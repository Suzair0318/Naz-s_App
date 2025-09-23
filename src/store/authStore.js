import { create } from 'zustand';
import storage from '../utils/storage';
import { ENDPOINTS } from '../utils/endpoint';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

const useAuthStore = create((set, get) => ({
  user: null, // { name, email }
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated'
  // temp redirect target to preserve navigation across auth flows
  _redirectTarget: null, // { redirectTo, redirectParams }

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

  // Store a temporary redirect target to be used after login
  setRedirectTarget: ({ redirectTo, redirectParams }) => {
    set({ _redirectTarget: redirectTo ? { redirectTo, redirectParams } : null });
  },
  // Consume and clear the temporary redirect target
  consumeRedirectTarget: () => {
    const target = get()._redirectTarget;
    set({ _redirectTarget: null });
    return target;
  },

  // POST /auth/login { email, password } -> { name, token }
  signIn: async ({ email, password }) => {
    set({ status: 'loading' });
    try {
      const resp = await fetch(`${ENDPOINTS.live}/auth/login`, {
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
      const resp = await fetch(`${ENDPOINTS.live}/auth/signup`, {
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

  // Forgot password: request OTP to email
  requestPasswordReset: async ({ email }) => {
    try {
      const resp = await fetch(`${ENDPOINTS.live}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Failed to request password reset');
      }
      return true;
    } catch (e) {
      throw e;
    }
  },

  // Verify OTP sent to email
  verifyOtp: async ({ email, otp }) => {
    try {
      const resp = await fetch(`${ENDPOINTS.live}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Invalid or expired OTP');
      }
      return true;
    } catch (e) {
      throw e;
    }
  },

  // Reset password using verified OTP
  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      const resp = await fetch(`${ENDPOINTS.live}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Failed to reset password');
      }
      return true;
    } catch (e) {
      throw e;
    }
  },

  signOut: async () => {
    try {
      // Remove specific keys and then clear all to ensure no residual cache remains
      await storage.multiRemove([TOKEN_KEY, USER_KEY]);
      await storage.clearAll();
    } catch (e) {}
    set({ status: 'idle', user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));

export default useAuthStore;
