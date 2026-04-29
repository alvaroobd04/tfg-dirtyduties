import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import housesRoutes from './modules/houses/houses.routes.js';
import tasksRoutes from './modules/tasks/task.routes.js'
import invitationsRoutes from './modules/invitations/invitations.routes.js'
import notificationsRoutes from './modules/notifications/notifications.routes.js'
import { swapsHouseRoutes, swapsDirectRoutes } from './modules/swaps/swaps.routes.js'
import vacationsRoutes from './modules/vacations/vacations.routes.js'
import { errorHandler } from './middlewares/erorr.middleware.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.disable('etag');
//Se desactiva porque es información delicada que los atacantes pueden usar para ataques
app.disable('x-powered-by');

//Configuración de CORS: solo permitir peticiones desde el frontend autorizado
app.use(cors({
  origin: [
    "http://localhost:5173"
  ],
  credentials: true
}));


app.use(express.json());
app.use(cookieParser())

//Rutas
app.use('/auth', authRoutes);
app.use('/houses', housesRoutes);
app.use('/houses', tasksRoutes);
app.use('/houses', invitationsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/houses', swapsHouseRoutes);
app.use('/swaps', swapsDirectRoutes);
app.use('/houses', vacationsRoutes);

app.use(errorHandler);

export default app;
