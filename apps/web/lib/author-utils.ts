/**
 * Author normalization utilities for research papers
 */

export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
}

/**
 * Normalize authors for database storage
 * Converts author objects to JSON string format for database
 */
export function normalizeAuthorsForDB(authors: Author[] | string): string {
  if (typeof authors === 'string') {
    try {
      // Validate it's proper JSON
      JSON.parse(authors);
      return authors;
    } catch {
      // If not valid JSON, treat as single author name
      return JSON.stringify([{ name: authors }]);
    }
  }

  if (Array.isArray(authors)) {
    return JSON.stringify(authors);
  }

  return JSON.stringify([]);
}

/**
 * Normalize authors for API response
 * Converts JSON string or various formats to Author array
 */
export function normalizeAuthors(authors: string | Author[] | any): Author[] {
  if (typeof authors === 'string') {
    try {
      const parsed = JSON.parse(authors);
      if (Array.isArray(parsed)) {
        return parsed.map((author) => ({
          name: author.name || author,
          affiliation: author.affiliation,
          email: author.email,
        }));
      }
      return [{ name: authors }];
    } catch {
      return [{ name: authors }];
    }
  }

  if (Array.isArray(authors)) {
    return authors.map((author) => ({
      name: typeof author === 'string' ? author : author.name || '',
      affiliation: typeof author === 'object' ? author.affiliation : undefined,
      email: typeof author === 'object' ? author.email : undefined,
    }));
  }

  return [];
}

/**
 * Extract first author from authors array
 */
export function getFirstAuthor(authors: Author[] | string): string {
  const authorList = normalizeAuthors(authors);
  return authorList.length > 0 ? authorList[0].name : 'Unknown';
}

/**
 * Format authors for citation
 */
export function formatAuthorsForCitation(authors: Author[] | string): string {
  const authorList = normalizeAuthors(authors);
  if (authorList.length === 0) return 'Unknown';
  if (authorList.length === 1) return authorList[0].name;
  if (authorList.length === 2) return `${authorList[0].name} and ${authorList[1].name}`;
  return `${authorList[0].name} et al.`;
}
