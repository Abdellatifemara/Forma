import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Button, Card } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness' | 'gain_strength';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

interface OnboardingState {
  goal: FitnessGoal | null;
  experience: ExperienceLevel | null;
  gender: Gender | null;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activityLevel: ActivityLevel | null;
}

const GOALS = [
  { value: 'lose_weight', label: 'Lose Weight', icon: 'flame-outline', emoji: '🔥' },
  { value: 'build_muscle', label: 'Build Muscle', icon: 'barbell-outline', emoji: '💪' },
  { value: 'maintain', label: 'Stay Fit', icon: 'fitness-outline', emoji: '⚖️' },
  { value: 'improve_fitness', label: 'Get Healthier', icon: 'heart-outline', emoji: '❤️' },
  { value: 'gain_strength', label: 'Get Stronger', icon: 'medal-outline', emoji: '🏋️' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a break' },
  { value: 'intermediate', label: 'Intermediate', description: '6 months to 2 years of consistent training' },
  { value: 'advanced', label: 'Advanced', description: '2+ years of dedicated training' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Extra Active', description: 'Athlete or physical job' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingState>({
    goal: null,
    experience: null,
    gender: null,
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: null,
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.goal !== null;
      case 2:
        return data.experience !== null;
      case 3:
        return data.gender !== null && data.age && data.height && data.weight;
      case 4:
        return data.activityLevel !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate API call to save onboarding data
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your primary goal?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us personalize your experience
            </Text>
            <View style={styles.optionsGrid}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.goalCard,
                    data.goal === goal.value && styles.goalCardSelected,
                  ]}
                  onPress={() => setData({ ...data, goal: goal.value as FitnessGoal })}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={[
                    styles.goalLabel,
                    data.goal === goal.value && styles.goalLabelSelected,
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your experience level?</Text>
            <Text style={styles.stepSubtitle}>
              We'll adjust workout intensity accordingly
            </Text>
            <View style={styles.optionsList}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceCard,
                    data.experience === level.value && styles.experienceCardSelected,
                  ]}
                  onPress={() => setData({ ...data, experience: level.value as ExperienceLevel })}
                >
                  <View style={styles.experienceContent}>
                    <Text style={[
                      styles.experienceLabel,
                      data.experience === level.value && styles.experienceLabelSelected,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.experienceDescription}>{level.description}</Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    data.experience === level.value && styles.radioOuterSelected,
                  ]}>
                    {data.experience === level.value && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about yourself</Text>
            <Text style={styles.stepSubtitle}>
              This helps calculate your nutrition needs
            </Text>

            {/* Gender Selection */}
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as Gender[]).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    data.gender === gender && styles.genderButtonSelected,
                  ]}
                  onPress={() => setData({ ...data, gender })}
                >
                  <Ionicons
                    name={gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'male-female'}
                    size={24}
                    color={data.gender === gender ? Colors.background.dark : Colors.text.secondary}
                  />
                  <Text style={[
                    styles.genderText,
                    data.gender === gender && styles.genderTextSelected,
                  ]}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.age) || 25;
                      if (current > 13) setData({ ...data, age: String(current - 1) });
                    }}
                  >
                    <Ionicons name="remove" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.inputValue}>{data.age || '25'}</Text>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.age) || 25;
                      if (current < 99) setData({ ...data, age: String(current + 1) });
                    }}
                  >
                    <Ionicons name="add" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.height) || 170;
                      if (current > 100) setData({ ...data, height: String(current - 1) });
                    }}
                  >
                    <Ionicons name="remove" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.inputValue}>{data.height || '170'}</Text>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.height) || 170;
                      if (current < 250) setData({ ...data, height: String(current + 1) });
                    }}
                  >
                    <Ionicons name="add" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.metricInput}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.weight) || 70;
                      if (current > 30) setData({ ...data, weight: String(current - 1) });
                    }}
                  >
                    <Ionicons name="remove" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.inputValue}>{data.weight || '70'}</Text>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => {
                      const current = parseInt(data.weight) || 70;
                      if (current < 300) setData({ ...data, weight: String(current + 1) });
                    }}
                  >
                    <Ionicons name="add" size={20} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How active are you?</Text>
            <Text style={styles.stepSubtitle}>
              Your daily activity level outside of workouts
            </Text>
            <View style={styles.optionsList}>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceCard,
                    data.activityLevel === level.value && styles.experienceCardSelected,
                  ]}
                  onPress={() => setData({ ...data, activityLevel: level.value as ActivityLevel })}
                >
                  <View style={styles.experienceContent}>
                    <Text style={[
                      styles.experienceLabel,
                      data.activityLevel === level.value && styles.experienceLabelSelected,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.experienceDescription}>{level.description}</Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    data.activityLevel === level.value && styles.radioOuterSelected,
                  ]}>
                    {data.activityLevel === level.value && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={step === 1}
        >
          {step > 1 && (
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          )}
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(step / totalSteps) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{step}/{totalSteps}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={step === totalSteps ? 'Complete Setup' : 'Continue'}
          variant="primary"
          size="large"
          fullWidth
          loading={isLoading}
          disabled={!canProceed()}
          onPress={handleNext}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 3,
    marginRight: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing['3xl'],
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  goalCard: {
    width: (SCREEN_WIDTH - ScreenPadding.horizontal * 2 - Spacing.md) / 2,
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  goalEmoji: {
    fontSize: 36,
    marginBottom: Spacing.md,
  },
  goalLabel: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: Colors.primary,
  },
  optionsList: {
    gap: Spacing.md,
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  experienceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  experienceContent: {
    flex: 1,
  },
  experienceLabel: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
  },
  experienceLabelSelected: {
    color: Colors.primary,
  },
  experienceDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
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
  inputLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    ...Typography.body,
    color: Colors.text.secondary,
    fontFamily: FontFamily.medium,
  },
  genderTextSelected: {
    color: Colors.background.dark,
  },
  metricsGrid: {
    gap: Spacing.lg,
  },
  metricInput: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.sm,
  },
  inputButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputValue: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
});
