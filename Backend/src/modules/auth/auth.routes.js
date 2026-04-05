import express from 'express';
import { registerController, loginControlller, refreshController, logoutController, meController } from './auth.controller.js';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginControlller); 
router.post('/refresh', refreshController);
router.post('/logout', logoutController);



export default router;