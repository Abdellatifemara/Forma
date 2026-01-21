import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Input, Card, Badge, Avatar } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const SPECIALIZATIONS = [
  { id: 'all', label: 'All' },
  { id: 'bodybuilding', label: 'Bodybuilding' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'strength', label: 'Strength' },
  { id: 'calisthenics', label: 'Calisthenics' },
  { id: 'nutrition', label: 'Nutrition' },
];

const MOCK_TRAINERS = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    avatar: null,
    specializations: ['Bodybuilding', 'Strength'],
    rating: 4.9,
    reviewCount: 127,
    clientCount: 45,
    experience: 8,
    hourlyRate: 250,
    bio: 'Certified personal trainer with 8+ years of experience in bodybuilding and strength training.',
    isVerified: true,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Mohamed Ali',
    avatar: null,
    specializations: ['Weight Loss', 'Nutrition'],
    rating: 4.8,
    reviewCount: 89,
    clientCount: 62,
    experience: 5,
    hourlyRate: 200,
    bio: 'Specialized in weight loss transformations and nutritional coaching.',
    isVerified: true,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Sara Ibrahim',
    avatar: null,
    specializations: ['Calisthenics', 'Functional'],
    rating: 4.9,
    reviewCount: 156,
    clientCount: 38,
    experience: 6,
    hourlyRate: 275,
    bio: 'Expert in bodyweight training and functional fitness.',
    isVerified: true,
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Youssef Mahmoud',
    avatar: null,
    specializations: ['Strength', 'Powerlifting'],
    rating: 4.7,
    reviewCount: 64,
    clientCount: 28,
    experience: 4,
    hourlyRate: 180,
    bio: 'Powerlifting coach focused on building raw strength.',
    isVerified: false,
    isAvailable: true,
  },
];

const FEATURED_PROGRAMS = [
  {
    id: '1',
    trainerId: '1',
    trainerName: 'Ahmed Hassan',
    name: '12-Week Transformation',
    price: 1500,
    duration: 12,
    rating: 4.9,
    enrolledCount: 234,
  },
  {
    id: '2',
    trainerId: '2',
    trainerName: 'Mohamed Ali',
    name: 'Rapid Fat Loss',
    price: 1200,
    duration: 8,
    rating: 4.8,
    enrolledCount: 189,
  },
];

export default function TrainersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');

  const filteredTrainers = MOCK_TRAINERS.filter((trainer) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec =
      selectedSpec === 'all' ||
      trainer.specializations.some((s) =>
        s.toLowerCase().includes(selectedSpec.toLowerCase())
      );
    return matchesSearch && matchesSpec;
  });

  const renderTrainer = ({ item }: { item: typeof MOCK_TRAINERS[0] }) => (
    <TouchableOpacity
      style={styles.trainerCard}
      onPress={() => router.push(`/trainers/${item.id}`)}
    >
      <View style={styles.trainerHeader}>
        <Avatar
          name={item.name}
          source={item.avatar}
          size="lg"
          showOnlineStatus
          isOnline={item.isAvailable}
        />
        <View style={styles.trainerInfo}>
          <View style={styles.trainerNameRow}>
            <Text style={styles.trainerName}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            )}
          </View>
          <View style={styles.trainerSpecs}>
            {item.specializations.slice(0, 2).map((spec, index) => (
              <Badge key={index} variant="outline" size="small">
                {spec}
              </Badge>
            ))}
          </View>
          <View style={styles.trainerStats}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.trainerStat}>{item.experience} yrs exp</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>{item.hourlyRate}</Text>
          <Text style={styles.priceUnit}>EGP/hr</Text>
        </View>
      </View>
      <Text style={styles.trainerBio} numberOfLines={2}>
        {item.bio}
      </Text>
      <View style={styles.trainerFooter}>
        <View style={styles.clientCount}>
          <Ionicons name="people-outline" size={16} color={Colors.text.tertiary} />
          <Text style={styles.clientCountText}>{item.clientCount} active clients</Text>
        </View>
        {item.isAvailable ? (
          <Badge variant="success" size="small">Available</Badge>
        ) : (
          <Badge variant="default" size="small">Waitlist</Badge>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Trainers</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTrainers}
        renderItem={renderTrainer}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search trainers..."
                leftIcon={<Ionicons name="search" size={20} color={Colors.text.tertiary} />}
              />
            </View>

            {/* Specialization Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {SPECIALIZATIONS.map((spec) => (
                <TouchableOpacity
                  key={spec.id}
                  style={[
                    styles.specButton,
                    selectedSpec === spec.id && styles.specButtonActive,
                  ]}
                  onPress={() => setSelectedSpec(spec.id)}
                >
                  <Text
                    style={[
                      styles.specText,
                      selectedSpec === spec.id && styles.specTextActive,
                    ]}
                  >
                    {spec.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured Programs */}
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>Featured Programs</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.programsScroll}
              >
                {FEATURED_PROGRAMS.map((program) => (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.programCard}
                    onPress={() => router.push(`/trainers/${program.trainerId}`)}
                  >
                    <View style={styles.programHeader}>
                      <Badge variant="primary" size="small">
                        {program.duration} weeks
                      </Badge>
                      <View style={styles.programRating}>
                        <Ionicons name="star" size={12} color={Colors.warning} />
                        <Text style={styles.programRatingText}>{program.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.programName}>{program.name}</Text>
                    <Text style={styles.programTrainer}>by {program.trainerName}</Text>
                    <View style={styles.programFooter}>
                      <Text style={styles.programPrice}>{program.price} EGP</Text>
                      <Text style={styles.programEnrolled}>
                        {program.enrolledCount} enrolled
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Trainers Section Title */}
            <View style={styles.trainersHeader}>
              <Text style={styles.sectionTitle}>All Trainers</Text>
              <Text style={styles.resultsCount}>
                {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No trainers found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  filterContainer: {
    paddingHorizontal: ScreenPadding.horizontal,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  specButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background.darkSecondary,
    marginRight: Spacing.sm,
  },
  specButtonActive: {
    backgroundColor: Colors.primary,
  },
  specText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  specTextActive: {
    color: Colors.background.dark,
  },
  featuredSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  programsScroll: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  programCard: {
    width: SCREEN_WIDTH * 0.65,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginRight: Spacing.md,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  programRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programRatingText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: 4,
  },
  programName: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  programTrainer: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programPrice: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.primary,
  },
  programEnrolled: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  trainersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  listContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: 100,
  },
  trainerCard: {
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  trainerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trainerName: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  trainerSpecs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  trainerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  reviewCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: 2,
  },
  statDivider: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.sm,
  },
  trainerStat: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.primary,
  },
  priceUnit: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  trainerBio: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  trainerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientCountText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
});
