import { registerUser, loginUser, refreshAccessToken  } from "./auth.service.js";
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
            accessToken
        });
    } catch (error){
        next(error)
    }
}


export async function refreshController(req, res, next) 
{
    try {
        const refreshToken = req.cookies.refreshToken
        console.log("REQ.COOKIES:", req.cookies)

        if(!refreshToken)
        {
            throw new AuthError('Refresh token requerido')
        }

        const newAccessToken = await refreshAccessToken(refreshToken)

        return res.status(200).json({
            accessToken: newAccessToken
        })
    } catch(err){
        next(err)
    }

}
