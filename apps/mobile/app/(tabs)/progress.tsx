import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Card, Button } from '@/components/ui';
import { StatCard } from '@/components/cards';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - ScreenPadding.horizontal * 2 - 32;

// Mock data
const MOCK_WEIGHT_DATA = [
  { value: 85, label: 'Jan 1' },
  { value: 84.5, label: '' },
  { value: 84, label: '' },
  { value: 83.8, label: 'Jan 15' },
  { value: 83.2, label: '' },
  { value: 83.5, label: '' },
  { value: 82.8, label: 'Feb 1' },
  { value: 82.2, label: '' },
  { value: 82, label: '' },
  { value: 81.5, label: 'Feb 15' },
];

const MOCK_STATS = {
  currentWeight: 81.5,
  startWeight: 85,
  targetWeight: 78,
  totalLost: 3.5,
  weeklyChange: -0.5,
  workoutsThisMonth: 16,
  avgCalories: 2100,
};

const MOCK_MEASUREMENTS = {
  chest: { current: 102, start: 98 },
  waist: { current: 86, start: 92 },
  hips: { current: 100, start: 102 },
  arms: { current: 38, start: 35 },
};

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<'weight' | 'measurements' | 'photos'>('weight');

  const weightProgress = (MOCK_STATS.startWeight - MOCK_STATS.currentWeight) /
    (MOCK_STATS.startWeight - MOCK_STATS.targetWeight);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Weight Summary Card */}
        <Card variant="gradient" padding="large" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Current Weight</Text>
              <View style={styles.weightRow}>
                <Text style={styles.weightValue}>{MOCK_STATS.currentWeight}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              <View style={styles.changeRow}>
                <Ionicons
                  name={MOCK_STATS.weeklyChange < 0 ? 'trending-down' : 'trending-up'}
                  size={16}
                  color={MOCK_STATS.weeklyChange < 0 ? Colors.success : Colors.error}
                />
                <Text style={[
                  styles.changeText,
                  { color: MOCK_STATS.weeklyChange < 0 ? Colors.success : Colors.error }
                ]}>
                  {Math.abs(MOCK_STATS.weeklyChange)} kg this week
                </Text>
              </View>
            </View>
            <View style={styles.goalProgress}>
              <Text style={styles.goalLabel}>Goal: {MOCK_STATS.targetWeight}kg</Text>
              <View style={styles.goalBarBg}>
                <View
                  style={[
                    styles.goalBar,
                    { width: `${Math.min(weightProgress * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.goalText}>
                {MOCK_STATS.totalLost}kg lost • {Math.round(weightProgress * 100)}% to goal
              </Text>
            </View>
          </View>
        </Card>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {(['weight', 'measurements', 'photos'] as const).map((tab) => (
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
        {activeTab === 'weight' && (
          <>
            {/* Weight Chart */}
            <Card variant="default" padding="medium" style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weight Trend</Text>
              <Text style={styles.chartSubtitle}>Last 30 days</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={MOCK_WEIGHT_DATA}
                  width={CHART_WIDTH}
                  height={180}
                  spacing={CHART_WIDTH / MOCK_WEIGHT_DATA.length}
                  color={Colors.primary}
                  thickness={2}
                  startFillColor={Colors.primary + '40'}
                  endFillColor={Colors.primary + '10'}
                  startOpacity={0.4}
                  endOpacity={0.1}
                  initialSpacing={10}
                  noOfSections={4}
                  yAxisColor="transparent"
                  xAxisColor={Colors.border.dark}
                  yAxisTextStyle={{ color: Colors.text.tertiary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: Colors.text.tertiary, fontSize: 10 }}
                  hideRules
                  curved
                  areaChart
                  pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: Colors.primary + '30',
                    pointerStripWidth: 2,
                    pointerColor: Colors.primary,
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 40,
                    pointerLabelComponent: (items: { value: number }[]) => (
                      <View style={styles.pointerLabel}>
                        <Text style={styles.pointerText}>{items[0].value} kg</Text>
                      </View>
                    ),
                  }}
                />
              </View>
            </Card>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Workouts"
                value={MOCK_STATS.workoutsThisMonth}
                subtitle="this month"
                icon="barbell-outline"
                style={styles.gridItem}
              />
              <StatCard
                title="Avg Calories"
                value={MOCK_STATS.avgCalories}
                subtitle="per day"
                icon="flame-outline"
                iconColor={Colors.warning}
                style={styles.gridItem}
              />
            </View>
          </>
        )}

        {activeTab === 'measurements' && (
          <Card variant="default" padding="medium" style={styles.measurementsCard}>
            <Text style={styles.measurementsTitle}>Body Measurements</Text>
            <Text style={styles.measurementsSubtitle}>cm • Tap to update</Text>

            {Object.entries(MOCK_MEASUREMENTS).map(([key, value]) => {
              const change = value.current - value.start;
              const isPositive = key === 'arms' || key === 'chest' ? change > 0 : change < 0;

              return (
                <TouchableOpacity key={key} style={styles.measurementRow}>
                  <Text style={styles.measurementLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={styles.measurementValues}>
                    <Text style={styles.measurementValue}>{value.current}</Text>
                    <View style={[
                      styles.measurementChange,
                      { backgroundColor: isPositive ? Colors.success + '20' : Colors.error + '20' }
                    ]}>
                      <Text style={[
                        styles.measurementChangeText,
                        { color: isPositive ? Colors.success : Colors.error }
                      ]}>
                        {change > 0 ? '+' : ''}{change}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Button
              title="Log Measurements"
              variant="outline"
              size="medium"
              fullWidth
              onPress={() => {}}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        )}

        {activeTab === 'photos' && (
          <Card variant="outline" padding="large" style={styles.photosCard}>
            <Ionicons name="images-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.photosTitle}>Progress Photos</Text>
            <Text style={styles.photosSubtitle}>
              Track your visual transformation
            </Text>
            <Button
              title="Add Photo"
              variant="primary"
              size="medium"
              onPress={() => {}}
              leftIcon={<Ionicons name="camera" size={18} color={Colors.background.dark} />}
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        )}

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  weightValue: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    color: Colors.text.primary,
  },
  weightUnit: {
    ...Typography.h3,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  changeText: {
    ...Typography.bodySmall,
    marginLeft: Spacing.xs,
  },
  goalProgress: {
    flex: 1,
    alignItems: 'flex-end',
  },
  goalLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  goalBarBg: {
    width: 100,
    height: 8,
    backgroundColor: Colors.background.darkTertiary,
    borderRadius: 4,
    marginTop: Spacing.sm,
  },
  goalBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  goalText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: 4,
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
  chartCard: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  chartSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    marginLeft: -16,
  },
  pointerLabel: {
    backgroundColor: Colors.background.darkSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointerText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  measurementsCard: {
    marginBottom: Spacing.lg,
  },
  measurementsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  measurementsSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.lg,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.dark,
  },
  measurementLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  measurementValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    color: Colors.text.primary,
    marginRight: Spacing.sm,
  },
  measurementChange: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  measurementChangeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
  },
  photosCard: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  photosTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  photosSubtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
