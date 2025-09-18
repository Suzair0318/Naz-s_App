import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const sample = {
    "email": "jane@example.com",
    "password": "StrongP@ssw0rd"
  }

const LoginScreen = ({ navigation, route }) => {
  const { signIn, status, setRedirectTarget, consumeRedirectTarget } = useAuthStore();
  const syncCartAfterLogin = useCartStore((s) => s.syncCartAfterLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loading = status === 'loading';

  // Persist redirect target (e.g., to Checkout) so it's not lost across flows
  useEffect(() => {
    const { redirectTo, redirectParams } = route.params || {};
    if (redirectTo) {
      setRedirectTarget({ redirectTo, redirectParams });
    }
  }, [route?.params?.redirectTo, route?.params?.redirectParams]);

  const handleLogin = async () => {
    setError('');
    try {
      const user = await signIn({ email, password });
      // Persist any pre-login cart to the backend now that we have a token
      await syncCartAfterLogin();
      const { redirectTo, redirectParams } = route.params || {};
      const fallbackTarget = consumeRedirectTarget?.() || null;
      const target = redirectTo ? { redirectTo, redirectParams } : fallbackTarget;
      if (target?.redirectTo) {
        navigation.replace(target.redirectTo, target.redirectParams);
      } else if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Safe fallback if there's no back stack
        navigation.replace('MainTabs', { screen: 'Home' });
      }
    } catch (e) {
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    const { redirectTo, redirectParams } = route.params || {};
    if (redirectTo) {
      setRedirectTarget({ redirectTo, redirectParams });
    }
    navigation.navigate('ForgotPassword', { redirectTo, redirectParams });
  };

  const handleSignupRedirect = () => {
    const { redirectTo, redirectParams } = route.params || {};
    navigation.navigate('Signup', { redirectTo, redirectParams });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.subtitle}>We use your info to save orders and address.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.forgotRow} onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupSection}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignupRedirect} style={styles.signupBtn}>
            <Text style={styles.signupBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 16,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 12,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
  },
  title: {
    marginTop: 8,
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: Fonts.sizes.md,
  },
  error: {
    color: '#D64545',
    marginBottom: 8,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
  },
  signupSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  signupBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signupBtnText: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold,
  },
});

export default LoginScreen;
