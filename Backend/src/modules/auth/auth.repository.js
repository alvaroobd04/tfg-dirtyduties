import { pool }  from '../../database/connection.js';
import { ConecctionError } from '../../erorrs/authError.js';

//Buscar usuarios por email 
export async function findUserByEmail(email)
{
    try {
        const [ rows ] = await pool.query (
        'SELECT user_id, user_apodo, email, password_hash, must_change_password FROM USUARIOS WHERE email = ? LIMIT 1',
        [email] //Se evita SQL Inyection
    );

    return rows[0] || null;
    } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos')
    }
}

//Buscar usuarios por apodo
export async function findUserByApodo(apodo)
{
    const [ rows ] = await pool.query (
        'SELECT user_id,user_apodo, email, password_hash from USUARIOS  where user_apodo = ? limit 1',
        [apodo] //Se evita SQL Inyection
    );

    return rows[0] || null;
}


//Crear nuevo usuario
export async function createUser({userApodo, email, nombre, apellidos , passwordHash})
{
    try {
    const [ result ] = await pool.query(
        'INSERT INTO USUARIOS (user_apodo, email, nombre, apellidos, password_hash) values (?,?,?,?,?)',
        [userApodo, email, nombre, apellidos, passwordHash]
    );

    return result.insertId;
    } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos')
    }
}

export async function saveRefreshToken(userId, refreshId, tokenHash, expiresAt) 
{
    try{
        const [ rows ] = await pool.query(
            `INSERT INTO refresh_tokens (id, user_id, token_hash, expires, created) VALUES (?, ?, ?, ?, NOW())`,
            [refreshId, userId, tokenHash, expiresAt]
        );

        return rows;

     } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos al guaradr el token')
    }
}

export async function findRefreshTokenByRefreshId(refreshId)
{
    try{
    const [ rows ] = await pool.query(
        'SELECT * FROM refresh_tokens where id = ?',
        [refreshId]
    );

    return rows;

    } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos')
    }
}


export async function deleteRefreshTokenById(refreshId)
{
     try{
        const [ rows ] = await pool.query(
            `DELETE FROM refresh_tokens where id = ?`,
            [refreshId]
        );

        return rows;

     } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos al borrar el token')
    }
}

export async function getUserProfile(userId) 
{
  const [rows] = await pool.query(
    `SELECT
        user_id,
        user_apodo,
        nombre,
        apellidos,
        email,
        must_change_password
     FROM USUARIOS
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0] || null;
}

export async function updateUserProfile(userId, data) 
{
  const { nombre, apellidos, user_apodo, email } = data;

  await pool.query(
    `UPDATE USUARIOS 
     SET nombre = ?, apellidos = ?, user_apodo = ?, email = ?
     WHERE user_id = ?`,
    [nombre, apellidos, user_apodo, email, userId]
  );

  return await getUserProfile(userId);
}

export async function updateUserPassword(userId, newPasswordHash)
{
    try {
        const [result] = await pool.query(
            'UPDATE USUARIOS SET password_hash = ? WHERE user_id = ?',
            [newPasswordHash, userId]
        );
        return result;
    } catch (err) {
        throw new ConecctionError('Error al actualizar la contraseña');
    }
}

export async function setMustChangePassword(userId, value)
{
    try {
        await pool.query(
            'UPDATE USUARIOS SET must_change_password = ? WHERE user_id = ?',
            [value, userId]
        );
    } catch (err) {
        throw new ConecctionError('Error al actualizar must_change_password');
    }
}

export async function createUserWithHash({ userApodo, email, nombre, apellidos, passwordHash })
{
    try {
        const [ result ] = await pool.query(
            'INSERT INTO USUARIOS (user_apodo, email, nombre, apellidos, password_hash) VALUES (?,?,?,?,?)',
            [userApodo, email, nombre, apellidos, passwordHash]
        );
        return result.insertId;
    } catch(err) {
        throw new ConecctionError('Error al crear usuario social');
    }
}