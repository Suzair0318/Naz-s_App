import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, RESULTS, request, check, openSettings } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const [detectedCity, setDetectedCity] = useState(null);
  const [shipping, setShipping] = useState(
    navTotals?.shipping != null ? navTotals.shipping : (items.length > 0 ? 350 : 0)
  );
  const total = navTotals?.total != null ? navTotals.total : subtotal + shipping;

  // Detect user's city via IP and set shipping: Karachi = 250, Others = 350
  useEffect(() => {
    let cancelled = false;
    const detectCity = async () => {
      try {
        const resp = await fetch('https://ipapi.co/json/?lang=en');
        const data = await resp.json();
        if (cancelled) return;
        const city = (data?.city || '').trim();
        if (city) setDetectedCity(city);
        const isKarachi = city.toLowerCase().includes('karachi');
        setShipping(items.length > 0 ? (isKarachi ? 250 : 350) : 0);
      } catch (e) {
        // Fallback: keep default shipping; optionally set a placeholder city
        if (!cancelled) {
          setDetectedCity(null);
          setShipping(items.length > 0 ? 350 : 0);
        }
      }
    };
    detectCity();
    return () => {
      cancelled = true;
    };
    // Re-evaluate when cart becomes empty/non-empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [askedLocationOnce, setAskedLocationOnce] = useState(false);

  // Ask permission and get precise location to improve city detection
  useEffect(() => {
    if (askedLocationOnce) return;
    setAskedLocationOnce(true);

    const askPermissionAndLocate = async () => {
      try {
        const perm = Platform.select({
          android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        });
        if (!perm) return;
        const status = await check(perm);
        let finalStatus = status;
        if (status !== RESULTS.GRANTED) {
          finalStatus = await request(perm);
        }
        if (finalStatus === RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            async ({ coords }) => {
              try {
                const { latitude, longitude } = coords;
                // Reverse geocode to get city and address
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`;
                const resp = await fetch(url, {
                  headers: { 'User-Agent': 'NazsApp/1.0 (ReactNative)', 'Accept-Language': 'en' },
                });
                const data = await resp.json();
                console.log(data);
                const addr = data?.address || {};
                const foundCity = (
                  addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
                ).toString();
                // Build a precise, readable address line
                const parts = [
                  [addr.house_number, addr.road].filter(Boolean).join(' '),
                  addr.neighbourhood || addr.suburb || addr.quarter || addr.hamlet,
                  addr.city_district || addr.district,
                  foundCity,
                  addr.state,
                  addr.postcode,
                ].filter(Boolean);
                const line1 = parts.slice(0, 4).join(', ');
                if (foundCity) {
                  setDetectedCity(foundCity);
                  setCity((prev) => prev || foundCity);
                  const isKarachi = foundCity.toLowerCase().includes('karachi');
                  setShipping(items.length > 0 ? (isKarachi ? 250 : 350) : 0);
                }
                if (line1) {
                  setAddress((prev) => prev || line1);
                }
              } catch (e) {
                // ignore reverse geocode errors
              }
            },
            (error) => {
              // ignore geolocation error; IP-based fallback already applied
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
          );
        } else {
          // Not granted or blocked: force user decision
          Alert.alert(
            'Location required',
            'Please allow location to auto-detect your city for correct shipping charges.',
            [
              { text: 'Open Settings', onPress: () => openSettings() },
              { text: 'Try Again', onPress: () => { askPermissionAndLocate(); } },
            ],
            { cancelable: false }
          );
        }
      } catch (e) {
        // silently fail; IP fallback remains
      }
    };

    // Single button: user must choose Allow to proceed
    Alert.alert(
      'Use your current location?',
      'Allow access to your location to auto-fill your address and apply the correct shipping charges.',
      [
        {
          text: 'Allow',
          onPress: () => { askPermissionAndLocate(); },
        },
      ],
      { cancelable: false }
    );
  }, [askedLocationOnce, items.length]);

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'phone':
        return !/^[\d\s\-\+\(\)]{10,}$/.test(value.replace(/\s/g, '')) ? 'Please enter a valid phone number' : '';
      case 'address':
        return value.length < 5 ? 'Address must be at least 5 characters' : '';
      case 'city':
        return value.length < 2 ? 'City must be at least 2 characters' : '';
      case 'zip':
        return !/^[\d\-\s]{3,}$/.test(value) ? 'Please enter a valid ZIP code' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.fullName = validateField('fullName', fullName);
    newErrors.phone = validateField('phone', phone);
    newErrors.address = validateField('address', address);
    newErrors.city = validateField('city', city);
    newErrors.zip = validateField('zip', zip);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Invalid Details', 'Please correct the highlighted fields.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (!buyNowItem) {
        clearCart();
      }
      Alert.alert('Order Placed Successfully! 🎉', 'Thank you for your purchase. You will receive a confirmation email shortly.', [
        { text: 'Continue Shopping', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
      ]);
    }, 2000);
  };

  const renderInput = (field, placeholder, value, setValue, iconName, keyboardType = 'default', multiline = false) => {
    const hasError = errors[field];
    const isFocused = focusedField === field;
    const hasValue = value.length > 0;

    return (
      <View style={styles.inputContainer}>
        <View style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          hasValue && !hasError && styles.inputValid
        ]}>
          <Ionicons 
            name={iconName} 
            size={20} 
            color={hasError ? '#FF4444' : isFocused ? Colors.primary : Colors.textSecondary} 
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.premiumInput, multiline && styles.multilineInput]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textSecondary}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (hasError) {
                const newErrors = { ...errors };
                newErrors[field] = validateField(field, text);
                setErrors(newErrors);
              }
            }}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
          {hasValue && !hasError && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.validIcon} />
          )}
        </View>
        {hasError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#FF4444" />
            <Text style={styles.errorText}>{hasError}</Text>
          </View>
        )}
      </View>
    );
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
          {/* <Text style={styles.title}>Checkout</Text> */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.formRow}>
              {renderInput('fullName', 'Full Name', fullName, setFullName, 'person-outline')}
              {renderInput('phone', 'Phone Number', phone, setPhone, 'call-outline', 'phone-pad')}
              {renderInput('address', 'Street Address', address, setAddress, 'location-outline', 'default', true)}
              {renderInput('city', 'City', city, setCity, 'business-outline')}
              {renderInput('zip', 'ZIP / Postal Code', zip, setZip, 'mail-outline', 'number-pad')}
              {renderInput('notes', 'Order Notes (Optional)', notes, setNotes, 'chatbubble-outline', 'default', true)}
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
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodContainer}>
              <View style={styles.paymentMethodRow}>
                <Ionicons name="cash-outline" size={24} color={Colors.primary} style={styles.paymentIcon} />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentMethodTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentMethodDesc}>Pay when your order arrives at your doorstep</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{detectedCity ? detectedCity : 'Detecting...'}</Text>
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
 
          <TouchableOpacity 
            style={[styles.premiumOrderButton, isLoading && styles.loadingButton]} 
            onPress={placeOrder}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.orderButtonContent}>
              {isLoading ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color={Colors.textLight} style={styles.buttonIcon} />
                  <Text style={styles.orderButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color={Colors.textLight} style={styles.buttonIcon} />
                  <Text style={styles.orderButtonText}>Place Order • ${total.toFixed(2)}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12, alignSelf: 'center' }}>
            <Text style={{ color: Colors.accent, fontSize: Fonts.sizes.sm }}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  content: { 
    paddingHorizontal: 16, 
    paddingVertical: 20,
    paddingBottom: 40 
  },
  title: { 
    fontSize: Fonts.sizes.xxxl, 
    fontWeight: Fonts.weights.bold, 
    color: Colors.textPrimary, 
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5
  },
  section: { 
    backgroundColor: Colors.surfaceElevated, 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    paddingVertical: 24, 
    marginBottom: 20, 
    shadowColor: Colors.shadow, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  sectionTitle: { 
    fontSize: Fonts.sizes.lg, 
    fontWeight: Fonts.weights.bold, 
    color: Colors.textPrimary, 
    marginBottom: 16,
    letterSpacing: -0.2
  },
  formRow: {},
  
  // Premium Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  inputValid: {
    borderColor: '#4CAF50',
  },
  inputIcon: {
    marginRight: 12,
  },
  premiumInput: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    paddingVertical: 14,
    fontWeight: Fonts.weights.medium,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  validIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 16,
  },
  errorText: {
    fontSize: Fonts.sizes.xs,
    color: '#FF4444',
    marginLeft: 6,
    fontWeight: Fonts.weights.medium,
  },
  
  // Payment Method Styles
  paymentMethodContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  
  // Item Row Styles
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.surface, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 12,
  },
  itemImage: { 
    width: 64, 
    height: 80, 
    borderRadius: 12, 
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemInfo: { 
    flex: 1 
  },
  itemName: { 
    fontSize: Fonts.sizes.sm, 
    fontWeight: Fonts.weights.semiBold, 
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  itemVariant: { 
    fontSize: Fonts.sizes.xs, 
    color: Colors.textSecondary, 
    marginBottom: 3,
  },
  itemQty: { 
    fontSize: Fonts.sizes.xs, 
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  itemPrice: { 
    fontSize: Fonts.sizes.md, 
    fontWeight: Fonts.weights.bold, 
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  
  // Summary Styles
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12,
    paddingVertical: 4,
  },
  summaryLabel: { 
    fontSize: Fonts.sizes.sm, 
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  summaryValue: { 
    fontSize: Fonts.sizes.sm, 
    color: Colors.textPrimary, 
    fontWeight: Fonts.weights.semiBold,
  },
  totalRow: { 
    borderTopWidth: 2, 
    borderTopColor: Colors.primary, 
    paddingTop: 16, 
    marginTop: 12,
    backgroundColor: Colors.surface,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingBottom: 8,
    borderRadius: 12,
  },
  totalLabel: { 
    fontSize: Fonts.sizes.md, 
    color: Colors.textPrimary, 
    fontWeight: Fonts.weights.bold,
    letterSpacing: -0.1,
  },
  totalValue: { 
    fontSize: Fonts.sizes.lg, 
    color: Colors.primary, 
    fontWeight: Fonts.weights.extraBold,
    letterSpacing: -0.2,
  },
  
  // Premium Order Button
  premiumOrderButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingButton: {
    opacity: 0.8,
  },
  orderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 12,
  },
  orderButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.textLight,
    letterSpacing: 0.3,
  },
});

export default CheckoutScreen;
