import express from 'express';
import { createHouseController, deleteUserFromHouseController, getHouseByIdController, getHousesController, getMembersController } from './houses.controller.js';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js';
import { check } from 'zod';

const router = express.Router();

router.post('/create', autenticarToken, createHouseController);
router.get('/', autenticarToken, getHousesController);
router.get('/:houseId', autenticarToken, checkHouseAccess, getHouseByIdController);
router.get('/:houseId/members', autenticarToken, checkHouseAccess, getMembersController);
router.delete('/:houseId/leave', autenticarToken, checkHouseAccess, deleteUserFromHouseController);

export default router;
