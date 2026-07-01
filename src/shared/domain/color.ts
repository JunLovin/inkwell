export const COLOR_PALETTE = [
  "emerald",
  "blue",
  "amber",
  "red",
  "purple",
  "pink",
  "cyan",
  "indigo",
] as const;

export type PaletteColor = (typeof COLOR_PALETTE)[number];

export function isPaletteColor(value: string): value is PaletteColor {
  return (COLOR_PALETTE as readonly string[]).includes(value);
}

export function pickColorFromString(name: string): PaletteColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

export function safeColor(value: string): PaletteColor {
  return isPaletteColor(value) ? value : "emerald";
}
