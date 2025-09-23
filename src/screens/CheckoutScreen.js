import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated, Modal, AppState } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, RESULTS, request, check, openSettings } from 'react-native-permissions';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useCartStore from '../store/cartStore';
import PremiumAlert from '../components/PremiumAlert';
import useAuthStore from '../store/authStore';
import storage from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { ENDPOINTS } from '../utils/endpoint';

// Notifications removed per user request

const CHECKOUT_ADDRESS_KEY = '@checkout_address';


const CheckoutScreen = ({ route, navigation }) => {
  const { buyNowItem, items: navItems, totals: navTotals, openLocationOnMount } = route?.params || {};
  const isAuthenticated = useAuthStore((s) => !!s.user);
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
  // Total weight in kg across all items
  const totalWeight = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.weight || 0) * Number(it.quantity || 1)), 0);
  }, [items]);
  const [detectedCity, setDetectedCity] = useState(null);
  const [shipping, setShipping] = useState(
    navTotals?.shipping != null ? navTotals.shipping : (items.length > 0 ? 350 : 0)
  );
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  // Helpers for city and weight-based shipping
  const isKarachiCity = (c) => (c || '').toLowerCase().includes('karachi');
  // Remove administrative suffixes like 'Division'/'District' from city names for cleaner UI
  const cleanCityName = (name) => {
    const n = String(name || '');
    return n
      .replace(/\b(Division|District)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // Notifications removed per user request
  const computeShipping = (weightKg, cityName, itemsCount) => {
    if (navTotals?.shipping != null) return navTotals.shipping; // if explicitly provided, respect it
    if (!itemsCount) return 0;
    const basePerKg = isKarachiCity(cityName) ? 300 : 350;
    const billedUnits = Math.max(1, Math.ceil(Number(weightKg || 0)));
    return basePerKg * billedUnits;
  };

  // Hydrate cart if user lands on Checkout without navItems/buyNowItem
  useEffect(() => {
    // If Checkout was invoked with explicit items, do not override
    if (buyNowItem || Array.isArray(navItems)) return;
    // If store already has items, no need to hydrate
    if ((cartItems || []).length > 0) return;
    const hydrate = async () => {
      if (isAuthenticated) {
        await useCartStore.getState().loadCartFromServer();
      } else {
        await useCartStore.getState().loadCartFromStorage();
      }
    };
    hydrate();
    // Re-run when auth changes; cartItems excluded to avoid flicker while mapping items below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, buyNowItem, navItems]);

  // Detect user's city via IP and set weight-based shipping: Karachi = 300/kg, Others = 350/kg
  useEffect(() => {
    let cancelled = false;
    const detectCity = async () => {
      try {
        setIsDetectingCity(true);
        const resp = await fetch('https://ipapi.co/json/?lang=en');
        const data = await resp.json();
        if (cancelled) return;
        const city = cleanCityName((data?.city || '').trim());
        if (city) setDetectedCity(city);
        const newShipping = computeShipping(totalWeight, city, items.length);
        setShipping(newShipping);
        setLastShippingAt(Date.now());
      } catch (e) {
        // Fallback: keep default shipping; optionally set a placeholder city
        if (!cancelled) {
          setDetectedCity(null);
          const fallback = computeShipping(totalWeight, null, items.length);
          setShipping(fallback);
          setLastShippingAt(Date.now());
        }
      }
      setIsDetectingCity(false);
    };
    detectCity();
    return () => {
      cancelled = true;
    };
    // Re-evaluate when cart becomes empty/non-empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, totalWeight]);

  // Re-validate when screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      // On focus, recompute shipping with current city and weight
      const cityName = (detectedCity || city || '').trim();
      const newShipping = computeShipping(totalWeight, cityName, items.length);
      if (newShipping !== shipping) {
        setShipping(newShipping);
        setLastShippingAt(Date.now());
      }
      return () => {};
    }, [detectedCity, city, totalWeight, items.length, shipping])
  );

  // Re-validate when app returns to foreground
  useEffect(() => {
    const handler = (state) => {
      if (state === 'active') {
        const cityName = (detectedCity || city || '').trim();
        const newShipping = computeShipping(totalWeight, cityName, items.length);
        if (newShipping !== shipping) {
          setShipping(newShipping);
          setLastShippingAt(Date.now());
        }
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub?.remove?.();
  }, [detectedCity, city, totalWeight, items.length, shipping]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  // City resolution: allow either detectedCity or user-entered city
  const isCityResolved = useMemo(() => {
    const manual = (city || '').trim().length > 0;
    const detected = (detectedCity || '').trim().length > 0;
    return manual || detected;
  }, [city, detectedCity]);
  const [askedLocationOnce, setAskedLocationOnce] = useState(false);
  const [isDetectingCity, setIsDetectingCity] = useState(false);
  const [lastShippingAt, setLastShippingAt] = useState(0);

  // React to manual city changes and update shipping accordingly when navTotals doesn't override
  useEffect(() => {
    // If shipping was injected via navTotals, don't override
    if (navTotals?.shipping != null) return;
    setShipping(computeShipping(totalWeight, city, items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, items.length, totalWeight]);

  // Load cached address info on mount (only if fields are empty)
  useEffect(() => {
    let cancelled = false;
    const loadCachedAddress = async () => {
      try {
        const raw = await storage.getItem(CHECKOUT_ADDRESS_KEY);
        if (cancelled || !raw) return;
        const cached = JSON.parse(raw);
        if (cached) {
          if (!address && cached.address) setAddress(cached.address);
          if (!city && cached.city) setCity(cached.city);
          if (!zip && cached.zip) setZip(cached.zip);
        }
      } catch (e) {
        // ignore cache errors
      }
    };
    loadCachedAddress();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist address info whenever user edits them or auto-fill updates
  useEffect(() => {
    const save = async () => {
      try {
        const payload = { address, city, zip };
        await storage.setItem(CHECKOUT_ADDRESS_KEY, JSON.stringify(payload));
      } catch (e) {}
    };
    save();
  }, [address, city, zip]);
  
  // Premium Alert States
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // Animation references
  const scrollViewRef = React.useRef(null);
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const successOpacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Show location modal only when coming from Cart with intent and user is authenticated
  useEffect(() => {
    if (!openLocationOnMount) return;
    if (!isAuthenticated) return;
    if (askedLocationOnce) return;
    setAskedLocationOnce(true);
    setShowLocationAlert(true);
  }, [openLocationOnMount, isAuthenticated, askedLocationOnce, items.length]);

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'phone':
        {
          const digits = String(value || '').replace(/\D/g, '');
          if (digits.length !== 11) return 'Phone must be exactly 11 digits';
          if (!digits.startsWith('03')) return "Phone must start with '03'";
          return '';
        }
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
    // Block order placement if city is not resolved
    if (!isCityResolved) {
      Alert.alert('City required', 'Please wait for location detection or enter your city to calculate shipping.');
      return;
    }
    if (!validateForm()) {
      // Scroll to top to show validation errors
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setIsLoading(true);
    try {
      // Final re-check shipping just before placing order
      const cityName = (detectedCity || city || '').trim();
      const recomputedShipping = computeShipping(totalWeight, cityName, items.length);
      if (recomputedShipping !== shipping) {
        setIsLoading(false);
        setShipping(recomputedShipping);
        setLastShippingAt(Date.now());
        Alert.alert('Shipping updated', 'We recalculated your shipping before placing the order. Please review and confirm.');
        return;
      }
      // Build minimal payload per backend contract
      const orderPayload = {
        customer: {
          fullName,
          phone: String(phone || '').replace(/\D/g, ''),
          address,
          city,
          zip,
          notes,
        },
        items: items.map((it) => ({
          cartId: it.cartId || `${it.id}_${it.size || ''}_${it.color || ''}`,
          productId: it.id,
          name: it.name,
          price: it.price,
          image: it.image,
          size: it.size || null,
          color: it.color || null,
          quantity: it.quantity || 1,
          lineTotal: Number((it.price * (it.quantity || 1)).toFixed(2)),
        })),
        shipping: Number(shipping.toFixed(2)),
        paymentMethod: 'COD',
        detectedCity: detectedCity || city || null,
      };

      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Login required', 'Please login to place the order.');
        setIsLoading(false);
        navigation.navigate('Login', { redirectTo: 'Checkout' });
        return;
      }

      const resp = await fetch(`${ENDPOINTS.live}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Failed to place order');
      }
      const json = await resp.json();
      // Success UI
      if (!buyNowItem) clearCart();

      // Notifications removed per user request
      try {
        const oid = json?.order?.id || json?.id || null;
        setLastOrderId(oid);
      } catch (e) {}

      setShowOrderSuccess(true);
      Animated.sequence([
        Animated.timing(successOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(successScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (e) {
      Alert.alert('Order failed', e?.message || 'Could not place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = () => {
    // Reset animations
    successScaleAnim.setValue(0);
    successOpacityAnim.setValue(0);
    confettiAnim.setValue(0);
    setShowOrderSuccess(false);
    try {
      if (lastOrderId) {
        navigation.navigate('Orders', { orderId: lastOrderId });
      } else {
        navigation.navigate('Orders');
      }
    } catch (e) {
      navigation.navigate('Orders');
    }
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
              if (field === 'phone') {
                const digits = text.replace(/\D/g, '').slice(0, 11);
                setValue(digits);
              } else {
                setValue(text);
              }
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
            maxLength={field === 'phone' ? 11 : undefined}
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
        <Text style={styles.itemVariant}>Size: {item.size || '-'} </Text>
        <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
      </View>
      <Text style={styles.itemPrice}>Rs {(item.price * (item.quantity || 1)).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.summaryValue}>{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>{detectedCity ? cleanCityName(detectedCity) : 'Detecting...'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Weight</Text>
              <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{shipping.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total}</Text>
            </View>
          </View>
 
          <TouchableOpacity 
            style={[
              styles.premiumOrderButton,
              (isLoading || !isCityResolved || isDetectingCity) && styles.loadingButton
            ]} 
            onPress={placeOrder}
            disabled={isLoading || !isCityResolved || isDetectingCity}
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
                  <Text style={styles.orderButtonText}>
                    {isCityResolved && !isDetectingCity ? `Place Order • Rs ${total.toFixed(2)}` : 'Detecting city...'}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          {/* Notifications removed per user request */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12, alignSelf: 'center' }}>
            <Text style={{ color: Colors.accent, fontSize: Fonts.sizes.sm }}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Location Permission Alert */}
      <PremiumAlert
        visible={showLocationAlert}
        title="Use your current location?"
        message="Allow access to your location to auto-fill your address and apply the correct shipping charges."
        icon="location-outline"
        iconColor={Colors.primary}
        buttons={[
          {
            text: 'Allow Location Access',
            style: 'primary',
            icon: 'checkmark-circle-outline',
            onPress: () => {
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
                          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`;
                          const resp = await fetch(url, {
                            headers: { 'User-Agent': 'NazsApp/1.0 (ReactNative)', 'Accept-Language': 'en' },
                          });
                          const data = await resp.json();
                          const addr = data?.address || {};
                          const foundCity = (
                            addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
                          ).toString();
                          const cleanFoundCity = cleanCityName(foundCity);
                          const parts = [
                            [addr.house_number, addr.road].filter(Boolean).join(' '),
                            addr.neighbourhood || addr.suburb || addr.quarter || addr.hamlet,
                            addr.city_district || addr.district,
                            foundCity,
                            addr.state,
                            addr.postcode,
                          ].filter(Boolean);
                          const line1 = parts.slice(0, 4).join(', ');
                          if (cleanFoundCity) {
                            setDetectedCity(cleanFoundCity);
                            setCity((prev) => prev || cleanFoundCity);
                            setShipping(computeShipping(totalWeight, cleanFoundCity, items.length));
                          }
                          if (line1) {
                            setAddress((prev) => prev || line1);
                            // Auto-fill ZIP/Postal Code if provided by reverse geocoding
                            if (addr.postcode) {
                              setZip((prev) => prev || String(addr.postcode));
                            }
                          }
                          // Save to cache after auto-fill
                          try {
                            const payload = {
                              address: line1 || address,
                              city: cleanFoundCity || city,
                              zip: (addr.postcode ? String(addr.postcode) : zip) || '',
                            };
                            await storage.setItem(CHECKOUT_ADDRESS_KEY, JSON.stringify(payload));
                          } catch (e) {}
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
                    setShowPermissionAlert(true);
                  }
                } catch (e) {
                  // silently fail; IP fallback remains
                }
              };
              askPermissionAndLocate();
            }
          }
        ]}
        onDismiss={() => setShowLocationAlert(false)}
      />

      {/* Premium Permission Required Alert */}
      <PremiumAlert
        visible={showPermissionAlert}
        title="Location Permission Required"
        message="Please allow location access in settings to auto-detect your city for accurate shipping charges."
        icon="settings-outline"
        iconColor="#FF6B35"
        buttons={[
          {
            text: 'Open Settings',
            style: 'primary',
            icon: 'settings-outline',
            onPress: () => openSettings()
          },
          {
            text: 'Try Again',
            style: 'secondary',
            icon: 'refresh-outline',
            onPress: () => {
              setShowPermissionAlert(false);
              setTimeout(() => setShowLocationAlert(true), 300);
            }
          }
        ]}
        onDismiss={() => setShowPermissionAlert(false)}
      />

      {/* Premium Order Success Modal */}
      <Modal
        visible={showOrderSuccess}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            styles.successModalOverlay,
            { opacity: successOpacityAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.successModalContainer,
              { 
                transform: [{ scale: successScaleAnim }],
                opacity: successOpacityAnim 
              }
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.modalGradientBackground}
            >
              {/* Confetti Animation */}
              {/* <Animated.View 
                style={[
                  styles.confettiContainer,
                  {
                    opacity: confettiAnim,
                    transform: [{
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 10]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.confettiEmoji}>🎉</Text>
                <Text style={styles.confettiEmoji}>✨</Text>
                <Text style={styles.confettiEmoji}>🛍️</Text>
                <Text style={styles.confettiEmoji}>💎</Text>
                <Text style={styles.confettiEmoji}>🎊</Text>
              </Animated.View> */}

              {/* Success Icon with Premium Background */}
              <Animated.View 
                style={[
                  styles.successIconContainer,
                  {
                    transform: [{ scale: successScaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.successIconGradient}
                >
                  <Ionicons name="checkmark-circle" size={60} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>

              {/* Brand Section */}
              <View style={styles.brandSection}>
                <Text style={styles.brandName}>Naz's Collection</Text>
                <View style={styles.brandDivider} />
              </View>

              {/* Success Content */}
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>🎉 Order Placed Successfully!</Text>
                <Text style={styles.successSubtitle}>Thank you for your purchase!</Text>
                <Text style={styles.successMessage}>
                  Your order has been confirmed and will be carefully prepared for delivery.
                </Text>
                
                {/* Order Summary Card */}
                <View style={styles.orderSummaryCard}>
                  <LinearGradient
                    colors={[Colors.primary + '08', Colors.primary + '15']}
                    style={styles.summaryGradient}
                  >
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryIconContainer}>
                        <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.summaryText}>Order Total: Rs {total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryIconContainer}>
                        <Ionicons name="time-outline" size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.summaryText}>Delivery: 2-3 business days</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                      <View style={styles.summaryIconContainer}>
                        <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.summaryText}>Confirmation email sent</Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Premium Action Button */}
              <TouchableOpacity 
                style={styles.premiumActionButton}
                onPress={handleViewOrderDetails}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primary, '#2C2C2C']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>
                    {lastOrderId ? 'View Order Details' : 'Go to My Orders'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
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
    letterSpacing: -0.5,
    fontFamily: Fonts.families.heading,
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
    letterSpacing: -0.2,
    fontFamily: Fonts.families.heading,
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
    fontFamily: Fonts.families.body,
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
    fontFamily: Fonts.families.body,
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
    fontFamily: Fonts.families.body,
  },
  paymentMethodDesc: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
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
    fontFamily: Fonts.families.body,
  },
  itemVariant: { 
    fontSize: Fonts.sizes.xs, 
    color: Colors.textSecondary, 
    marginBottom: 3,
    fontFamily: Fonts.families.body,
  },
  itemQty: { 
    fontSize: Fonts.sizes.xs, 
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
  },
  itemPrice: { 
    fontSize: Fonts.sizes.md, 
    fontWeight: Fonts.weights.bold, 
    color: Colors.primary,
    letterSpacing: -0.1,
    fontFamily: Fonts.families.body,
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
    flex: 1,
    fontFamily: Fonts.families.body,
  },
  summaryValue: { 
    fontSize: Fonts.sizes.sm, 
    color: Colors.textPrimary, 
    fontWeight: Fonts.weights.semiBold,
    textAlign: 'right',
    fontFamily: Fonts.families.body,
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
    flex: 1,
    fontFamily: Fonts.families.body,
  },
  totalValue: { 
    fontSize: Fonts.sizes.lg, 
    color: Colors.primary, 
    fontWeight: Fonts.weights.extraBold,
    letterSpacing: -0.2,
    textAlign: 'right',
    fontFamily: Fonts.families.body,
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
    fontFamily: Fonts.families.body,
  },

  // Premium Order Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModalContainer: {
    borderRadius: 30,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    overflow: 'hidden',
  },
  modalGradientBackground: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confettiContainer: {
    position: 'absolute',
    top: -15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 50,
    zIndex: 10,
  },
  confettiEmoji: {
    fontSize: 20,
    opacity: 0.9,
  },
  successIconContainer: {
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: Fonts.families.heading,
  },
  brandDivider: {
    width: 50,
    height: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
    borderRadius: 1,
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
    fontFamily: Fonts.families.heading,
  },
  successSubtitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
    fontFamily: Fonts.families.body,
  },
  successMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Fonts.lineHeights.relaxed * Fonts.sizes.sm,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontWeight: Fonts.weights.medium,
    fontFamily: Fonts.families.body,
  },
  orderSummaryCard: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  summaryGradient: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    flex: 1,
    letterSpacing: 0.1,
    fontFamily: Fonts.families.body,
  },
  premiumActionButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    alignSelf: 'stretch',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: Fonts.families.body,
  },
});

export default CheckoutScreen;
