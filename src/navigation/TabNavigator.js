import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import useCartStore from '../store/cartStore';

const TabNavigator = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const translateY = useRef(new Animated.Value(0)).current; // animation value
  const lastScrollY = useRef(0); // to detect direction

  const { items } = useCartStore();
  const [cartCount, setCartCount] = useState(0);

  // Update cart count when items change
  useEffect(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [items]);

  const tabs = [
    { name: 'Home', icon: { active: 'home', inactive: 'home-outline' }, component: HomeScreen },
    { name: 'Products', icon: { active: 'grid', inactive: 'grid-outline' }, component: ProductsScreen },
    { name: 'Search', icon: { active: 'search', inactive: 'search-outline' }, component: SearchScreen },
    { 
      name: 'Cart', 
      icon: { active: 'cart', inactive: 'cart-outline' }, 
      component: CartScreen,
      badge: cartCount > 0 ? cartCount : null 
    },
    { name: 'Profile', icon: { active: 'person', inactive: 'person-outline' }, component: ProfileScreen },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || HomeScreen;

  // Function to handle scroll event
  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentY > lastScrollY.current ? 'down' : 'up';
    
    // Only trigger animation if direction changes and we've scrolled more than 5 units
    if (Math.abs(currentY - lastScrollY.current) > 5) {
      if (scrollDirection === 'down' && translateY._value === 0) {
        // Hide tab bar when scrolling down
        Animated.spring(translateY, {
          toValue: 100,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      } else if (scrollDirection === 'up' && translateY._value > 0) {
        // Show tab bar when scrolling up
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
      
      lastScrollY.current = currentY;
    }
  };

  const renderTabBar = () => (
    <Animated.View 
      style={[
        styles.tabBar, 
        { 
          transform: [{ translateY }],
          elevation: 5,
          zIndex: 1000,
        }
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <Pressable key={tab.name} style={styles.tabItemWrapper} onPress={() => setActiveTab(tab.name)}>
            <View style={[
              styles.tabItem, 
              isActive && styles.activeTabItem,
              tab.name === 'Cart' && isActive && styles.cartTabItem
            ]}>
              <Ionicons
                name={isActive ? tab.icon.active : tab.icon.inactive}
                size={22}
                color={isActive ? Colors.textLight : Colors.textSecondary}
                style={styles.tabIcon}
              />
              {tab.badge !== null && tab.name === 'Cart' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Pass onScroll prop so each screen can notify us */}
        <ActiveComponent navigation={{ navigate: setActiveTab }} onScroll={handleScroll} />
      </View>
      {renderTabBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  tabItemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeTabItem: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Special style for cart tab when active
  cartTabItem: {
    position: 'relative',
    overflow: 'visible',
  },
  tabIcon: {},
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1, // Ensure badge stays above other elements
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabNavigator;
