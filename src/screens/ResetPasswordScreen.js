import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, otp, redirectTo, redirectParams } = route.params || {};
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword({ email, otp, newPassword: password });
      setSuccess('Password updated. Please sign in.');
      setTimeout(() => {
        try { navigation.popToTop(); } catch (e) {}
        navigation.replace('Login', { redirectTo, redirectParams });
      }, 800);
    } catch (e) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter a new password for {email}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { alignSelf: 'flex-start', padding: 8, borderRadius: 16 },
  title: { marginTop: 8, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.textPrimary },
  subtitle: { marginTop: 4, fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  form: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary },
  error: { color: '#E74C3C', marginBottom: 10 },
  success: { color: '#27AE60', marginBottom: 10 },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: Colors.textLight, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold },
});

export default ResetPasswordScreen;
