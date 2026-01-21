import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, FontFamily, AvatarSize } from '@/constants';

type AvatarSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSizeType;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const getSize = (size: AvatarSizeType): number => {
  switch (size) {
    case 'xs':
      return AvatarSize.xs;
    case 'sm':
      return AvatarSize.sm;
    case 'md':
      return AvatarSize.md;
    case 'lg':
      return AvatarSize.lg;
    case 'xl':
      return AvatarSize.xl;
    default:
      return AvatarSize.md;
  }
};

const getFontSize = (size: AvatarSizeType): number => {
  switch (size) {
    case 'xs':
      return 10;
    case 'sm':
      return 12;
    case 'md':
      return 16;
    case 'lg':
      return 20;
    case 'xl':
      return 24;
    default:
      return 16;
  }
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({
  source,
  name = '',
  size = 'md',
  style,
  textStyle,
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const avatarSize = getSize(size);
  const fontSize = getFontSize(size);
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
  };

  const statusSize = Math.max(avatarSize * 0.25, 8);

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, containerStyle]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          <Text style={[styles.initials, { fontSize }, textStyle]}>
            {initials}
          </Text>
        </View>
      )}
      {showOnlineStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? Colors.success : Colors.text.tertiary,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: Colors.background.darkSecondary,
  },
  placeholder: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: Colors.background.dark,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.background.dark,
  },
});
