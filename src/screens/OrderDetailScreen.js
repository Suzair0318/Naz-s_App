import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route?.params || {};

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.textSecondary }}>No order data provided.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariant}>Size: {item.size || '-'} • Color: {item.color || '-'}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * (item.quantity || 1)).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order {order.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
            <Text style={styles.metaText}>#{order.id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{order.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>Status: {order.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <FlatList
            data={order.items}
            keyExtractor={(it, idx) => `${order.id}_${it.id}_${idx}`}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${Number(order.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>${Number(order.shipping).toFixed(2)}</Text>
          </View>
          <View style={[styles.totalLine, { marginTop: 8 }] }>
            <Text style={styles.totalLabelStrong}>Total</Text>
            <Text style={styles.totalValueStrong}>${Number(order.total).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  metaCard: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 16, padding: 14, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { marginLeft: 8, fontSize: Fonts.sizes.sm, color: Colors.textPrimary },
  section: { backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 16, padding: 14, marginBottom: 16 },
  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold, color: Colors.textPrimary, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 56, height: 72, borderRadius: 8, backgroundColor: '#F2F2F2', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Fonts.sizes.sm, color: Colors.textPrimary, fontWeight: Fonts.weights.medium },
  itemVariant: { marginTop: 2, fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
  itemQty: { marginTop: 2, fontSize: Fonts.sizes.xs, color: Colors.textSecondary },
  itemPrice: { fontSize: Fonts.sizes.sm, color: Colors.textPrimary, fontWeight: Fonts.weights.semiBold },
  totalLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  totalLabel: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  totalValue: { fontSize: Fonts.sizes.sm, color: Colors.textPrimary, fontWeight: Fonts.weights.medium },
  totalLabelStrong: { fontSize: Fonts.sizes.md, color: Colors.textPrimary, fontWeight: Fonts.weights.bold },
  totalValueStrong: { fontSize: Fonts.sizes.md, color: Colors.textPrimary, fontWeight: Fonts.weights.bold },
});

export default OrderDetailScreen;
