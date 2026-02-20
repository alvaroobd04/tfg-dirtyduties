import bcrypt from 'bcrypt';
import { registerSchema, loginSchema  } from './auth.schema.js';
import { findUserByEmail, findUserByApodo, createUser, saveRefreshToken, findRefreshTokenByRefreshId, deleteRefreshTokenById } from './auth.repository.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthError, ConflictError } from '../../erorrs/authError.js';
import { _isoDateTime } from 'zod/v4/core';
import { randomUUID } from 'node:crypto';

export async function registerUser(data)
{
    //Validación de formato con Zod
    const parsedData = registerSchema.parse(data);

    const {email, user_apodo, password, nombre, apellidos} = parsedData;


    //Comprobacion de que email y apodo son UNIQUE
    const existingUserEmail = await findUserByEmail(email);
    if(existingUserEmail){
        throw new ConflictError('El email ya está registrado');
    }

    const existingUserApodo = await findUserByApodo(user_apodo);
    if(existingUserApodo){
        throw new ConflictError('El apodo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, parseInt(env.saltRounds));

    //Crear usuario
    const userId = await createUser({
        userApodo: user_apodo,
        email,
        nombre,
        apellidos,
        passwordHash
    });

    return { user_id: userId, email, user_apodo};
}


export async function loginUser(data) 
{
    const parsedData = loginSchema.parse(data);
    const { email, password } = parsedData;

    //Buscar usuario
    const user = await findUserByEmail(email);
    if(!user){
        throw new AuthError ('Credenciales inválidas');
    }

    //Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if(!isPasswordValid){
        throw new AuthError ('Credenciales inválidas');
    }

    //Generar JWT -- Access Token
    const accessToken = jwt.sign(
        {userId : user.user_id},
        env.jwtSecret,
        {expiresIn: '15m'}
    );

    const refreshToken = await generarRefreshToken(user.user_id)
    return { accessToken, refreshToken };
}


export async function generarRefreshToken(userId) 
{
    const refreshId = randomUUID();
    const refreshToken = jwt.sign(
        {userId: userId, 
         jti: refreshId,
        }, 
        env.jwtRefreshToken, 
        {expiresIn: '7d'}
    )
    const refreshHashed = await bcrypt.hash(refreshToken, parseInt(env.saltRounds));

    const expiresAt = new Date(Date.now() + 7*24*60*60*1000)
    const result = await saveRefreshToken(userId, refreshId, refreshHashed, expiresAt);
    if(!result)
        throw new AuthError('Token no generado')

    return refreshToken;
}

export async function refreshAccessToken(refreshToken)
{
    let decoded

    try{
        decoded = jwt.verify(refreshToken, env.jwtRefreshToken)
    } catch (err){
        throw new AuthError('Refresh token invalido aqui')
    }

    const refreshTokenAlmacenado = await findRefreshTokenByRefreshId(decoded.jti);
    
    if (!refreshTokenAlmacenado || refreshTokenAlmacenado.length === 0)
        throw new AuthError('Refresh token invalido')

    const isValid = await bcrypt.compare(refreshToken, refreshTokenAlmacenado[0].token_hash);
    
    if(!isValid)
        throw new AuthError('Refresh token invalido')

    //Se genera nuevo refresh token cada vez que se genere otro access token para evitar ataques
    //Primero se borra el actual 
    const result = await deleteRefreshToken(refreshToken)
    if(!result || result.affectedRows === 0)
        throw new AuthError('Refresh Token invalido')

    const newRefreshToken = await generarRefreshToken(decoded.userId)

    //Se genera nuevo access token
    const newAccessToken = jwt.sign(
        { userId: decoded.userId}, 
        env.jwtSecret,
        { expiresIn: '15m' }
    )

    return { newAccessToken, newRefreshToken }
}


export async function deleteRefreshToken(refreshToken)
{
    const decoded = jwt.verify(refreshToken, env.jwtRefreshToken)

    if(!decoded)
        throw new AuthError('Refresh Token invalido')

    const result = await deleteRefreshTokenById(decoded.jti)

    if(!result || result.affectedRows === 0)
            throw new AuthError('Refresh Token invalido')
    
    return true

}