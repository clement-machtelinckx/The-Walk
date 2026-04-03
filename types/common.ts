export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export type EntityId = string;

export interface TimestampedEntity {
    id: EntityId;
    created_at: string;
    updated_at: string;
}
