import {
  COLOR_PALETTE,
  type PaletteColor,
  pickColorFromString,
  safeColor,
} from "@/shared/domain/color";

export const TAG_COLORS = COLOR_PALETTE;
export type TagColor = PaletteColor;

const colorStyles: Record<TagColor, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
};

const swatchStyles: Record<TagColor, string> = {
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
  purple: "bg-purple-400",
  pink: "bg-pink-400",
  cyan: "bg-cyan-400",
  indigo: "bg-indigo-400",
};

export function tagColorClasses(color: string): string {
  return colorStyles[safeColor(color)];
}

export function tagSwatchClasses(color: string): string {
  return swatchStyles[safeColor(color)];
}

export const pickColorFromName = pickColorFromString;
