import express from 'express';
import { completeExecutionController, createtaskController, getMonthCalendarController, getTasksByHouseIdController, replanthMonthController, deleteTaskController, updateTaskController, validateExecutionController, getMyExecutionsController, getHouseStatsController } from "./task.controller.js";
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js'
import { upload } from '../../middlewares/upload.middleware.js';
import { check } from 'zod';

const router = express.Router();

router.post('/:houseId/tasks', autenticarToken, checkHouseAccess, createtaskController);
router.get('/:houseId/tasks', autenticarToken, checkHouseAccess, getTasksByHouseIdController);
router.get('/:houseId/tasks/calendar', autenticarToken, checkHouseAccess, getMonthCalendarController);
router.get('/:houseId/tasks/replan', autenticarToken, checkHouseAccess, replanthMonthController);
router.delete('/:houseId/tasks/:taskId', autenticarToken, checkHouseAccess, deleteTaskController);
router.patch('/executions/:executionId/complete', autenticarToken, completeExecutionController);
router.put('/:houseId/tasks/:taskId', autenticarToken, checkHouseAccess, updateTaskController);
router.post('/executions/:executionId/validate', autenticarToken, upload.single('image'), validateExecutionController);
router.get('/:houseId/executions/my-tasks', autenticarToken, checkHouseAccess, getMyExecutionsController);
router.get('/:houseId/stats', autenticarToken, checkHouseAccess, getHouseStatsController);

export default router;
