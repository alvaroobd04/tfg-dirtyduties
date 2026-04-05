import { createTaskSchema } from "./task.schema.js";
import { createTask, getTasksByHouseId, createExecutions, deleteFutureExecutions, getMonthExecutions, completeExecution, getUsersByHouseId, deleteTaskById, updateTaskById, getExecutionById, updateExecutionValidation, createPunishmentExecution, getMyExecutions } from "./task.repository.js";
import { NotFoundError } from "../../erorrs/authError.js";
import { validateTaskWithAI } from './ai.validation.service.js';

function generateMonthlyDates(periodicidad, from)
{
    const dates = [];
    const current = new Date(from);
    const month = current.getMonth();

    let countWeek = 0;
    let lastWeek = -1;

    while(current.getMonth() === month)
    {
        const week = getWeekNumber(current);

        if(week !== lastWeek)
        {
            lastWeek = week;
            countWeek = 0;
        }

        if(countWeek < periodicidad)
        {
            dates.push(current.toLocaleDateString('en-CA'));
            countWeek++;
        }

        current.setDate(current.getDate() + 1);
    }

    return dates;
}

function getWeekNumber(date)
{
    const temp = new Date(date);
    temp.setHours(0, 0, 0, 0);

    const firstDayOfYear = new Date(temp.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.floor((temp - firstDayOfYear) / 86400000);

    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function buildRawExecutions(tasks, from)
{
    return tasks.flatMap(task => {
        const fechas = generateMonthlyDates(task.periodicidad, from);

        return fechas.map(fecha => ({
            tarea_id: task.id,
            fecha,
            estado: 'pendiente',
            dificultad: task.dificultad
        }));
    });
}

function assignUsers(executions, userIds)
{
    const userLoad = {};
    userIds.forEach(id => userLoad[id] = 0);

    return executions.map(exec => {

        const user = userIds.reduce((minUser, currentUser) => {
            return userLoad[currentUser] < userLoad[minUser]
                ? currentUser
                : minUser;
        });

        userLoad[user] += exec.dificultad;

        return {
            ...exec,
            usuario_id: user
        };
    });
}

//Planifica todas las tareas de la casa desde la fecha de FROM hasta final de mes
export async function plantMonth(houseId, from)
{
    const [ users, tasks ] = await Promise.all([
        getUsersByHouseId(houseId),
        getTasksByHouseId(houseId),
    ]);
    if(!users.length || !tasks.length)
        return;

    // 1 generar todas las ejecuciones
    const rawExecutions = buildRawExecutions(tasks, from);

    // 2 ordenar por fecha
    rawExecutions.sort((a,b) => {
    if(a.fecha !== b.fecha)
        return new Date(a.fecha) - new Date(b.fecha);

        return b.dificultad - a.dificultad;
    });

    // 3 repartir usuarios globalmente
    const allExecutions = assignUsers(rawExecutions, users);

    await createExecutions(allExecutions);
}

export async function createTaskService(data, houseId)
{
    const parsed = createTaskSchema.parse(data);

    const taskId = await createTask(data, houseId);

    await deleteFutureExecutions(houseId);
    await plantMonth(houseId, new Date());

    return{
        id:taskId, 
        ...parsed
    };
}

export async function getTasksByHouseIdService(houseId)
{
    return await getTasksByHouseId(houseId);
}

export async function getMonthCalendarService(houseId)
{
    let executions = await getMonthExecutions(houseId);

    if(!executions || executions.length === 0)
    {
        await plantMonth(houseId, new Date());
        executions = await getMonthExecutions(houseId);
    }

    return executions;
}

export async function completeExecutionService(executionId)
{
    const affected = await completeExecution(executionId);

    if(affected === 0)
        throw new NotFoundError('Ejecucion no encontrada');
}

export async function replanthMonthService(houseId)
{
    await deleteFutureExecutions(houseId);
    await plantMonth(houseId, new Date());
}

export async function deleteTaskService(houseId, taskId) 
{

  const deleted = await deleteTaskById(houseId, taskId);

  if (!deleted) {
    throw new NotFoundError("La tarea no existe o no pertenece a esta casa");
  }

}

export async function updateTaskService(data, houseId, taskId) {

  const parsed = createTaskSchema.parse(data); // reutilizas schema ✔️

  const updated = await updateTaskById(houseId, taskId, parsed);

  if (!updated) {
    throw new NotFoundError("La tarea no existe o no pertenece a esta casa");
  }

  // recalcular calendario
  await deleteFutureExecutions(houseId);
  await plantMonth(houseId, new Date());

  return {
    id: Number(taskId),
    ...parsed
  };
}

export async function validateExecutionService(executionId, file, taskName, userId) 
{
  const execution = await getExecutionById(executionId);

    if (execution.usuario_id !== userId)
        throw new ForbiddenError('No puedes validar esta tarea');

    if (!execution)
        throw new NotFoundError('Ejecucion no encontrada');

    const now = new Date();
    const executionDate = new Date(execution.fecha);

    const diffDays = (executionDate - now) / (1000 * 60 * 60 * 24);

    if (diffDays > 2)
    throw new Error('Aún no puedes validar esta tarea');

  // IA VALIDATION
  const { valid, confidence } = await validateTaskWithAI(file.buffer, taskName);

  const MIN_CONFIDENCE = 0.6;

  // si no hay buen grado de confianza --> nada
  if (confidence < MIN_CONFIDENCE) {
    return {
      status: 'retry',
      message: 'La IA no está segura, sube otra imagen',
      confidence
    };
  }

  // Si hay buen grado de confianza --> seguimos
  await updateExecutionValidation(executionId, valid, confidence);

  //Si esta segura y esta mal --> castigo
  if (!valid) {
    await createPunishmentExecution({
      tarea_id: execution.tarea_id,
      usuario_id: execution.usuario_id,
      fecha: execution.fecha
    });
  }

  return {
    status: 'done',
    valid,
    confidence
  };
}

export async function getMyExecutionsService(userId, houseId)
{
  return await getMyExecutions(userId, houseId)
}