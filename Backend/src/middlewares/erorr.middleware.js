import { ZodError } from "zod";
import { ValidationError } from "../erorrs/authError.js";

export const errorHandler = (err, req, res, next) => {

    if(err instanceof ZodError){
        const formatedError = err.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
        }))

        return res.status(400).json({
            error: 'ValidationError',
            message: 'Datos inválidos',
            details: formatedError
        })
    }

    if(err.statusCode){
        return res.status(err.statusCode).json({
            error: err.name,
            message: err.message,
            details: err.details || undefined
        })
    }

    console.log(err)

    return res.status(500).json({
        error: 'InternalServerError',
        message: 'Error interno del servidor',
        details: err.details || undefined
    })
}