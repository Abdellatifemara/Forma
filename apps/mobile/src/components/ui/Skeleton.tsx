import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, CardStyle } from '@/constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [0, 1],
          [-200, 200]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width: width as number,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            Colors.overlay.white10,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={skeletonStyles.cardHeaderText}>
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={60} style={{ marginTop: 16 }} />
    </View>
  );
}

export function SkeletonExerciseRow() {
  return (
    <View style={skeletonStyles.exerciseRow}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={skeletonStyles.exerciseContent}>
        <Skeleton width={150} height={16} />
        <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  );
}

export function SkeletonStatCard() {
  return (
    <View style={skeletonStyles.statCard}>
      <Skeleton width={80} height={40} borderRadius={8} />
      <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.skeleton.dark,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: 200,
    height: '100%',
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: CardStyle.borderRadius,
    padding: CardStyle.padding,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseContent: {
    flex: 1,
    marginLeft: 12,
  },
  statCard: {
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: CardStyle.borderRadiusSmall,
    padding: 16,
    alignItems: 'center',
  },
});
