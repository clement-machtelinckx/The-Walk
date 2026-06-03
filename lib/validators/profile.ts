import { z } from "zod";
import { isAvatarKey } from "@/config/avatars";

export const profileUpdateSchema = z.object({
    avatarKey: z
        .union([
            z.string().refine(isAvatarKey, {
                message: "Avatar non supporte",
            }),
            z.null(),
        ])
        .optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
