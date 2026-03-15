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
        
        const values = executions.map(e => [e.tarea_id, e.usuario_id, e.fecha, e.estado]);

        await pool.query(
            'INSERT INTO ejecucion (tarea_id, usuario_id, fecha, estado) VALUES ?',
            [values]
        );
    } catch (error) {
        throw new ConecctionError('Error al crear ejecuciones')
    }
}

export async function deleteFutureExecutions(houseId)
{
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];

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
            `SELECT e.fecha, t.nombre AS tarea, e.usuario_id AS usuario, e.estado
             FROM ejecucion e
             INNER JOIN tarea t ON e.tarea_id = t.id
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