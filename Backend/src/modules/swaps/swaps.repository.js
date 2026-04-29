import { pool } from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

export async function getExecutionForSwap(execId) {
  const [rows] = await pool.query(
    `SELECT e.id, e.fecha, e.usuario_id, e.estado, e.tipo, t.casa_id, t.nombre AS taskName,
            u.user_apodo AS userApodo
     FROM ejecucion e
     JOIN tarea t ON e.tarea_id = t.id
     JOIN usuarios u ON u.user_id = e.usuario_id
     WHERE e.id = ?`,
    [execId]
  );
  return rows[0] || null;
}

export async function getEligibleExecutions(houseId, execId, requesterId) {
  const [[requesterExec]] = await pool.query(
    `SELECT e.fecha FROM ejecucion e
     JOIN tarea t ON e.tarea_id = t.id
     WHERE e.id = ? AND t.casa_id = ?`,
    [execId, houseId]
  );
  if (!requesterExec) return [];

  const [rows] = await pool.query(
    `SELECT e.id, e.fecha, t.nombre AS taskName, u.user_apodo AS userName, u.user_id AS userId
     FROM ejecucion e
     JOIN tarea t ON e.tarea_id = t.id
     JOIN usuarios u ON u.user_id = e.usuario_id
     JOIN house_users hu ON hu.user_id = e.usuario_id AND hu.house_id = ?
     WHERE t.casa_id = ?
       AND e.usuario_id != ?
       AND e.estado = 'pendiente'
       AND (e.tipo IS NULL OR e.tipo != 'castigo')
       AND e.fecha > CURDATE()
       AND ABS(DATEDIFF(e.fecha, ?)) <= 7
       AND e.id != ?
     ORDER BY e.fecha ASC`,
    [houseId, houseId, requesterId, requesterExec.fecha, execId]
  );
  return rows;
}

export async function createSwap(casaId, solicitanteId, execSolId, destinatarioId, execDestId) {
  const [result] = await pool.query(
    `INSERT INTO intercambios
       (casa_id, solicitante_id, ejecucion_solicitante_id, destinatario_id, ejecucion_destinatario_id)
     VALUES (?, ?, ?, ?, ?)`,
    [casaId, solicitanteId, execSolId, destinatarioId, execDestId]
  );
  return result.insertId;
}

export async function getSwapById(swapId) {
  const [rows] = await pool.query(
    `SELECT * FROM intercambios WHERE id = ?`,
    [swapId]
  );
  return rows[0] || null;
}

export async function updateSwapEstado(swapId, estado) {
  await pool.query(
    `UPDATE intercambios SET estado = ? WHERE id = ?`,
    [estado, swapId]
  );
}

export async function swapExecutionUsers(execSolId, execDestId, solicitanteId, destinatarioId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE ejecucion SET usuario_id = ? WHERE id = ?`, [destinatarioId, execSolId]);
    await conn.query(`UPDATE ejecucion SET usuario_id = ? WHERE id = ?`, [solicitanteId, execDestId]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw new ConecctionError('Error al intercambiar ejecuciones');
  } finally {
    conn.release();
  }
}
