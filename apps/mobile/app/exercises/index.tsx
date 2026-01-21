import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Input, Card } from '@/components/ui';

// Mock data
const MUSCLE_GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'legs', label: 'Legs' },
  { id: 'core', label: 'Core' },
];

const MOCK_EXERCISES = [
  { id: '1', name: 'Bench Press', muscle: 'chest', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'chest', equipment: 'Dumbbell', difficulty: 'intermediate' },
  { id: '3', name: 'Cable Flyes', muscle: 'chest', equipment: 'Cable', difficulty: 'beginner' },
  { id: '4', name: 'Push-ups', muscle: 'chest', equipment: 'Bodyweight', difficulty: 'beginner' },
  { id: '5', name: 'Deadlift', muscle: 'back', equipment: 'Barbell', difficulty: 'advanced' },
  { id: '6', name: 'Pull-ups', muscle: 'back', equipment: 'Bodyweight', difficulty: 'intermediate' },
  { id: '7', name: 'Lat Pulldown', muscle: 'back', equipment: 'Cable', difficulty: 'beginner' },
  { id: '8', name: 'Barbell Row', muscle: 'back', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '9', name: 'Overhead Press', muscle: 'shoulders', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '10', name: 'Lateral Raises', muscle: 'shoulders', equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: '11', name: 'Face Pulls', muscle: 'shoulders', equipment: 'Cable', difficulty: 'beginner' },
  { id: '12', name: 'Barbell Curl', muscle: 'biceps', equipment: 'Barbell', difficulty: 'beginner' },
  { id: '13', name: 'Hammer Curls', muscle: 'biceps', equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: '14', name: 'Tricep Pushdowns', muscle: 'triceps', equipment: 'Cable', difficulty: 'beginner' },
  { id: '15', name: 'Skull Crushers', muscle: 'triceps', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '16', name: 'Squat', muscle: 'legs', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '17', name: 'Leg Press', muscle: 'legs', equipment: 'Machine', difficulty: 'beginner' },
  { id: '18', name: 'Romanian Deadlift', muscle: 'legs', equipment: 'Barbell', difficulty: 'intermediate' },
  { id: '19', name: 'Plank', muscle: 'core', equipment: 'Bodyweight', difficulty: 'beginner' },
  { id: '20', name: 'Cable Crunches', muscle: 'core', equipment: 'Cable', difficulty: 'beginner' },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return Colors.success;
    case 'intermediate':
      return Colors.warning;
    case 'advanced':
      return Colors.error;
    default:
      return Colors.text.tertiary;
  }
};

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  const filteredExercises = useMemo(() => {
    return MOCK_EXERCISES.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'all' || exercise.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [searchQuery, selectedMuscle]);

  const renderExercise = ({ item }: { item: typeof MOCK_EXERCISES[0] }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => router.push(`/exercises/${item.id}`)}
    >
      <View style={styles.exerciseImage}>
        <Ionicons name="barbell-outline" size={24} color={Colors.primary} />
      </View>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={styles.exerciseMeta}>
          <Text style={styles.exerciseEquipment}>{item.equipment}</Text>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) + '20' }
          ]}>
            <Text style={[
              styles.difficultyText,
              { color: getDifficultyColor(item.difficulty) }
            ]}>
              {item.difficulty}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Exercise Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
          leftIcon={<Ionicons name="search" size={20} color={Colors.text.tertiary} />}
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {/* Muscle Group Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {MUSCLE_GROUPS.map((muscle) => (
          <TouchableOpacity
            key={muscle.id}
            style={[
              styles.filterButton,
              selectedMuscle === muscle.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedMuscle(muscle.id)}
          >
            <Text style={[
              styles.filterText,
              selectedMuscle === muscle.id && styles.filterTextActive,
            ]}>
              {muscle.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search or filter
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
  searchContainer: {
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  filterContainer: {
    paddingHorizontal: ScreenPadding.horizontal,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background.darkSecondary,
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.background.dark,
  },
  resultsHeader: {
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  resultsText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  listContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: 100,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exerciseImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
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
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  exerciseEquipment: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    ...Typography.caption,
    fontFamily: FontFamily.medium,
    textTransform: 'capitalize',
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
