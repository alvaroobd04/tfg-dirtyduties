import { registerUser, loginUser, refreshAccessToken, deleteRefreshToken  } from "./auth.service.js";
import { AuthError } from '../../erorrs/authError.js';

export async function registerController(req, res, next) 
{
    try{
        const result = await registerUser(req.body);

        return res.status(201).json({
            message: 'Usuario creado correctamente',
            user: result
        });
    } catch (error) {
            next(error)
    }
}

export async function loginControlller(req, res, next)
{
    try{
        const { accessToken, refreshToken } = await loginUser(req.body); 

        //Refresh Token como cookie httpOnly
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                                   //Para que no se pueda recuperar la cookie desde JavaScript
            secure: process.env.NODE_ENV === 'production',   //Si es true el navegador solo envia la cookie por https aunque en desarrollo suele ser false
            sameSite: 'strict',                             //Evita que el navegador envíe la cookie en todas la peticiones
            maxAge: 7*24*60*60*1000                         //Cuanto dura la cookie
        })

        return res.status(200).json({
            message: 'Login correcto',
            accessToken, 
            refreshToken
        });
    } catch (error){
        next(error)
    }
}


export async function refreshController(req, res, next) 
{
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken)
            throw new AuthError('Refresh token requerido')

        const { newAccessToken, newRefreshToken } = await refreshAccessToken(refreshToken)

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.status(200).json({
            accessToken: newAccessToken, 
            newRefreshToken
        })
    } catch(err){
        next(err)
    }

}


export async function logoutController(req, res, next) 
{
    try{
        const refreshToken = req.cookies.refreshToken
        
        if(!refreshToken)
            throw new AuthError('Refresh token requerido')

        const result = await deleteRefreshToken(refreshToken)

        if(!result || result.affectedRows === 0)
                throw new AuthError('Refresh Token invalido')

        //Limpiar cookie
        res.clearCookie('refreshToken', {
            httpOnly: true, 
            secure: true, 
            sameSite: 'strict'
        })

        return res.status(200).json({
            message: 'Logout exitoso'
        })
    } catch(err){
        next(err)
    }
}

export async function meController (req, res, next)
{
    return res.status(200).json({
        message: 'Usuario autenticado',
        user: req.user
    });
}
