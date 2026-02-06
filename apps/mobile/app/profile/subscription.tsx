import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button, Card, Badge } from '@/components/ui';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    period: 'forever',
    description: 'Basic features to get started',
    features: [
      { text: 'Basic workout tracking', included: true },
      { text: 'Food logging (3 meals/day)', included: true },
      { text: 'Progress photos (2/month)', included: true },
      { text: '3 AI questions/month', included: true },
      { text: 'Custom workout plans', included: false },
      { text: 'Detailed analytics', included: false },
      { text: 'Ad-free experience', included: false },
    ],
    isCurrent: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'بريميوم',
    price: 79,
    period: 'month',
    description: 'Best deal - everything you need',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited food logging', included: true },
      { text: 'Custom workout plans (10)', included: true },
      { text: 'Detailed analytics', included: true },
      { text: 'Squad challenges', included: true },
      { text: 'Ad-free + Offline mode', included: true },
      { text: '10 AI questions/month', included: true },
      { text: 'Personal trainer', included: false },
    ],
    isCurrent: true,
    isPopular: true,
    badge: 'Best Deal',
  },
  {
    id: 'premium_plus',
    name: 'Premium+',
    nameAr: 'بريميوم+',
    price: 449,
    period: 'month',
    description: 'VIP with AI & personal coaching',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Unlimited AI Coach', included: true },
      { text: 'AI Form Checker', included: true },
      { text: 'AI Workout Generator', included: true },
      { text: 'Personal trainer matching', included: true },
      { text: 'Direct trainer chat', included: true },
      { text: 'Video consultations (2/mo)', included: true },
      { text: 'WhatsApp VIP support', included: true },
    ],
    isCurrent: false,
    badge: 'VIP',
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const currentPlan = PLANS.find((p) => p.isCurrent);
  const yearlyDiscount = 0.2; // 20% discount for yearly

  const getPrice = (plan: typeof PLANS[0]) => {
    if (plan.price === 0) return 0;
    if (billingPeriod === 'yearly') {
      return Math.round(plan.price * 12 * (1 - yearlyDiscount));
    }
    return plan.price;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Banner */}
        {currentPlan && (
          <LinearGradient
            colors={[Colors.primary, Colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentPlanBanner}
          >
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={styles.currentPlanName}>{currentPlan.name}</Text>
            </View>
            <View style={styles.currentPlanMeta}>
              <Text style={styles.renewText}>Renews on Feb 15, 2024</Text>
              <TouchableOpacity>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Billing Period Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingPeriod('monthly')}
          >
            <Text
              style={[
                styles.billingText,
                billingPeriod === 'monthly' && styles.billingTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'yearly' && styles.billingOptionActive,
            ]}
            onPress={() => setBillingPeriod('yearly')}
          >
            <Text
              style={[
                styles.billingText,
                billingPeriod === 'yearly' && styles.billingTextActive,
              ]}
            >
              Yearly
            </Text>
            <Badge variant="success" size="small" style={{ marginLeft: Spacing.xs }}>
              -20%
            </Badge>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.isCurrent && styles.planCardCurrent,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {/* Plan Header */}
            <View style={styles.planHeader}>
              <View>
                <View style={styles.planNameRow}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.isPopular && (
                    <Badge variant="warning" size="small" style={{ marginLeft: Spacing.sm }}>
                      Popular
                    </Badge>
                  )}
                  {plan.isCurrent && (
                    <Badge variant="primary" size="small" style={{ marginLeft: Spacing.sm }}>
                      Current
                    </Badge>
                  )}
                </View>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                selectedPlan === plan.id && styles.radioOuterSelected,
              ]}>
                {selectedPlan === plan.id && <View style={styles.radioInner} />}
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              {plan.price === 0 ? (
                <Text style={styles.priceText}>Free</Text>
              ) : (
                <>
                  <Text style={styles.priceText}>{getPrice(plan)}</Text>
                  <Text style={styles.priceCurrency}> EGP</Text>
                  <Text style={styles.pricePeriod}>
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </Text>
                </>
              )}
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons
                    name={feature.included ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={feature.included ? Colors.success : Colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled,
                    ]}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions auto-renew unless cancelled at least 24 hours before the
          end of the current period.
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.footer}>
        <Button
          title={
            selectedPlan === PLANS.find((p) => p.isCurrent)?.id
              ? 'Current Plan'
              : `Subscribe to ${PLANS.find((p) => p.id === selectedPlan)?.name}`
          }
          variant="primary"
          size="large"
          fullWidth
          disabled={selectedPlan === PLANS.find((p) => p.isCurrent)?.id}
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: Spacing.md,
  },
  currentPlanBanner: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  currentPlanInfo: {
    marginBottom: Spacing.md,
  },
  currentPlanLabel: {
    ...Typography.caption,
    color: Colors.background.dark,
    opacity: 0.8,
  },
  currentPlanName: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.background.dark,
    marginTop: 4,
  },
  currentPlanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  renewText: {
    ...Typography.bodySmall,
    color: Colors.background.dark,
    opacity: 0.9,
  },
  manageText: {
    ...Typography.label,
    color: Colors.background.dark,
    textDecorationLine: 'underline',
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 10,
  },
  billingOptionActive: {
    backgroundColor: Colors.primary,
  },
  billingText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  billingTextActive: {
    color: Colors.background.dark,
  },
  planCard: {
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: Colors.primary,
  },
  planCardCurrent: {
    borderColor: Colors.primary + '50',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  planDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  priceText: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: Colors.text.primary,
  },
  priceCurrency: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  pricePeriod: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  featuresContainer: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  featureTextDisabled: {
    color: Colors.text.tertiary,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    backgroundColor: Colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
});
