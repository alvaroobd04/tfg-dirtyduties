import express from 'express';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js';
import {
  proposeSwapController,
  getEligibleExecutionsController,
  acceptSwapController,
  rejectSwapController
} from './swaps.controller.js';

// Routes mounted at /houses
export const swapsHouseRoutes = express.Router();
swapsHouseRoutes.post('/:houseId/swaps', autenticarToken, checkHouseAccess, proposeSwapController);
swapsHouseRoutes.get('/:houseId/swaps/eligible/:execId', autenticarToken, checkHouseAccess, getEligibleExecutionsController);

// Routes mounted at /swaps
export const swapsDirectRoutes = express.Router();
swapsDirectRoutes.put('/:swapId/accept', autenticarToken, acceptSwapController);
swapsDirectRoutes.put('/:swapId/reject', autenticarToken, rejectSwapController);
