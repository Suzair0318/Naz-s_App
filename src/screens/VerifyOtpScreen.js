import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import useAuthStore from '../store/authStore';

const VerifyOtpScreen = ({ navigation, route }) => {
  const { email, redirectTo, redirectParams } = route.params || {};
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    try {
      setLoading(true);
      await verifyOtp({ email, otp });
      navigation.replace('ResetPassword', { email, otp, redirectTo, redirectParams });
    } catch (e) {
      setError('Invalid OTP. Please try again.');
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
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>OTP</Text>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit code"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          activeOpacity={0.9}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Verify</Text>
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
  input: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.textPrimary, textAlign: 'center', letterSpacing: 4, fontSize: 18 },
  error: { color: '#E74C3C', marginBottom: 10 },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: Colors.textLight, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold },
});

export default VerifyOtpScreen;
