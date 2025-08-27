import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const ProfileScreen = ({ navigation, onScroll }) => {
  const menuItems = [
    { id: '1', title: 'My Orders', icon: '📦', screen: 'Orders' },
    { id: '2', title: 'Wishlist', icon: '♡', screen: 'Wishlist' },
    { id: '3', title: 'Address Book', icon: '📍', screen: 'Addresses' },
    { id: '4', title: 'Payment Methods', icon: '💳', screen: 'PaymentMethods' },
    { id: '5', title: 'Size Guide', icon: '📏', screen: 'SizeGuide' },
    { id: '6', title: 'Customer Support', icon: '💬', screen: 'Support' },
    { id: '7', title: 'Settings', icon: '⚙️', screen: 'Settings' },
    { id: '8', title: 'About', icon: 'ℹ️', screen: 'About' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Jane Doe</Text>
          <Text style={styles.userEmail}>jane.doe@email.com</Text>
          <Text style={styles.memberSince}>Member since 2023</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>VIP</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderLogoutButton = () => (
    <TouchableOpacity style={styles.logoutButton}>
      <Text style={styles.logoutText}>Sign Out</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <View key={item.id}>
              {renderMenuItem({ item })}
            </View>
          ))}
        </View>
        
        {renderLogoutButton()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  menuArrow: {
    fontSize: 16,
    color: Colors.textLight,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textWhite,
    fontWeight: Fonts.weights.semiBold,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
