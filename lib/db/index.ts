import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Helper simple pour obtenir le client Supabase serveur (Server Components, Server Actions, Route Handlers).
 * centralise l'accès côté projet à la couche technique Supabase.
 * Ce client respecte la session de l'utilisateur (RLS).
 */
export async function getServerClient() {
    return await createServerClient();
}

/**
 * Client avec les privilèges service_role.
 * À utiliser uniquement pour les opérations administratives (ex: login tokens, triggers complexes).
 * BYPASS LES RLS. À manipuler avec précaution extrême.
 */
export function getServiceRoleClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}

/**
 * Conventions de persistence du projet :
 * 1. Les repositories seront créés dans lib/repositories/ et utiliseront ces clients.
 * 2. Chaque repository se concentrera sur une entité (TableRepository, SessionRepository, etc.).
 * 3. Les opérations DB de bas niveau restent ici si nécessaire.
 */
