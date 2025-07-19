import { act, renderHook } from '@testing-library/react';
import type { StoreApi } from 'zustand';

/**
 * Reset a Zustand store to its initial state
 */
export const resetStore = <T>(store: StoreApi<T>, initialState: T) => {
  store.setState(initialState, true);
};

/**
 * Create a mock store for testing
 */
export const createMockStore = <T extends object>(initialState: T) => {
  const listeners = new Set<(state: T) => void>();
  let state = initialState;

  return {
    getState: () => state,
    setState: (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => {
      const nextState = typeof partial === 'function' ? partial(state) : partial;
      state = replace ? (nextState as T) : { ...state, ...nextState };
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };
};

/**
 * Test helper to wait for async store updates
 */
export const waitForStoreUpdate = async (
  store: StoreApi<any>,
  predicate: (state: any) => boolean
) => {
  return new Promise<void>((resolve) => {
    const unsubscribe = store.subscribe((state) => {
      if (predicate(state)) {
        unsubscribe();
        resolve();
      }
    });
  });
};

/**
 * Test helper to get store state in tests
 */
export const getStoreState = <T>(store: StoreApi<T>): T => {
  return store.getState();
};

/**
 * Test helper to update store state in tests
 */
export const updateStore = <T>(
  store: StoreApi<T>,
  update: Partial<T> | ((state: T) => Partial<T>)
) => {
  act(() => {
    store.setState(update as any);
  });
};

/**
 * Create a test wrapper for stores that need React context
 */
export const createStoreWrapper = (stores: Record<string, StoreApi<any>>) => {
  return ({ children }: { children: React.ReactNode }) => {
    // If your stores need any providers, add them here
    return <>{children}</>;
  };
};

/**
 * Test helper for testing store selectors
 */
export const testSelector = <T, R>(
  store: StoreApi<T>,
  selector: (state: T) => R,
  initialState: T,
  expectedResult: R
): void => {
  store.setState(initialState);
  const result = selector(store.getState());
  expect(result).toEqual(expectedResult);
};

/**
 * Test helper for testing async actions
 */
export const testAsyncAction = async <T>(
  store: StoreApi<T>,
  action: () => Promise<void>,
  expectations: {
    before?: (state: T) => void;
    during?: (state: T) => void;
    after: (state: T) => void;
  }
): Promise<void> => {
  if (expectations.before) {
    expectations.before(store.getState());
  }

  const promise = action();

  if (expectations.during) {
    expectations.during(store.getState());
  }

  await act(async () => {
    await promise;
  });

  expectations.after(store.getState());
};

/**
 * Mock implementation of localStorage for testing stores with persistence
 */
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

/**
 * Setup localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  const localStorageMock = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};

/**
 * Test helper for testing store persistence
 */
export const testPersistence = async <T>(
  storeName: string,
  createStore: () => StoreApi<T>,
  update: Partial<T>
) => {
  const localStorage = setupLocalStorageMock();

  // Create initial store and update it
  const store1 = createStore();
  act(() => {
    store1.setState(update as any);
  });

  // Wait for persistence
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check localStorage was updated
  const stored = localStorage.getItem(`${storeName}`);
  expect(stored).toBeTruthy();

  // Create new store instance - should load from localStorage
  const store2 = createStore();

  // Wait for hydration
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check state was restored
  const restoredState = store2.getState();
  Object.entries(update).forEach(([key, value]) => {
    expect((restoredState as any)[key]).toEqual(value);
  });
};

/**
 * Test helper for store subscriptions
 */
export const testSubscription = <T>(
  store: StoreApi<T>,
  update: Partial<T>,
  expectedCalls: number = 1
) => {
  const listener = jest.fn();
  const unsubscribe = store.subscribe(listener);

  act(() => {
    store.setState(update as any);
  });

  expect(listener).toHaveBeenCalledTimes(expectedCalls);
  expect(listener).toHaveBeenCalledWith(expect.objectContaining(update), expect.any(Object));

  unsubscribe();
};
