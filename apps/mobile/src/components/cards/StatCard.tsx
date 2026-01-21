import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Colors, Typography, Spacing, FontFamily } from '@/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = Colors.primary,
  trend,
  onPress,
  style,
}: StatCardProps) {
  return (
    <Card
      variant="gradient"
      padding="medium"
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {trend && (
          <View style={[
            styles.trendBadge,
            { backgroundColor: trend.isPositive ? Colors.success + '20' : Colors.error + '20' }
          ]}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.isPositive ? Colors.success : Colors.error}
            />
            <Text style={[
              styles.trendText,
              { color: trend.isPositive ? Colors.success : Colors.error }
            ]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.text.primary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  trendText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 11,
    marginLeft: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});
