// packages/core/src/utils/validation.ts
import validator from 'validator';
import Joi from 'joi';

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[] | number[];
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export interface SanitizationOptions {
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  removeSpecialChars?: boolean;
  maxLength?: number;
}

/**
 * Validate input data against rules
 */
export function validateInput(data: Record<string, any>, rules: ValidationRules): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors: string[] = [];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not required and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rule.type) {
      if (!validateType(value, rule.type)) {
        fieldErrors.push(`${field} must be of type ${rule.type}`);
        continue;
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${field} must be at least ${rule.minLength} characters long`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(`${field} format is invalid`);
      }

      if (rule.email && !validator.isEmail(value)) {
        fieldErrors.push(`${field} must be a valid email address`);
      }

      if (rule.url && !validator.isURL(value)) {
        fieldErrors.push(`${field} must be a valid URL`);
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        fieldErrors.push(`${field} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        fieldErrors.push(`${field} must not exceed ${rule.max}`);
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${field} must contain at least ${rule.minLength} items`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${field} must not contain more than ${rule.maxLength} items`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value as never)) {
      fieldErrors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        fieldErrors.push(customResult);
      } else if (customResult === false) {
        fieldErrors.push(`${field} is invalid`);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate type of value
 */
function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'email':
      return typeof value === 'string' && validator.isEmail(value);
    case 'url':
      return typeof value === 'string' && validator.isURL(value);
    default:
      return true;
  }
}

/**
 * Sanitize input data
 */
export function sanitizeInput(data: Record<string, any>, options: Record<string, SanitizationOptions> = {}): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldOptions = options[key] || {};
    sanitized[key] = sanitizeValue(value, fieldOptions);
  }

  return sanitized;
}

/**
 * Sanitize individual value
 */
function sanitizeValue(value: any, options: SanitizationOptions): any {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  if (options.trim) {
    sanitized = sanitized.trim();
  }

  if (options.toLowerCase) {
    sanitized = sanitized.toLowerCase();
  }

  if (options.toUpperCase) {
    sanitized = sanitized.toUpperCase();
  }

  if (options.removeSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s-]/g, '');
  }

  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? { password: errors } : {}
  };
}

/**
 * Email validation with advanced checks
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors: { email: errors } };
  }

  // Basic email format validation
  if (!validator.isEmail(email)) {
    errors.push('Invalid email format');
  }

  // Length validation
  if (email.length > 254) {
    errors.push('Email address is too long');
  }

  // Domain validation
  const domain = email.split('@')[1];
  if (domain) {
    // Check for disposable email domains (basic list)
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email'
    ];

    if (disposableDomains.includes(domain.toLowerCase())) {
      errors.push('Disposable email addresses are not allowed');
    }

    // Check for suspicious patterns
    if (domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('Invalid email domain');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? { email: errors } : {}
  };
}

/**
 * URL validation
 */
export function validateUrl(url: string, options: { requireHttps?: boolean; allowedDomains?: string[] } = {}): ValidationResult {
  const errors: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('URL is required');
    return { isValid: false, errors: { url: errors } };
  }

  // Basic URL validation
  if (!validator.isURL(url, { require_protocol: true })) {
    errors.push('Invalid URL format');
    return { isValid: false, errors: { url: errors } };
  }

  try {
    const urlObj = new URL(url);

    // HTTPS requirement
    if (options.requireHttps && urlObj.protocol !== 'https:') {
      errors.push('URL must use HTTPS protocol');
    }

    // Domain whitelist
    if (options.allowedDomains && !options.allowedDomains.includes(urlObj.hostname)) {
      errors.push(`Domain ${urlObj.hostname} is not allowed`);
    }

    // Prevent local/private URLs
    const hostname = urlObj.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      errors.push('Local and private URLs are not allowed');
    }

  } catch (error) {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? { url: errors } : {}
  };
}

/**
 * File upload validation
 */
export function validateFileUpload(
  file: { name: string; size: number; type: string },
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const allowedTypes = options.allowedTypes || [];
  const allowedExtensions = options.allowedExtensions || [];

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // MIME type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  // Filename validation
  if (file.name.length > 255) {
    errors.push('Filename is too long');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? { file: errors } : {}
  };
}

/**
 * Create Joi schema from validation rules
 */
export function createJoiSchema(rules: ValidationRules): Joi.ObjectSchema {
  const schemaFields: Record<string, Joi.Schema> = {};

  for (const [field, rule] of Object.entries(rules)) {
    let fieldSchema: Joi.Schema;

    // Base type
    switch (rule.type) {
      case 'string':
        fieldSchema = Joi.string();
        break;
      case 'number':
        fieldSchema = Joi.number();
        break;
      case 'boolean':
        fieldSchema = Joi.boolean();
        break;
      case 'array':
        fieldSchema = Joi.array();
        break;
      case 'object':
        fieldSchema = Joi.object();
        break;
      default:
        fieldSchema = Joi.any();
    }

    // Apply constraints
    if (rule.required) {
      fieldSchema = fieldSchema.required();
    } else {
      fieldSchema = fieldSchema.optional();
    }

    if (rule.minLength) {
      fieldSchema = (fieldSchema as Joi.StringSchema).min(rule.minLength);
    }

    if (rule.maxLength) {
      fieldSchema = (fieldSchema as Joi.StringSchema).max(rule.maxLength);
    }

    if (rule.min !== undefined) {
      fieldSchema = (fieldSchema as Joi.NumberSchema).min(rule.min);
    }

    if (rule.max !== undefined) {
      fieldSchema = (fieldSchema as Joi.NumberSchema).max(rule.max);
    }

    if (rule.pattern) {
      fieldSchema = (fieldSchema as Joi.StringSchema).pattern(rule.pattern);
    }

    if (rule.enum) {
      fieldSchema = fieldSchema.valid(...rule.enum);
    }

    if (rule.email) {
      fieldSchema = (fieldSchema as Joi.StringSchema).email();
    }

    if (rule.url) {
      fieldSchema = (fieldSchema as Joi.StringSchema).uri();
    }

    schemaFields[field] = fieldSchema;
  }

  return Joi.object(schemaFields);
}

/**
 * Batch validation utility
 */
export function validateBatch<T extends Record<string, any>>(
  items: T[],
  rules: ValidationRules
): { valid: T[]; invalid: Array<{ item: T; errors: Record<string, string[]> }> } {
  const valid: T[] = [];
  const invalid: Array<{ item: T; errors: Record<string, string[]> }> = [];

  for (const item of items) {
    const validation = validateInput(item, rules);
    if (validation.isValid) {
      valid.push(item);
    } else {
      invalid.push({ item, errors: validation.errors });
    }
  }

  return { valid, invalid };
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  // Username: alphanumeric, underscores, hyphens, 3-30 characters
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  
  // Slug: lowercase letters, numbers, hyphens, 1-50 characters
  slug: /^[a-z0-9-]{1,50}$/,
  
  // Phone number: various international formats
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  
  // UUID v4
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Hex color
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // Semantic version
  semver: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  
  // IP address (v4)
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  
  // Safe filename (no path traversal)
  safeFilename: /^[a-zA-Z0-9._-]+$/,
  
  // Credit card number (basic)
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/
};

/**
 * Common validation rule sets
 */
export const CommonValidationRules = {
  user: {
    email: { required: true, email: true },
    password: { required: true, minLength: 8, maxLength: 128 },
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    username: { required: true, pattern: ValidationPatterns.username }
  },

  project: {
    name: { required: true, minLength: 1, maxLength: 100 },
    description: { maxLength: 500 },
    visibility: { required: true, enum: ['private', 'public', 'team'] },
    tags: { type: 'array', maxLength: 20 }
  },

  chatSession: {
    title: { maxLength: 200 },
    projectId: { required: true },
    modelProvider: { required: true },
    modelName: { required: true }
  },

  file: {
    name: { required: true, minLength: 1, maxLength: 255 },
    projectId: { required: true },
    size: { required: true, min: 0 },
    mimeType: { required: true }
  },

  invitation: {
    email: { required: true, email: true },
    role: { required: true, enum: ['viewer', 'contributor', 'editor', 'admin'] },
    message: { maxLength: 500 }
  }
};

/**
 * Validation middleware for Express/Next.js
 */
export function createValidationMiddleware(rules: ValidationRules) {
  return (req: any, res: any, next: any) => {
    const validation = validateInput(req.body, rules);
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    // Sanitize the validated data
    req.validatedData = sanitizeInput(req.body);
    next();
  };
}

/**
 * Real-time validation for forms
 */
export class FormValidator {
  private rules: ValidationRules;
  private errors: Record<string, string[]> = {};

  constructor(rules: ValidationRules) {
    this.rules = rules;
  }

  validateField(field: string, value: any): string[] {
    const rule = this.rules[field];
    if (!rule) return [];

    const validation = validateInput({ [field]: value }, { [field]: rule });
    const fieldErrors = validation.errors[field] || [];
    
    this.errors[field] = fieldErrors;
    return fieldErrors;
  }

  validateAll(data: Record<string, any>): ValidationResult {
    const validation = validateInput(data, this.rules);
    this.errors = validation.errors;
    return validation;
  }

  getFieldErrors(field: string): string[] {
    return this.errors[field] || [];
  }

  getAllErrors(): Record<string, string[]> {
    return this.errors;
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  clearErrors(): void {
    this.errors = {};
  }

  clearFieldErrors(field: string): void {
    delete this.errors[field];
  }
}