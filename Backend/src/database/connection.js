import mysql from 'mysql2/promise';
import { env } from '../config/env.js';


//Se crea un pool de conexion a la bbdd por si hay varias conexiones simultáneas
export const pool = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  port: env.dbPort,
  database: env.dbName,
  password: env.dbPassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: ['DATE']  // columnas DATE vuelven como string 'YYYY-MM-DD', sin conversión de zona horaria
});
