import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Success State */}
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="mail" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.instructions}>
              <InstructionItem number={1} text="Open the email we sent you" />
              <InstructionItem number={2} text="Click the reset password link" />
              <InstructionItem number={3} text="Create a new secure password" />
            </View>

            <Button
              title="Back to Login"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backToLoginButton}
            />

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setIsSubmitted(false);
                handleSubmit();
              }}
            >
              <Text style={styles.resendText}>
                Didn't receive the email?{' '}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-open-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={error}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={Colors.text.tertiary} />
              }
            />

            <Button
              title="Send Reset Link"
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.loginLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InstructionItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.instructionItem}>
      <View style={styles.instructionNumber}>
        <Text style={styles.instructionNumberText}>{number}</Text>
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
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
  header: {
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['3xl'],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
  loginLinkText: {
    ...Typography.body,
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
    marginLeft: Spacing.sm,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -Spacing['3xl'],
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
  instructions: {
    width: '100%',
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['3xl'],
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  instructionNumberText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
  },
  backToLoginButton: {
    width: '100%',
  },
  resendButton: {
    marginTop: Spacing.xl,
  },
  resendText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  resendLink: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
});
