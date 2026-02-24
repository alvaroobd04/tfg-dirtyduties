import { isUserInHouse } from "../modules/houses/houses.repository.js";
import { AuthError, ForbiddenError } from "../erorrs/authError.js";

export async function checkHouseAccess(req, res, next) 
{
    try {
        const userId = req.user?.userId;
        const houseId = Number(req.params.houseId) ?? req.params.id;
        
        if(!userId)
            throw new AuthError("Token inválido")

        if(!houseId || Number.isNaN(houseId))
            throw new AuthError("House id inválido")

        const disponible = await isUserInHouse(userId, houseId);

        if(!disponible)
            throw new ForbiddenError("No perteneces a esta casa")

        req.houseId = houseId;
        next();
    }  catch(error){
        next(error);
    }
}