// packages/core/src/utils/errors.ts
export enum ErrorCodes {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_ERROR = 'TOKEN_REFRESH_ERROR',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_VERIFICATION_ERROR = 'EMAIL_VERIFICATION_ERROR',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // User management errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  REGISTRATION_ERROR = 'REGISTRATION_ERROR',
  LOGIN_ERROR = 'LOGIN_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  PASSWORD_RESET_ERROR = 'PASSWORD_RESET_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Project errors
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_CREATION_ERROR = 'PROJECT_CREATION_ERROR',
  PROJECT_UPDATE_ERROR = 'PROJECT_UPDATE_ERROR',
  PROJECT_DELETION_ERROR = 'PROJECT_DELETION_ERROR',
  PROJECT_ACCESS_ERROR = 'PROJECT_ACCESS_ERROR',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',
  PROJECT_SEARCH_ERROR = 'PROJECT_SEARCH_ERROR',
  PROJECT_STATS_ERROR = 'PROJECT_STATS_ERROR',
  PROJECT_DUPLICATION_ERROR = 'PROJECT_DUPLICATION_ERROR',
  PROJECT_ARCHIVE_ERROR = 'PROJECT_ARCHIVE_ERROR',
  PROJECT_CREATE_ERROR = 'PROJECT_CREATE_ERROR',
  PROJECT_GET_ERROR = 'PROJECT_GET_ERROR',
  PROJECT_DELETE_ERROR = 'PROJECT_DELETE_ERROR',
  PROJECT_LIST_ERROR = 'PROJECT_LIST_ERROR',
  
  // Member management errors
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',
  MEMBER_ADDITION_ERROR = 'MEMBER_ADDITION_ERROR',
  MEMBER_REMOVAL_ERROR = 'MEMBER_REMOVAL_ERROR',
  MEMBER_UPDATE_ERROR = 'MEMBER_UPDATE_ERROR',
  
  // Invitation errors
  INVITATION_NOT_FOUND = 'INVITATION_NOT_FOUND',
  INVITATION_INVALID = 'INVITATION_INVALID',
  INVITATION_EXPIRED = 'INVITATION_EXPIRED',
  INVITATION_ALREADY_SENT = 'INVITATION_ALREADY_SENT',
  INVITATION_ERROR = 'INVITATION_ERROR',
  INVITATION_ACCEPTANCE_ERROR = 'INVITATION_ACCEPTANCE_ERROR',
  INVITATION_DECLINE_ERROR = 'INVITATION_DECLINE_ERROR',
  
  // Chat errors
  CHAT_SESSION_NOT_FOUND = 'CHAT_SESSION_NOT_FOUND',
  CHAT_SESSION_CREATION_ERROR = 'CHAT_SESSION_CREATION_ERROR',
  CHAT_SESSION_UPDATE_ERROR = 'CHAT_SESSION_UPDATE_ERROR',
  CHAT_SESSION_DELETION_ERROR = 'CHAT_SESSION_DELETION_ERROR',
  CHAT_SESSION_ACCESS_ERROR = 'CHAT_SESSION_ACCESS_ERROR',
  CHAT_SESSION_SEARCH_ERROR = 'CHAT_SESSION_SEARCH_ERROR',
  CHAT_SESSION_DUPLICATION_ERROR = 'CHAT_SESSION_DUPLICATION_ERROR',
  CHAT_SESSION_ARCHIVE_ERROR = 'CHAT_SESSION_ARCHIVE_ERROR',
  CHAT_SESSION_CREATE_ERROR = 'CHAT_SESSION_CREATE_ERROR',
  CHAT_SESSION_GET_ERROR = 'CHAT_SESSION_GET_ERROR',
  CHAT_SESSION_DELETE_ERROR = 'CHAT_SESSION_DELETE_ERROR',
  CHAT_SESSION_LIST_ERROR = 'CHAT_SESSION_LIST_ERROR',
  CHAT_EXPORT_ERROR = 'CHAT_EXPORT_ERROR',
  CHAT_STATS_ERROR = 'CHAT_STATS_ERROR',
  
  // Message errors
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
  MESSAGE_CREATION_ERROR = 'MESSAGE_CREATION_ERROR',
  MESSAGE_UPDATE_ERROR = 'MESSAGE_UPDATE_ERROR',
  MESSAGE_DELETION_ERROR = 'MESSAGE_DELETION_ERROR',
  MESSAGE_ACCESS_ERROR = 'MESSAGE_ACCESS_ERROR',
  MESSAGE_SEARCH_ERROR = 'MESSAGE_SEARCH_ERROR',
  MESSAGE_CREATE_ERROR = 'MESSAGE_CREATE_ERROR',
  MESSAGE_GET_ERROR = 'MESSAGE_GET_ERROR',
  MESSAGE_DELETE_ERROR = 'MESSAGE_DELETE_ERROR',
  
  // File errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_UPDATE_ERROR = 'FILE_UPDATE_ERROR',
  FILE_DELETION_ERROR = 'FILE_DELETION_ERROR',
  FILE_ACCESS_ERROR = 'FILE_ACCESS_ERROR',
  FILE_SEARCH_ERROR = 'FILE_SEARCH_ERROR',
  FILE_MOVE_ERROR = 'FILE_MOVE_ERROR',
  FILE_COPY_ERROR = 'FILE_COPY_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  FILE_STATS_ERROR = 'FILE_STATS_ERROR',
  FILE_VERSION_ERROR = 'FILE_VERSION_ERROR',
  FILE_VERSION_CREATION_ERROR = 'FILE_VERSION_CREATION_ERROR',
  FILE_ALREADY_EXISTS = 'FILE_ALREADY_EXISTS',
  FILE_CREATE_ERROR = 'FILE_CREATE_ERROR',
  FILE_GET_ERROR = 'FILE_GET_ERROR',
  FILE_DELETE_ERROR = 'FILE_DELETE_ERROR',
  FILE_LIST_ERROR = 'FILE_LIST_ERROR',
  FILE_DUPLICATE_ERROR = 'FILE_DUPLICATE_ERROR',
  FILE_CONTENT_ERROR = 'FILE_CONTENT_ERROR',
  
  // Folder errors
  FOLDER_CREATION_ERROR = 'FOLDER_CREATION_ERROR',
  FOLDER_NOT_FOUND = 'FOLDER_NOT_FOUND',
  
  // Analytics errors
  ANALYTICS_ERROR = 'ANALYTICS_ERROR',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_EXPORT_FORMAT = 'INVALID_EXPORT_FORMAT',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class CoreError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCodes,
    details?: any,
    statusCode?: number
  ) {
    super(message);
    this.name = 'CoreError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.statusCode = statusCode || this.getDefaultStatusCode(code);

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, CoreError.prototype);
  }

  private getDefaultStatusCode(code: ErrorCodes): number {
    switch (code) {
      case ErrorCodes.UNAUTHORIZED:
      case ErrorCodes.INVALID_CREDENTIALS:
      case ErrorCodes.INVALID_TOKEN:
      case ErrorCodes.TOKEN_EXPIRED:
      case ErrorCodes.EMAIL_NOT_VERIFIED:
        return 401;

      case ErrorCodes.FORBIDDEN:
      case ErrorCodes.INSUFFICIENT_PERMISSIONS:
      case ErrorCodes.ACCOUNT_LOCKED:
      case ErrorCodes.PROJECT_ACCESS_DENIED:
        return 403;

      case ErrorCodes.USER_NOT_FOUND:
      case ErrorCodes.PROJECT_NOT_FOUND:
      case ErrorCodes.CHAT_SESSION_NOT_FOUND:
      case ErrorCodes.MESSAGE_NOT_FOUND:
      case ErrorCodes.FILE_NOT_FOUND:
      case ErrorCodes.FOLDER_NOT_FOUND:
      case ErrorCodes.MEMBER_NOT_FOUND:
      case ErrorCodes.INVITATION_NOT_FOUND:
      case ErrorCodes.RESOURCE_NOT_FOUND:
        return 404;

      case ErrorCodes.USER_ALREADY_EXISTS:
      case ErrorCodes.MEMBER_ALREADY_EXISTS:
      case ErrorCodes.INVITATION_ALREADY_SENT:
        return 409;

      case ErrorCodes.VALIDATION_ERROR:
      case ErrorCodes.INVALID_INPUT:
      case ErrorCodes.REQUIRED_FIELD_MISSING:
      case ErrorCodes.INVALID_EMAIL:
      case ErrorCodes.INVALID_PASSWORD:
      case ErrorCodes.INVALID_EXPORT_FORMAT:
      case ErrorCodes.FILE_TOO_LARGE:
      case ErrorCodes.FILE_TYPE_NOT_ALLOWED:
      case ErrorCodes.INVALID_OPERATION:
        return 400;

      case ErrorCodes.RATE_LIMIT_EXCEEDED:
      case ErrorCodes.TOO_MANY_REQUESTS:
        return 429;

      case ErrorCodes.SERVICE_UNAVAILABLE:
        return 503;

      default:
        return 500;
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  toString(): string {
    const details = this.details ? ` (${JSON.stringify(this.details)})` : '';
    return `${this.name} [${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Error handler utility functions
 */

/**
 * Check if error is a CoreError
 */
export function isCoreError(error: any): error is CoreError {
  return error instanceof CoreError;
}

/**
 * Convert any error to CoreError
 */
export function toCoreError(error: any, defaultCode: ErrorCodes = ErrorCodes.INTERNAL_ERROR): CoreError {
  if (isCoreError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new CoreError(error.message, defaultCode, { originalError: error });
  }

  return new CoreError(
    typeof error === 'string' ? error : 'Unknown error occurred',
    defaultCode,
    { originalError: error }
  );
}

/**
 * Handle async errors with proper typing
 */
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[CoreError | null, T | null]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [toCoreError(error), null];
  }
}

/**
 * Create error factory functions
 */
export const createError = {
  unauthorized: (message: string = 'Unauthorized', details?: any) =>
    new CoreError(message, ErrorCodes.UNAUTHORIZED, details),

  forbidden: (message: string = 'Forbidden', details?: any) =>
    new CoreError(message, ErrorCodes.FORBIDDEN, details),

  notFound: (resource: string = 'Resource', details?: any) =>
    new CoreError(`${resource} not found`, ErrorCodes.RESOURCE_NOT_FOUND, details),

  validation: (message: string, details?: any) =>
    new CoreError(message, ErrorCodes.VALIDATION_ERROR, details),

  conflict: (message: string, details?: any) =>
    new CoreError(message, ErrorCodes.USER_ALREADY_EXISTS, details),

  rateLimited: (message: string = 'Rate limit exceeded', details?: any) =>
    new CoreError(message, ErrorCodes.RATE_LIMIT_EXCEEDED, details),

  internal: (message: string = 'Internal server error', details?: any) =>
    new CoreError(message, ErrorCodes.INTERNAL_ERROR, details)
};

/**
 * Error logging utility
 */
export function logError(error: CoreError | Error, context?: any): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  };

  if (isCoreError(error)) {
    logData.error = {
      ...logData.error,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    } as any;
  }

  console.error('Core Error:', JSON.stringify(logData, null, 2));
}

/**
 * Validation error helpers
 */
export function createValidationError(field: string, message: string): CoreError {
  return new CoreError(
    `Validation failed for field '${field}': ${message}`,
    ErrorCodes.VALIDATION_ERROR,
    { field, validationMessage: message }
  );
}

export function createRequiredFieldError(field: string): CoreError {
  return new CoreError(
    `Required field '${field}' is missing`,
    ErrorCodes.REQUIRED_FIELD_MISSING,
    { field }
  );
}