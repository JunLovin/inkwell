"use client";

import { createFoldersService } from "../../application/folders.service";
import { convexFolderRepository } from "../repositories/convex-folder.repository";

const foldersService = createFoldersService(convexFolderRepository);

export const useAllFolders = foldersService.useAllFolders;
export const useFolderActions = foldersService.useFolderActions;
