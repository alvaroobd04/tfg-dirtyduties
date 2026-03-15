import z from 'zod';

export const createTaskSchema = z.object({
    nombre: z
            .string()
            .min(2,'El nombre debe tener al menos 2 caracteres')
            .max(255),

    dificultad: z
            .number()
            .int()
            .min(1)
            .max(5),

    periodicidad: z
            .number()
            .int()
            .min(1)
            .max(7)
});