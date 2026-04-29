import { pool } from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

export async function createHouse(nombre, userId) 
{

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insertar en casa
        const [houseResult] = await connection.query(
            'INSERT INTO casa (nombre) VALUES (?)',
            [nombre]
        );

        const houseId = houseResult.insertId;

        // Insertar en house_users
        await connection.query(
            'INSERT INTO house_users (house_id, user_id, joined_at) VALUES (?, ?, NOW())',
            [houseId, userId]
        );

        await connection.commit();

        return houseResult;

    } catch (err) {
        await connection.rollback();
        throw new ConecctionError('Error de conexion con la base de datos');
    } finally {
        connection.release();
    }
}

export async function findHouseByName(nombre, userId)
{
    try {
        const [ rows ] = await pool.query(
            'SELECT c.id, c.nombre, c.created_at from casa c JOIN house_users hu ON hu.house_id = c.id where c.nombre = ? AND hu.user_id = ? ',
            [nombre, userId]
        );

        return rows[0] || null;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}

export async function getHousesByUserId(userId)
{
    try {
        const [ rows ] = await pool.query(
             `SELECT c.id, c.nombre, c.modo FROM casa c JOIN house_users hu ON hu.house_id = c.id WHERE hu.user_id = ? ORDER BY c.created_at DESC`,
            [userId]
        );

        return rows;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}

export async function getHousesById(houseId)
{
    try {
        const [ rows ] = await pool.query(
             `SELECT id, nombre, modo, created_at FROM casa where id = ?`,
            [houseId]
        );

        return rows[0] || null;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}

export async function isUserInHouse(userId, houseId)
{
    try {
        const [ rows ] = await pool.query(
            `SELECT * FROM house_users WHERE user_id = ? AND house_id = ? LIMIT 1`,
            [userId, houseId]
        );

        return rows[0] || null;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}


export async function getMembersByHouseId(houseId)
{
    try {
        const [ rows ] = await pool.query(
            `SELECT u.user_id, u.user_apodo FROM usuarios u JOIN house_users hu ON hu.user_id = u.user_id where hu.house_id = ?`,
            [houseId]
        );

        return rows;
    } catch (err) {
        throw new ConecctionError('Error de conexion con la base de datos');
    }
}

export async function deleteUserFromHouse(userId, houseId)
{
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Eliminar usuario
        const [userResult] = await connection.query(
            'DELETE FROM house_users WHERE user_id = ? AND house_id = ?',
            [userId, houseId]
        );

        // Comprobar si quedan mas users
        const [ restantes ] = await connection.query(
            'SELECT count(*) as total FROM house_users WHERE house_id = ?',
            [houseId]
        );

        // Si no hay más users borrar la casa
        if(restantes[0].total === 0)
        {
            await connection.query(
                'DELETE FROM casa WHERE id = ?',
                [houseId]
            )
        }

        await connection.commit();

        return true;

    } catch (err) {
        await connection.rollback();
        throw new ConecctionError('Error de conexion con la base de datos');
    } finally {
        connection.release();
    }
}

export async function getUsersByHouseId(houseId)
{
  const [rows] = await pool.query(
    `SELECT u.user_id, u.user_apodo 
     FROM house_users hu
     JOIN usuarios u ON u.user_id = hu.user_id
     WHERE hu.house_id = ?`,
    [houseId]
  );

  return rows;
}

export async function getTasksByHouseId(houseId)
{
  const [rows] = await pool.query(
    `SELECT t.id, t.nombre, t.dificultad, t.periodicidad
     FROM tarea t
     WHERE t.casa_id = ?`,
    [houseId]
  );

  return rows;
}

export async function updateHouseNameById(houseId, nombre) {
  const [result] = await pool.query(
    `UPDATE casa SET nombre = ? WHERE id = ?`,
    [nombre, houseId]
  );

  return result.affectedRows > 0;
}

export async function createHouseWithTasks(nombre, userId, tasks, modo = 'estricto') {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. crear casa
    const [houseResult] = await connection.query(
      'INSERT INTO casa (nombre, modo) VALUES (?, ?)',
      [nombre, modo]
    );

    const houseId = houseResult.insertId;

    // 2. añadir usuario
    await connection.query(
      'INSERT INTO house_users (house_id, user_id, joined_at) VALUES (?, ?, NOW())',
      [houseId, userId]
    );

    // 3. crear tareas
    for (const t of tasks) {
      await connection.query(
        `INSERT INTO tarea (nombre, dificultad, periodicidad, casa_id)
         VALUES (?, ?, ?, ?)`,
        [t.nombre, t.dificultad, t.periodicidad, houseId]
      );
    }

    await connection.commit();

    return {
      id: houseId,
      nombre,
      tasks,
      users: [{ user_id: userId }]
    };

  } catch (err) {
    await connection.rollback();
    throw new ConecctionError('Error al crear la casa con tareas');
  } finally {
    connection.release();
  }
}