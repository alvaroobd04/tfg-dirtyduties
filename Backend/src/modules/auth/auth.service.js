import bcrypt from 'bcrypt';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schema.js';
import { findUserByEmail, findUserByApodo, createUser, saveRefreshToken, findRefreshTokenByRefreshId, deleteRefreshTokenById, getUserProfile, updateUserProfile, updateUserPassword, setMustChangePassword, createUserWithHash } from './auth.repository.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthError, ConflictError, NotFoundError } from '../../erorrs/authError.js';
import { randomUUID, randomBytes, createPublicKey } from 'node:crypto';
import { transporter } from '../../config/mailer.js';
import axios from 'axios';

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
    return { accessToken, refreshToken, mustChangePassword: !!user.must_change_password };
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

export async function getProfileService(userId) 
{
  const user = await getUserProfile(userId);

  if (!user) {
    throw new AuthError('Usuario no encontrado');
  }

  return user;
}

export async function updateProfileService(userId, data) 
{
  return await updateUserProfile(userId, data);
}

function generateTempPassword() {
  const bytes = randomBytes(9);
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$';

  const chars = [
    upper[bytes[0] % upper.length],
    upper[bytes[1] % upper.length],
    lower[bytes[2] % lower.length],
    lower[bytes[3] % lower.length],
    lower[bytes[4] % lower.length],
    digits[bytes[5] % digits.length],
    digits[bytes[6] % digits.length],
    special[bytes[7] % special.length],
    lower[bytes[8] % lower.length],
  ];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = bytes[i % bytes.length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export async function forgotPasswordService(email)
{
  const user = await findUserByEmail(email);

  if (!user) return; // no revelar si el email existe

  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, parseInt(env.saltRounds));

  await updateUserPassword(user.user_id, hashed);
  await setMustChangePassword(user.user_id, true);

  await transporter.sendMail({
    from: `"DirtyDuties" <${env.emailUser}>`,
    to: email,
    subject: 'Tu contraseña temporal — DirtyDuties',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #2f4858;">DirtyDuties</h2>
        <p>Hemos generado una contraseña temporal para tu cuenta:</p>
        <div style="background:#f1f5f9; padding:16px; border-radius:8px; font-size:22px; font-weight:bold; letter-spacing:2px; text-align:center; color:#1d3557;">
          ${tempPassword}
        </div>
        <p style="margin-top:16px; color:#555;">Inicia sesión con esta contraseña. Al entrar se te pedirá que la cambies.</p>
        <p style="color:#999; font-size:12px; margin-top:24px;">Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `
  });
}

export async function changePasswordService(userId, newPassword)
{
  changePasswordSchema.parse({ newPassword });

  const hashed = await bcrypt.hash(newPassword, parseInt(env.saltRounds));
  await updateUserPassword(userId, hashed);
  await setMustChangePassword(userId, false);
}

export async function resetPasswordService(token, newPassword)
{
    try {
        // Verificar el token de reset de contraseña
        const decoded = jwt.verify(token, env.jwtSecret);

        const user = await findUserByEmail(decoded.email);
        if (!user) {
            throw new AuthError('Usuario no encontrado');
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(env.saltRounds));

        // Actualizar la contraseña en la base de datos
        await updateUserPassword(user.user_id, hashedPassword);

        return { message: 'Contraseña actualizada' };
    } catch (err) {
        throw new AuthError('Token inválido o expirado');
    }
}

async function findOrCreateSocialUser(email, nombre, apellidos) {
    const existing = await findUserByEmail(email);
    if (existing) return existing;

    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 15) || 'user';
    let apodo = base;
    let i = 1;
    while (await findUserByApodo(apodo)) {
        apodo = `${base}${i++}`;
    }

    const passwordHash = await bcrypt.hash(randomUUID(), parseInt(env.saltRounds));
    const userId = await createUserWithHash({
        userApodo: apodo,
        email,
        nombre: nombre || base,
        apellidos: apellidos || '',
        passwordHash
    });

    return { user_id: userId, email, user_apodo: apodo };
}

export async function googleLoginService(idToken) {
    let payload;
    try {
        const { data } = await axios.get(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        payload = data;
    } catch {
        throw new AuthError('Token de Google inválido');
    }

    const { email, given_name, family_name } = payload;
    if (!email) throw new AuthError('El token de Google no incluye email');

    if (env.googleClientId && payload.aud !== env.googleClientId)
        throw new AuthError('Token de Google no corresponde a esta aplicación');

    const user = await findOrCreateSocialUser(email, given_name || '', family_name || '');

    const accessToken = jwt.sign({ userId: user.user_id }, env.jwtSecret, { expiresIn: '15m' });
    const refreshToken = await generarRefreshToken(user.user_id);

    return { accessToken, refreshToken };
}

export async function appleLoginService(idToken) {
    let decoded;
    try {
        const { data: { keys } } = await axios.get('https://appleid.apple.com/auth/keys');

        const b64 = idToken.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
        const header = JSON.parse(Buffer.from(b64, 'base64').toString());
        const jwk = keys.find(k => k.kid === header.kid);
        if (!jwk) throw new Error('JWK no encontrado');

        const publicKey = createPublicKey({ key: jwk, format: 'jwk' });

        const verifyOptions = { algorithms: ['RS256'], issuer: 'https://appleid.apple.com' };
        if (env.appleClientId) verifyOptions.audience = env.appleClientId;

        decoded = jwt.verify(idToken, publicKey, verifyOptions);
    } catch {
        throw new AuthError('Token de Apple inválido');
    }

    const { email, sub } = decoded;
    if (!email) throw new AuthError('El token de Apple no incluye email');

    const user = await findOrCreateSocialUser(email, sub || '', '');

    const accessToken = jwt.sign({ userId: user.user_id }, env.jwtSecret, { expiresIn: '15m' });
    const refreshToken = await generarRefreshToken(user.user_id);

    return { accessToken, refreshToken };
}