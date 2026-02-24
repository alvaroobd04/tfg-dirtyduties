import { createNewHouse, getHouseFromUser, getHouseById, getMembersService, deleteUserFromHouseService } from './houses.service.js';

export async function createHouseController(req, res, next)
{
    try {
        const house = await createNewHouse(req.body, req.user.userId);

        return res.status(201).json({
            message: 'Casa creada correctamente',
            house
        });
    } catch (error) {
        next(error);
    }
}

export async function getHousesController(req, res, next)
{
    try{
        const userId = req.user.userId; 
        
        const houses = await getHouseFromUser(userId);

        return res.status(200).json({
            houses,
        });
    } catch (error){
        next(error);
    }
}

export async function getHouseByIdController(req, res, next)
{
     try{
        const houseId = req.houseId; 
        
        const house = await getHouseById(houseId);

        return res.status(200).json({
            house,
        });
    } catch (error){
        next(error);
    }
}

export async function getMembersController(req, res, next)
{
    try {
        const houseId = req.houseId;
        
        const members = await getMembersService(houseId);

        return res.status(200).json({
            members
        });
    } catch (error) {
        next(error);
    }


}

export async function deleteUserFromHouseController(req, res, next)
{
    try{
        const userId = req.user.userId;
        const houseId = req.houseId;

        await deleteUserFromHouseService(userId, houseId);

        return res.status(200).json({
            message: 'Has salido de la casa correctamente'
        });

    } catch(error){
        next(error);
    }
}