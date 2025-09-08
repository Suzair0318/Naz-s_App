import { create } from 'zustand';
import storage from '../utils/storage';

// Keep base aligned with screens
const API_BASE = 'http://192.168.18.11:3006';
const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

const useAuthStore = create((set, get) => ({
  user: null, // { name, email }
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated'

  // Hydrate session from storage
  loadSession: async () => {
    try {
      const [token, userStr] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);
      const user = userStr ? JSON.parse(userStr) : null;
      if (token && user) {
        set({ token, user, status: 'authenticated' });
        return { token, user };
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  // POST /auth/login { email, password } -> { name, token }
  signIn: async ({ email, password }) => {
    set({ status: 'loading' });
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Login failed');
      }
      const json = await resp.json();
      console.log("Login Response",json)
      const token = json?.token;
      const name = json?.name || 'User';
      if (!token) throw new Error('No token in response');
      const user = { name, email };
      let a =  await storage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, JSON.stringify(user)]
      ]);
      console.log("Storage Response",a)
      set({ token, user, status: 'authenticated' });
      return user;
    } catch (e) {
      set({ status: 'idle' });
      throw e;
    }
  },

  // POST /auth/signup { name, email, password } -> { name, token }
  signUp: async ({ name, email, password }) => {
    set({ status: 'loading' });
    try {
      const resp = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Signup failed');
      }
      const json = await resp.json();
      const token = json?.token;
      const displayName = json?.name || name || 'User';
      if (!token) throw new Error('No token in response');
      const user = { name: displayName, email };
      await storage.multiSet([[TOKEN_KEY, token], [USER_KEY, JSON.stringify(user)]]);
      set({ token, user, status: 'authenticated' });
      return user;
    } catch (e) {
      set({ status: 'idle' });
      throw e;
    }
  },

  signOut: async () => {
    await storage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ status: 'idle', user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));

export default useAuthStore;
