export function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  const cleaned: Partial<T> = {};
  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined && val !== null) {
      cleaned[key as keyof T] = val as T[keyof T];
    }
  }
  return cleaned as T;
}
