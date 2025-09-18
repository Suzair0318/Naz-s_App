import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, newArrivals } from '../data/mockData';
import { wishlistListResponse } from '../data/sample';
import useAuthStore from '../store/authStore';
import storage from '../utils/storage';
import { useIsFocused } from '@react-navigation/native';

// Align with other screens
const API_BASE = 'http://192.168.18.11:3006';
const CACHE_KEY = 'wishlist:v1';

const WishlistScreen = ({ navigation }) => {
  const { token } = useAuthStore();
  const isFocused = useIsFocused();

  // Build initial list from mock ids (fallback) and mock product catalog
  const initialProducts = useMemo(() => {
    const byId = new Map();
    [...featuredProducts, ...newArrivals].forEach((p) => byId.set(p.id, p));
    const ids = wishlistListResponse.items || [];
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, []);

  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    let isActive = true;
    const hydrate = async () => {
      try {
        if (!token) {
          // Guest: read ids from cache and map to product objects from mock lists
          const raw = await storage.getItem(CACHE_KEY);
          const parsed = raw ? JSON.parse(raw) : null;
          const ids = Array.isArray(parsed?.items) ? parsed.items : [];
          const byId = new Map();
          [...featuredProducts, ...newArrivals].forEach((p) => byId.set(String(p.id), p));
          const mapped = ids.map((id) => byId.get(String(id))).filter(Boolean);
          if (isActive) setProducts(mapped);
        } else {
          // Authenticated: ideally GET /wishlist and map ids -> product objects
          // Keeping existing mock behavior for now.
          if (isActive) setProducts(initialProducts);
        }
      } catch (_) {
        // ignore
      }
    };
    if (isFocused) hydrate();
    return () => {
      isActive = false;
    };
  }, [token, initialProducts, isFocused]);

  const readGuestWishlistIds = async () => {
    try {
      const raw = await storage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed?.items) ? parsed.items : [];
    } catch (e) {
      return [];
    }
  };

  const writeGuestWishlistIds = async (ids) => {
    try {
      await storage.setItem(CACHE_KEY, JSON.stringify({ items: ids }));
    } catch (e) {
      // noop
    }
  };

  const handleRemove = async (pid) => {
    if (!pid) return;
    if (!token) {
      const ids = await readGuestWishlistIds();
      const nextIds = ids.filter((id) => id !== pid);
      await writeGuestWishlistIds(nextIds);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(pid)));
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/wishlist/${pid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(pid)));
      }
    } catch (e) {
      // optionally show a toast
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {item.originalPrice ? (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          ) : null}
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Ionicons name="heart" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Add your favorite items and find them here later.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}>
            <Text style={styles.shopBtnText}>Shop now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: 110, height: 130, backgroundColor: '#F2F2F2' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold, color: Colors.textPrimary },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  price: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  originalPrice: { marginLeft: 8, textDecorationLine: 'line-through', color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { marginLeft: 6, color: Colors.textSecondary, fontSize: Fonts.sizes.xs },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { marginTop: 12, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  emptySubtitle: { marginTop: 6, fontSize: Fonts.sizes.sm, color: Colors.textSecondary, textAlign: 'center' },
  shopBtn: { marginTop: 14, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  shopBtnText: { color: '#FFFFFF', fontWeight: Fonts.weights.semiBold },
});

export default WishlistScreen;
