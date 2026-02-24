import { ConflictError, NotFoundError } from '../../erorrs/authError.js';
import { createHouseSchema } from './houses.schema.js';
import { findHouseByName, createHouse, getHousesByUserId, getHousesById, getMembersByHouseId, deleteUserFromHouse } from './houses.repository.js';

export async function createNewHouse(data, userId)
{
    
    const parsedData = createHouseSchema.parse(data);
    const { nombre } = parsedData;
    
    const existingHouse = await findHouseByName(nombre, userId);

    if (existingHouse) {
        throw new ConflictError('Ya existe una casa con ese nombre');
    }

    const houseId = await createHouse( nombre, userId );

    return {
        id: houseId,
        nombre
    };
}

export async function getHouseFromUser(userId)
{
    const houses = await getHousesByUserId(userId);

    return houses;
}

export async function getHouseById(houseId) 
{
    const house = await getHousesById(houseId)

    if(!house)
        throw new NotFoundError("Casa no encontrada")

    return house;
}

export async function getMembersService(houseId)
{
    const members = await getMembersByHouseId(houseId)

    return members
}

export async function deleteUserFromHouseService(userId, houseId)
{
    return await deleteUserFromHouse(userId, houseId);
}
