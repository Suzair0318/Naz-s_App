// Sample API payloads used or implied by the app
// Brand: Naz's Collection (women's clothing)
// These are examples only — adjust field names to match your backend.

// --------------------------------------------
// Product shapes (from UI usage in ProductCard/ProductDetail/mockData)
// --------------------------------------------
export const productSample = {
  id: '1',
  name: 'Elegant Evening Dress',
  price: 299.99,
  originalPrice: 399.99, // nullable
  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop&auto=format',
  rating: 4.8,
  reviews: 124,
  isNew: false,
  isSale: true,
  category: 'Dresses',
  colors: ['Black', 'Navy', 'Burgundy'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  description:
    "A timeless evening dress crafted from premium fabric with a flattering silhouette.",
  points: [
    'Premium satin blend',
    'Flattering A-line fit',
    'Invisible back zipper',
    'Fully lined for comfort',
  ],
};

// GET /api/v1/products response sample (list)
export const productsListResponse = {
  items: [productSample],
  page: 1,
  total: 100,
};

// GET /api/v1/products/:id response sample (detail)
export const productDetailResponse = productSample;

// --------------------------------------------
// Cart and Buy-Now client-side shapes (no API yet)
// --------------------------------------------
// The app keeps cart locally using Zustand. If you add a server, you can mirror this shape.
export const cartItemClientShape = {
  cartId: '1_M_Black', // `${id}_${size}_${color}` to allow variants side-by-side in cart
  id: '1',
  name: 'Elegant Evening Dress',
  price: 299.99,
  image: productSample.image,
  size: 'M', // nullable
  color: 'Black', // nullable
  quantity: 2,
};

// Buy Now payload sent via navigation to Checkout
export const buyNowClientShape = {
  id: '1',
  name: 'Elegant Evening Dress',
  price: 299.99,
  image: productSample.image,
  size: 'M',
  color: 'Black',
  quantity: 1,
};

// --------------------------------------------
// Orders (CheckoutScreen) — main backend you will build
// --------------------------------------------
// POST /api/v1/orders request sample
export const createOrderRequest = {
  userId: null, // null for guest checkout; supply a user id when you add auth
  items: [
    {
      productId: '1', // or your Mongo ObjectId string
      name: 'Elegant Evening Dress', // snapshot at time of purchase
      price: 299.99, // snapshot price
      image: productSample.image,
      size: 'M', // optional
      color: 'Black', // optional
      quantity: 2,
    },
  ],
  shippingAddress: {
    fullName: 'Jane Doe',
    phone: '+92 300 1234567',
    addressLine1: '123 Main Street, Clifton',
    city: 'Karachi',
    zip: '75500',
    notes: 'Leave at the reception', // optional
  },
  pricing: {
    subtotal: 599.98, // server should recompute
    shipping: 250, // Karachi rule in app: Karachi=250, Others=350
    total: 849.98, // server should recompute
    currency: 'USD',
  },
  payment: {
    method: 'COD', // Cash on Delivery (current UI)
  },
  meta: {
    detectedCity: 'Karachi', // optional; from IP/GPS detection
  },
};

// POST /api/v1/orders response sample
export const createOrderResponse = {
  orderId: 'ORD-2025-0001',
  status: 'confirmed', // confirmed | processing | shipped | delivered | cancelled
  estimatedDeliveryDays: '2-3',
  pricing: {
    subtotal: 599.98,
    shipping: 250,
    total: 849.98,
    currency: 'USD',
  },
  placedAt: '2025-09-04T20:00:00.000Z',
};

// GET /api/v1/orders/:orderId response sample
export const orderDetailResponse = {
  orderId: 'ORD-2025-0001',
  status: 'confirmed',
  items: createOrderRequest.items,
  shippingAddress: createOrderRequest.shippingAddress,
  pricing: createOrderResponse.pricing,
  payment: { method: 'COD', paid: false, transactionId: null },
  timeline: [
    { status: 'confirmed', at: '2025-09-04T20:00:00.000Z' },
  ],
};

// GET /api/v1/orders (for current user) response sample
export const ordersListResponse = {
  items: [orderDetailResponse],
  page: 1,
  total: 1,
};

// --------------------------------------------
// Users (not wired in UI yet, but useful to align early)
// --------------------------------------------
export const signUpRequest = {
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  password: 'plaintext-or-token', // send plaintext, hash on server
};

export const signUpResponse = {
  user: { id: 'USR-1001', name: 'Jane Doe', email: 'jane.doe@email.com' },
  token: 'jwt.token.here',
};

export const loginRequest = {
  email: 'jane.doe@email.com',
  password: 'plaintext-or-token',
};

export const loginResponse = signUpResponse;

export const userProfileResponse = {
  id: 'USR-1001',
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  addresses: [
    {
      fullName: 'Jane Doe',
      phone: '+92 300 1234567',
      addressLine1: '123 Main Street, Clifton',
      city: 'Karachi',
      zip: '75500',
      notes: '',
    },
  ],
  createdAt: '2025-07-01T12:00:00.000Z',
};

// --------------------------------------------
// Wishlist (UI has a heart button; backend is optional for now)
// --------------------------------------------
export const wishlistAddResponse = { success: true };
export const wishlistListResponse = { items: ['1', '2', '3'] }; // array of productIds

// --------------------------------------------
// 3rd-party APIs currently used directly by the app (for reference only)
// --------------------------------------------
// GET https://ipapi.co/json/?lang=en
export const ipApiCityResponseSample = {
  ip: '203.99.123.45',
  city: 'Karachi',
  region: 'Sindh',
  country_name: 'Pakistan',
  latitude: 24.8607,
  longitude: 67.0011,
};

// GET https://nominatim.openstreetmap.org/reverse?format=json&lat=..&lon=..&zoom=18&addressdetails=1&accept-language=en
export const nominatimReverseGeocodeResponseSample = {
  address: {
    house_number: '123',
    road: 'Main Street',
    neighbourhood: 'Clifton',
    city_district: 'District South',
    city: 'Karachi',
    state: 'Sindh',
    postcode: '75500',
    country: 'Pakistan',
  },
  display_name: '123 Main Street, Clifton, Karachi, Sindh 75500, Pakistan',
};

// --------------------------------------------
// Helper: compute shipping like the app (optional reference)
// --------------------------------------------
export const exampleShippingRule = {
  rule: 'If city contains "karachi" => 250 else 350; if no items => 0',
};
