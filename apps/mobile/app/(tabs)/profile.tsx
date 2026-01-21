import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily, AvatarSize } from '@/constants';
import { Card, Button } from '@/components/ui';

// Mock user data
const MOCK_USER = {
  firstName: 'Ahmed',
  lastName: 'Hassan',
  email: 'ahmed@example.com',
  avatarUrl: null,
  subscription: 'premium',
  memberSince: 'Jan 2024',
  stats: {
    workoutsCompleted: 48,
    currentStreak: 12,
    totalVolume: 125000,
  },
};

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', route: '/profile/edit' },
      { icon: 'fitness-outline', label: 'Fitness Settings', route: '/profile/fitness' },
      { icon: 'nutrition-outline', label: 'Nutrition Preferences', route: '/profile/nutrition' },
      { icon: 'card-outline', label: 'Subscription', route: '/profile/subscription', badge: 'Premium' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', route: '/profile/notifications' },
      { icon: 'language-outline', label: 'Language', route: '/profile/language', value: 'English' },
      { icon: 'moon-outline', label: 'Dark Mode', toggle: true },
      { icon: 'scale-outline', label: 'Units', route: '/profile/units', value: 'Metric' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: '/help' },
      { icon: 'chatbubble-outline', label: 'Contact Support', route: '/support' },
      { icon: 'document-text-outline', label: 'Terms & Privacy', route: '/legal' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = React.useState(true);

  const initials = `${MOCK_USER.firstName[0]}${MOCK_USER.lastName[0]}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card variant="gradient" padding="large" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {MOCK_USER.avatarUrl ? (
              <Image
                source={{ uri: MOCK_USER.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {MOCK_USER.firstName} {MOCK_USER.lastName}
              </Text>
              <Text style={styles.profileEmail}>{MOCK_USER.email}</Text>
              <View style={styles.memberBadge}>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <Text style={styles.memberText}>
                  {MOCK_USER.subscription.charAt(0).toUpperCase() + MOCK_USER.subscription.slice(1)} Member
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.stats.workoutsCompleted}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.streakValue}>
                <Ionicons name="flame" size={16} color={Colors.warning} />
                <Text style={styles.statValue}>{MOCK_USER.stats.currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(MOCK_USER.stats.totalVolume / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>kg Lifted</Text>
            </View>
          </View>
        </Card>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="default" padding="none">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => item.route && router.push(item.route as never)}
                  disabled={item.toggle}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={Colors.text.secondary}
                      />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    {item.value && (
                      <Text style={styles.menuValue}>{item.value}</Text>
                    )}
                    {item.toggle ? (
                      <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: Colors.border.dark, true: Colors.primary + '50' }}
                        thumbColor={darkMode ? Colors.primary : Colors.text.tertiary}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.text.tertiary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <Button
          title="Log Out"
          variant="outline"
          size="large"
          fullWidth
          onPress={() => {}}
          leftIcon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          textStyle={{ color: Colors.error }}
          style={styles.logoutButton}
        />

        {/* Version */}
        <Text style={styles.version}>Forma v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: AvatarSize.xl,
    height: AvatarSize.xl,
    borderRadius: AvatarSize.xl / 2,
  },
  avatarPlaceholder: {
    width: AvatarSize.xl,
    height: AvatarSize.xl,
    borderRadius: AvatarSize.xl / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.background.dark,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  profileEmail: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  memberText: {
    ...Typography.labelSmall,
    color: Colors.warning,
    marginLeft: 4,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darkTertiary,
    borderRadius: 12,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.dark,
    marginVertical: 4,
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.text.primary,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.dark,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background.darkTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginRight: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.warning,
  },
  logoutButton: {
    borderColor: Colors.error,
    marginBottom: Spacing.lg,
  },
  version: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
