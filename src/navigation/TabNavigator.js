import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { TabBarVisibilityProvider, useTabBarVisibility } from './TabBarVisibilityContext';

const Tab = createBottomTabNavigator();

// Animated wrapper for the default BottomTabBar that slides up/down
const AnimatedTabBar = (props) => {
  const { translateY } = useTabBarVisibility();
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        transform: [
          {
            translateY: translateY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 100],
              extrapolate: 'clamp',
            }),
          },
        ],
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

// Clean Premium animated tab icon component
const PremiumTabIcon = ({ focused, iconName, color, size, cartCount, routeName }) => {
  const [scaleValue] = useState(new Animated.Value(focused ? 1.1 : 1));
  const [fadeValue] = useState(new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    // Simple scale animation
    Animated.spring(scaleValue, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();

    // Fade animation for background
    Animated.timing(fadeValue, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.premiumTabContainer}>
      {/* Clean Active Background */}
      {focused && (
        <Animated.View 
          style={[
            styles.activeBackground,
            {
              opacity: fadeValue,
              transform: [{ scale: fadeValue }],
            }
          ]}
        >
          <LinearGradient
            colors={[`${Colors.primary}15`, `${Colors.primary}25`, `${Colors.primary}15`]}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}
      
      {/* Icon container */}
      <Animated.View 
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleValue }],
          }
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={size} 
          color={focused ? Colors.primary : color}
        />
        
        {/* Clean cart badge */}
        {routeName === 'Cart' && cartCount > 0 && (
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#FF6B35', '#FF8E53']}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.premiumBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </LinearGradient>
          </View>
        )}
      </Animated.View>
      
      {/* Clean Active Indicator */}
      {focused && (
        <Animated.View 
          style={[
            styles.activeLine,
            {
              opacity: fadeValue,
              transform: [{ scaleX: fadeValue }],
            }
          ]}
        >
          <View style={[styles.lineGradient, { backgroundColor: Colors.primary }]} />
        </Animated.View>
      )}
    </View>
  );
};

const TabNavigator = () => {
  // Derive cart count directly from store so it updates instantly
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + (item.quantity || 0), 0)
  );
  const itemsLength = useCartStore((state) => state.items.length);
  const isAuthenticated = useAuthStore((s) => !!s.user);

  // Hydrate cart on app/tab mount so badge is correct immediately
  useEffect(() => {
    const hydrate = async () => {
      if (itemsLength > 0) return;
      if (isAuthenticated) {
        await useCartStore.getState().loadCartFromServer();
      } else {
        await useCartStore.getState().loadCartFromStorage();
      }
    };
    hydrate();
  }, [isAuthenticated, itemsLength]);

  return (
    <TabBarVisibilityProvider>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return (
            <PremiumTabIcon
              focused={focused}
              iconName={iconName}
              color={color}
              size={size}
              cartCount={cartCount}
              routeName={route.name}
            />
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.premiumTabBar,
        tabBarLabelStyle: styles.premiumTabLabel,
        tabBarItemStyle: styles.premiumTabItem,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      })}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ tabBarLabel: 'Shop' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
    </TabBarVisibilityProvider>
  );
};

const styles = StyleSheet.create({
  // Clean Premium Tab Container
  premiumTabContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 60,
    paddingBottom: 4,
  },
  
  // Clean Active Background
  activeBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 5,
    left: 5,
  },
  
  gradientBackground: {
    flex: 1,
    borderRadius: 20,
  },
  
  // Clean Icon Wrapper
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  
  // Tab Icon
  tabIcon: {
    // Clean design without shadows
  },
  
  tabIconActive: {
    // Clean active state without shadows
  },
  
  // Clean Premium Badge
  premiumBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  badgeGradient: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Fonts.families.body,
  },
  
  // Clean Active Indicator Line
  activeLine: {
    position: 'absolute',
    bottom: -12,
    width: 24,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  lineGradient: {
    flex: 1,
    borderRadius: 2,
  },
  
  // Clean Premium Tab Bar
  premiumTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  
  // Premium Tab Label
  premiumTabLabel: {
    fontSize: 11,
    fontWeight: Fonts.weights.semiBold,
    marginTop: 4,
    letterSpacing: 0.4,
    textTransform: 'capitalize',
    fontFamily: Fonts.families.body,
  },
  
  // Premium Tab Item
  premiumTabItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 22,
    marginHorizontal: 3,
  },
  
  // Legacy styles (keeping for compatibility)
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
    elevation: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 70,
  },
  tabBarLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabNavigator;
