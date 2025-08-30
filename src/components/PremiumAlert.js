import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const { width: screenWidth } = Dimensions.get('window');

const PremiumAlert = ({ 
  visible, 
  title, 
  message, 
  buttons = [], 
  onDismiss,
  icon = 'information-circle',
  iconColor = Colors.primary 
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }
          ]}
        >
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'primary' ? styles.primaryButton : styles.secondaryButton,
                  index > 0 && { marginTop: 12 }
                ]}
                onPress={() => {
                  button.onPress && button.onPress();
                  onDismiss && onDismiss();
                }}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {button.icon && (
                    <Ionicons 
                      name={button.icon} 
                      size={18} 
                      color={button.style === 'primary' ? Colors.textLight : Colors.primary} 
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={[
                    styles.buttonText,
                    button.style === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText
                  ]}>
                    {button.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    maxWidth: screenWidth - 40,
    minWidth: screenWidth - 80,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  alertTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  alertMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: Fonts.weights.medium,
  },
  buttonContainer: {
    width: '100%',
  },
  alertButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    letterSpacing: 0.2,
  },
  primaryButtonText: {
    color: Colors.textLight,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
});

export default PremiumAlert;
