import { ValidationError, ForbiddenError, NotFoundError } from '../../erorrs/authError.js';
import {
  getExecutionForSwap,
  getEligibleExecutions,
  createSwap,
  getSwapById,
  updateSwapEstado,
  swapExecutionUsers
} from './swaps.repository.js';
import { notifyUser } from '../notifications/notifications.service.js';
import { getHousesById } from '../houses/houses.repository.js';

export async function proposeSwapService(houseId, solicitanteId, execSolId, execDestId) {
  const houses = await getHousesById(houseId);
  const house = houses[0];
  if (!house) throw new NotFoundError('Casa no encontrada');
  if (house.modo !== 'flexible') throw new ForbiddenError('Esta casa no tiene el modo flexible activado');

  const execSol = await getExecutionForSwap(execSolId);
  if (!execSol) throw new NotFoundError('Ejecución no encontrada');
  if (execSol.usuario_id !== solicitanteId) throw new ForbiddenError('Esta ejecución no te pertenece');
  if (execSol.casa_id !== houseId) throw new ForbiddenError('La ejecución no pertenece a esta casa');
  if (execSol.estado !== 'pendiente') throw new ValidationError('Solo puedes intercambiar tareas pendientes');
  if (execSol.tipo === 'castigo') throw new ValidationError('No puedes intercambiar tareas de castigo');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const execDate = new Date(execSol.fecha);
  const daysUntil = Math.floor((execDate - today) / 86400000);
  if (daysUntil < 1) throw new ValidationError('Solo puedes proponer un intercambio hasta el día antes de la tarea');

  const execDest = await getExecutionForSwap(execDestId);
  if (!execDest) throw new NotFoundError('Ejecución del destinatario no encontrada');
  if (execDest.casa_id !== houseId) throw new ForbiddenError('La ejecución del destinatario no pertenece a esta casa');
  if (execDest.estado !== 'pendiente') throw new ValidationError('La tarea del destinatario no está pendiente');
  if (execDest.tipo === 'castigo') throw new ValidationError('No se puede intercambiar con una tarea de castigo');

  const destinatarioId = execDest.usuario_id;
  if (destinatarioId === solicitanteId) throw new ValidationError('No puedes intercambiar tareas contigo mismo');

  const solDate = new Date(execSol.fecha);
  const destDate = new Date(execDest.fecha);
  const daysDiff = Math.abs(Math.floor((solDate - destDate) / 86400000));
  if (daysDiff > 7) throw new ValidationError('Las dos tareas deben estar dentro de un margen de 7 días');

  const swapId = await createSwap(houseId, solicitanteId, execSolId, destinatarioId, execDestId);

  const fmtDate = (f) => new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const mensaje =
    `${execSol.userApodo} te propone un intercambio: ` +
    `te da su tarea "${execSol.taskName}" (${fmtDate(execSol.fecha)}) ` +
    `a cambio de tu tarea "${execDest.taskName}" (${fmtDate(execDest.fecha)}).`;
  await notifyUser(destinatarioId, 'intercambio_propuesta', mensaje, null, swapId);

  return { swapId };
}

export async function getEligibleExecutionsService(houseId, execId, userId) {
  return await getEligibleExecutions(houseId, execId, userId);
}

export async function acceptSwapService(swapId, userId) {
  const swap = await getSwapById(swapId);
  if (!swap) throw new NotFoundError('Intercambio no encontrado');
  if (swap.destinatario_id !== userId) throw new ForbiddenError('No eres el destinatario de este intercambio');
  if (swap.estado !== 'pendiente') throw new ValidationError('Este intercambio ya no está pendiente');

  await swapExecutionUsers(
    swap.ejecucion_solicitante_id,
    swap.ejecucion_destinatario_id,
    swap.solicitante_id,
    swap.destinatario_id
  );
  await updateSwapEstado(swapId, 'aceptado');

  await notifyUser(swap.solicitante_id, 'intercambio_aceptado', 'Tu propuesta de intercambio ha sido aceptada ✅', null, swapId);
}

export async function rejectSwapService(swapId, userId) {
  const swap = await getSwapById(swapId);
  if (!swap) throw new NotFoundError('Intercambio no encontrado');
  if (swap.destinatario_id !== userId) throw new ForbiddenError('No eres el destinatario de este intercambio');
  if (swap.estado !== 'pendiente') throw new ValidationError('Este intercambio ya no está pendiente');

  await updateSwapEstado(swapId, 'rechazado');

  await notifyUser(swap.solicitante_id, 'intercambio_rechazado', 'Tu propuesta de intercambio ha sido rechazada ❌', null, swapId);
}
