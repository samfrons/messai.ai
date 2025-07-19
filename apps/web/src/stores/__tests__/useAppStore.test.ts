import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '../useAppStore';
import {
  resetStore,
  updateStore,
  testSelector,
  testSubscription,
  setupLocalStorageMock,
  waitForStoreUpdate,
} from '../../test-utils/store-test-utils';

describe('useAppStore', () => {
  // Store initial state for resetting between tests
  const initialState = useAppStore.getState();

  beforeEach(() => {
    // Reset store to initial state
    resetStore(useAppStore, initialState);
    // Clear any mocked timers
    jest.clearAllTimers();
    // Setup localStorage mock
    setupLocalStorageMock();
  });

  describe('User State', () => {
    it('should initialize with null user', () => {
      const { user } = useAppStore.getState();
      expect(user).toBeNull();
    });

    it('should set user correctly', () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'researcher',
      };

      act(() => {
        useAppStore.getState().setUser(mockUser);
      });

      expect(useAppStore.getState().user).toEqual(mockUser);
    });

    it('should clear user', () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'researcher',
      };

      act(() => {
        useAppStore.getState().setUser(mockUser);
        useAppStore.getState().clearUser();
      });

      expect(useAppStore.getState().user).toBeNull();
    });
  });

  describe('UI State', () => {
    it('should initialize with default UI state', () => {
      const { ui } = useAppStore.getState();
      expect(ui.theme).toBe('system');
      expect(ui.sidebarOpen).toBe(true);
      expect(ui.notifications).toEqual([]);
      expect(ui.activeModal).toBeNull();
    });

    it('should toggle sidebar', () => {
      const initialSidebarState = useAppStore.getState().ui.sidebarOpen;

      act(() => {
        useAppStore.getState().toggleSidebar();
      });

      expect(useAppStore.getState().ui.sidebarOpen).toBe(!initialSidebarState);
    });

    it('should set sidebar open state directly', () => {
      act(() => {
        useAppStore.getState().setSidebarOpen(false);
      });

      expect(useAppStore.getState().ui.sidebarOpen).toBe(false);

      act(() => {
        useAppStore.getState().setSidebarOpen(true);
      });

      expect(useAppStore.getState().ui.sidebarOpen).toBe(true);
    });

    it('should set theme and apply to document', () => {
      // Mock document.documentElement
      const mockClassList = {
        remove: jest.fn(),
        add: jest.fn(),
      };
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      act(() => {
        useAppStore.getState().setTheme('dark');
      });

      expect(useAppStore.getState().ui.theme).toBe('dark');
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });

    it('should handle system theme preference', () => {
      // Mock matchMedia
      const mockMatchMedia = jest.fn().mockReturnValue({
        matches: true, // Dark mode preference
      });
      window.matchMedia = mockMatchMedia;

      const mockClassList = {
        remove: jest.fn(),
        add: jest.fn(),
      };
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      act(() => {
        useAppStore.getState().setTheme('system');
      });

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
    });
  });

  describe('Notifications', () => {
    it('should add notification with generated id and timestamp', () => {
      const notification = {
        type: 'success' as const,
        title: 'Test Notification',
        message: 'This is a test',
      };

      act(() => {
        useAppStore.getState().addNotification(notification);
      });

      const notifications = useAppStore.getState().ui.notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        ...notification,
        read: false,
      });
      expect(notifications[0].id).toBeTruthy();
      expect(notifications[0].timestamp).toBeInstanceOf(Date);
    });

    it('should limit notifications to 50', () => {
      // Add 51 notifications
      act(() => {
        for (let i = 0; i < 51; i++) {
          useAppStore.getState().addNotification({
            type: 'info',
            title: `Notification ${i}`,
          });
        }
      });

      expect(useAppStore.getState().ui.notifications).toHaveLength(50);
    });

    it('should mark notification as read', () => {
      act(() => {
        useAppStore.getState().addNotification({
          type: 'info',
          title: 'Test',
        });
      });

      const notificationId = useAppStore.getState().ui.notifications[0].id;

      act(() => {
        useAppStore.getState().markNotificationAsRead(notificationId);
      });

      expect(useAppStore.getState().ui.notifications[0].read).toBe(true);
    });

    it('should remove notification', () => {
      act(() => {
        useAppStore.getState().addNotification({
          type: 'info',
          title: 'Test 1',
        });
        useAppStore.getState().addNotification({
          type: 'info',
          title: 'Test 2',
        });
      });

      const notificationId = useAppStore.getState().ui.notifications[0].id;

      act(() => {
        useAppStore.getState().removeNotification(notificationId);
      });

      const remainingNotifications = useAppStore.getState().ui.notifications;
      expect(remainingNotifications).toHaveLength(1);
      expect(remainingNotifications.find((n) => n.id === notificationId)).toBeUndefined();
    });

    it('should clear all notifications', () => {
      act(() => {
        useAppStore.getState().addNotification({ type: 'info', title: 'Test 1' });
        useAppStore.getState().addNotification({ type: 'info', title: 'Test 2' });
        useAppStore.getState().addNotification({ type: 'info', title: 'Test 3' });
      });

      expect(useAppStore.getState().ui.notifications).toHaveLength(3);

      act(() => {
        useAppStore.getState().clearNotifications();
      });

      expect(useAppStore.getState().ui.notifications).toHaveLength(0);
    });
  });

  describe('Loading States', () => {
    it('should set loading states correctly', () => {
      act(() => {
        useAppStore.getState().setLoading('papers', true);
      });

      expect(useAppStore.getState().loading.papers).toBe(true);

      act(() => {
        useAppStore.getState().setLoading('papers', false);
      });

      expect(useAppStore.getState().loading.papers).toBe(false);
    });

    it('should handle multiple loading states independently', () => {
      act(() => {
        useAppStore.getState().setLoading('papers', true);
        useAppStore.getState().setLoading('experiments', true);
        useAppStore.getState().setLoading('predictions', false);
      });

      const { loading } = useAppStore.getState();
      expect(loading.papers).toBe(true);
      expect(loading.experiments).toBe(true);
      expect(loading.predictions).toBe(false);
      expect(loading.global).toBe(false);
    });
  });

  describe('Error States', () => {
    it('should set errors correctly', () => {
      const error = new Error('Test error');

      act(() => {
        useAppStore.getState().setError('testError', error);
      });

      expect(useAppStore.getState().errors.testError).toEqual(error);
    });

    it('should clear specific error', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      act(() => {
        useAppStore.getState().setError('error1', error1);
        useAppStore.getState().setError('error2', error2);
      });

      act(() => {
        useAppStore.getState().clearError('error1');
      });

      const { errors } = useAppStore.getState();
      expect(errors.error1).toBeUndefined();
      expect(errors.error2).toEqual(error2);
    });

    it('should clear all errors', () => {
      act(() => {
        useAppStore.getState().setError('error1', new Error('Error 1'));
        useAppStore.getState().setError('error2', new Error('Error 2'));
        useAppStore.getState().setError('error3', new Error('Error 3'));
      });

      expect(Object.keys(useAppStore.getState().errors)).toHaveLength(3);

      act(() => {
        useAppStore.getState().clearAllErrors();
      });

      expect(useAppStore.getState().errors).toEqual({});
    });
  });

  describe('Selectors', () => {
    it('should select user correctly', () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'researcher',
      };

      updateStore(useAppStore, { user: mockUser });

      const { selectUser } = require('../useAppStore');
      testSelector(useAppStore, selectUser, useAppStore.getState(), mockUser);
    });

    it('should select unread notifications', () => {
      act(() => {
        useAppStore.getState().addNotification({ type: 'info', title: 'Read' });
        useAppStore.getState().addNotification({ type: 'info', title: 'Unread 1' });
        useAppStore.getState().addNotification({ type: 'info', title: 'Unread 2' });
      });

      const notifications = useAppStore.getState().ui.notifications;
      act(() => {
        useAppStore.getState().markNotificationAsRead(notifications[0].id);
      });

      const { selectUnreadNotifications } = require('../useAppStore');
      const unreadNotifications = selectUnreadNotifications(useAppStore.getState());
      expect(unreadNotifications).toHaveLength(2);
    });
  });

  describe('Store Persistence', () => {
    it('should persist user and theme to localStorage', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'researcher',
      };

      act(() => {
        useAppStore.getState().setUser(mockUser);
        useAppStore.getState().setTheme('dark');
      });

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = localStorage.getItem('messai-app-store');
      expect(stored).toBeTruthy();

      const parsedStore = JSON.parse(stored!);
      expect(parsedStore.state.user).toEqual(mockUser);
      expect(parsedStore.state.ui.theme).toBe('dark');
    });

    it('should not persist notifications or loading states', async () => {
      act(() => {
        useAppStore.getState().addNotification({ type: 'info', title: 'Test' });
        useAppStore.getState().setLoading('papers', true);
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = localStorage.getItem('messai-app-store');
      const parsedStore = JSON.parse(stored!);

      expect(parsedStore.state.ui.notifications).toBeUndefined();
      expect(parsedStore.state.loading).toBeUndefined();
    });
  });

  describe('Store Subscriptions', () => {
    it('should notify subscribers on state changes', () => {
      testSubscription(useAppStore, {
        user: { id: '123', name: 'Test', email: 'test@example.com', role: 'researcher' },
      });
    });

    it('should handle multiple subscribers', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = useAppStore.subscribe(listener1);
      const unsubscribe2 = useAppStore.subscribe(listener2);

      act(() => {
        useAppStore.getState().toggleSidebar();
      });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });
  });

  describe('Integration with React Hooks', () => {
    it('should work with React hooks', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.user).toBeNull();

      act(() => {
        result.current.setUser({
          id: '123',
          name: 'Hook Test',
          email: 'hook@test.com',
          role: 'admin',
        });
      });

      expect(result.current.user).toEqual({
        id: '123',
        name: 'Hook Test',
        email: 'hook@test.com',
        role: 'admin',
      });
    });

    it('should update when store changes outside of hook', async () => {
      const { result } = renderHook(() => useAppStore((state) => state.ui.theme));

      expect(result.current).toBe('system');

      // Change store outside of hook
      act(() => {
        useAppStore.getState().setTheme('dark');
      });

      // Hook should reflect the change
      expect(result.current).toBe('dark');
    });
  });
});
