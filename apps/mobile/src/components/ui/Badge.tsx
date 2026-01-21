import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, FontFamily, Spacing } from '@/constants';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getVariantStyles = (variant: BadgeVariant): { container: ViewStyle; text: TextStyle } => {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: Colors.primary + '20' },
        text: { color: Colors.primary },
      };
    case 'success':
      return {
        container: { backgroundColor: Colors.success + '20' },
        text: { color: Colors.success },
      };
    case 'warning':
      return {
        container: { backgroundColor: Colors.warning + '20' },
        text: { color: Colors.warning },
      };
    case 'error':
      return {
        container: { backgroundColor: Colors.error + '20' },
        text: { color: Colors.error },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.border.dark,
        },
        text: { color: Colors.text.secondary },
      };
    default:
      return {
        container: { backgroundColor: Colors.background.darkSecondary },
        text: { color: Colors.text.secondary },
      };
  }
};

const getSizeStyles = (size: BadgeSize): { container: ViewStyle; text: TextStyle } => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingHorizontal: Spacing.sm,
          paddingVertical: 2,
          borderRadius: 4,
        },
        text: { fontSize: 10 },
      };
    case 'large':
      return {
        container: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          borderRadius: 8,
        },
        text: { fontSize: 14 },
      };
    default:
      return {
        container: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: 6,
        },
        text: { fontSize: 12 },
      };
  }
};

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FontFamily.medium,
    textTransform: 'capitalize',
  },
});
