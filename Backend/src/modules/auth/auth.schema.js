import z from 'zod';

export const registerSchema = z.object({
    email: z
        .email('Formato de email inválido'),

    user_apodo: z
        .string()
        .min(3, 'El apodo debe tener como mínimo 3 caracteres')
        .max(30, 'El apodo debe tener como máximo 30 caracteres')
        .regex(/^[a-zA-Z0-9-_]+$/, 'El apodo solo puede contener letras, números y "_"'),

    password: z 
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un caracter especial'),

    nombre: z
        .string()
        .min(2, 'El nombre debe tener como mínimo 2 caracteres')
        .max(50, 'El nombre debe tener como máximo 50 caracteres'),

    apellidos: z
        .string()
        .min(2, 'Los apellidos debe tener como mínimo 2 caracteres')
        .max(50, 'Los apellidos debe tener como máximo 50 caracteres'),
})

export const loginSchema = z.object({
    email: z
        .email('Formato de email invalido'),

    password: z
            .string()
            .min(1,'La contraseña es obligatoria')
});