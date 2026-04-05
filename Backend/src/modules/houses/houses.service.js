import { ConflictError, NotFoundError } from '../../erorrs/authError.js';
import { createHouseSchema } from './houses.schema.js';
import { findHouseByName, createHouse, getHousesByUserId, getHousesById, getMembersByHouseId, deleteUserFromHouse, getUsersByHouseId, getTasksByHouseId, updateHouseNameById, createHouseWithTasks } from './houses.repository.js';

export async function createNewHouse(data, userId)
{
    const parsedData = createHouseSchema.parse(data);
    const { nombre, tasks } = parsedData;
    
    const existingHouse = await findHouseByName(nombre, userId);

    if (existingHouse) {
        throw new ConflictError('Ya tienes una casa con ese nombre');
    }

    const houseId = await createHouseWithTasks( nombre, userId, tasks );

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
    const members = await getMembersByHouseId(houseId);

    return members
}

export async function deleteUserFromHouseService(userId, houseId)
{
    return await deleteUserFromHouse(userId, houseId);
}

export async function getHouseDetails(houseId) 
{
  const house = await getHouseById(houseId);

  if (!house) {
    throw new NotFoundError('Casa no encontrada');
  }

  const users = await getUsersByHouseId(houseId);
  const tasks = await getTasksByHouseId(houseId);

  return {
    ...house,
    users,
    tasks
  };
}

export async function updateHouseNameService(data, houseId) {
  const parsed = createHouseSchema.parse(data);

  const updated = await updateHouseNameById(houseId, parsed.nombre);

  if (!updated) {
    throw new NotFoundError('La casa no existe');
  }

  return {
    id: Number(houseId),
    nombre: parsed.nombre
  };
}