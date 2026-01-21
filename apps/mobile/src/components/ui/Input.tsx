import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, InputSize, Spacing, FontFamily } from '@/constants';

const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.border.dark, Colors.primary]
    );

    return {
      borderColor: error ? Colors.error : borderColor,
    };
  });

  const showPasswordToggle = secureTextEntry;
  const actualSecureEntry = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <AnimatedView style={[styles.inputContainer, animatedContainerStyle]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? Colors.primary : Colors.text.secondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          selectionColor={Colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={actualSecureEntry}
          {...textInputProps}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {hint && !error && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: InputSize.height,
    borderRadius: InputSize.borderRadius,
    borderWidth: 1.5,
    backgroundColor: Colors.background.darkSecondary,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: InputSize.paddingHorizontal,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: InputSize.paddingHorizontal,
    marginRight: Spacing.sm,
  },
  rightIconButton: {
    padding: Spacing.md,
    marginRight: Spacing.xs,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  hint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
});
