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
import { Button, Card } from '@/components/ui';
import { ExerciseRow } from '@/components/cards';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const MOCK_WORKOUT = {
  id: '1',
  name: 'Upper Body Power',
  description: 'Focus on building strength in your chest, shoulders, and triceps with compound movements.',
  dayNumber: 3,
  weekNumber: 2,
  targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
  estimatedDuration: 45,
  caloriesBurn: 350,
  exercises: [
    {
      id: '1',
      name: 'Bench Press',
      muscleGroup: 'Chest',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      muscleGroup: 'Chest',
      sets: 3,
      reps: '10-12',
      restSeconds: 75,
      imageUrl: null,
    },
    {
      id: '3',
      name: 'Overhead Press',
      muscleGroup: 'Shoulders',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      imageUrl: null,
    },
    {
      id: '4',
      name: 'Lateral Raises',
      muscleGroup: 'Shoulders',
      sets: 3,
      reps: '12-15',
      restSeconds: 60,
      imageUrl: null,
    },
    {
      id: '5',
      name: 'Tricep Pushdowns',
      muscleGroup: 'Triceps',
      sets: 3,
      reps: '12-15',
      restSeconds: 60,
      imageUrl: null,
    },
    {
      id: '6',
      name: 'Overhead Tricep Extension',
      muscleGroup: 'Triceps',
      sets: 3,
      reps: '12-15',
      restSeconds: 60,
      imageUrl: null,
    },
  ],
};

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id, start } = useLocalSearchParams();
  const [showDetails, setShowDetails] = useState(true);

  const totalSets = MOCK_WORKOUT.exercises.reduce((acc, ex) => acc + ex.sets, 0);

  return (
    <View style={styles.container}>
      {/* Header Image Area */}
      <LinearGradient
        colors={[Colors.primary + '40', Colors.background.dark]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Info */}
        <View style={styles.workoutInfo}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Day {MOCK_WORKOUT.dayNumber}</Text>
          </View>
          <Text style={styles.workoutName}>{MOCK_WORKOUT.name}</Text>
          <Text style={styles.workoutDescription}>{MOCK_WORKOUT.description}</Text>

          {/* Muscle Tags */}
          <View style={styles.muscleTags}>
            {MOCK_WORKOUT.targetMuscles.map((muscle) => (
              <View key={muscle} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={Colors.text.tertiary} />
              <Text style={styles.statValue}>{MOCK_WORKOUT.estimatedDuration}</Text>
              <Text style={styles.statLabel}>min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={20} color={Colors.text.tertiary} />
              <Text style={styles.statValue}>{MOCK_WORKOUT.exercises.length}</Text>
              <Text style={styles.statLabel}>exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={20} color={Colors.text.tertiary} />
              <Text style={styles.statValue}>{totalSets}</Text>
              <Text style={styles.statLabel}>sets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={20} color={Colors.text.tertiary} />
              <Text style={styles.statValue}>{MOCK_WORKOUT.caloriesBurn}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
              <Text style={styles.toggleText}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Text>
            </TouchableOpacity>
          </View>

          {MOCK_WORKOUT.exercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => {}}
            >
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseMeta}>
                  <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
                  <Text style={styles.exerciseDot}>•</Text>
                  <Text style={styles.exerciseSets}>
                    {exercise.sets} sets × {exercise.reps}
                  </Text>
                </View>
                {showDetails && (
                  <View style={styles.exerciseDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={Colors.text.tertiary} />
                      <Text style={styles.detailText}>{exercise.restSeconds}s rest</Text>
                    </View>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Card */}
        <Card variant="outline" padding="medium" style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
            <Text style={styles.tipsTitle}>Workout Tips</Text>
          </View>
          <Text style={styles.tipsText}>
            • Warm up with 5-10 minutes of light cardio{'\n'}
            • Focus on form over weight{'\n'}
            • Stay hydrated throughout{'\n'}
            • Progressive overload: increase weight gradually
          </Text>
        </Card>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Start Workout Button */}
      <View style={styles.footer}>
        <Button
          title="Start Workout"
          variant="primary"
          size="large"
          fullWidth
          onPress={() => router.push(`/workout/active/${MOCK_WORKOUT.id}`)}
          leftIcon={<Ionicons name="play" size={20} color={Colors.background.dark} />}
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
    marginTop: 100,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  workoutInfo: {
    marginTop: Spacing.xl,
  },
  dayBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  dayBadgeText: {
    ...Typography.label,
    color: Colors.primary,
  },
  workoutName: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  workoutDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  muscleTag: {
    backgroundColor: Colors.background.darkSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  muscleTagText: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
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
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  exercisesSection: {
    marginBottom: Spacing.xl,
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
  toggleText: {
    ...Typography.label,
    color: Colors.primary,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exerciseNumberText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  exerciseMuscle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  exerciseDot: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.xs,
  },
  exerciseSets: {
    ...Typography.caption,
    color: Colors.primary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  tipsCard: {
    marginBottom: Spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  tipsText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 22,
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
