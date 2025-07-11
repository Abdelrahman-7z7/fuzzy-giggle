export default class AppError extends Error{
    statusCode: number;
    status: 'fail' | 'error';
    isOperational: boolean;

    //optional additional fields for Supabase/PostageSQL
    code?:string;
    details?:string;
    hint?:string;

    constructor(message:string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }
}