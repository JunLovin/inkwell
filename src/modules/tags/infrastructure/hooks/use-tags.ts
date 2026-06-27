"use client";

import { createTagsService } from "../../application/tags.service";
import { convexTagRepository } from "../repositories/convex-tag.repository";

const tagsService = createTagsService(convexTagRepository);

export const useAllTags = tagsService.useAllTags;
export const useTagsForNote = tagsService.useTagsForNote;
export const useAllNoteTagLinks = tagsService.useAllNoteTagLinks;
export const useTagActions = tagsService.useTagActions;
