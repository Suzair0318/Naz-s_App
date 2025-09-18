import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation, onScroll }) => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const menuItems = [
    { id: '1', title: 'My Orders', icon: 'bag-outline', iconColor: '#4CAF50', screen: 'Orders' },
    { id: '6', title: 'Customer Support', icon: 'chatbubble-ellipses-outline', iconColor: '#FECA57', screen: 'Support' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarGradient}>
            <Text style={styles.avatarInitial}>
              {(user?.name || 'User').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          {/* <View style={styles.memberBadge}> */}
            {/* <Ionicons name="diamond" size={14} color={Colors.primary} /> */}
            {/* <Text style={styles.memberSince}>VIP Member since 2023</Text> */}
          {/* </View> */}
        </View>
      </View>
      
    </View>
  );

  const handleMenuPress = (item) => {
    if (item.title === 'Customer Support' || item.screen === 'Support') {
      setShowSupportModal(true);
      return;
    }
    navigation.navigate(item.screen);
  };

  const handleCallSupport = () => {
    const phoneNumber = '+92 300 1234567';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>Manage your {item.title.toLowerCase()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const handleSignOutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              try { useCartStore.getState().clearCart(); } catch (e) {}
              // Notification removed per user request
            } finally {
              // Navigate back to Home
              try {
                navigation.navigate('MainTabs', { screen: 'Home' });
              } catch (e) {
                navigation.navigate('Home');
              }
            }
          },
        },
      ]
    );
  };

  const renderLogoutButton = () => (
    <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleSignOutPress}>
      <Ionicons name="log-out-outline" size={20} color={Colors.textLight} style={styles.logoutIcon} />
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
      {/* Customer Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.supportIconContainer}>
                <Ionicons name="headset" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Customer Support</Text>
              <Text style={styles.modalSubtitle}>We're here to help you!</Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color="#4CAF50" />
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Call us directly</Text>
                  <Text style={styles.contactValue}>+92 300 1234567</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Support Hours</Text>
                  <Text style={styles.contactValue}>9:00 AM - 8:00 PM (Mon-Sat)</Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color="#2196F3" />
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>Email Support</Text>
                  <Text style={styles.contactValue}>support@nazcollection.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.callButton} onPress={handleCallSupport}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSupportModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    color: Colors.textLight,
    fontSize: 28,
    fontWeight: Fonts.weights.bold,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceElevated,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: Fonts.weights.medium,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  memberSince: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold,
    marginLeft: 6,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  menuSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FF4757',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 0.2,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  supportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contactInfo: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    marginLeft: 6,
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
  },
});

export default ProfileScreen;
