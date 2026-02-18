import { pool }  from '../../database/connection.js'
import { ConecctionError } from '../../erorrs/authError.js';

//Buscar usuarios por email 
export async function findUserByEmail(email)
{
    try {
        const [ rows ] = await pool.query (
        'SELECT user_id,user_apodo, email, password_hash from USUARIOS  where email = ? limit 1',
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

export async function saveRefreshToken(userId, tokenHash, expiresAt) 
{
    try{
        const [ rows ] = await pool.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires, created) VALUES (?, ?, ?, NOW())`,
            [userId, tokenHash, expiresAt]
        );

        return rows;

     } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos al guaradr el token')
    }
}

export async function findRefreshTokenByUserId(userId)
{
    try{
    const [ rows ] = await pool.query(
        'SELECT * FROM refresh_tokens where user_id = ?',
        [userId]
    );

    return rows;

    } catch(err) {
        throw new ConecctionError('Error de conexión con la base de datos')
    }
}