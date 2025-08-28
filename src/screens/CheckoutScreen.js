import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useCartStore from '../store/cartStore';
import CustomButton from '../components/CustomButton';

const CheckoutScreen = ({ route, navigation }) => {
  const { buyNowItem, items: navItems, totals: navTotals } = route?.params || {};
  const { items: cartItems, clearCart } = useCartStore();

  const items = useMemo(() => {
    if (buyNowItem) return [buyNowItem];
    if (Array.isArray(navItems)) return navItems;
    return cartItems;
  }, [buyNowItem, navItems, cartItems]);

  const subtotal = useMemo(() => {
    if (navTotals?.subtotal != null) return navTotals.subtotal;
    return items.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
  }, [items, navTotals]);
  const shipping = navTotals?.shipping != null ? navTotals.shipping : (items.length > 0 ? 15 : 0);
  const total = navTotals?.total != null ? navTotals.total : subtotal + shipping;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');

  const placeOrder = () => {
    if (!fullName || !phone || !address || !city || !zip) {
      Alert.alert('Missing details', 'Please fill all required fields.');
      return;
    }
    // Fake success flow
    if (!buyNowItem) {
      clearCart();
    }
    Alert.alert('Order placed', 'Thank you! Your order has been placed.', [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariant}>Size: {item.size || '-'} • Color: {item.color || '-'}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * (item.quantity || 1)).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Checkout</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.formRow}>
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
              <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
              <TextInput style={styles.input} placeholder="ZIP / Postal Code" value={zip} onChangeText={setZip} keyboardType="number-pad" />
              <TextInput style={[styles.input, styles.textarea]} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <FlatList
              data={items}
              keyExtractor={(it, idx) => it.cartId || `${it.id}_${it.size || ''}_${it.color || ''}_${idx}`}
              renderItem={renderItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
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

          <CustomButton title="Place Order" variant="primary" size="large" onPress={placeOrder} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12, alignSelf: 'center' }}>
            <Text style={{ color: Colors.accent, fontSize: Fonts.sizes.sm }}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: Fonts.sizes.xxxl, fontWeight: Fonts.weights.bold, color: Colors.textPrimary, marginBottom: 16 },
  section: { backgroundColor: Colors.cardBackground, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.semiBold, color: Colors.textPrimary, marginBottom: 12 },
  formRow: {},
  input: { backgroundColor: Colors.backgroundLight, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10, fontSize: Fonts.sizes.md, color: Colors.textPrimary },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundLight, borderRadius: 10, padding: 10 },
  itemImage: { width: 56, height: 70, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold, color: Colors.textPrimary },
  itemVariant: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  itemQty: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
  itemPrice: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
  summaryValue: { fontSize: Fonts.sizes.md, color: Colors.textPrimary, fontWeight: Fonts.weights.medium },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 6 },
  totalLabel: { fontSize: Fonts.sizes.lg, color: Colors.textPrimary, fontWeight: Fonts.weights.semiBold },
  totalValue: { fontSize: Fonts.sizes.lg, color: Colors.textPrimary, fontWeight: Fonts.weights.bold },
});

export default CheckoutScreen;
