import { DatabaseError } from "@/lib/errors";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Handle Supabase errors and throw project-specific errors.
 */
export function handleDbError(error: PostgrestError | null, context?: string): void {
    if (error) {
        console.error(`Database Error [${context || "unknown"}]:`, error);
        throw new DatabaseError(error.message, error);
    }
}

/**
 * Common pagination parameters.
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    ascending?: boolean;
}

/**
 * Standard pagination result.
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Apply pagination to a Supabase query.
 */
export function applyPagination(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    params: PaginationParams,
    defaultSort: string = "created_at",
) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const sortBy = params.sortBy || defaultSort;
    const ascending = params.ascending !== false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return query.order(sortBy, { ascending }).range(from, to);
}
