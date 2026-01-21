import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Card, Button } from '@/components/ui';

export default function SettingsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: true,
    trainerMessages: true,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    language: 'en',
    units: 'metric',
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/welcome'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {},
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="default" padding="none" style={styles.card}>
          <SettingToggle
            icon="barbell-outline"
            label="Workout Reminders"
            description="Daily reminders to complete your workout"
            value={notifications.workoutReminders}
            onValueChange={(v) => setNotifications({ ...notifications, workoutReminders: v })}
          />
          <SettingToggle
            icon="restaurant-outline"
            label="Meal Reminders"
            description="Reminders to log your meals"
            value={notifications.mealReminders}
            onValueChange={(v) => setNotifications({ ...notifications, mealReminders: v })}
            showBorder
          />
          <SettingToggle
            icon="trending-up-outline"
            label="Progress Updates"
            description="Weekly progress summaries"
            value={notifications.progressUpdates}
            onValueChange={(v) => setNotifications({ ...notifications, progressUpdates: v })}
            showBorder
          />
          <SettingToggle
            icon="chatbubble-outline"
            label="Trainer Messages"
            description="Messages from your trainer"
            value={notifications.trainerMessages}
            onValueChange={(v) => setNotifications({ ...notifications, trainerMessages: v })}
            showBorder
          />
          <SettingToggle
            icon="megaphone-outline"
            label="Marketing"
            description="Tips, offers, and updates"
            value={notifications.marketing}
            onValueChange={(v) => setNotifications({ ...notifications, marketing: v })}
            showBorder
          />
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card variant="default" padding="none" style={styles.card}>
          <SettingToggle
            icon="moon-outline"
            label="Dark Mode"
            value={preferences.darkMode}
            onValueChange={(v) => setPreferences({ ...preferences, darkMode: v })}
          />
          <SettingLink
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {}}
            showBorder
          />
          <SettingLink
            icon="scale-outline"
            label="Units"
            value="Metric (kg, cm)"
            onPress={() => {}}
            showBorder
          />
        </Card>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>Data</Text>
        <Card variant="default" padding="none" style={styles.card}>
          <SettingLink
            icon="cloud-download-outline"
            label="Export Data"
            onPress={() => {}}
          />
          <SettingLink
            icon="trash-outline"
            label="Clear Cache"
            onPress={() => {
              Alert.alert('Cache Cleared', 'App cache has been cleared successfully.');
            }}
            showBorder
          />
        </Card>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="default" padding="none" style={styles.card}>
          <SettingLink
            icon="shield-outline"
            label="Privacy Settings"
            onPress={() => {}}
          />
          <SettingLink
            icon="key-outline"
            label="Change Password"
            onPress={() => {}}
            showBorder
          />
          <SettingLink
            icon="card-outline"
            label="Payment Methods"
            onPress={() => {}}
            showBorder
          />
        </Card>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card variant="default" padding="none" style={styles.card}>
          <SettingLink
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {}}
          />
          <SettingLink
            icon="chatbubble-ellipses-outline"
            label="Contact Support"
            onPress={() => {}}
            showBorder
          />
          <SettingLink
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
            showBorder
          />
          <SettingLink
            icon="lock-closed-outline"
            label="Privacy Policy"
            onPress={() => {}}
            showBorder
          />
        </Card>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Log Out"
            variant="outline"
            size="large"
            fullWidth
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
            textStyle={{ color: Colors.error }}
            style={styles.logoutButton}
          />

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Forma v1.0.0 (Build 100)</Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showBorder?: boolean;
}

function SettingToggle({
  icon,
  label,
  description,
  value,
  onValueChange,
  showBorder = false,
}: SettingToggleProps) {
  return (
    <View style={[styles.settingItem, showBorder && styles.settingItemBorder]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border.dark, true: Colors.primary + '50' }}
        thumbColor={value ? Colors.primary : Colors.text.tertiary}
      />
    </View>
  );
}

interface SettingLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  showBorder?: boolean;
}

function SettingLink({ icon, label, value, onPress, showBorder = false }: SettingLinkProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, showBorder && styles.settingItemBorder]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
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
    backgroundColor: Colors.background.darkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.tertiary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  settingDescription: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  settingValue: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginRight: Spacing.sm,
  },
  actionsContainer: {
    marginTop: Spacing['3xl'],
  },
  logoutButton: {
    borderColor: Colors.error,
    marginBottom: Spacing.md,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  deleteText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  versionText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
