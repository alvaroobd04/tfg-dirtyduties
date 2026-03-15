import { createTaskSchema } from "./task.schema.js";
import { createTask, getTasksByHouseId, createExecutions, deleteFutureExecutions, getMonthExecutions, completeExecution, getUsersByHouseId } from "./task.repository.js";
import { NotFoundError } from "../../erorrs/authError.js";

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
async function plantMonth(houseId, from)
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

    const taskId = await createTask(data, houseId)

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
    return await getMonthExecutions(houseId);
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