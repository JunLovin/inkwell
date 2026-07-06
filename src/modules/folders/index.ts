export type { Folder, FolderId } from "./domain/entities/folder";
export {
  FOLDER_COLORS,
  type FolderColor,
  folderIconClasses,
  folderBadgeClasses,
  pickFolderColor,
} from "./domain/services/folder-color";

export {
  useAllFolders,
  useFolderActions,
} from "./infrastructure/hooks/use-folders";

export { FolderPicker } from "./ui/components/folder-picker";
export { FolderQuickCreate } from "./ui/components/folder-quick-create";
