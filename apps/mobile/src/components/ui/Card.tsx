import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, CardStyle, Shadow } from '@/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outline' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  style,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const paddingValue = getPaddingValue(padding);
  const variantStyles = getVariantStyles(variant);

  const content = (
    <View style={[styles.inner, { padding: paddingValue }]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    const Wrapper = onPress ? AnimatedTouchable : Animated.View;
    return (
      <Wrapper
        style={[animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={onPress ? 0.9 : 1}
      >
        <LinearGradient
          colors={Colors.gradient.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, variantStyles]}
        >
          {content}
        </LinearGradient>
      </Wrapper>
    );
  }

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[styles.card, variantStyles, animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  return (
    <View style={[styles.card, variantStyles, style]}>
      {content}
    </View>
  );
}

function getPaddingValue(padding: 'none' | 'small' | 'medium' | 'large') {
  switch (padding) {
    case 'none':
      return 0;
    case 'small':
      return CardStyle.paddingSmall;
    case 'medium':
      return CardStyle.padding;
    case 'large':
      return CardStyle.padding + 8;
    default:
      return CardStyle.padding;
  }
}

function getVariantStyles(variant: string): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: Colors.background.darkSecondary,
      };
    case 'gradient':
      return {};
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border.dark,
      };
    case 'elevated':
      return {
        backgroundColor: Colors.background.darkSecondary,
        ...Shadow.medium,
      };
    default:
      return {
        backgroundColor: Colors.background.darkSecondary,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CardStyle.borderRadius,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
  },
});
