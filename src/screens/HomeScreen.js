import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
// Data inlined for clarity on what the Home screen maps
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CustomButton from '../components/CustomButton';
import Naz_Logo from '../assets/images/naz_logo.jpeg'
import useAuthStore from '../store/authStore';

const { width } = Dimensions.get('window');

// // Inlined data (migrated from src/data/mockData.js)
export const categories = [
  {
    id: '1',
    name: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
    itemCount: 45,
  },
  {
    id: '2',
    name: 'Tops & Blouses',
    image: 'https://images.unsplash.com/photo-1564257577-2d3b8c3b7e5b?w=300&h=300&fit=crop',
    itemCount: 32,
  },
  {
    id: '3',
    name: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
    itemCount: 28,
  },
  {
    id: '4',
    name: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
    itemCount: 18,
  },
  {
    id: '5',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
    itemCount: 24,
  },
];

export const featuredProducts = [
  {
    id: '1',
    name: 'Elegant Evening Dress',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop&auto=format',
    rating: 4.8,
    reviews: 124,
    isNew: false,
    isSale: true,
    category: 'Dresses',
    colors: ['Black', 'Navy', 'Burgundy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'A timeless evening dress crafted from premium fabric with a flattering silhouette, designed for special occasions and elegant nights out.',
    points: [
      'Premium satin blend',
      'Flattering A-line fit',
      'Invisible back zipper',
      'Fully lined for comfort',
    ],
  },
  {
    id: '2',
    name: 'Silk Blouse Premium',
    price: 159.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&auto=format',
    rating: 4.9,
    reviews: 89,
    isNew: true,
    isSale: false,
    category: 'Tops & Blouses',
    colors: ['White', 'Cream', 'Blush'],
    sizes: ['XS', 'S', 'M', 'L'],
    description:
      'An ultra-soft silk blouse with a luxurious drape that elevates any outfit from day to night.',
    points: [
      '100% silk fabric',
      'Breathable and lightweight',
      'Classic button-down design',
      'Delicate sheen finish',
    ],
  },
  {
    id: '3',
    name: 'Designer Blazer',
    price: 249.99,
    originalPrice: 329.99,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&auto=format',
    rating: 4.7,
    reviews: 156,
    isNew: false,
    isSale: true,
    category: 'Outerwear',
    colors: ['Black', 'Camel', 'Gray'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'A tailored blazer with structured shoulders and a refined fit to complete your premium wardrobe.',
    points: [
      'Structured yet comfortable',
      'Premium wool blend',
      'Functional inner pockets',
      'Single-breasted closure',
    ],
  },
  {
    id: '4',
    name: 'High-Waist Trousers',
    price: 129.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&auto=format',
    rating: 4.6,
    reviews: 203,
    isNew: true,
    isSale: false,
    category: 'Bottoms',
    colors: ['Black', 'Navy', 'Charcoal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Elegant high-waist trousers designed for a sleek silhouette and all-day comfort.',
    points: [
      'Stretch comfort fabric',
      'Tailored straight-leg fit',
      'Concealed hook-and-bar closure',
      'Wrinkle-resistant',
    ],
  },
];

export const newArrivals = [
  {
    id: '5',
    name: 'Floral Midi Dress',
    price: 189.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    rating: 4.5,
    reviews: 67,
    isNew: true,
    isSale: false,
    category: 'Dresses',
    colors: ['Floral Print', 'Navy Floral'],
    sizes: ['XS', 'S', 'M', 'L'],
    description:
      'A romantic floral midi dress with a flowy silhouette perfect for brunches and garden parties.',
    points: [
      'Soft breathable fabric',
      'Adjustable waist tie',
      'Midi-length hem',
      'Machine washable',
    ],
  },
  {
    id: '6',
    name: 'Cashmere Sweater',
    price: 199.99,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
    rating: 4.9,
    reviews: 45,
    isNew: true,
    isSale: false,
    category: 'Tops & Blouses',
    colors: ['Cream', 'Gray', 'Camel'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description:
      'Luxuriously soft cashmere sweater designed to keep you warm without compromising on style.',
    points: [
      '100% cashmere',
      'Ultra-soft hand feel',
      'Ribbed cuffs and hem',
      'Classic crew neckline',
    ],
  },
];

export const bannerData = [
  {
    id: '1',
    title: 'New Collection',
    subtitle: 'Discover elegance in every piece',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
    buttonText: 'Shop Now',
  },
  {
    id: '2',
    title: 'Sale Up to 50%',
    subtitle: 'Limited time offer',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    buttonText: 'View Sale',
  },
  {
    id: '3',
    title: 'Premium Dresses',
    subtitle: 'Luxury meets comfort',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=400&fit=crop',
    buttonText: 'Explore',
  },
  {
    id: '4',
    title: 'Winter Collection',
    subtitle: 'Stay warm in style',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
    buttonText: 'Shop Winter',
  },
];

const HomeScreen = ({ navigation, onScroll }) => {
  // Ensure we only pass serializable params through navigation
  const serializeProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    isNew: !!p.isNew,
    isSale: !!p.isSale,
    category: p.category,
    colors: Array.isArray(p.colors) ? [...p.colors] : [],
    sizes: Array.isArray(p.sizes) ? [...p.sizes] : [],
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;
  const viewAllButtonScale = useRef(new Animated.Value(1)).current;
  const premiumButtonScale = useRef(new Animated.Value(1)).current;
  // Categories fetched from backend
  const [apiCategories, setApiCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  // New Arrivals fetched from backend
  const [apiNewArrivals, setApiNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(false);
  // Featured (On Sale) products fetched from backend
  const [apiFeaturedOnSale, setApiFeaturedOnSale] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  // Wishlist state (only for authenticated users)
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch wishlist for authenticated users
  useEffect(() => {
    const loadWishlist = async () => {
      if (!token) {
        // Per requirement: if user not logged in, do nothing (and hide section)
        setWishlistIds([]);
        setWishlistProducts([]);
        return;
      }
      try {
        const resp = await fetch(`${API_BASE}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        // Accept either:
        // - { items: [id,...] }
        // - { items: [ { productId: { ...product } }, ... ] }
        // - [ { ...product }, ... ]
        let ids = [];
        if (Array.isArray(data)) {
          // If API returns array of product objects
          const mapped = data.map((p) => ({
            id: String(p._id ?? p.id),
            name: p.name,
            price: Number(p.price ?? 0),
            originalPrice: p.cutPrice != null ? Number(p.cutPrice) : (p.originalPrice ?? null),
            image: normalizeImageUrl(Array.isArray(p.image) ? (p.image[0] || '') : (p.image || '')),
            rating: Number(p.rating ?? 4.7),
            reviews: Number(p.reviews ?? 0),
            isNew: !!p.isNew,
            isSale: !!p.isSale,
            category: p.category ?? '',
            colors: Array.isArray(p.colors) ? p.colors : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            description: p.description ?? '',
            points: Array.isArray(p.points) ? p.points : [],
          }));
          setWishlistProducts(mapped);
          setWishlistIds(mapped.map((m) => m.id));
          return;
        }
        if (Array.isArray(data?.items)) {
          // Could be array of productId objects or simple id array
          const first = data.items[0];
          if (first && typeof first === 'object' && first.productId && typeof first.productId === 'object') {
            const mapped = data.items.map(({ productId: p }) => ({
              id: String(p._id ?? p.id),
              name: p.name,
              price: Number(p.price ?? 0),
              originalPrice: p.cutPrice != null ? Number(p.cutPrice) : (p.originalPrice ?? null),
              image: normalizeImageUrl(Array.isArray(p.image) ? (p.image[0] || '') : (p.image || '')),
              rating: Number(p.rating ?? 4.7),
              reviews: Number(p.reviews ?? 0),
              isNew: !!p.isNew,
              isSale: !!p.isSale,
              category: p.category ?? '',
              colors: Array.isArray(p.colors) ? p.colors : [],
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              description: p.description ?? '',
              points: Array.isArray(p.points) ? p.points : [],
            }));
            setWishlistProducts(mapped);
            setWishlistIds(mapped.map((m) => m.id));
          } else {
            ids = data.items.map((x) => String(x));
            setWishlistIds(ids);
          }
        } else {
          // Unknown payload; clear section gracefully
          setWishlistIds([]);
          setWishlistProducts([]);
        }
      } catch (e) {
        // fail silently
      }
    };
    loadWishlist();
  }, [token]);

  // Build wishlistProducts by mapping ids to already fetched product feeds
  useEffect(() => {
    if (!token) return; // guests: do nothing per requirement
    if (!wishlistIds || wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    const byId = new Map();
    [...apiNewArrivals, ...apiFeaturedOnSale].forEach((p) => byId.set(String(p.id), p));
    const mapped = wishlistIds.map((id) => byId.get(String(id))).filter(Boolean);
    setWishlistProducts(mapped);
  }, [wishlistIds, apiNewArrivals, apiFeaturedOnSale, token]);

  // Fetch Featured (On Sale) products and map to ProductCard shape
  useEffect(() => {
    const fetchFeaturedOnSale = async () => {
      try {
        setFeaturedLoading(true);
        const url = `${API_BASE}/admin/products/on-sale`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (Array.isArray(data)) {
          const mapped = data.map((p) => {
            const firstImage = Array.isArray(p.image) && p.image.length > 0 ? p.image[0] : p.image;
            const normalizedImage = normalizeImageUrl(firstImage || '');

            // sizes may come as ["XS,S,M,L,XL"] or a comma string
            let sizesArr = [];
            if (Array.isArray(p.sizes)) {
              sizesArr = p.sizes.length === 1 && typeof p.sizes[0] === 'string'
                ? p.sizes[0].split(',').map((s) => s.trim()).filter(Boolean)
                : p.sizes.map((s) => String(s).trim());
            } else if (typeof p.sizes === 'string') {
              sizesArr = p.sizes.split(',').map((s) => s.trim()).filter(Boolean);
            }

            // points may come as ["a,b,c"] or a comma string
            let pointsArr = [];
            if (Array.isArray(p.points)) {
              pointsArr = p.points.length === 1 && typeof p.points[0] === 'string'
                ? p.points[0].split(',').map((s) => s.trim()).filter(Boolean)
                : p.points.map((s) => String(s).trim());
            } else if (typeof p.points === 'string') {
              pointsArr = p.points.split(',').map((s) => s.trim()).filter(Boolean);
            }

            return {
              id: String(p._id ?? p.id ?? p.name),
              name: p.name,
              price: Number(p.price ?? 0),
              originalPrice: p.cutPrice != null ? Number(p.cutPrice) : null,
              image: normalizedImage,
              rating: Number(p.rating ?? 4.8),
              reviews: Number(p.reviews ?? 0),
              isNew: !!p.isNew,
              isSale: !!p.isSale,
              category: p.category ?? '',
              colors: Array.isArray(p.colors) ? p.colors : [],
              sizes: sizesArr,
              description: p.description ?? '',
              points: pointsArr,
              availableQuantity: Number(p.availableQuantity ?? 0),
            };
          });
          setApiFeaturedOnSale(mapped);
        } else {
          console.warn('Featured (on-sale) API returned non-array payload');
        }
      } catch (e) {
        console.warn('Featured (on-sale) fetch failed:', e?.message || e);
      } finally {
        setFeaturedLoading(false);
      }
    };
    fetchFeaturedOnSale();
  }, []);

  // API base for physical device testing (user provided LAN IP)
  // If you switch back to emulator, consider 10.0.2.2 for Android emulator.
  const API_BASE = 'http://192.168.18.11:3006';

  // Normalize image URLs coming from backend (localhost, 127.0.0.1, relative)
  const normalizeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    // If URL is absolute and points to localhost/127, rewrite to API_BASE
    if (url.startsWith('http://localhost:3006')) return url.replace('http://localhost:3006', API_BASE);
    if (url.startsWith('https://localhost:3006')) return url.replace('https://localhost:3006', API_BASE);
    if (url.startsWith('http://127.0.0.1:3006')) return url.replace('http://127.0.0.1:3006', API_BASE);
    if (url.startsWith('https://127.0.0.1:3006')) return url.replace('https://127.0.0.1:3006', API_BASE);
    // If already absolute http(s) to some other host, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // If relative path, prefix with API_BASE
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    // Fallback: treat as relative without leading slash
    return `${API_BASE}/${url.replace(/^\/+/, '')}`;
  };

  // Fetch categories from backend and map to UI shape
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const url = `${API_BASE}/admin/products/categories`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (Array.isArray(data)) {
          // Expecting: [{ id, name, image, itemCount }]
          setApiCategories(data.map((c) => ({
            id: String(c.id ?? c._id ?? c.name),
            name: c.name,
            image: normalizeImageUrl(c.image),
            itemCount: Number(c.itemCount ?? 0),
          })));
          console.log(apiCategories);
        } else {
          console.warn('Categories API returned non-array payload');
        }
      } catch (e) {
        console.warn('Categories fetch failed:', e?.message || e);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch New Arrivals from backend and map to ProductCard shape
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setNewArrivalsLoading(true);
        const url = `${API_BASE}/admin/products/new-arrivals`;
        const resp = await fetch(url);
        const data = await resp.json();
        console.log( "New Arrivals",data);
        if (Array.isArray(data)) {
          const mapped = data.map((p) => {
            const firstImage = Array.isArray(p.image) && p.image.length > 0 ? p.image[0] : p.image;
            const normalizedImage = normalizeImageUrl(firstImage || '');
            // sizes may come as ["XS,S,M,L,XL"] or "XS,S,M,L,XL"
            let sizesArr = [];
            if (Array.isArray(p.sizes)) {
              sizesArr = p.sizes.length === 1 && typeof p.sizes[0] === 'string'
                ? p.sizes[0].split(',').map((s) => s.trim()).filter(Boolean)
                : p.sizes.map((s) => String(s).trim());
            } else if (typeof p.sizes === 'string') {
              sizesArr = p.sizes.split(',').map((s) => s.trim()).filter(Boolean);
            }

            // points may come as ["a,b,c"] or "a,b,c"
            let pointsArr = [];
            if (Array.isArray(p.points)) {
              pointsArr = p.points.length === 1 && typeof p.points[0] === 'string'
                ? p.points[0].split(',').map((s) => s.trim()).filter(Boolean)
                : p.points.map((s) => String(s).trim());
            } else if (typeof p.points === 'string') {
              pointsArr = p.points.split(',').map((s) => s.trim()).filter(Boolean);
            }

            return {
              id: String(p._id ?? p.id ?? p.name),
              name: p.name,
              price: Number(p.price ?? 0),
              originalPrice: p.cutPrice != null ? Number(p.cutPrice) : null,
              image: normalizedImage,
              rating: Number(p.rating ?? 4.7),
              reviews: Number(p.reviews ?? 0),
              isNew: !!p.isNew,
              isSale: !!p.isSale,
              category: p.category ?? '',
              colors: Array.isArray(p.colors) ? p.colors : [],
              sizes: sizesArr,
              description: p.description ?? '',
              points: pointsArr,
              availableQuantity: Number(p.availableQuantity ?? 0),
            };
          });
          setApiNewArrivals(mapped);
        } else {
          console.warn('New Arrivals API returned non-array payload');
        }
      } catch (e) {
        console.warn('New Arrivals fetch failed:', e?.message || e);
      } finally {
        setNewArrivalsLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const handleCartPress = () => {
    // Cart bounce animation
    Animated.sequence([
      Animated.timing(cartBounceAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cartBounceAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cartBounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => navigation.navigate('Cart'), 100);
  };

  const handleViewAllPress = () => {
    Animated.sequence([
      Animated.timing(viewAllButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(viewAllButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => navigation.navigate('Products'), 50);
  };

  const handlePremiumButtonPress = () => {
    Animated.sequence([
      Animated.timing(premiumButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(premiumButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => navigation.navigate('Products'), 50);
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerShadowContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Image source={Naz_Logo} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>N&N Naz's Collection</Text>
            <Text style={styles.brandTagline}>WOMEN'S FASHION</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  // Auto-scroll banner carousel
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % bannerData.length;
        if (bannerScrollRef.current) {
          bannerScrollRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(bannerInterval);
  }, []);

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      <View style={styles.bannerContent}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <View style={styles.bannerDivider} />
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.bannerButtonContainer}>
          <Animated.View style={[{ transform: [{ scale: premiumButtonScale }] }]}>
            <TouchableOpacity
              style={styles.premiumButton}
              activeOpacity={0.9}
              onPress={handlePremiumButtonPress}
            >
              <LinearGradient
                colors={['#C0C0C0', '#A8A8A8', '#909090']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.premiumButtonText}>{item.buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );

  const renderBanner = () => {
    return (
      <View style={styles.bannerWrapper}>
        <FlatList
          ref={bannerScrollRef}
          data={bannerData}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentBannerIndex(index);
          }}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
        <View style={styles.bannerPagination}>
          {bannerData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentBannerIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderSectionHeader = (title, actionText) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <Animated.View style={[{ transform: [{ scale: viewAllButtonScale }] }]}>
          <TouchableOpacity 
            style={styles.viewAllButton} 
            onPress={handleViewAllPress}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>{actionText}</Text>
            <View style={styles.viewAllArrow} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  const renderCategories = () => {
    return (
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <Animated.View style={[{ transform: [{ scale: viewAllButtonScale }] }]}>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleViewAllPress}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <View style={styles.viewAllArrow} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.categoriesContainer}>
          <FlatList
            data={apiCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => navigation.navigate('Products', { categoryName: item.name })}
              />
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      </View>
    );
  };


  const renderFeaturedProducts = () => {
    return (
      <View style={styles.featuredSection}>
        {renderSectionHeader('Featured Products', 'View All')}
        <FlatList
          data={apiFeaturedOnSale}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.horizontalFeaturedCard}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id || item._id })}
                onToggleWishlist={() => { }}
              />
            </View>
          )}
          contentContainerStyle={styles.featuredProductsList}
        />
      </View>
    );
  };

  const renderNewArrivals = () => {
    return (
      <View style={styles.featuredSection}>
        {renderSectionHeader('New Arrivals', 'View All')}
        <FlatList
          data={apiNewArrivals}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.horizontalFeaturedCard}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { product: serializeProduct(item) })}
                onToggleWishlist={() => { }}
              />
            </View>
          )}
          contentContainerStyle={styles.featuredProductsList}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
      </View>
    );
  };

  // Wishlist section (only for authenticated users with items)
  const renderWishlistSection = () => {
    if (!token) return null;
    if (!wishlistProducts || wishlistProducts.length === 0) return null;
    return (
      <View style={styles.featuredSection}>
        {renderSectionHeader('Your Wishlist', null)}
        <FlatList
          data={wishlistProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.horizontalFeaturedCard}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id || item._id })}
                onToggleWishlist={() => { /* optional: refresh here if needed */ }}
              />
            </View>
          )}
          contentContainerStyle={styles.featuredProductsList}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderBanner()}
        {renderCategories()}
        {renderNewArrivals()}
        {renderFeaturedProducts()}
        {typeof renderWishlistSection === 'function' ? renderWishlistSection() : null}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerShadowContainer: {
    // Shadow properties with curved shape
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 25,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textLuxury,
    letterSpacing: 0.8,
    fontFamily: Fonts.families.heading,
  },
  brandTagline: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: 3,
    opacity: 0.8,
    fontFamily: Fonts.families.body,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
  },
  brandTextContainer: {
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  brandTagline: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 14,
    // backgroundColor: Colors.surfaceElevated,
    // borderRadius: 20,
    // elevation: 4,
    // shadowColor: Colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 1,
    // shadowRadius: 6,
    // borderWidth: 1,
    // borderColor: Colors.borderLight,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceElevated,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginHorizontal: 24,
    marginVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textSecondary,
    marginLeft: 12,
    fontStyle: 'italic',
    flex: 1,
    letterSpacing: 0.3,
  },
  bannerWrapper: {
    marginBottom: 32,
  },
  bannerContainer: {
    width: width,
    paddingHorizontal: 20,
    position: 'relative',
    marginTop: 20
  },
  bannerImageContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 32,
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#C0C0C0',
    marginVertical: 12,
    opacity: 0.8,
  },
  bannerButtonContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumButton: {
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 38,
    fontFamily: Fonts.families.heading,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.8,
    fontWeight: '300',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: Fonts.families.body,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    fontFamily: Fonts.families.heading,
  },
  sectionAction: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textLuxury,
    fontWeight: Fonts.weights.semiBold,
    letterSpacing: 0.2,
  },
  categoriesSection: {
    paddingVertical: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    alignItems: 'flex-start',
  },
  premiumSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#C0C0C0',
    marginTop: 8,
    borderRadius: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  viewAllArrow: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.textSecondary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 6,
  },
  categoriesContainer: {
    paddingLeft: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  featuredSection: {
    marginTop: 16,
  },
  horizontalFeaturedCard: {
    width: 180,
    marginRight: 16,
  },
  featuredProductsList: {
    paddingHorizontal: 20,
  },
  productCardContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  productCardRight: {
    paddingLeft: 10,
  },
  horizontalProductCard: {
    width: width * 0.7,
    marginRight: 16,
  },
  horizontalProductsList: {
    paddingHorizontal: 20,
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.textPrimary,
    width: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;
