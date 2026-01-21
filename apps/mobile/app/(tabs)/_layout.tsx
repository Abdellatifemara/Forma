import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, FontFamily } from '@/constants';

type TabIconName = 'home' | 'barbell' | 'restaurant' | 'stats-chart' | 'person';

const TAB_ICONS: Record<string, { outline: TabIconName | `${TabIconName}-outline`; filled: TabIconName }> = {
  index: { outline: 'home-outline', filled: 'home' },
  workouts: { outline: 'barbell-outline', filled: 'barbell' },
  nutrition: { outline: 'restaurant-outline', filled: 'restaurant' },
  progress: { outline: 'stats-chart-outline', filled: 'stats-chart' },
  profile: { outline: 'person-outline', filled: 'person' },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBackground]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.index.filled : TAB_ICONS.index.outline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.workouts.filled : TAB_ICONS.workouts.outline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.nutrition.filled : TAB_ICONS.nutrition.outline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.progress.filled : TAB_ICONS.progress.outline}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? TAB_ICONS.profile.filled : TAB_ICONS.profile.outline}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: Platform.OS === 'ios' ? 88 : 64,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors.background.dark + 'F0',
  },
  tabBarBackground: {
    backgroundColor: Colors.background.dark + 'F0',
  },
  tabBarLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    marginTop: -4,
  },
});
