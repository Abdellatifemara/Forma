import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProgressRing } from '../ui/ProgressRing';
import { Colors, Typography, Spacing, FontFamily } from '@/constants';

interface WorkoutCardProps {
  title: string;
  subtitle?: string;
  muscleGroups: string[];
  exerciseCount: number;
  estimatedMinutes: number;
  progress?: number; // 0-1 for in-progress workouts
  isCompleted?: boolean;
  isRestDay?: boolean;
  onPress: () => void;
  onStartPress?: () => void;
  style?: ViewStyle;
}

export function WorkoutCard({
  title,
  subtitle,
  muscleGroups,
  exerciseCount,
  estimatedMinutes,
  progress,
  isCompleted = false,
  isRestDay = false,
  onPress,
  onStartPress,
  style,
}: WorkoutCardProps) {
  if (isRestDay) {
    return (
      <Card variant="outline" padding="large" style={[styles.card, style]}>
        <View style={styles.restDayContent}>
          <Ionicons name="bed-outline" size={48} color={Colors.text.tertiary} />
          <Text style={styles.restDayTitle}>Rest Day</Text>
          <Text style={styles.restDaySubtitle}>
            Recovery is essential for muscle growth
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="gradient" padding="medium" onPress={onPress} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
        ) : progress !== undefined ? (
          <ProgressRing
            progress={progress}
            size={50}
            strokeWidth={5}
            showPercentage={false}
            centerContent={
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            }
          />
        ) : null}
      </View>

      {/* Muscle Groups */}
      <View style={styles.muscleGroups}>
        {muscleGroups.slice(0, 3).map((muscle, index) => (
          <View key={index} style={styles.muscleBadge}>
            <Text style={styles.muscleText}>{muscle}</Text>
          </View>
        ))}
        {muscleGroups.length > 3 && (
          <Text style={styles.moreText}>+{muscleGroups.length - 3}</Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="barbell-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.statText}>{exerciseCount} exercises</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.statText}>{estimatedMinutes} min</Text>
        </View>
      </View>

      {/* Action Button */}
      {!isCompleted && onStartPress && (
        <Button
          title={progress !== undefined ? 'Continue Workout' : 'Start Workout'}
          onPress={onStartPress}
          variant="primary"
          size="medium"
          fullWidth
          leftIcon={<Ionicons name="play" size={18} color={Colors.background.dark} />}
          style={styles.actionButton}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  completedBadge: {
    backgroundColor: Colors.success + '20',
    padding: 8,
    borderRadius: 12,
  },
  progressText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    color: Colors.primary,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  muscleBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  muscleText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  moreText: {
    ...Typography.labelSmall,
    color: Colors.text.tertiary,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  statText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  actionButton: {
    marginTop: Spacing.xs,
  },
  restDayContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  restDayTitle: {
    ...Typography.h3,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  restDaySubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
