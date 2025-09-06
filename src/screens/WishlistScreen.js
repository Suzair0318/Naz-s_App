import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, newArrivals } from '../data/mockData';
import { wishlistListResponse } from '../data/sample';

const WishlistScreen = ({ navigation }) => {
  // Build wishlist products using sample wishlist ids and mock products list
  const products = useMemo(() => {
    const byId = new Map();
    [...featuredProducts, ...newArrivals].forEach((p) => byId.set(p.id, p));
    const ids = wishlistListResponse.items || [];
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, []);

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
      <TouchableOpacity style={styles.removeBtn}>
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
