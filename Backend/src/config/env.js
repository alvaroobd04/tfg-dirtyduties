import dotenv from 'dotenv';

dotenv.config();

//Se recuperan las variables de entorno para no recuperarlas directamente del .env todo el rato

export const env = {
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPort: process.env.DB_PORT,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshToken: process.env.JWT_REFRESH_TOKEN,
  saltRounds: process.env.SALT_ROUNDS
};
