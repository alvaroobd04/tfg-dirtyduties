import { createTaskService, getTasksByHouseIdService, replanthMonthService, getMonthCalendarService, completeExecutionService } from "./task.service.js";

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