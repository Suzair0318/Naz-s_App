import { create } from 'zustand';

// Minimal guest-first auth store (no persistence yet)
// You can later plug in @react-native-async-storage/async-storage to persist the session.
const useAuthStore = create((set, get) => ({
  user: null, // { id, name, email } when signed in; null when guest
  status: 'idle', // 'idle' | 'loading' | 'authenticated'

  // Mock sign-in for now. Replace with real API.
  signIn: async ({ email, name }) => {
    set({ status: 'loading' });
    try {
      // Simulate network latency
      await new Promise((res) => setTimeout(res, 300));
      const user = { id: 'mock-user-1', name: name || 'Guest User', email: email || 'guest@example.com' };
      set({ user, status: 'authenticated' });
      return user;
    } catch (e) {
      set({ status: 'idle' });
      throw e;
    }
  },

  // Mock sign-up for now. Replace with real API.
  signUp: async ({ email, name, password }) => {
    set({ status: 'loading' });
    try {
      await new Promise((res) => setTimeout(res, 400));
      const user = { id: 'mock-user-1', name: name || 'New User', email: email || 'user@example.com' };
      set({ user, status: 'authenticated' });
      return user;
    } catch (e) {
      set({ status: 'idle' });
      throw e;
    }
  },

  signOut: async () => {
    set({ status: 'idle', user: null });
  },

  isAuthenticated: () => !!get().user,
}));

export default useAuthStore;
