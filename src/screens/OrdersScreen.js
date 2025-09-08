import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://192.168.18.11:3006';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      try {
        if (!token) {
          setOrders([]);
          return;
        }
        const resp = await fetch(`${API_BASE}/orders`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(t || 'Failed to load orders');
        }
        const json = await resp.json();
        if (cancelled) return;
        const mapped = Array.isArray(json)
          ? json.map((o) => ({
              id: o._id || '',
              date: (o.createdAt || '').slice(0, 10),
              status: (o.status || 'Pending').charAt(0).toUpperCase() + (o.status || 'Pending').slice(1),
              subtotal: Number(o.subtotal || 0),
              shipping: Number(o.shipping || 0),
              total: Number(o.total || 0),
              items: Array.isArray(o.items)
                ? o.items.map((it) => ({
                    id: String(it.productId || it.cartId || ''),
                    name: it.name || '',
                    image: it.image || '',
                    size: it.size || '-',
                    color: it.color || '-',
                    price: Number(it.price || 0),
                    quantity: Number(it.quantity || 1),
                  }))
                : [],
            }))
          : [];
        setOrders(mapped);
      } catch (e) {
        setOrders([]);
      }
    };
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const renderOrderItemRow = ({ item }) => (
    <View style={styles.itemRow}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemVariant}>Size: {item.size || '-'} • Color: {item.color || '-'}</Text>
        <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
          <Text style={styles.orderId}>{item.id}</Text>
        </View>
        {((item.status || '').toLowerCase() !== 'pending') && (
          <View style={[styles.statusPill, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.metaText}>{item.date}</Text>
      </View>

      <View style={styles.itemsContainer}>
        <FlatList
          data={item.items}
          keyExtractor={(it, idx) => `${item.id}_${it.id}_${idx}`}
          renderItem={renderOrderItemRow}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </View>

      <View style={styles.totalsRow}>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${item.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalLine}>
          <Text style={styles.totalLabel}>Shipping</Text>
          <Text style={styles.totalValue}>${item.shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalLine, styles.totalLineStrong]}>
          <Text style={styles.totalLabelStrong}>Total</Text>
          <Text style={styles.totalValueStrong}>${item.total.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          renderItem={renderOrderCard}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusStyle = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
      return { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9', color: '#2E7D32' };
    case 'shipped':
      return { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB', color: '#1565C0' };
    case 'pending':
      return { backgroundColor: '#FFFDE7', borderColor: '#FFF9C4', color: '#8D6E63' };
    case 'processing':
      return { backgroundColor: '#FFFDE7', borderColor: '#FFF9C4', color: '#8D6E63' };
    default:
      return { backgroundColor: '#EFEFEF', borderColor: '#E0E0E0', color: '#616161' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    marginLeft: 8,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    marginLeft: 6,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  itemsContainer: {
    marginTop: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 56,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  itemVariant: {
    marginTop: 2,
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  itemQty: {
    marginTop: 2,
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  itemPrice: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
  },
  totalsRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  totalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  totalLineStrong: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  totalLabelStrong: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
  },
  totalValueStrong: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
  },
});

export default OrdersScreen;
