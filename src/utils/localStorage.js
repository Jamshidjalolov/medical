export const STORAGE_KEY = "eduvista-academy-state";

export function readStorage(key, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

export function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}
