export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError    extends AppError { constructor(m = 'Not found')    { super(m, 404); } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized') { super(m, 401); } }
export class ForbiddenError   extends AppError { constructor(m = 'Forbidden')    { super(m, 403); } }
export class BadRequestError  extends AppError { constructor(m = 'Bad request')  { super(m, 400); } }
export class ConflictError    extends AppError { constructor(m = 'Conflict')     { super(m, 409); } }
