export const createErrorFactory = (name, statusCode) => {
    return class AppError extends Error {
        constructor (message, details = null) {
            super(message)
            this.name = name 
            this.statusCode = statusCode
            this.details = details
            Error.captureStackTrace?.(this, this.constrcutor)
        }
    }
}

export const ValidationError = createErrorFactory('ValidationError', 400)
export const AuthError = createErrorFactory('AuthError', 401)
export const ForbiddenError = createErrorFactory('ForbiddenError', 403)
export const NotFoundError = createErrorFactory('NotFoundError', 404)
export const ConflictError = createErrorFactory('ConflictError', 409);
export const ConecctionError = createErrorFactory('ConecctionError', 500)
export const InternalServerError = createErrorFactory('InternalServerError', 500)