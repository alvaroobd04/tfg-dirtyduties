import { joinInvitationSchema  } from "./invitations.schema.js";
import { getInvitationsByHouse,createInvitation, isUserInHouse, addUserToHouse, markInvitationUsed, findInvitationByToken} from "./invitations.repository.js";
import { ConflictError, NotFoundError, ValidationError } from "../../erorrs/authError.js";
import { randomBytes } from "crypto";

const EXPIRATION_DAYS = 7;

function generateToken()
{
    return randomBytes(6).toString('hex').toUpperCase();
}

function getExpirationDate()
{
    const date = new Date();
    date.setDate(date.getDate() + EXPIRATION_DAYS);

    return date.toISOString().split('T')[0];
}

export async function createInvitationService(houseId) 
{
    const token = generateToken();
    const fechaExpiracion = getExpirationDate();
 
    await createInvitation({ houseId, token, fechaExpiracion });
 
    return { token, expiresAt: fechaExpiracion };
}

export async function joinByTokenService(data, userId) 
{
    const parsed = joinInvitationSchema.parse(data);
 
    const invitation = await findInvitationByToken(parsed.token);
 
    if (!invitation) {
        throw new NotFoundError('El token de invitación no existe');
    }
 
    if (invitation.usado) {
        throw new ConflictError('Este token ya ha sido utilizado');
    }
 
    const now = new Date();
    const expiration = new Date(invitation.fecha_expiracion);
    if (now > expiration) {
        throw new ValidationError('El token de invitación ha expirado');
    }
 
    const alreadyMember = await isUserInHouse(userId, invitation.casa_id);
    if (alreadyMember) {
        throw new ConflictError('Ya perteneces a esta casa');
    }
 
    await addUserToHouse(userId, invitation.casa_id);
    await markInvitationUsed(invitation.id);
 
    return { houseId: invitation.casa_id };
}

export async function getInvitationsByHouseService(houseId)
{
    return await getInvitationsByHouse(houseId);
}