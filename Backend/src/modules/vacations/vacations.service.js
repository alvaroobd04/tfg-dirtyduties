import { ValidationError, ForbiddenError, NotFoundError } from '../../erorrs/authError.js';
import {
  createVacation,
  getActiveVacationByUser,
  getVacationById,
  cancelVacationById,
  getUserPendingExecutionsInPeriod,
  getMemberLoadsInPeriod,
  reassignExecution,
  restoreVacationExecutions,
  countOtherMembers
} from './vacations.repository.js';
import { getHousesById } from '../houses/houses.repository.js';
import { notifyUser } from '../notifications/notifications.service.js';

const MAX_VACATION_DAYS = 30;
const MIN_ADVANCE_DAYS = 14;

export async function declareVacationService(userId, casaId, fechaInicio, fechaFin) {
  const houses = await getHousesById(casaId);
  const house = houses[0];
  if (!house) throw new NotFoundError('Casa no encontrada');
  if (house.modo !== 'flexible') throw new ForbiddenError('Las vacaciones solo están disponibles en casas con modo flexible');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio + 'T00:00:00');
  const fin    = new Date(fechaFin    + 'T00:00:00');

  // const daysUntilStart = Math.floor((inicio - today) / 86400000);
  // if (daysUntilStart < MIN_ADVANCE_DAYS)
  //   throw new ValidationError(`Las vacaciones deben declararse con al menos ${MIN_ADVANCE_DAYS} días de antelación`);

  if (fin <= inicio)
    throw new ValidationError('La fecha de fin debe ser posterior a la de inicio');

  const duration = Math.floor((fin - inicio) / 86400000) + 1;
  if (duration > MAX_VACATION_DAYS)
    throw new ValidationError(`Las vacaciones no pueden superar ${MAX_VACATION_DAYS} días consecutivos`);

  const existing = await getActiveVacationByUser(userId, casaId);
  if (existing)
    throw new ValidationError('Ya tienes unas vacaciones activas en esta casa');

  const others = await countOtherMembers(casaId, userId);
  if (others < 1)
    throw new ValidationError('Necesitas al menos un compañero para declarar vacaciones');

  const vacacionId = await createVacation(userId, casaId, fechaInicio, fechaFin);

  const executions = await getUserPendingExecutionsInPeriod(userId, casaId, fechaInicio, fechaFin);
  console.log('[VACACIONES] executions encontradas:', executions.length, executions);

  if (executions.length > 0) {
    const memberLoads = await getMemberLoadsInPeriod(casaId, userId, fechaInicio, fechaFin);
    console.log('[VACACIONES] memberLoads:', memberLoads);

    // FIFO priority queue: sorted ascending by current load
    const queue = memberLoads.map(m => ({ id: m.userId, load: Number(m.carga) }));
    queue.sort((a, b) => a.load - b.load);

    for (const exec of executions) {
      const assignee = queue[0];
      assignee.load += exec.dificultad;
      queue.sort((a, b) => a.load - b.load);
      await reassignExecution(exec.id, assignee.id, vacacionId);
    }
  }

  const fmtDate = (f) => new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  await notifyUser(
    userId,
    'vacaciones',
    `Tus vacaciones del ${fmtDate(fechaInicio)} al ${fmtDate(fechaFin)} han sido registradas. ${executions.length} tarea(s) reasignadas a tus compañeros.`
  );

  return { vacacionId, executionsReassigned: executions.length };
}

export async function cancelVacationService(vacationId, userId) {
  const vacation = await getVacationById(vacationId);
  if (!vacation)                          throw new NotFoundError('Vacaciones no encontradas');
  if (vacation.usuario_id !== userId)     throw new ForbiddenError('Estas vacaciones no te pertenecen');
  if (vacation.estado !== 'activa')       throw new ValidationError('Estas vacaciones ya están canceladas');

  await cancelVacationById(vacationId);
  const restored = await restoreVacationExecutions(vacationId, userId);

  await notifyUser(userId, 'vacaciones', 'Has cancelado tus vacaciones. Tus tareas pendientes te han sido devueltas.');

  return { ok: true };
}

export async function getMyVacationService(userId, casaId) {
  return await getActiveVacationByUser(userId, casaId);
}
