export type ChatContextId = string;

export const dashboardContextId: ChatContextId = "dashboard";

export const noteContextId = (slug: string): ChatContextId => `note:${slug}`;
