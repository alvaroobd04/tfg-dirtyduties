import { ConflictError } from '../../erorrs/authError.js';
import { createHouseSchema } from './houses.schema.js';
import { findHouseByName, createHouse } from './houses.repository.js';

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
