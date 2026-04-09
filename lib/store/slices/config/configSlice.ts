import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Toast } from "@/lib/types/toast.types";

export type Language = "en" | "es" | "fr" | "de" | "pt";

export type Theme = "dark" | "light" | "system";

export type NotificationSettings = {
  sound: boolean;
  push: boolean;
  email: boolean;
};

type ConfigState = {
  toasts: Toast[];
  language: Language;
  theme: Theme;
  notifications: NotificationSettings;
};

const initialState: ConfigState = {
  toasts: [],
  language: "en",
  theme: "dark",
  notifications: {
    sound: true,
    push: true,
    email: false,
  },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Toast>) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      const index = state.toasts.findIndex((t) => t.id === action.payload);
      if (index !== -1) state.toasts.splice(index, 1);
    },

    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },

    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },

    setNotifications: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>,
    ) => {
      Object.assign(state.notifications, action.payload);
    },
  },
});

export const {
  addToast,
  removeToast,
  setLanguage,
  setTheme,
  setNotifications,
} = configSlice.actions;

export default configSlice.reducer;
