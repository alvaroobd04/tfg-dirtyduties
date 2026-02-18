import mysql from 'mysql2/promise';
import { env } from '../config/env.js';


//Se crea un pool de conexion a la bbdd por si hay varias conexiones simultáneas
export const pool = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  port: env.dbPort,
  database: env.dbName,
  password: env.dbPassword,
  waitForConnections: true, //Si las 10 conexiones están ocupadas, la siguiente petición espera
  connectionLimit: 10,  //Nº de conexiones simultáneas
  queueLimit: 0         //No hay límite
});
