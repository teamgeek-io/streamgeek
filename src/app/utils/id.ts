import { customAlphabet } from "nanoid";

/**
 * Generate a youtube-like uuid.
 */
export function generateId() {
  return customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    11
  )();
}
