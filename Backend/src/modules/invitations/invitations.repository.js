import { pool } from '../../database/connection.js'
import { ConecctionError } from '../../erorrs/authError.js'

export async function createInvitation({ houseId, token, fechaExpiracion })
 {
    try {
        const [result] = await pool.query(
            'INSERT INTO invitacion (casa_id, token, fecha_creacion, fecha_expiracion) VALUES (?, ?, NOW(), ?)',
            [houseId, token, fechaExpiracion]
        );
        return result.insertId;
    } catch (err) {
        throw new ConecctionError('Error al crear la invitación');
    }
}
 
export async function findInvitationByToken(token) 
{
    try {
        const [rows] = await pool.query(
            'SELECT * FROM invitacion WHERE token = ?',
            [token]
        );
        return rows[0] || null;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}
 
export async function getInvitationsByHouse(houseId) 
{
    try {
        const [rows] = await pool.query(
            'SELECT * FROM invitacion WHERE casa_id = ? AND (used IS NULL OR used = 0) AND fecha_expiracion > NOW()',
            [houseId]
        );
        return rows;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}
 
export async function markInvitationUsed(invitationId) 
{
    try {
        await pool.query(
            'UPDATE invitacion SET used = 1 WHERE id = ?',
            [invitationId]
        );
    } catch (err) {
        throw new ConecctionError('Error al marcar la invitación como usada');
    }
}
 
export async function addUserToHouse(userId, houseId) 
{
    try {
        await pool.query(
            'INSERT INTO house_users (user_id, house_id) VALUES (?, ?)',
            [userId, houseId]
        );
    } catch (err) {
        throw new ConecctionError('Error al añadir usuario a la casa');
    }
}
 
export async function isUserInHouse(userId, houseId) 
{
    try {
        const [rows] = await pool.query(
            'SELECT 1 FROM house_users WHERE user_id = ? AND house_id = ?',
            [userId, houseId]
        );
        return rows.length > 0;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}
 