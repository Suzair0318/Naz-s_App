import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const SignupScreen = ({ navigation, route }) => {
  const { signUp, status } = useAuthStore();
  const syncCartAfterLogin = useCartStore((s) => s.syncCartAfterLogin);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loading = status === 'loading';

  const handleCreateAccount = async () => {
    setError('');
    try {
      await signUp({ name, email, password });
      // Persist any pre-signup cart to the backend now that we have a token
      await syncCartAfterLogin();
      const { redirectTo, redirectParams } = route.params || {};
      if (redirectTo) {
        navigation.replace(redirectTo, redirectParams);
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Save your orders and shipping details securely.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
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
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Create account</Text>
          )}
        </TouchableOpacity>
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
});

export default SignupScreen;
