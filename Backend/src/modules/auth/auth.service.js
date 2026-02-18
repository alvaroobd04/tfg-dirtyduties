import bcrypt from 'bcrypt';
import { registerSchema, loginSchema  } from './auth.schema.js';
import { findUserByEmail, findUserByApodo, createUser, saveRefreshToken, findRefreshTokenByUserId } from './auth.repository.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthError, ConflictError } from '../../erorrs/authError.js';
import { _isoDateTime } from 'zod/v4/core';

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


export async function loginUser(data) {
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

    //Generar Refresh Token
    const refreshToken = jwt.sign(
        {userId: user.user_id}, 
        env.jwtRefreshToken, 
        {expiresIn: '7d'}
    )
console.log("REFRESH GENERADO:", refreshToken)

    const refreshHashed = await bcrypt.hash(refreshToken, parseInt(env.saltRounds));

    const expiresAt = new Date(Date.now() + 7*24*60*60*1000)
    await saveRefreshToken(user.user_id, refreshHashed, expiresAt);

    return { accessToken, refreshToken };
}


export async function refreshAccessToken(refreshToken)
{
    let decoded
    console.log("TOKEN RECIBIDO EN REFRESH:", refreshToken)

    try{
        decoded = jwt.verify(refreshToken, env.jwtRefreshToken)
    } catch (err){
        throw new AuthError('Refresh token invalido aqui')
    }

    const tokensGuardados = await findRefreshTokenByUserId(decoded.userId)

    if(!tokensGuardados.length)
        throw new AuthError('Refresh token invalido o aqui')

    //Se comprueba si alguno coincide porque cada usuario puede tener varios refersh tokens, uno por cada dispositivo suyo
    let isValid = false

    for(const token of tokensGuardados)
    {
        const match = await bcrypt.compare(refreshToken, token.token_hash)
        if(match)
        {
            isValid = true 
            break
        }
    }

    if(!isValid)
        throw new AuthError('Refresh token invalido o igual aqui')

    //Se genera nuevo access token
    const newAccessToken = jwt.sign(
        { userId: decoded.userId}, 
        env.jwtSecret,
        { expiresIn: '15m' }
    )

    return newAccessToken
}
