const WRITE_VERBS = new Set([
  "write",
  "draft",
  "compose",
  "generate",
  "outline",
  "escribe",
  "escribir",
  "redacta",
  "redactar",
  "genera",
  "generar",
]);

export function isWriterIntent(prompt: string): boolean {
  const first = prompt.trim().toLowerCase().split(/\s+/)[0] ?? "";
  const normalized = first.normalize("NFD").replace(/[^\p{L}]/gu, "");
  return WRITE_VERBS.has(normalized);
}
