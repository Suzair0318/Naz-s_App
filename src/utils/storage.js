// Safe storage wrapper. Uses AsyncStorage if available; falls back to in-memory map
// to prevent app crashes when the native module isn't linked yet.

let memory = new Map();

let AsyncStorage;
try {
  // This may throw if native module isn't linked
  // eslint-disable-next-line global-require
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const storage = {
  getItem: async (key) => {
    if (AsyncStorage) return AsyncStorage.getItem(key);
    return memory.has(key) ? String(memory.get(key)) : null;
  },
  setItem: async (key, value) => {
    if (AsyncStorage) return AsyncStorage.setItem(key, value);
    memory.set(key, value);
    return null;
  },
  removeItem: async (key) => {
    if (AsyncStorage) return AsyncStorage.removeItem(key);
    memory.delete(key);
    return null;
  },
  multiSet: async (pairs) => {
    if (AsyncStorage && AsyncStorage.multiSet) return AsyncStorage.multiSet(pairs);
    pairs.forEach(([k, v]) => memory.set(k, v));
    return null;
  },
  multiRemove: async (keys) => {
    if (AsyncStorage && AsyncStorage.multiRemove) return AsyncStorage.multiRemove(keys);
    keys.forEach((k) => memory.delete(k));
    return null;
  },
  clearAll: async () => {
    if (AsyncStorage && AsyncStorage.clear) return AsyncStorage.clear();
    memory.clear();
    return null;
  },
};

export default storage;
