import jwt from 'jsonwebtoken';
import { env } from '../config/env.js'
import { AuthError } from '../erorrs/authError.js';

export async function autenticarToken(req, res, next)
{
    try{
        const auth = req.headers.authorization
        if(!auth)
            throw new AuthError('Token requerido')

        const [ type, token ] = auth.split(' ')
        if(type !== 'Bearer' || !token)
            throw new AuthError('Formato Authorization inválido')

        const decoded = jwt.verify(token, env.jwtSecret)
        if(!decoded)
        throw new AuthError('Access Token invalido')

        req.user = decoded
        next()
    } catch(error) {
        next(new AuthError('Token expirado'))
    }
}