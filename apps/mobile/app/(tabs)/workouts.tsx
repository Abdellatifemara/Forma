import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Card } from '@/components/ui';
import { WorkoutCard, ExerciseRow } from '@/components/cards';

// Mock data
const MOCK_PLAN = {
  name: 'Muscle Builder 4-Week',
  week: 2,
  totalWeeks: 4,
  daysPerWeek: 4,
};

const MOCK_WEEK_SCHEDULE = [
  { day: 1, name: 'Upper Body Power', completed: true, muscles: ['Chest', 'Back', 'Shoulders'] },
  { day: 2, name: 'Lower Body', completed: true, muscles: ['Quads', 'Hamstrings', 'Glutes'] },
  { day: 3, name: 'Upper Body Hypertrophy', completed: false, isToday: true, muscles: ['Chest', 'Triceps'] },
  { day: 4, name: 'Rest', isRest: true },
  { day: 5, name: 'Full Body', completed: false, muscles: ['Full Body'] },
  { day: 6, name: 'Rest', isRest: true },
  { day: 7, name: 'Active Recovery', completed: false, muscles: ['Mobility'] },
];

export default function WorkoutsScreen() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(MOCK_PLAN.week);

  const weekProgress = MOCK_WEEK_SCHEDULE.filter(d => d.completed).length /
    MOCK_WEEK_SCHEDULE.filter(d => !d.isRest).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Current Plan Card */}
        <Card variant="gradient" padding="medium" style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{MOCK_PLAN.name}</Text>
              <Text style={styles.planProgress}>
                Week {selectedWeek} of {MOCK_PLAN.totalWeeks}
              </Text>
            </View>
            <TouchableOpacity style={styles.changePlanButton}>
              <Text style={styles.changePlanText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Week Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${weekProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(weekProgress * 100)}% of week completed
          </Text>
        </Card>

        {/* Week Selector */}
        <View style={styles.weekSelector}>
          {Array.from({ length: MOCK_PLAN.totalWeeks }, (_, i) => i + 1).map(week => (
            <TouchableOpacity
              key={week}
              style={[
                styles.weekButton,
                selectedWeek === week && styles.weekButtonActive,
              ]}
              onPress={() => setSelectedWeek(week)}
            >
              <Text style={[
                styles.weekButtonText,
                selectedWeek === week && styles.weekButtonTextActive,
              ]}>
                W{week}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Week Schedule */}
        <Text style={styles.sectionTitle}>Week {selectedWeek} Schedule</Text>

        {MOCK_WEEK_SCHEDULE.map((workout, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCard,
              workout.isToday && styles.dayCardToday,
              workout.completed && styles.dayCardCompleted,
            ]}
            onPress={() => !workout.isRest && router.push(`/workout/${workout.day}`)}
            disabled={workout.isRest}
          >
            <View style={styles.dayHeader}>
              <View style={[
                styles.dayNumber,
                workout.isToday && styles.dayNumberToday,
                workout.completed && styles.dayNumberCompleted,
              ]}>
                <Text style={[
                  styles.dayNumberText,
                  (workout.isToday || workout.completed) && styles.dayNumberTextActive,
                ]}>
                  {workout.day}
                </Text>
              </View>
              <View style={styles.dayContent}>
                <View style={styles.dayTitleRow}>
                  <Text style={[
                    styles.dayName,
                    workout.isRest && styles.dayNameRest,
                  ]}>
                    {workout.name}
                  </Text>
                  {workout.isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayText}>Today</Text>
                    </View>
                  )}
                </View>
                {!workout.isRest && (
                  <Text style={styles.dayMuscles}>
                    {workout.muscles?.join(' • ')}
                  </Text>
                )}
              </View>
              {workout.completed ? (
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              ) : !workout.isRest ? (
                <Ionicons name="chevron-forward" size={24} color={Colors.text.tertiary} />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        {/* Exercise Library Button */}
        <Card
          variant="outline"
          padding="medium"
          onPress={() => router.push('/exercises')}
          style={styles.libraryCard}
        >
          <View style={styles.libraryContent}>
            <Ionicons name="library-outline" size={24} color={Colors.primary} />
            <Text style={styles.libraryText}>Browse Exercise Library</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </View>
        </Card>

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
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  calendarButton: {
    padding: Spacing.sm,
  },
  planCard: {
    marginBottom: Spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planName: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  planProgress: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  changePlanButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  changePlanText: {
    ...Typography.label,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.background.darkTertiary,
    borderRadius: 3,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  weekSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  weekButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  weekButtonActive: {
    backgroundColor: Colors.primary,
  },
  weekButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  weekButtonTextActive: {
    color: Colors.background.dark,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  dayCard: {
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayCardCompleted: {
    opacity: 0.7,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dayNumberToday: {
    backgroundColor: Colors.primary,
  },
  dayNumberCompleted: {
    backgroundColor: Colors.success,
  },
  dayNumberText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  dayNumberTextActive: {
    color: Colors.background.dark,
  },
  dayContent: {
    flex: 1,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  dayNameRest: {
    color: Colors.text.tertiary,
  },
  todayBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: Spacing.sm,
  },
  todayText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.primary,
  },
  dayMuscles: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  libraryCard: {
    marginTop: Spacing.lg,
  },
  libraryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: Spacing.md,
  },
});
