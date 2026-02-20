import { createNewHouse } from './houses.service.js';

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
