import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button, Input } from '@/components/ui';

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain a number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(auth)/onboarding');
    }, 1500);
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'transparent', width: '0%' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: Colors.error, width: '33%' };
    if (strength <= 3) return { label: 'Medium', color: Colors.warning, width: '66%' };
    return { label: 'Strong', color: Colors.success, width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 1 ? router.back() : setStep(1))}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === 1 ? 'Create Account' : 'Set Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Start your fitness journey today'
                : 'Create a secure password for your account'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 1 ? (
              <>
                <Input
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoComplete="name"
                  error={errors.name}
                  leftIcon={
                    <Ionicons name="person-outline" size={20} color={Colors.text.tertiary} />
                  }
                />

                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={
                    <Ionicons name="mail-outline" size={20} color={Colors.text.tertiary} />
                  }
                />

                <Button
                  title="Continue"
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={handleNext}
                  style={styles.submitButton}
                />
              </>
            ) : (
              <>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.password}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Password Strength Indicator */}
                {password && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          { width: passwordStrength.width, backgroundColor: passwordStrength.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}

                <Input
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} />
                  }
                />

                <Button
                  title="Create Account"
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                  onPress={handleSignup}
                  style={styles.submitButton}
                />
              </>
            )}
          </View>

          {step === 1 && (
            <>
              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border.dark,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.border.dark,
    marginHorizontal: Spacing.sm,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  header: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  form: {
    gap: Spacing.lg,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border.dark,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    ...Typography.caption,
    fontFamily: FontFamily.medium,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing['3xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.dark,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
  loginText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
});
