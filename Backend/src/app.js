import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import housesRoutes from './modules/houses/houses.routes.js';
import { errorHandler } from './middlewares/erorr.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

//Se desactiva porque es información delicada que los atacantes pueden usar para ataques
app.disable('x-powered-by');


app.use(express.json());
app.use(cookieParser())

//Rutas
app.use('/auth', authRoutes);
app.use('/houses', housesRoutes);

app.use(errorHandler);

// Ruta de prueba para comprobar que el servidor funciona
app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});


export default app;
