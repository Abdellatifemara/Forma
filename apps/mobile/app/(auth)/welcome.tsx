import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button } from '@/components/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[Colors.primary + '30', Colors.background.dark]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
      </View>

      <SafeAreaView style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.brandName}>Forma</Text>
          <Text style={styles.tagline}>Your Egyptian Fitness Companion</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="barbell-outline"
            title="Smart Workouts"
            description="AI-powered plans tailored to your goals"
          />
          <FeatureItem
            icon="restaurant-outline"
            title="Egyptian Foods"
            description="Track local cuisine with accurate macros"
          />
          <FeatureItem
            icon="people-outline"
            title="Expert Trainers"
            description="Connect with certified Egyptian coaches"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Get Started"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => router.push('/(auth)/signup')}
          />
          <Button
            title="I already have an account"
            variant="ghost"
            size="large"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginButton}
          />
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.08,
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    color: Colors.background.dark,
  },
  brandName: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  buttons: {
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  terms: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  termsLink: {
    color: Colors.primary,
  },
});
