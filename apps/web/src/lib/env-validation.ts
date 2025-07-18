/**
 * Environment variable validation for production safety
 */

interface EnvConfig {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validates environment variables at application startup
 * Throws error with helpful message if required variables are missing
 */
export function validateEnvironment(): EnvConfig {
  const errors: string[] = [];

  // Required environment variables
  const requiredVars = {
    DATABASE_URL: process.env['DATABASE_URL'],
    NEXTAUTH_SECRET: process.env['NEXTAUTH_SECRET'],
    NEXTAUTH_URL: process.env['NEXTAUTH_URL'],
    NODE_ENV: process.env['NODE_ENV'],
  };

  // Check for missing required variables
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Validate NODE_ENV
  if (
    requiredVars.NODE_ENV &&
    !['development', 'production', 'test'].includes(requiredVars.NODE_ENV)
  ) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  // Validate DATABASE_URL format
  if (requiredVars.DATABASE_URL) {
    try {
      new URL(requiredVars.DATABASE_URL);
    } catch {
      errors.push('DATABASE_URL must be a valid URL');
    }
  }

  // Validate NEXTAUTH_URL format
  if (requiredVars.NEXTAUTH_URL) {
    try {
      new URL(requiredVars.NEXTAUTH_URL);
    } catch {
      errors.push('NEXTAUTH_URL must be a valid URL');
    }
  }

  // Validate NEXTAUTH_SECRET length
  if (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return requiredVars as EnvConfig;
}

/**
 * Get validated environment variables
 * Use this instead of process.env directly
 */
export function getEnv(): EnvConfig {
  return validateEnvironment();
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Safely get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  const value = process.env[key];
  if (!value && fallback !== undefined) {
    return fallback;
  }
  return value;
}
