export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toUpperCase();
}
