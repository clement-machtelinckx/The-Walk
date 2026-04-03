import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const signupSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
    displayName: z.string().min(2, "Le nom d'affichage est requis").optional(),
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
