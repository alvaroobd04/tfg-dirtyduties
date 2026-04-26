import express from 'express';
import { registerController, loginControlller, refreshController, logoutController, getProfileController, updateProfileController, resetPasswordController } from './auth.controller.js';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginControlller); 
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/profile', autenticarToken, getProfileController);
router.put('/profile', autenticarToken, updateProfileController);
router.post('/reset-password', resetPasswordController)



export default router;