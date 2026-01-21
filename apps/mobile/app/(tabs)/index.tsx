import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Card, ProgressRing, Button, SkeletonCard } from '@/components/ui';
import { StatCard, WorkoutCard } from '@/components/cards';

// Mock data - replace with actual API calls
const MOCK_USER = {
  firstName: 'Ahmed',
  streak: 12,
};

const MOCK_WEEKLY_STATS = {
  workoutsCompleted: 4,
  workoutsTarget: 5,
  caloriesBurned: 1850,
  volumeLifted: 45000,
};

const MOCK_TODAY_WORKOUT = {
  name: 'Upper Body Power',
  subtitle: 'Day 3 of Week 2',
  muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
  exerciseCount: 6,
  estimatedMinutes: 45,
  isRestDay: false,
};

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const progress = MOCK_WEEKLY_STATS.workoutsCompleted / MOCK_WEEKLY_STATS.workoutsTarget;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحبا، {MOCK_USER.firstName}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to crush it today?</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={Colors.warning} />
            <Text style={styles.streakText}>{MOCK_USER.streak}</Text>
          </View>
        </View>

        {/* Weekly Progress Card */}
        <Card variant="gradient" padding="large" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>This Week</Text>
              <Text style={styles.progressSubtitle}>
                {MOCK_WEEKLY_STATS.workoutsCompleted}/{MOCK_WEEKLY_STATS.workoutsTarget} workouts
              </Text>
            </View>
            <ProgressRing
              progress={progress}
              size={80}
              strokeWidth={8}
              centerContent={
                <View style={styles.progressCenter}>
                  <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                </View>
              }
            />
          </View>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="Calories"
            value={MOCK_WEEKLY_STATS.caloriesBurned.toLocaleString()}
            subtitle="kcal burned"
            icon="flame-outline"
            iconColor={Colors.warning}
            style={styles.statCard}
          />
          <StatCard
            title="Volume"
            value={`${(MOCK_WEEKLY_STATS.volumeLifted / 1000).toFixed(1)}k`}
            subtitle="kg lifted"
            icon="barbell-outline"
            iconColor={Colors.info}
            style={styles.statCard}
          />
        </View>

        {/* Today's Workout */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
        </View>

        {isLoading ? (
          <SkeletonCard />
        ) : (
          <WorkoutCard
            title={MOCK_TODAY_WORKOUT.name}
            subtitle={MOCK_TODAY_WORKOUT.subtitle}
            muscleGroups={MOCK_TODAY_WORKOUT.muscleGroups}
            exerciseCount={MOCK_TODAY_WORKOUT.exerciseCount}
            estimatedMinutes={MOCK_TODAY_WORKOUT.estimatedMinutes}
            isRestDay={MOCK_TODAY_WORKOUT.isRestDay}
            onPress={() => router.push('/workout/today')}
            onStartPress={() => router.push('/workout/today?start=true')}
          />
        )}

        {/* Daily 10-Minute Option */}
        <Card variant="outline" padding="medium" onPress={() => {}} style={styles.daily10Card}>
          <View style={styles.daily10Content}>
            <View style={styles.daily10Left}>
              <View style={styles.daily10Badge}>
                <Text style={styles.daily10BadgeText}>10 min</Text>
              </View>
              <View>
                <Text style={styles.daily10Title}>Daily Movement</Text>
                <Text style={styles.daily10Subtitle}>Quick mobility & core routine</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.text.tertiary} />
          </View>
        </Card>

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  subGreeting: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  streakText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.warning,
    marginLeft: Spacing.xs,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  progressSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercent: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  daily10Card: {
    marginTop: Spacing.sm,
  },
  daily10Content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  daily10Left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daily10Badge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  daily10BadgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  daily10Title: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  daily10Subtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
});
