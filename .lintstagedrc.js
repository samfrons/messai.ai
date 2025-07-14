module.exports = {
  // TypeScript and JavaScript files - only format, skip linting for now
  '*.{ts,tsx,js,jsx}': ['prettier --write'],

  // JSON files
  '*.{json,jsonc}': ['prettier --write'],

  // Markdown files
  '*.{md,mdx}': ['prettier --write'],

  // CSS/SCSS files
  '*.{css,scss,sass}': ['prettier --write'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write'],
};
