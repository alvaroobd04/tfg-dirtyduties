import { pool } from '../../database/connection.js'
import { ConecctionError } from '../../erorrs/authError.js'

export async function createTask(data, houseId)
{
    try {
        const [ result ] = await pool.query(
            'INSERT INTO tarea (casa_id, nombre, dificultad, periodicidad) VALUES (?,?,?,?)',
            [houseId, data.nombre, data.dificultad, data.periodicidad]
        );

        return result.insertId;

    } catch (error) {
        throw new ConecctionError('Error al crear tarea')
    }
}


export async function getTasksByHouseId(houseId)
{
    try {
        const [ rows ] = await pool.query(
            'SELECT * FROM tarea WHERE casa_id = ?',
            [houseId]
        );

        return rows;

    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }    
}

export async function getUsersByHouseId(houseId)
{
    try {
        const [ rows ] = await pool.query(
            'SELECT user_id from house_users WHERE house_id = ?',
            [houseId]
        );
        
        return rows.map(r => r.user_id);
    } catch (err) {
        throw new ConecctionError('Error de conexión a la base de datos');
    }
}

export async function createExecutions(executions)
{
    try {
        if(!executions || executions.length === 0)
            return;
        
        const values = executions.map(e => [e.tarea_id, e.usuario_id, e.fecha, e.estado, e.tipo ?? null]);

        await pool.query(
            'INSERT INTO ejecucion (tarea_id, usuario_id, fecha, estado, tipo) VALUES ?',
            [values]
        );
    } catch (error) {
        throw new ConecctionError('Error al crear ejecuciones')
    }
}

export async function deleteFutureExecutions(houseId)
{
    try {
        const today = new Date().toLocaleDateString('en-CA');
        const now = new Date();
        const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-CA');

        await pool.query(
            'DELETE e FROM ejecucion e INNER JOIN tarea t ON e.tarea_id = t.id WHERE t.casa_id = ? AND e.fecha >= ? AND e.fecha < ?',
            [houseId, today, firstDayNextMonth]
        );
    } catch (err) {
        throw new ConecctionError('Error al eliminar ejecuciones futuras');
    }
}

export async function getMonthExecutions(houseId) {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const firstDay = `${year}-${month}-01`;
        const firstDayNextMonth = new Date(year, now.getMonth() + 1, 1)
            .toISOString().split('T')[0];
 
        const [rows] = await pool.query(
            `SELECT e.id, e.fecha, t.nombre AS taskName, u.nombre AS usuario, e.estado, e.tipo
             FROM ejecucion e
             INNER JOIN tarea t ON e.tarea_id = t.id
             INNER JOIN usuarios u ON u.user_id = e.usuario_id
             WHERE t.casa_id = ?
               AND e.fecha >= ?
               AND e.fecha < ?
             ORDER BY e.fecha ASC`,
            [houseId, firstDay, firstDayNextMonth]
        );
        return rows;
    } catch (err) {
        throw new ConecctionError('Error al obtener el calendario');
    }
}

export async function completeExecution(executionId) {
    try {
        const [result] = await pool.query(
            "UPDATE ejecucion SET estado = 'completada' WHERE id = ?",
            [executionId]
        );
        return result.affectedRows;
    } catch (err) {
        throw new ConecctionError('Error al completar la ejecución');
    }
}

export async function deleteTaskById(houseId, taskId) 
{
  const [result] = await pool.query(
    `DELETE FROM tarea 
     WHERE id = ? AND casa_id = ?`,
    [taskId, houseId]
  );

  return result.affectedRows > 0;
}

export async function updateTaskById(houseId, taskId, data) 
{
  const [result] = await pool.query(
    `UPDATE tarea 
     SET nombre = ?, dificultad = ?, periodicidad = ?
     WHERE id = ? AND casa_id = ?`,
    [data.nombre, data.dificultad, data.periodicidad, taskId, houseId]
  );

  return result.affectedRows > 0;
}

export async function updateExecutionValidation(executionId, result, confidence)
{
  await pool.query(
    `UPDATE ejecucion
     SET validation_result = ?,
         validated_at = NOW(),
         estado = ?
     WHERE id = ?`,
    [result ? 'valid' : 'invalid', result ? 'completada' : 'pendiente', executionId]
  );
}

export async function getExecutionById(executionId)
{
  const [rows] = await pool.query(
    `SELECT e.*, u.nombre AS userName
     FROM ejecucion e
     JOIN usuarios u ON u.user_id = e.usuario_id
     WHERE e.id = ?`,
    [executionId]
  );

  return rows[0];
}

export async function createPunishmentExecution(execution) 
{
  await pool.query(
    `INSERT INTO ejecucion (tarea_id, usuario_id, fecha, estado, tipo)
     VALUES (?, ?, ?, 'pendiente', 'castigo')`,
    [execution.tarea_id, execution.usuario_id, execution.fecha]
  );
}

export async function getMyExecutions(userId, houseId)
{
  const today = new Date().toLocaleDateString('en-CA')

  const [rows] = await pool.query(`
    SELECT e.id, e.fecha, t.nombre AS taskName, e.estado, e.validation_result, e.tipo
    FROM ejecucion e
    JOIN tarea t ON e.tarea_id = t.id
    WHERE e.usuario_id = ?
      AND t.casa_id = ?
      AND e.fecha BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
    ORDER BY e.fecha ASC
  `, [userId, houseId, today, today])

  return rows
}

export async function getPendingTasksBefore(date)
{
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toLocaleDateString('en-CA');

    const [rows] = await pool.query(`
      SELECT e.*, t.nombre AS taskName, u.nombre AS userName
      FROM ejecucion e
      JOIN tarea t ON e.tarea_id = t.id
      JOIN usuarios u ON u.user_id = e.usuario_id
      WHERE e.estado = 'pendiente'
        AND e.fecha = ?
        AND (e.tipo IS NULL OR e.tipo != 'castigo')
    `, [formattedDate]);

    return rows;
  } catch (err) {
    throw new ConecctionError('Error al obtener tareas pendientes vencidas');
  }
}

export async function getHouseStats(houseId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const firstDay = `${year}-${month}-01`;
  const firstDayNextMonth = new Date(year, now.getMonth() + 1, 1)
    .toISOString().split('T')[0];

  const [rows] = await pool.query(
    `SELECT
       u.user_id                                                                     AS userId,
       u.nombre                                                                      AS userName,
       u.user_apodo                                                                  AS userApodo,
       COUNT(CASE WHEN e.estado = 'completada'
                   AND (e.tipo IS NULL OR e.tipo != 'castigo') THEN 1 END)           AS completadas,
       COUNT(CASE WHEN e.tipo  = 'castigo'                    THEN 1 END)           AS fallos,
       COALESCE(SUM(CASE WHEN (e.tipo IS NULL OR e.tipo != 'castigo')
                         THEN t.dificultad ELSE 0 END), 0)                          AS carga
     FROM house_users hu
     JOIN usuarios u ON u.user_id = hu.user_id
     LEFT JOIN ejecucion e
       ON  e.usuario_id = u.user_id
       AND e.fecha >= ? AND e.fecha < ?
     LEFT JOIN tarea t
       ON  t.id = e.tarea_id AND t.casa_id = ?
     WHERE hu.house_id = ?
     GROUP BY u.user_id, u.nombre, u.user_apodo
     ORDER BY completadas DESC, fallos ASC`,
    [firstDay, firstDayNextMonth, houseId, houseId]
  );
  return rows;
}

export async function markExecutionAsFailed(executionId)
{
  await pool.query(
    `UPDATE ejecucion
     SET estado = 'fallida'
     WHERE id = ?`,
    [executionId]
  );
}