import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button, Card, Badge, Avatar } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const MOCK_TRAINER = {
  id: '1',
  name: 'Ahmed Hassan',
  avatar: null,
  specializations: ['Bodybuilding', 'Strength Training', 'Nutrition'],
  rating: 4.9,
  reviewCount: 127,
  clientCount: 45,
  experience: 8,
  hourlyRate: 250,
  bio: 'Certified personal trainer with 8+ years of experience in bodybuilding and strength training. I specialize in helping clients achieve their dream physique through personalized workout and nutrition plans. My approach combines science-based training with practical lifestyle adjustments.',
  certifications: [
    'ISSA Certified Personal Trainer',
    'Precision Nutrition Level 1',
    'NASM Performance Enhancement',
  ],
  isVerified: true,
  isAvailable: true,
  languages: ['Arabic', 'English'],
  location: 'Cairo, Egypt',
};

const MOCK_PROGRAMS = [
  {
    id: '1',
    name: '12-Week Transformation',
    description: 'Complete body recomposition program',
    price: 1500,
    duration: 12,
    features: ['Custom workout plan', 'Nutrition guidance', 'Weekly check-ins', '24/7 chat support'],
    enrolledCount: 234,
  },
  {
    id: '2',
    name: 'Muscle Building Basics',
    description: 'Foundation program for beginners',
    price: 900,
    duration: 8,
    features: ['Workout plan', 'Exercise tutorials', 'Bi-weekly check-ins'],
    enrolledCount: 189,
  },
];

const MOCK_REVIEWS = [
  {
    id: '1',
    clientName: 'Omar S.',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Ahmed is an amazing trainer! Lost 15kg in 3 months following his program.',
  },
  {
    id: '2',
    clientName: 'Kareem M.',
    rating: 5,
    date: '1 month ago',
    comment: 'Very knowledgeable and supportive. Best investment I made for my fitness.',
  },
];

export default function TrainerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'programs' | 'reviews' | 'about'>('programs');

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Colors.primary + '40', Colors.background.dark]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar name={MOCK_TRAINER.name} size="xl" />
            {MOCK_TRAINER.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              </View>
            )}
          </View>

          <Text style={styles.trainerName}>{MOCK_TRAINER.name}</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.text.tertiary} />
            <Text style={styles.locationText}>{MOCK_TRAINER.location}</Text>
          </View>

          <View style={styles.specsRow}>
            {MOCK_TRAINER.specializations.map((spec, index) => (
              <Badge key={index} variant="primary" size="small">
                {spec}
              </Badge>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValue}>
                <Ionicons name="star" size={18} color={Colors.warning} />
                <Text style={styles.statNumber}>{MOCK_TRAINER.rating}</Text>
              </View>
              <Text style={styles.statLabel}>{MOCK_TRAINER.reviewCount} reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{MOCK_TRAINER.clientCount}</Text>
              <Text style={styles.statLabel}>clients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{MOCK_TRAINER.experience}</Text>
              <Text style={styles.statLabel}>years exp</Text>
            </View>
          </View>

          {/* Price */}
          <Card variant="gradient" padding="medium" style={styles.priceCard}>
            <View style={styles.priceContent}>
              <View>
                <Text style={styles.priceLabel}>Starting from</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceValue}>{MOCK_TRAINER.hourlyRate}</Text>
                  <Text style={styles.priceUnit}>EGP/session</Text>
                </View>
              </View>
              <Button
                title="Book Session"
                variant="primary"
                size="medium"
                onPress={() => {}}
              />
            </View>
          </Card>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['programs', 'reviews', 'about'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'programs' && (
          <View style={styles.tabContent}>
            {MOCK_PROGRAMS.map((program) => (
              <Card key={program.id} variant="default" padding="large" style={styles.programCard}>
                <View style={styles.programHeader}>
                  <View>
                    <Text style={styles.programName}>{program.name}</Text>
                    <Text style={styles.programDescription}>{program.description}</Text>
                  </View>
                  <View style={styles.programDuration}>
                    <Text style={styles.durationValue}>{program.duration}</Text>
                    <Text style={styles.durationUnit}>weeks</Text>
                  </View>
                </View>

                <View style={styles.featuresGrid}>
                  {program.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.programFooter}>
                  <View>
                    <Text style={styles.programPrice}>{program.price} EGP</Text>
                    <Text style={styles.enrolledCount}>
                      {program.enrolledCount} enrolled
                    </Text>
                  </View>
                  <Button
                    title="Enroll Now"
                    variant="outline"
                    size="medium"
                    onPress={() => {}}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            {MOCK_REVIEWS.map((review) => (
              <Card key={review.id} variant="default" padding="medium" style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Avatar name={review.clientName} size="sm" />
                    <View style={styles.reviewerDetails}>
                      <Text style={styles.reviewerName}>{review.clientName}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={16}
                        color={Colors.warning}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </Card>
            ))}

            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All {MOCK_TRAINER.reviewCount} Reviews</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <Card variant="default" padding="large" style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Bio</Text>
              <Text style={styles.aboutText}>{MOCK_TRAINER.bio}</Text>

              <Text style={[styles.aboutTitle, { marginTop: Spacing.xl }]}>Certifications</Text>
              {MOCK_TRAINER.certifications.map((cert, index) => (
                <View key={index} style={styles.certItem}>
                  <Ionicons name="ribbon" size={18} color={Colors.primary} />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}

              <Text style={[styles.aboutTitle, { marginTop: Spacing.xl }]}>Languages</Text>
              <View style={styles.languagesRow}>
                {MOCK_TRAINER.languages.map((lang, index) => (
                  <Badge key={index} variant="outline" size="medium">
                    {lang}
                  </Badge>
                ))}
              </View>
            </Card>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Button
          title="Start Training"
          variant="primary"
          size="large"
          onPress={() => {}}
          style={styles.ctaButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  headerGradient: {
    height: 160,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.dark + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: 80,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
  },
  trainerName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.dark,
    marginVertical: 4,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  priceCard: {
    marginTop: Spacing.lg,
    width: '100%',
  },
  priceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.text.primary,
  },
  priceUnit: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: 4,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.background.dark,
  },
  tabContent: {
    gap: Spacing.md,
  },
  programCard: {
    marginBottom: 0,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  programName: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  programDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  programDuration: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  durationValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.primary,
  },
  durationUnit: {
    ...Typography.caption,
    color: Colors.primary,
  },
  featuresGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
    paddingTop: Spacing.lg,
  },
  programPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.primary,
  },
  enrolledCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  reviewCard: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerDetails: {
    marginLeft: Spacing.md,
  },
  reviewerName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
    marginRight: Spacing.xs,
  },
  aboutCard: {
    marginBottom: 0,
  },
  aboutTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  aboutText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  certText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  languagesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    backgroundColor: Colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
  messageButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  ctaButton: {
    flex: 1,
  },
});
