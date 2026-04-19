// Lightweight typed localStorage wrapper. Acts as our prototype "database".
const PREFIX = "lms.v1.";

export function readCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(items));
}

export function readValue<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeValue<T>(key: string, value: T | null): void {
  if (typeof window === "undefined") return;
  if (value === null) {
    window.localStorage.removeItem(PREFIX + key);
  } else {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
