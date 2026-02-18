import express from 'express';
import { registerController, loginControlller, refreshController } from './auth.controller.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginControlller); 
router.post('/refresh', refreshController);

export default router;