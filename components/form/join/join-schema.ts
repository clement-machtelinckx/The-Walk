import { z } from "zod";

export const joinFormSchema = z.object({
    firstName: z.string().min(2, "Minimum 2 caractères").max(80),
    lastName: z.string().min(2, "Minimum 2 caractères").max(80),
    email: z.string().email("Email invalide").max(120),
    phone: z
        .string()
        .min(8, "Téléphone trop court")
        .max(20)
        .regex(/^[0-9+().\s-]+$/, "Téléphone invalide"),
    // Upload (pour l’instant juste validation côté client)
    cv: z
        .any()
        .refine((f) => f instanceof File || f === null, "CV requis")
        .refine((f) => f instanceof File, "Merci de joindre votre CV")
        .refine(
            (f) => (f instanceof File ? f.size <= 5 * 1024 * 1024 : true),
            "Fichier trop lourd (max 5MB)"
        )
        .refine((f) => {
            if (!(f instanceof File)) return true;
            const allowed = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            return allowed.includes(f.type);
        }, "Format invalide (PDF, DOC, DOCX)"),
    // honeypot anti-bot
    website: z.string().optional(),
});

export type JoinFormValues = z.infer<typeof joinFormSchema>;