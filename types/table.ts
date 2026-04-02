export type TableRole = "gm" | "player" | "observer";

export interface Table {
    id: string;
    name: string;
    description?: string;
    gmId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TableMember {
    tableId: string;
    userId: string;
    role: TableRole;
    joinedAt: string;
}
