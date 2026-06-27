export const FOLDER_COLORS = [
  "emerald",
  "blue",
  "amber",
  "red",
  "purple",
  "pink",
  "cyan",
  "indigo",
] as const;

export type FolderColor = (typeof FOLDER_COLORS)[number];

const swatchStyles: Record<FolderColor, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  amber: "text-amber-400",
  red: "text-red-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  cyan: "text-cyan-400",
  indigo: "text-indigo-400",
};

const badgeStyles: Record<FolderColor, string> = {
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  red: "bg-red-500/10 text-red-300 border-red-500/30",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
};

function isFolderColor(value: string): value is FolderColor {
  return (FOLDER_COLORS as readonly string[]).includes(value);
}

export function folderIconClasses(color: string): string {
  return isFolderColor(color) ? swatchStyles[color] : swatchStyles.emerald;
}

export function folderBadgeClasses(color: string): string {
  return isFolderColor(color) ? badgeStyles[color] : badgeStyles.emerald;
}

export function pickFolderColor(name: string): FolderColor {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return FOLDER_COLORS[Math.abs(hash) % FOLDER_COLORS.length];
}
