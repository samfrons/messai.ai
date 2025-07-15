/**
 * Utility functions for handling author data transformations
 * between different formats (string, array, object)
 */

export interface AuthorObject {
  name: string;
  affiliation?: string;
  isCorresponding?: boolean;
}

/**
 * Parses a comma-separated author string into an array of author names
 *
 * @param authorString - Comma-separated author string like "Chen, L., Wang, X., Liu, Y., Zhang, M."
 * @returns Array of author names
 */
export function parseAuthorString(authorString: string): string[] {
  if (!authorString || typeof authorString !== 'string') {
    return [];
  }

  // Split by comma and clean up each author name
  return authorString
    .split(',')
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
}

/**
 * Converts an array of author names back to a comma-separated string
 *
 * @param authors - Array of author names
 * @returns Comma-separated string
 */
export function authorsToString(authors: string[]): string {
  if (!authors || !Array.isArray(authors)) {
    return '';
  }

  return authors.join(', ');
}

/**
 * Normalizes author data to always return a string array
 * Handles string, array, and JSON inputs for cross-environment compatibility
 *
 * @param authors - Author data in string, array, or JSON format
 * @returns Normalized string array
 */
export function normalizeAuthors(authors: string | string[] | unknown): string[] {
  if (Array.isArray(authors)) {
    return authors;
  }

  if (typeof authors === 'string') {
    return parseAuthorString(authors);
  }

  return [];
}

/**
 * Normalizes author data for database storage
 * Returns appropriate format based on environment (JSON for dev, string[] for prod)
 *
 * @param authors - Author data in string or array format
 * @returns Normalized format for database storage
 */
export function normalizeAuthorsForDB(authors: string | string[]): string[] {
  const normalized = normalizeAuthors(authors);

  // For production (PostgreSQL), return as string array
  // For development (SQLite), this will be converted to JSON by Prisma
  return normalized;
}

/**
 * Validates author data structure
 *
 * @param authors - Author data to validate
 * @returns Boolean indicating if the data is valid
 */
export function validateAuthors(authors: unknown): boolean {
  if (typeof authors === 'string') {
    return authors.length > 0;
  }

  if (Array.isArray(authors)) {
    return (
      authors.length > 0 &&
      authors.every((author) => typeof author === 'string' && author.length > 0)
    );
  }

  return false;
}

/**
 * Formats authors for display in UI components
 *
 * @param authors - Author data in string or array format
 * @param maxDisplay - Maximum number of authors to display (default: 3)
 * @returns Formatted string for display
 */
export function formatAuthorsForDisplay(
  authors: string | string[],
  maxDisplay: number = 3
): string {
  const authorArray = normalizeAuthors(authors);

  if (authorArray.length === 0) {
    return 'Unknown Authors';
  }

  if (authorArray.length <= maxDisplay) {
    return authorArray.join(', ');
  }

  return `${authorArray.slice(0, maxDisplay).join(', ')} et al.`;
}
