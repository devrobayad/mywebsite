export function utilGenerateId(): string {
  // Generates a short, secure random-like ID string
  return Math.random().toString(36).substring(2, 11);
}

export function utilCleanId(id: any): string {
  if (id === null || id === undefined) return '';
  return String(id).trim();
}
