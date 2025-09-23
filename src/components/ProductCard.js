import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';
import storage from '../utils/storage';
import { ENDPOINTS } from '../utils/endpoint';

const ProductCard = ({ product, onPress, onToggleWishlist }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wishlistScaleAnim = useRef(new Animated.Value(1)).current;
  const { token } = useAuthStore();

  // Determine stock availability from product data
  const availableQty = Number(product?.availableQuantity ?? product?.quantity ?? product?.stock ?? 0);
  const isOutOfStock = isNaN(availableQty) || availableQty <= 0;

  const CACHE_KEY = 'wishlist:v1';

  const readGuestWishlist = async () => {
    try {
      const raw = await storage.getItem(CACHE_KEY);
      if (!raw) return { items: [] };
      const parsed = JSON.parse(raw);
      return { items: Array.isArray(parsed?.items) ? parsed.items : [] };
    } catch (e) {
      return { items: [] };
    }
  };

  const writeGuestWishlist = async (items) => {
    try {
      await storage.setItem(CACHE_KEY, JSON.stringify({ items }));
    } catch (e) {
      // noop
    }
  };

  // Initialize heart state for guests based on cache
  useEffect(() => {
    let isActive = true;
    const init = async () => {
      const pid = String(product?.id || product?._id || '').trim();
      if (!pid) return;
      if (!token) {
        try {
          const raw = await storage.getItem(CACHE_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          const ids = Array.isArray(parsed?.items) ? parsed.items : [];
          if (isActive) setIsWishlisted(ids.includes(pid));
        } catch (_) {
          // ignore
        }
      }
    };
    init();
    return () => { isActive = false; };
  }, [product, token]);

  const addToWishlist = async (pid) => {
    if (!pid) return false;
    if (!token) {
      const { items } = await readGuestWishlist();
      if (!items.includes(pid)) {
        items.push(pid);
        await writeGuestWishlist(items);
      }
      return true;
    }
    try {
      const resp = await fetch(`${ENDPOINTS.live}/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: pid }),
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  };

  const removeFromWishlist = async (pid) => {
    if (!pid) return false;
    if (!token) {
      const { items } = await readGuestWishlist();
      const next = items.filter((id) => id !== pid);
      await writeGuestWishlist(next);
      return true;
    }
    try {
      const resp = await fetch(`${ENDPOINTS.live}/wishlist/${pid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  };

  const handleWishlistToggle = async () => {
    // Wishlist button animation
    Animated.sequence([
      Animated.timing(wishlistScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const pid = String(product?.id || product?._id || '').trim();
    if (!pid) return;

    let success = false;
    if (!isWishlisted) {
      success = await addToWishlist(pid);
      if (success) setIsWishlisted(true);
    } else {
      success = await removeFromWishlist(pid);
      if (success) setIsWishlisted(false);
    }

    if (onToggleWishlist) {
      onToggleWishlist(pid, success, !isWishlisted);
    }
  };
  const calculateDiscount = () => {
    if (product.originalPrice && product.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return discount;
    }
    return 0;
  };

  const renderPriceSection = () => {
    return (
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderBadges = () => {
    const discountPercent = calculateDiscount();
    
    return (
      <View style={styles.badgeContainer}>
        {product.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {product.isSale && discountPercent > 0 && (
          <View style={[styles.badge, styles.saleBadge]}>
            <Text style={styles.badgeText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.rating}>★ {product.rating}</Text>
      <Text style={styles.reviews}>({product.reviews})</Text>
    </View>
  );

  const handleCardPress = () => {
    // Do not navigate if out of stock
    if (isOutOfStock) {
      return;
    }
    // Card press animation - bounce like wishlist
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    if (onPress) {
      setTimeout(() => onPress(), 50);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}> 
      <TouchableOpacity 
        style={styles.container} 
        onPress={handleCardPress}
        disabled={isOutOfStock}
        activeOpacity={0.95}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: Array.isArray(product?.image) ? (product.image[0] || '') : (product?.image || '') }} 
            style={styles.image} 
          />
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
          {renderBadges()}
          <View style={styles.buttonRow}>
            <Animated.View style={[{ transform: [{ scale: wishlistScaleAnim }] }]}> 
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  styles.wishlistButton,
                  isWishlisted && styles.wishlistButtonActive
                ]}
                onPress={handleWishlistToggle}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={isWishlisted ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isWishlisted ? "#FFFFFF" : Colors.primary}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {renderPriceSection()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  newBadge: {
    backgroundColor: Colors.success,
  },
  saleBadge: {
    backgroundColor: '#FF6B35',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  buttonRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 0,
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cartButton: {
    backgroundColor: Colors.primary,
  },
  inCartButton: {
    backgroundColor: '#4CAF50',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Fonts.families.body,
  },
  wishlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },
  wishlistButtonActive: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    padding: 16,
    paddingTop : 7,
    backgroundColor: '#FFFFFF',
  },
  category: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    opacity: 0.8,
    fontFamily: Fonts.families.body,
  },
  name: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 5,
    lineHeight: 18,
    fontFamily: Fonts.families.body,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
    fontFamily: Fonts.families.body,
  },
  reviews: {
    fontSize: 9,
    color: Colors.textLight,
    fontFamily: Fonts.families.body,
  },
  priceContainer: {
    // marginTop: 6,
    // paddingTop: 4,
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
    color: '#2C2C2C',
    fontWeight: '700',
    letterSpacing: 0.2,
    fontFamily: Fonts.families.body,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
    opacity: 0.8,
    fontFamily: Fonts.families.body,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  outOfStockText: {
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Fonts.families.body,
  },
});

export default ProductCard;
