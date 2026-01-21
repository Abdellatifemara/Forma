import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Typography, ButtonSize, Spacing } from '@/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSizeType = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSizeType;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeStyles = ButtonSize[size];
  const variantStyles = getVariantStyles(variant, disabled);

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        variantStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              size === 'small' ? Typography.buttonSmall : Typography.button,
              { color: variantStyles.textColor },
              leftIcon && { marginLeft: Spacing.sm },
              rightIcon && { marginRight: Spacing.sm },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedTouchable>
  );
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: Colors.primary,
          opacity,
        } as ViewStyle,
        textColor: Colors.background.dark,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: Colors.background.darkSecondary,
          opacity,
        } as ViewStyle,
        textColor: Colors.text.primary,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: Colors.primary,
          opacity,
        } as ViewStyle,
        textColor: Colors.primary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          opacity,
        } as ViewStyle,
        textColor: Colors.primary,
      };
    default:
      return {
        container: {} as ViewStyle,
        textColor: Colors.text.primary,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
