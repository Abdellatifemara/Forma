import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, IconSize } from '@/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ExerciseRowProps {
  name: string;
  muscle: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds, for time-based
  thumbnailUrl?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function ExerciseRow({
  name,
  muscle,
  sets,
  reps,
  duration,
  thumbnailUrl,
  isCompleted = false,
  isActive = false,
  onPress,
  style,
}: ExerciseRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const prescriptionText = duration
    ? `${sets} × ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
    : `${sets} × ${reps}`;

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        isActive && styles.activeContainer,
        isCompleted && styles.completedContainer,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            placeholder={require('@/assets/placeholder-exercise.png')}
            transition={200}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="barbell" size={24} color={Colors.text.tertiary} />
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedOverlay}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.name, isCompleted && styles.completedText]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={styles.muscle}>{muscle}</Text>
      </View>

      {/* Prescription */}
      <View style={styles.prescriptionContainer}>
        <Text style={styles.prescription}>{prescriptionText}</Text>
        <Ionicons
          name="chevron-forward"
          size={IconSize.sm}
          color={Colors.text.tertiary}
        />
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  completedContainer: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.background.darkTertiary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay.black50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  name: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.text.secondary,
  },
  muscle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  prescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prescription: {
    ...Typography.label,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
});
