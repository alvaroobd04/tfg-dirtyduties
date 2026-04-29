import { createTaskService, getTasksByHouseIdService, replanthMonthService, getMonthCalendarService, completeExecutionService, deleteTaskService, updateTaskService, validateExecutionService, getMyExecutionsService, getHouseStatsService } from "./task.service.js";

export async function createtaskController(req, res, next)
{
    try {
        const houseId = req.houseId;

        const task = await createTaskService(req.body, houseId);

        return res.status(201).json({
            message: 'Tarea creada correctamente', 
            task
        });
    } catch (error) {
        next(error);
    }
}

export async function getTasksByHouseIdController(req, res, next) 
{
    try {

        const houseId = req.houseId;
        
        const tasks = await getTasksByHouseIdService(houseId);
        
        return res.status(200).json({ tasks });
    } catch (error) {
        next(error);
    }
}

export async function getMonthCalendarController(req, res, next)
{
    try {
        const houseId = req.houseId;
        const calendar = await getMonthCalendarService(houseId);
        return res.status(200).json(calendar);
    } catch (error) {
        next(error);
    }
}

export async function completeExecutionController(req, res, next)
{
    try {
        const { executionId } = req.params;
        await completeExecutionService(Number(executionId));
        return res.status(200).json({
            message: 'Ejecucion marcada como completada'
        });
    } catch (error) {
        next(error);
    }
}

export async function replanthMonthController(req, res, next)
{
    try {
        const houseId = req.houseId; 
        await replanthMonthService(houseId);
        return res.status(200).json({
            message: 'Mes planificado correctamente'
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteTaskController(req, res, next) 
{
  try {
    const { houseId, taskId } = req.params;

    await deleteTaskService(houseId, taskId);

    res.status(200).json({ message: "Tarea eliminada correctamente" });

  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(req, res, next) 
{
  try {
    const { houseId, taskId } = req.params;

    const task = await updateTaskService(req.body, houseId, taskId);

    return res.status(200).json({
      message: "Tarea actualizada correctamente",
      task
    });

  } catch (error) {
    next(error);
  }
}

export async function validateExecutionController(req, res, next) 
{
  try {
    const { executionId } = req.params;
    const { taskName } = req.body;
    if (!req.file) {
      throw new Error('Imagen requerida');
    }

    const result = await validateExecutionService(Number(executionId), req.file, taskName, req.user.userId);

    return res.status(200).json({
      message: 'Validación realizada',
      valid: result.valid,
      confidence: result.confidence
    });

  } catch (error) {
    next(error);
  }
}

export async function getMyExecutionsController(req, res, next) 
{
  try {
    const userId = req.user.userId
    const houseId = req.houseId

    const executions = await getMyExecutionsService(userId, houseId)

    return res.status(200).json({ executions })

  } catch (error) {
    next(error)
  }
}

export async function getHouseStatsController(req, res, next) {
  try {
    const stats = await getHouseStatsService(req.houseId);
    return res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
}