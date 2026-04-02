import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Helper simple pour obtenir le client Supabase serveur (Server Components, Server Actions, Route Handlers).
 * centralise l'accès côté projet à la couche technique Supabase.
 */
export async function getServerClient() {
    return await createServerClient();
}

/**
 * Conventions de persistence du projet :
 * 1. Les repositories seront créés dans lib/repositories/ et utiliseront ces clients.
 * 2. Chaque repository se concentrera sur une entité (TableRepository, SessionRepository, etc.).
 * 3. Les opérations DB de bas niveau restent ici si nécessaire.
 */
