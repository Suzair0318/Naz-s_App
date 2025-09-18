import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import TabNavigator from './TabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="Orders" 
          component={OrdersScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{
            gestureEnabled: true,
          }}
        />
        {/** Wishlist screen removed per requirements */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
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

export default MainNavigator;
