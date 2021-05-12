const PATH_QUERY_FRAGMENT_REGEXP = /^(#?(?:\0.|[^?#\0])*)(\?(?:\0.|[^#\0])*)?(#.*)?$/;

/**
 * @param {string} identifier identifier
 * @returns {[string, string, string]|null} parsed identifier
 */
export default function parseIdentifier(identifier) {
  const match = PATH_QUERY_FRAGMENT_REGEXP.exec(identifier);

  if (!match) return null;

  return [
    match[1].replace(/\0(.)/g, '$1'),
    match[2] ? match[2].replace(/\0(.)/g, '$1') : '',
    match[3] || '',
  ];
}
