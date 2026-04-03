import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const signupSchema = z
    .object({
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
        confirmPassword: z.string().min(6, "La confirmation est requise"),
        displayName: z
            .string()
            .min(2, "Le nom d'affichage doit faire au moins 2 caractères")
            .optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

export const passwordChangeSchema = z
    .object({
        currentPassword: z.string().min(6, "L'ancien mot de passe est requis"),
        newPassword: z.string().min(6, "Le nouveau mot de passe doit faire au moins 6 caractères"),
        confirmPassword: z.string().min(6, "La confirmation est requise"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Les nouveaux mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

export const tokenLoginSchema = z.object({
    token: z.string().min(1, "Token requis"),
    redirectTo: z
        .string()
        .startsWith("/", "Redirection invalide")
        .refine((s) => !s.includes("//"), "Redirection non sécurisée")
        .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type TokenLoginInput = z.infer<typeof tokenLoginSchema>;
