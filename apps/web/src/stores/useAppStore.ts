import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// App-wide state interface
interface AppState {
  // User state
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
  } | null;

  // UI state
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    notifications: Notification[];
    activeModal: string | null;
  };

  // Loading states
  loading: {
    global: boolean;
    papers: boolean;
    experiments: boolean;
    predictions: boolean;
  };

  // Error states
  errors: Record<string, Error | null>;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

interface AppActions {
  // User actions
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;

  // UI actions
  setTheme: (theme: AppState['ui']['theme']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setActiveModal: (modal: string | null) => void;

  // Loading actions
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;

  // Error actions
  setError: (key: string, error: Error | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          user: null,
          ui: {
            theme: 'system',
            sidebarOpen: true,
            notifications: [],
            activeModal: null,
          },
          loading: {
            global: false,
            papers: false,
            experiments: false,
            predictions: false,
          },
          errors: {},

          // User actions
          setUser: (user) =>
            set((state) => {
              state.user = user;
            }),

          clearUser: () =>
            set((state) => {
              state.user = null;
            }),

          // UI actions
          setTheme: (theme) =>
            set((state) => {
              state.ui.theme = theme;

              // Apply theme to document
              if (typeof window !== 'undefined') {
                const root = document.documentElement;
                root.classList.remove('light', 'dark');

                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              }
            }),

          toggleSidebar: () =>
            set((state) => {
              state.ui.sidebarOpen = !state.ui.sidebarOpen;
            }),

          setSidebarOpen: (open) =>
            set((state) => {
              state.ui.sidebarOpen = open;
            }),

          addNotification: (notification) =>
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                read: false,
              };

              state.ui.notifications.unshift(newNotification);

              // Keep only last 50 notifications
              if (state.ui.notifications.length > 50) {
                state.ui.notifications = state.ui.notifications.slice(0, 50);
              }
            }),

          markNotificationAsRead: (id) =>
            set((state) => {
              const notification = state.ui.notifications.find((n) => n.id === id);
              if (notification) {
                notification.read = true;
              }
            }),

          removeNotification: (id) =>
            set((state) => {
              state.ui.notifications = state.ui.notifications.filter((n) => n.id !== id);
            }),

          clearNotifications: () =>
            set((state) => {
              state.ui.notifications = [];
            }),

          setActiveModal: (modal) =>
            set((state) => {
              state.ui.activeModal = modal;
            }),

          // Loading actions
          setLoading: (key, value) =>
            set((state) => {
              state.loading[key] = value;
            }),

          // Error actions
          setError: (key, error) =>
            set((state) => {
              state.errors[key] = error;
            }),

          clearError: (key) =>
            set((state) => {
              delete state.errors[key];
            }),

          clearAllErrors: () =>
            set((state) => {
              state.errors = {};
            }),
        }))
      ),
      {
        name: 'messai-app-store',
        partialize: (state) => ({
          user: state.user,
          ui: {
            theme: state.ui.theme,
            sidebarOpen: state.ui.sidebarOpen,
          },
        }),
      }
    ),
    {
      name: 'MessAI App Store',
    }
  )
);

// Selectors
export const selectUser = (state: AppState & AppActions) => state.user;
export const selectTheme = (state: AppState & AppActions) => state.ui.theme;
export const selectNotifications = (state: AppState & AppActions) => state.ui.notifications;
export const selectUnreadNotifications = (state: AppState & AppActions) =>
  state.ui.notifications.filter((n) => !n.read);
export const selectLoading = (key: keyof AppState['loading']) => (state: AppState & AppActions) =>
  state.loading[key];
export const selectError = (key: string) => (state: AppState & AppActions) => state.errors[key];
