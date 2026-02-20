import { pool } from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

export async function createHouse( nombre, userId )
{
    try {
        const [ result ] = await pool.query(
            'INSERT INTO casa (nombre, user_id) VALUES (?, ?)',
            [nombre, userId]
        );

        return result;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}

export async function findHouseByName(nombre, userId)
{
    try {
        const [ rows ] = await pool.query(
            'SELECT id, nombre, created_at FROM casa WHERE nombre = ? and user_id = ?',
            [nombre, userId]
        );

        return rows[0] || null;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}
