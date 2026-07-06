export type { Tag, TagId, NoteTagLink } from "./domain/entities/tag";
export {
  TAG_COLORS,
  type TagColor,
  tagColorClasses,
  tagSwatchClasses,
  pickColorFromName,
} from "./domain/services/tag-color";
export {
  buildNoteTagsIndex,
  noteMatchesAllTags,
  type NoteTagsByNote,
} from "./domain/services/note-tag-index";

export {
  useAllTags,
  useTagsForNote,
  useAllNoteTagLinks,
  useTagActions,
} from "./infrastructure/hooks/use-tags";

export { TagChip } from "./ui/components/tag-chip";
export { TagPicker } from "./ui/components/tag-picker";
export { TagQuickCreate } from "./ui/components/tag-quick-create";
