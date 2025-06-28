// controller/errorController.ts
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

// Duplicate field error (PostgreSQL code 23505)
const handleDuplicateFieldSupabase = (err: any): AppError => {
  const details: string = err.details || '';
  const match = details.match(/\((.*?)\)=\((.*?)\)/);

  if (match) {
    const [, field, value] = match;
    return new AppError(`The ${field} '${value}' is already taken.`, 400);
  }

  return new AppError('Duplicate field value. Please use another value!', 400);
};

// General Supabase client error (PostgREST)
const handleGeneralSupabaseError = (err: any): AppError => {
  const message = err.message || 'Supabase error occurred.';
  const details = err.details ? ` (${err.details})` : '';
  const hint = err.hint ? ` Hint: ${err.hint}` : '';
  return new AppError(`${message}${details}${hint}`, err.status || 400);
};

// Auth API Errors (e.g., from supabase.auth.signUp)
const handleAuthApiError = (err: any): AppError => {
  const message = err.message || 'Authentication error.';
  return new AppError(message, err.status || 401);
};

// JWT
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Token expired. Please log in again.', 401);

// Multer
const handleMulterError = (err: any): AppError => {
  let message = 'An error occurred during file upload.';
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size exceeds the maximum limit of 10MB.';
  } else if (err.code === 'LIMIT_FILE_TYPE') {
    message = err.field;
  }
  return new AppError(message, 400);
};

// Development error response
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    code: err.code || null,
    details: err.details || null,
    hint: err.hint || null,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Global error middleware
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const env = process.env.NODE_ENV?.trim() || 'development';

  if (env === 'development') {
    sendErrorDev(err, res);
  } else {
    let error: any = { ...err };
    error.name = err.name;
    error.message = err.message;
    error.details = err.details;
    error.hint = err.hint;
    error.code = err.code;

    if (error.code === '23505') error = handleDuplicateFieldSupabase(error);
    if (error.name === 'AuthApiError') error = handleAuthApiError(error);
    if (error.message?.toLowerCase().includes('supabase'))
      error = handleGeneralSupabaseError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
