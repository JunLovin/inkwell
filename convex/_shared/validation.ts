import { errors } from "./errors";

export const LIMITS = {
  noteTitle: 200,
  noteSlug: 128,
  notePreview: 300,
  noteContent: 500_000,
  folderName: 64,
  tagName: 64,
  userName: 80,
  colorName: 24,
} as const;

export function assertMaxLength(field: string, value: string, max: number) {
  if (value.length > max) {
    throw errors.invalidInput(`${field} exceeds ${max} character limit`);
  }
}

export function assertColorName(field: string, value: string) {
  if (value.length === 0 || value.length > LIMITS.colorName) {
    throw errors.invalidInput(`${field} has invalid length`);
  }
}
