import z from 'zod';

export const joinInvitationSchema  = z.object({
    token: z
        .string()
        .min(1, 'El token es requerido'),
});