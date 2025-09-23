import { create } from 'zustand';
import useAuthStore from './authStore';
import storage from '../utils/storage';
import { ENDPOINTS } from '../utils/endpoint';

const CART_STORAGE_KEY = '@cart_items';

// Cart items are keyed by a composite cartId so variants (size/color) of the same
// product can coexist in the cart independently.
const useCartStore = create((set, get) => ({
  items: [],
  // product: { id, name, price, image, size?, color? }
  // quantity: number (default 1)
  addToCart: (product, quantity = 1) =>
    set((state) => {
      const size = product.size || product.selectedSize || '';
      const color = product.color || product.selectedColor || '';
      const cartId = `${product.id}_${size}_${color}`;

      const existingItem = state.items.find((item) => item.cartId === cartId);
      if (existingItem) {
        const maxAvail = Number(
          existingItem.availableQuantity ?? product.availableQuantity ?? Infinity
        );
        const nextQty = Math.min(existingItem.quantity + quantity, maxAvail);
        return {
          items: state.items.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: Math.max(1, nextQty) }
              : item
          ),
        };
      }

      const newItem = {
        cartId,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size || null,
        color: color || null,
        weight: Number(product.weight ?? 0),
        availableQuantity: Number(product.availableQuantity ?? product.stock ?? Infinity),
        quantity: (() => {
          const maxAvail = Number(product.availableQuantity ?? product.stock ?? Infinity);
          const base = Math.max(1, quantity || 1);
          return Math.min(base, maxAvail);
        })(),
      };
      return { items: [...state.items, newItem] };
    }),
  removeFromCart: (cartId) =>
    set((state) => ({
      items: state.items.filter((item) => item.cartId !== cartId),
    })),
  updateQuantity: (cartId, newQuantity) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.cartId !== cartId) return item;
        const maxAvail = Number(item.availableQuantity ?? Infinity);
        const clamped = Math.max(1, Math.min(Number(newQuantity || 1), maxAvail));
        return { ...item, quantity: clamped };
      }),
    })),
  clearCart: () => set({ items: [] }),
  getTotalItems: () =>
    useCartStore
      .getState()
      .items.reduce((total, item) => total + item.quantity, 0),

  // Load cart from local storage (guest users)
  loadCartFromStorage: async () => {
    try {
      const raw = await storage.getItem(CART_STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(items) ? items : [] });
      return items;
    } catch (e) {
      return [];
    }
  },

  // Persist cart to local storage when not authenticated
  persistCartToStorage: async () => {
    try {
      const isAuthed = !!useAuthStore.getState().token;
      const items = get().items;
      if (isAuthed) {
        // Server is source of truth for authed users; clear local cache
        await storage.removeItem(CART_STORAGE_KEY);
        return;
      }
      await storage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []));
    } catch (e) {
      // best-effort
    }
  },

  // Fetch cart from server (authenticated users)
  loadCartFromServer: async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return [];
      const resp = await fetch(`${ENDPOINTS.live}/cart`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to load cart');
      }
      const json = await resp.json();
      const items = Array.isArray(json?.items)
        ? json.items.map((entry) => {
            const p = entry?.productId || {};
            const id = String(p?._id || entry?.productId || '');
            const name = p?.name || '';
            const price = Number(p?.price || 0);
            const image = Array.isArray(p?.image) ? p.image[0] : p?.image;
            const size = entry?.size || null;
            const availableQuantity = Number(p?.availableQuantity ?? Infinity);
            const weight = Number(p?.weight ?? 0);
            const requestedQty = Math.max(1, Number(entry?.quantity || 1));
            const quantity = Math.max(1, Math.min(requestedQty, availableQuantity));
            const cartId = `${id}_${size || ''}_`;
            return {
              cartId,
              id,
              name,
              price,
              image,
              size,
              color: null,
              availableQuantity,
              weight,
              quantity,
            };
          })
        : [];
      set({ items });
      return items;
    } catch (e) {
      console.warn('loadCartFromServer failed:', e?.message || e);
      return [];
    }
  },

  // Persist current cart to backend (Save/Replace Cart)
  saveCartToServer: async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      const items = get().items;
      const body = items.map((i) => ({
        productId: String(i.id),
        quantity: Number(i.quantity || 1),
        size: i.size || undefined,
      }));
      const resp = await fetch(`${ENDPOINTS.live}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        console.log('saveCartToServer failed:', resp);
        const t = await resp.text();
        throw new Error(t || 'Failed to save cart');
      }
      const json = await resp.json();
      return json;
    } catch (e) {
      console.log('saveCartToServer failed:', e);
      return null;
    }
  },

  // Call after successful login/signup to persist pre-login cart
  syncCartAfterLogin: async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;
      await get().saveCartToServer();
    } catch (e) {
      // best-effort
    }
  },

  // Server side update for a single item's quantity
  patchItemQuantityOnServer: async (productId, quantity) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      const resp = await fetch(`${ENDPOINTS.live}/cart/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: Number(quantity) }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to update quantity');
      }
      return await resp.json();
    } catch (e) {
      console.warn('patchItemQuantityOnServer failed:', e?.message || e);
      return null;
    }
  },

  // Server side remove for a single productId
  removeItemFromServer: async (productId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return null;
      const resp = await fetch(`${ENDPOINTS.live}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Failed to remove item');
      }
      return await resp.json();
    } catch (e) {
      console.warn('removeItemFromServer failed:', e?.message || e);
      return null;
    }
  },
}));

// Side effects: when items change and user is authenticated, we can optionally debounce-save
// For now, we'll explicitly save on actions below via optimistic updates.

// Wrap original actions to hit server when authenticated
const baseAddToCart = useCartStore.getState().addToCart;
useCartStore.setState({}, false, 'INIT');
useCartStore.setState({
  addToCart: (product, quantity = 1) => {
    baseAddToCart(product, quantity);
    // After optimistic local update, persist full cart if authenticated
    useCartStore.getState().saveCartToServer();
  },
  updateQuantity: (cartId, newQuantity) => {
    const state = useCartStore.getState();
    const item = state.items.find((i) => i.cartId === cartId);
    // optimistic local update
    state.items = state.items.map((i) => {
      if (i.cartId !== cartId) return i;
      const maxAvail = Number(i.availableQuantity ?? Infinity);
      const clamped = Math.max(1, Math.min(Number(newQuantity || 1), maxAvail));
      return { ...i, quantity: clamped };
    });
    useCartStore.setState({ items: state.items });
    // server update
    if (item) {
      const maxAvail = Number(item.availableQuantity ?? Infinity);
      const clamped = Math.max(1, Math.min(Number(newQuantity || 1), maxAvail));
      state.patchItemQuantityOnServer(item.id, clamped);
    }
  },
  removeFromCart: (cartId) => {
    const state = useCartStore.getState();
    const item = state.items.find((i) => i.cartId === cartId);
    // optimistic local removal
    useCartStore.setState({ items: state.items.filter((i) => i.cartId !== cartId) });
    // server remove
    if (item) state.removeItemFromServer(item.id);
  },
});

// Persist cart changes to local storage when unauthenticated
useCartStore.subscribe(
  (state) => state.items,
  () => {
    // best-effort persistence
    useCartStore.getState().persistCartToStorage();
  }
);

export default useCartStore;
