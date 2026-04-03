import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { NotFoundError } from "@/lib/errors";

export interface Profile {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export const ProfileRepository = {
    async getById(id: string): Promise<Profile> {
        const supabase = await getServerClient();
        const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Profile", id);
        }
        handleDbError(error, "ProfileRepository.getById");
        return data;
    },

    async getByEmail(email: string): Promise<Profile> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .single();

        if (error && error.code === "PGRST116") {
            throw new NotFoundError("Profile", email);
        }
        handleDbError(error, "ProfileRepository.getByEmail");
        return data;
    },

    async update(
        id: string,
        updates: Partial<Pick<Profile, "display_name" | "avatar_url">>,
    ): Promise<Profile> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        handleDbError(error, "ProfileRepository.update");
        return data;
    },
};
