import React, { useState , useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import CustomButton from '../components/CustomButton';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';




// Reusable bounce touchable (local) for this screen
const BounceTouchable = ({
  onPress,
  disabled,
  children,
  style,
  activeOpacity = 0.9,
  scaleTo = 1.08,
  ...rest
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: scaleTo, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress && onPress());
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const test_data = [
  {
    cartId: '1_XS_Black',
    productId: '1',
    name: 'Elegant Evening Dress',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop&auto=format',
    size: 'XS',
    quantity: 2,
  },
]

const CartScreen = ({ navigation, onScroll }) => {
  const { items: cartItems, updateQuantity, removeFromCart } = useCartStore();
  const isAuthenticated = useAuthStore((s) => !!s.user);

  // Hydrate cart when screen mounts depending on auth state
  useEffect(() => {
    const hydrate = async () => {
      if (cartItems.length > 0) return;
      if (isAuthenticated) {
        await useCartStore.getState().loadCartFromServer();
      } else {
        await useCartStore.getState().loadCartFromStorage();
      }
    };
    hydrate();
    // Re-run when auth state changes (e.g., user logs in)
  }, [isAuthenticated]);

  const changeQty = (cartId, change) => {
    const item = cartItems.find(i => i.cartId === cartId);
    if (!item) return;
    const maxAvail = Number(item.availableQuantity ?? Infinity);
    const next = Math.max(1, Math.min((item.quantity || 1) + change, maxAvail));
    updateQuantity(cartId, next);
  };

  const removeItem = (cartId) => removeFromCart(cartId);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Shopping Bag</Text>
      <Text style={styles.headerSubtitle}>{cartItems.length} items</Text>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity
        style={styles.removeIconButton}
        onPress={() => removeItem(item.cartId)}
      >
        <Text style={styles.removeIcon}>×</Text>
      </TouchableOpacity>
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>Rs {item.price}</Text>
        </View>
        
        <View style={styles.variantContainer}>
          <View style={styles.variantChip}>
            <Text style={styles.variantText}>Size: {item.size || 'XS'}</Text>
          </View>
          {/* <View style={styles.variantChip}>
            <Text style={styles.variantText}>{item.color || 'Floral Print'}</Text>
          </View> */}
        </View>
        
        <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => changeQty(item.cartId, -1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => changeQty(item.cartId, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>      
          <Text style={styles.itemTotal}>Rs {(item.price * item.quantity)}</Text>
        </View>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total}</Text>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Text style={styles.emptyCartIcon}>🛍️</Text>
      <Text style={styles.emptyCartTitle}>Your bag is empty</Text>
      <Text style={styles.emptyCartText}>Add some beautiful pieces to get started</Text>
      <BounceTouchable
        style={styles.continueButton}
        onPress={() => navigation.navigate('Products')}
        activeOpacity={0.9}
      >
        <View style={styles.continueButtonContent}>
          <Ionicons name="pricetags-outline" size={20} color={Colors.primary} />
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </View>
      </BounceTouchable>
    </View>
  );

  const handleCheckout = () => {
    const params = { items: cartItems, totals: { subtotal, total }, openLocationOnMount: true };
    if (!isAuthenticated) {
      navigation.navigate('Login', { redirectTo: 'Checkout', redirectParams: params });
      return;
    }
    navigation.navigate('Checkout', params);
  };

  const renderCheckoutButton = () => (
    <View style={styles.checkoutContainer}>
      <BounceTouchable
        style={styles.premiumCheckoutButton}
        onPress={handleCheckout}
        activeOpacity={0.9}
      >
        <View style={styles.checkoutButtonContent}>
          <View style={styles.checkoutIconContainer}>
            <Ionicons name="bag-check-outline" size={24} color={Colors.textLight} />
          </View>
          <View style={styles.checkoutTextContainer}>
            <Text style={styles.checkoutMainText}>Checkout</Text>
          </View>
        </View>
      </BounceTouchable>
      <BounceTouchable
        style={styles.continueButton}
        onPress={() => navigation.navigate('Products')}
        activeOpacity={0.9}
      >
        <View style={styles.continueButtonContent}>
          <Ionicons name="pricetags-outline" size={20} color={Colors.primary} />
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </View>
      </BounceTouchable>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.cartId || item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListFooterComponent={() => (
          <>
            {renderSummary()}
            {renderCheckoutButton()}
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
    fontFamily: Fonts.families.heading,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    borderColor : Colors.borderLight,
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 130,
    borderRadius: 16,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  removeIconButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  removeIcon: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: 'bold',
    lineHeight: 14,
    fontFamily: Fonts.families.body,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
    lineHeight: Fonts.lineHeights.tight * Fonts.sizes.md,
    fontFamily: Fonts.families.body,
  },
  itemPrice: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    letterSpacing: -0.1,
    flexShrink: 0,
    fontFamily: Fonts.families.body,
  },
  variantContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  variantChip: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 0,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  quantityButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: Fonts.weights.bold,
    lineHeight: Fonts.sizes.sm,
    fontFamily: Fonts.families.body,
  },
  quantityText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
    marginHorizontal: 12,
    minWidth: 18,
    textAlign: 'center',
    fontFamily: Fonts.families.body,
  },
  itemTotal: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.1,
    flex: 0,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: Fonts.families.body,
  },
  summaryContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
    fontFamily: Fonts.families.heading,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
  },
  summaryValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    fontFamily: Fonts.families.body,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingTop: 12,
    marginTop: 8,
    backgroundColor: Colors.surface,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingBottom: 4,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
    letterSpacing: -0.2,
    fontFamily: Fonts.families.body,
  },
  totalValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.extraBold,
    letterSpacing: -0.2,
    fontFamily: Fonts.families.body,
  },
  checkoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  continueButton: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 200,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    fontFamily: Fonts.families.body,
  },
  premiumCheckoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    minWidth: 200,
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutIcon: {
    fontSize: 24,
    color: Colors.textLight,
  },
  checkoutTextContainer: {
    flex: 1,
  },
  checkoutMainText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textLight,
    marginBottom: 2,
    letterSpacing: 0.3,
    fontFamily: Fonts.families.body,
  },
  checkoutSubText: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Fonts.weights.medium,
    letterSpacing: 0.2,
    fontFamily: Fonts.families.body,
  },
  checkoutPriceContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  checkoutPriceText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.extraBold,
    color: Colors.textLight,
    letterSpacing: -0.2,
    fontFamily: Fonts.families.body,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Fonts.families.heading,
  },
  emptyCartText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Fonts.lineHeights.relaxed * Fonts.sizes.md,
    fontFamily: Fonts.families.body,
  },
  continueShoppingButton: {
    paddingHorizontal: 32,
  },
  premiumContinueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    alignSelf: 'stretch',
    maxWidth: 280,
    alignSelf: 'center',
  },
  buttonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  premiumButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textLight,
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: Fonts.families.body,
  },
  premiumButtonSubtext: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Fonts.weights.medium,
    letterSpacing: 0.3,
    fontFamily: Fonts.families.body,
  },
});

export default CartScreen;
