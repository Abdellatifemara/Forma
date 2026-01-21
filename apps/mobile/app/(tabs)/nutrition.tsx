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
import { Card, ProgressRing, Button } from '@/components/ui';

// Mock data
const MOCK_DAILY = {
  date: 'Today',
  consumed: { calories: 1850, protein: 142, carbs: 185, fat: 62 },
  targets: { calories: 2200, protein: 165, carbs: 220, fat: 73 },
};

const MOCK_MEALS = [
  {
    type: 'breakfast',
    name: 'Breakfast',
    icon: 'sunny-outline' as const,
    time: '8:30 AM',
    calories: 520,
    logged: true,
    foods: ['3 Eggs', 'Toast', 'Foul Medames'],
  },
  {
    type: 'lunch',
    name: 'Lunch',
    icon: 'partly-sunny-outline' as const,
    time: '1:00 PM',
    calories: 750,
    logged: true,
    foods: ['Grilled Chicken', 'Rice', 'Salad'],
  },
  {
    type: 'dinner',
    name: 'Dinner',
    icon: 'moon-outline' as const,
    time: '7:00 PM',
    calories: 580,
    logged: true,
    foods: ['Kofta', 'Vegetables'],
  },
  {
    type: 'snack',
    name: 'Snacks',
    icon: 'cafe-outline' as const,
    time: '',
    calories: 0,
    logged: false,
    foods: [],
  },
];

export default function NutritionScreen() {
  const router = useRouter();

  const calorieProgress = MOCK_DAILY.consumed.calories / MOCK_DAILY.targets.calories;
  const remaining = MOCK_DAILY.targets.calories - MOCK_DAILY.consumed.calories;

  const getMacroProgress = (consumed: number, target: number) => consumed / target;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.dateText}>{MOCK_DAILY.date}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Calorie Summary Card */}
        <Card variant="gradient" padding="large" style={styles.calorieCard}>
          <View style={styles.calorieContent}>
            <View style={styles.calorieLeft}>
              <Text style={styles.calorieTitle}>Calories</Text>
              <Text style={styles.calorieValue}>
                {MOCK_DAILY.consumed.calories.toLocaleString()}
              </Text>
              <Text style={styles.calorieSubtext}>
                of {MOCK_DAILY.targets.calories.toLocaleString()} kcal
              </Text>
              <View style={styles.remainingBadge}>
                <Text style={styles.remainingText}>
                  {remaining > 0 ? `${remaining} remaining` : 'Goal reached!'}
                </Text>
              </View>
            </View>
            <ProgressRing
              progress={Math.min(calorieProgress, 1)}
              size={100}
              strokeWidth={10}
              showPercentage={false}
              centerContent={
                <Text style={styles.ringPercent}>
                  {Math.round(calorieProgress * 100)}%
                </Text>
              }
            />
          </View>
        </Card>

        {/* Macros Row */}
        <View style={styles.macrosRow}>
          <MacroCard
            name="Protein"
            consumed={MOCK_DAILY.consumed.protein}
            target={MOCK_DAILY.targets.protein}
            color={Colors.macro.protein}
            unit="g"
          />
          <MacroCard
            name="Carbs"
            consumed={MOCK_DAILY.consumed.carbs}
            target={MOCK_DAILY.targets.carbs}
            color={Colors.macro.carbs}
            unit="g"
          />
          <MacroCard
            name="Fat"
            consumed={MOCK_DAILY.consumed.fat}
            target={MOCK_DAILY.targets.fat}
            color={Colors.macro.fat}
            unit="g"
          />
        </View>

        {/* Meals Section */}
        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <Button
            title="+ Add Food"
            variant="ghost"
            size="small"
            onPress={() => router.push('/nutrition/search')}
          />
        </View>

        {MOCK_MEALS.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealCard}
            onPress={() => router.push(`/nutrition/meal/${meal.type}`)}
          >
            <View style={styles.mealIconContainer}>
              <Ionicons name={meal.icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                {meal.time && <Text style={styles.mealTime}>{meal.time}</Text>}
              </View>
              {meal.logged ? (
                <>
                  <Text style={styles.mealFoods} numberOfLines={1}>
                    {meal.foods.join(', ')}
                  </Text>
                  <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                </>
              ) : (
                <Text style={styles.mealEmpty}>Tap to add food</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="scan-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Scan Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Photo Log</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroCard({
  name,
  consumed,
  target,
  color,
  unit,
}: {
  name: string;
  consumed: number;
  target: number;
  color: string;
  unit: string;
}) {
  const progress = consumed / target;

  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroName}>{name}</Text>
      <Text style={styles.macroValue}>{consumed}{unit}</Text>
      <View style={styles.macroBarBg}>
        <View
          style={[
            styles.macroBar,
            { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.macroTarget}>of {target}{unit}</Text>
    </View>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  dateText: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.xs,
  },
  calorieCard: {
    marginBottom: Spacing.lg,
  },
  calorieContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLeft: {
    flex: 1,
  },
  calorieTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  calorieValue: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  calorieSubtext: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  remainingBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  remainingText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.primary,
  },
  ringPercent: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.primary,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
  },
  macroName: {
    ...Typography.labelSmall,
    color: Colors.text.tertiary,
  },
  macroValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.text.primary,
    marginVertical: Spacing.xs,
  },
  macroBarBg: {
    height: 4,
    backgroundColor: Colors.background.darkTertiary,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  macroBar: {
    height: '100%',
    borderRadius: 2,
  },
  macroTarget: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  mealTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  mealFoods: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  mealCalories: {
    ...Typography.label,
    color: Colors.primary,
    marginTop: 4,
  },
  mealEmpty: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.dark,
    borderStyle: 'dashed',
  },
  quickActionText: {
    ...Typography.label,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
});
