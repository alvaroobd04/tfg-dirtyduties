import { createInvitationService, joinByTokenService, getInvitationsByHouseService} from './invitations.service.js';
 
export async function createInvitationController(req, res, next) 
{
    try {
        const houseId = req.houseId;
 
        const result = await createInvitationService(houseId);
 
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}
 
export async function joinByTokenController(req, res, next) 
{
    try {
        const userId = req.user.userId
 
        const result = await joinByTokenService(req.body, userId);
 
        return res.status(200).json({ message: 'Te has unido a la casa correctamente', ...result });
    } catch (error) {
        next(error);
    }
}
 
export async function getInvitationsByHouseController(req, res, next) 
{
    try {
        const houseId = req.houseId;
 
        const invitations = await getInvitationsByHouseService(houseId);
 
        return res.status(200).json({ invitations });
    } catch (error) {
        next(error);
    }
}