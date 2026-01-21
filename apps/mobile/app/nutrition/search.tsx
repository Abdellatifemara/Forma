import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, ScreenPadding, FontFamily } from '@/constants';
import { Input, Card, Button } from '@/components/ui';

// Mock data - Egyptian foods
const MOCK_FOODS = [
  { id: '1', name: 'Foul Medames', nameAr: 'فول مدمس', calories: 250, protein: 14, carbs: 40, fat: 4, serving: '1 cup' },
  { id: '2', name: 'Koshari', nameAr: 'كشري', calories: 450, protein: 12, carbs: 80, fat: 8, serving: '1 plate' },
  { id: '3', name: 'Grilled Chicken Breast', nameAr: 'صدر دجاج مشوي', calories: 165, protein: 31, carbs: 0, fat: 4, serving: '100g' },
  { id: '4', name: 'Egyptian Rice', nameAr: 'أرز مصري', calories: 200, protein: 4, carbs: 45, fat: 1, serving: '1 cup' },
  { id: '5', name: 'Molokhia', nameAr: 'ملوخية', calories: 180, protein: 8, carbs: 20, fat: 8, serving: '1 bowl' },
  { id: '6', name: 'Falafel', nameAr: 'فلافل', calories: 333, protein: 13, carbs: 31, fat: 18, serving: '5 pieces' },
  { id: '7', name: 'Shawarma', nameAr: 'شاورما', calories: 400, protein: 25, carbs: 30, fat: 20, serving: '1 wrap' },
  { id: '8', name: 'Fattoush Salad', nameAr: 'سلطة فتوش', calories: 120, protein: 3, carbs: 15, fat: 6, serving: '1 bowl' },
  { id: '9', name: 'Hummus', nameAr: 'حمص', calories: 177, protein: 8, carbs: 20, fat: 9, serving: '100g' },
  { id: '10', name: 'Baladi Bread', nameAr: 'عيش بلدي', calories: 150, protein: 5, carbs: 30, fat: 1, serving: '1 piece' },
  { id: '11', name: 'Kofta', nameAr: 'كفتة', calories: 280, protein: 22, carbs: 5, fat: 20, serving: '100g' },
  { id: '12', name: 'Macarona Bechamel', nameAr: 'مكرونة بشاميل', calories: 380, protein: 15, carbs: 45, fat: 15, serving: '1 serving' },
  { id: '13', name: 'Eggs', nameAr: 'بيض', calories: 78, protein: 6, carbs: 1, fat: 5, serving: '1 large' },
  { id: '14', name: 'Greek Yogurt', nameAr: 'زبادي يوناني', calories: 100, protein: 17, carbs: 6, fat: 1, serving: '1 cup' },
  { id: '15', name: 'Banana', nameAr: 'موز', calories: 105, protein: 1, carbs: 27, fat: 0, serving: '1 medium' },
];

const RECENT_FOODS = ['1', '3', '5', '10'];

export default function FoodSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return MOCK_FOODS.filter((f) => RECENT_FOODS.includes(f.id));
    }
    return MOCK_FOODS.filter((food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.nameAr.includes(searchQuery)
    );
  }, [searchQuery]);

  const toggleFood = (id: string) => {
    setSelectedFoods((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const renderFood = ({ item }: { item: typeof MOCK_FOODS[0] }) => {
    const isSelected = selectedFoods.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.foodCard, isSelected && styles.foodCardSelected]}
        onPress={() => toggleFood(item.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color={Colors.background.dark} />}
        </View>
        <View style={styles.foodContent}>
          <View style={styles.foodHeader}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodNameAr}>{item.nameAr}</Text>
          </View>
          <Text style={styles.foodServing}>{item.serving}</Text>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{item.calories}</Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: Colors.macro.protein }]}>{item.protein}g</Text>
              <Text style={styles.macroLabel}>P</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: Colors.macro.carbs }]}>{item.carbs}g</Text>
              <Text style={styles.macroLabel}>C</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: Colors.macro.fat }]}>{item.fat}g</Text>
              <Text style={styles.macroLabel}>F</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Food</Text>
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="scan-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search foods... (English or Arabic)"
          leftIcon={<Ionicons name="search" size={20} color={Colors.text.tertiary} />}
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Results' : 'Recent Foods'}
        </Text>
      </View>

      {/* Food List */}
      <FlatList
        data={filteredFoods}
        renderItem={renderFood}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No foods found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term
            </Text>
          </View>
        }
      />

      {/* Add Selected Button */}
      {selectedFoods.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={`Add ${selectedFoods.length} Item${selectedFoods.length > 1 ? 's' : ''}`}
            variant="primary"
            size="large"
            fullWidth
            onPress={() => {
              // Add foods logic
              router.back();
            }}
          />
        </View>
      )}
    </SafeAreaView>
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
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: ScreenPadding.horizontal,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.tertiary,
  },
  listContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: 150,
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.darkSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  foodContent: {
    flex: 1,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodName: {
    ...Typography.body,
    color: Colors.text.primary,
    fontFamily: FontFamily.semiBold,
    flex: 1,
  },
  foodNameAr: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  foodServing: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.background.darkTertiary,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border.dark,
  },
  macroValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.text.primary,
  },
  macroLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
    backgroundColor: Colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: Colors.border.dark,
  },
});
