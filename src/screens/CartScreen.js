import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import CustomButton from '../components/CustomButton';
import useCartStore from '../store/cartStore';

const CartScreen = ({ navigation, onScroll }) => {
  const { items: cartItems, updateQuantity, removeFromCart } = useCartStore();

  const changeQty = (cartId, change) => {
    const item = cartItems.find(i => i.cartId === cartId);
    if (!item) return;
    updateQuantity(cartId, Math.max(1, (item.quantity || 1) + change));
  };

  const removeItem = (cartId) => removeFromCart(cartId);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Shopping Bag</Text>
      <Text style={styles.headerSubtitle}>{cartItems.length} items</Text>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariant}>Size: {item.size || '-'} • Color: {item.color || '-'}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        
        <View style={styles.itemActions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => changeQty(item.cartId, -1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => changeQty(item.cartId, 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.cartId)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping</Text>
        <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Text style={styles.emptyCartIcon}>🛍️</Text>
      <Text style={styles.emptyCartTitle}>Your bag is empty</Text>
      <Text style={styles.emptyCartText}>Add some beautiful pieces to get started</Text>
      <CustomButton
        title="Continue Shopping"
        variant="primary"
        size="large"
        style={styles.continueShoppingButton}
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );

  const renderCheckoutButton = () => (
    <View style={styles.checkoutContainer}>
      <CustomButton
        title={`Checkout • $${total.toFixed(2)}`}
        variant="primary"
        size="large"
        onPress={() => navigation.navigate('Checkout', { items: cartItems, totals: { subtotal, shipping, total } })}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButtonText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
  },
  quantityText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.accent,
    fontWeight: Fonts.weights.medium,
  },
  summaryContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
  },
  totalValue: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
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
    opacity: 0.3,
  },
  emptyCartTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Fonts.lineHeights.relaxed * Fonts.sizes.md,
  },
  continueShoppingButton: {
    paddingHorizontal: 32,
  },
});

export default CartScreen;
