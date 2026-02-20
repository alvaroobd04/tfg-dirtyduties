import express from 'express';
import { createHouseController } from './houses.controller.js';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/create', autenticarToken, createHouseController);

export default router;
