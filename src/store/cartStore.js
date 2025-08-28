import { create } from 'zustand';

// Cart items are keyed by a composite cartId so variants (size/color) of the same
// product can coexist in the cart independently.
const useCartStore = create((set) => ({
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
        return {
          items: state.items.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + quantity }
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
        quantity: Math.max(1, quantity || 1),
      };
      return { items: [...state.items, newItem] };
    }),
  removeFromCart: (cartId) =>
    set((state) => ({
      items: state.items.filter((item) => item.cartId !== cartId),
    })),
  updateQuantity: (cartId, newQuantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.cartId === cartId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
  getTotalItems: () =>
    useCartStore
      .getState()
      .items.reduce((total, item) => total + item.quantity, 0),
}));

export default useCartStore;
