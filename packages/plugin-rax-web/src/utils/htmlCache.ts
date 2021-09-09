const cached: {
  [key: string]: string;
} = {};

export function updateHTMLByEntryName(entryName: string, html: string) {
  cached[entryName] = html;
}

export function getHTMLByEntryName(entryName: string): string {
  return cached[entryName];
}
