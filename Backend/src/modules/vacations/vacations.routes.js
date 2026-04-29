import express from 'express';
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js';
import { declareVacationController, cancelVacationController, getMyVacationController } from './vacations.controller.js';

const router = express.Router();

router.post('/:houseId/vacations',                  autenticarToken, checkHouseAccess, declareVacationController);
router.get('/:houseId/vacations/mine',              autenticarToken, checkHouseAccess, getMyVacationController);
router.delete('/:houseId/vacations/:vacationId',    autenticarToken, checkHouseAccess, cancelVacationController);

export default router;
