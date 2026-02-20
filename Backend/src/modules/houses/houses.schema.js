import z from 'zod';

export const createHouseSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(2, 'El nombre de la casa debe tener al menos 2 caracteres')
        .max(255, 'El nombre de la casa debe tener como maximo 255 caracteres')
});
