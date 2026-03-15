import express from 'express';
import { createInvitationController, joinByTokenController, getInvitationsByHouseController } from "./invitations.controller.js";
import { autenticarToken } from '../../middlewares/auth.middlewares.js';
import { checkHouseAccess } from '../../middlewares/checkHouseAccess.middleware.js'
const router = express.Router();

router.post('/:houseId/invitations', autenticarToken, checkHouseAccess, createInvitationController);
router.get('/:houseId/invitations', autenticarToken, checkHouseAccess, getInvitationsByHouseController);


router.post('/invitations/join', autenticarToken, joinByTokenController);


export default router;
