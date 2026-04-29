import { pool } from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

export async function createVacation(userId, casaId, fechaInicio, fechaFin) {
  const [result] = await pool.query(
    `INSERT INTO vacaciones (usuario_id, casa_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)`,
    [userId, casaId, fechaInicio, fechaFin]
  );
  return result.insertId;
}

export async function getActiveVacationByUser(userId, casaId) {
  const [rows] = await pool.query(
    `SELECT * FROM vacaciones WHERE usuario_id = ? AND casa_id = ? AND estado = 'activa' LIMIT 1`,
    [userId, casaId]
  );
  return rows[0] || null;
}

export async function getVacationById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM vacaciones WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function cancelVacationById(id) {
  await pool.query(
    `UPDATE vacaciones SET estado = 'cancelada' WHERE id = ?`,
    [id]
  );
}

export async function getUserPendingExecutionsInPeriod(userId, casaId, fechaInicio, fechaFin) {
  const [rows] = await pool.query(
    `SELECT e.id, e.fecha, t.dificultad
     FROM ejecucion e
     JOIN tarea t ON e.tarea_id = t.id
     WHERE e.usuario_id = ?
       AND t.casa_id = ?
       AND e.fecha BETWEEN ? AND ?
       AND e.estado = 'pendiente'
       AND (e.tipo IS NULL OR e.tipo != 'castigo')
     ORDER BY e.fecha ASC`,
    [userId, casaId, fechaInicio, fechaFin]
  );
  return rows;
}

export async function getMemberLoadsInPeriod(casaId, excludeUserId, fechaInicio, fechaFin) {
  const [rows] = await pool.query(
    `SELECT hu.user_id AS userId, COALESCE(SUM(t.dificultad), 0) AS carga
     FROM house_users hu
     LEFT JOIN ejecucion e
       ON e.usuario_id = hu.user_id
       AND e.fecha BETWEEN ? AND ?
       AND e.estado = 'pendiente'
     LEFT JOIN tarea t
       ON t.id = e.tarea_id AND t.casa_id = ?
     WHERE hu.house_id = ?
       AND hu.user_id != ?
     GROUP BY hu.user_id`,
    [fechaInicio, fechaFin, casaId, casaId, excludeUserId]
  );
  return rows;
}

export async function reassignExecution(execId, newUserId, vacacionId) {
  await pool.query(
    `UPDATE ejecucion SET usuario_id = ?, vacacion_id = ? WHERE id = ?`,
    [newUserId, vacacionId, execId]
  );
}

export async function restoreVacationExecutions(vacacionId, originalUserId) {
  const today = new Date().toLocaleDateString('en-CA');
  await pool.query(
    `UPDATE ejecucion
     SET usuario_id = ?, vacacion_id = NULL
     WHERE vacacion_id = ? AND fecha >= ? AND estado = 'pendiente'`,
    [originalUserId, vacacionId, today]
  );
}

export async function getActiveVacationsForHouse(casaId) {
  const [rows] = await pool.query(
    `SELECT usuario_id, fecha_inicio, fecha_fin
     FROM vacaciones
     WHERE casa_id = ? AND estado = 'activa'`,
    [casaId]
  );
  return rows;
}

export async function countOtherMembers(casaId, userId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total FROM house_users WHERE house_id = ? AND user_id != ?`,
    [casaId, userId]
  );
  return row.total;
}
