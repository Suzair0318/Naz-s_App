import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const { redirectTo, redirectParams } = route.params || {};
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      setLoading(true);
      await requestPasswordReset({ email });
      setSuccess('If an account exists for this email, you will receive an OTP.');
      navigation.navigate('VerifyOtp', { email, redirectTo, redirectParams });
    } catch (e) {
      setError('Failed to send OTP. Please try again.');
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to receive an OTP.</Text>
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

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Send OTP</Text>
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

export default ForgotPasswordScreen;
