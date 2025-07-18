/**
 * Production Database Safety Utilities
 *
 * CRITICAL: Production contains 4,087+ LIVE research papers
 * These utilities prevent accidental writes to production database
 */

export function isProductionEnvironment(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  return (
    isProduction ||
    databaseUrl?.includes('supabase') ||
    databaseUrl?.includes('neon') ||
    databaseUrl?.includes('railway')
  );
}

export function checkProductionWrite(operation: string): void {
  if (isProductionEnvironment()) {
    console.warn(`⚠️ PRODUCTION DATABASE - BLOCKING WRITE OPERATION: ${operation}`);
    throw new Error(`Write operation '${operation}' is not allowed in production environment`);
  }
}

export function createProductionSafetyResponse(operation: string) {
  return {
    data: null,
    error: {
      message: `Write operation '${operation}' is not allowed in production environment`,
      code: 'PRODUCTION_WRITE_BLOCKED',
      details: 'Production database contains 4,087+ live research papers and is read-only',
    },
  };
}
