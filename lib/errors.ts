/**
 * Base class for all application errors.
 */
export class AppError extends Error {
    constructor(
        public message: string,
        public code: string = "INTERNAL_ERROR",
        public status: number = 500,
        public details?: unknown,
    ) {
        super(message);
        this.name = "AppError";
    }
}

/**
 * Error when a resource is not found.
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id ? `${resource} avec l'id ${id} introuvable` : `${resource} introuvable`;
        super(message, "NOT_FOUND", 404);
        this.name = "NotFoundError";
    }
}

/**
 * Error for validation failures.
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, "VALIDATION_ERROR", 400, details);
        this.name = "ValidationError";
    }
}

/**
 * Error for permission/access issues.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = "Accès refusé") {
        super(message, "FORBIDDEN", 403);
        this.name = "ForbiddenError";
    }
}

/**
 * Error for authentication issues.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = "Non authentifié") {
        super(message, "UNAUTHORIZED", 401);
        this.name = "UnauthorizedError";
    }
}

/**
 * Database/Persistence error.
 */
export class DatabaseError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, "DATABASE_ERROR", 500, details);
        this.name = "DatabaseError";
    }
}
