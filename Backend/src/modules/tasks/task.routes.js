import express from 'express';
import { completeExecutionController, createtaskController, getMonthCalendarController, getTasksByHouseIdController, replanthMonthController } from "./task.controller.js";
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js'
import { check } from 'zod';

const router = express.Router();

router.post('/:houseId/tasks', autenticarToken, checkHouseAccess, createtaskController);
router.get('/:houseId/tasks', autenticarToken, checkHouseAccess, getTasksByHouseIdController);
router.get('/:houseId/tasks/calendar', autenticarToken, checkHouseAccess, getMonthCalendarController);
router.get('/:houseId/tasks/replan', autenticarToken, checkHouseAccess, replanthMonthController);

router.patch('/executions/:executionId/complete', autenticarToken, completeExecutionController);


export default router;
