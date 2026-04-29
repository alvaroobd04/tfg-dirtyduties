import { registerUser, loginUser, refreshAccessToken, deleteRefreshToken, getProfileService, updateProfileService, resetPasswordService, forgotPasswordService, changePasswordService, googleLoginService, appleLoginService } from "./auth.service.js";
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
        const { accessToken, refreshToken, mustChangePassword } = await loginUser(req.body); 

        //Refresh Token como cookie httpOnly
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                                 //Para que no se pueda recuperar la cookie desde JavaScript
            secure: false,                                  //Si es true el navegador solo envia la cookie por https aunque en desarrollo suele ser false
            sameSite: 'lax',                                //Evita que el navegador envíe la cookie en todas la peticiones
            maxAge: 7*24*60*60*1000                         //Cuanto dura la cookie
        })

        return res.status(200).json({
            message: 'Login correcto',
            accessToken,
            refreshToken,
            mustChangePassword
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

export async function getProfileController(req, res, next) 
{
  try {
    const userId = req.user.userId;

    const user = await getProfileService(userId);
    console.log(user)
    return res.status(200).json({
      user
    });

  } catch (error) {
    next(error);
  }
}

export async function updateProfileController(req, res, next) 
{
  try {
    const userId = req.user.userId;
    const { nombre, apellidos, user_apodo, email } = req.body;

    const user = await updateProfileService(userId, {
      nombre,
      apellidos,
      user_apodo,
      email
    });

    res.json({ user });

  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(req, res, next)
{
  try {
    const { email } = req.body;
    await forgotPasswordService(email);
    return res.status(200).json({ message: 'Si el correo existe, recibirás la contraseña temporal.' });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(req, res, next)
{
  try {
    const userId = req.user.userId;
    const { newPassword } = req.body;
    await changePasswordService(userId, newPassword);
    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(req, res, next)
{
    try {
        const { token, newPassword } = req.body;

        const result = await resetPasswordService(token, newPassword);

        return res.status(200).json({
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
}

export async function googleLoginController(req, res, next) {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: 'idToken requerido' });

        const { accessToken, refreshToken } = await googleLoginService(idToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Login con Google correcto', accessToken });
    } catch (error) {
        next(error);
    }
}

export async function appleLoginController(req, res, next) {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: 'idToken requerido' });

        const { accessToken, refreshToken } = await appleLoginService(idToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Login con Apple correcto', accessToken });
    } catch (error) {
        next(error);
    }
}