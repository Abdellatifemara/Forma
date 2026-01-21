# Forma Data Visualization & Graphs

## Overview

This document defines all charts, graphs, and data visualizations used in Forma. Following the "Google Mind" approach: **Graphs > Tables, Context > Raw Numbers**.

---

## Chart Library

**Recommended:** `react-native-gifted-charts` or `victory-native`

**Requirements:**
- Scrubbable (touch and drag to see values)
- Animated transitions
- RTL support
- Dark/light mode
- High performance (60fps)

---

## 1. Dashboard Charts

### 1.1 Weekly Activity Ring

**Location:** Home screen, top card
**Type:** Circular progress (donut chart)

```
┌──────────────────────────────────┐
│   ┌─────────────────────┐        │
│   │       ╭───╮         │        │
│   │      ╱     ╲        │        │
│   │     │   4   │       │   4/5  │
│   │      ╲     ╱        │  Days  │
│   │       ╰───╯         │        │
│   │      This Week      │        │
│   └─────────────────────┘        │
└──────────────────────────────────┘
```

**Data:**
- Workouts completed this week / Goal
- Color: Forma Teal fill, gray background
- Animation: Fill from 0 to current on load

### 1.2 Calorie Balance Bar

**Location:** Nutrition tab
**Type:** Horizontal stacked bar

```
┌──────────────────────────────────┐
│  Today's Calories                │
│  ┌────────────────────────────┐  │
│  │██████████████░░░░░░░░░░░░░│  │
│  └────────────────────────────┘  │
│  1,850 / 2,200 kcal              │
│  350 remaining                   │
└──────────────────────────────────┘
```

**Data:**
- Consumed vs Target
- Sections: Protein (blue), Carbs (orange), Fat (yellow)

### 1.3 Macro Distribution Pie

**Location:** Nutrition tab, below calorie bar
**Type:** Pie/Donut chart

```
     Protein 30%
        ╱╲
       ╱  ╲
      ╱    ╲
     │ Carbs│
     │  45% │
      ╲    ╱
       ╲  ╱
        ╲╱
     Fat 25%
```

**Data:**
- Today's macro breakdown
- Interactive: Tap segment to see grams

---

## 2. Progress Charts (Premium)

### 2.1 Weight Trend Line

**Location:** Progress tab
**Type:** Line chart with gradient fill

```
kg
82 ┤
80 ┤        ╱╲
78 ┤   ╱╲  ╱  ╲    ╱
76 ┤  ╱  ╲╱    ╲  ╱
74 ┤ ╱          ╲╱
72 ┼────────────────────
   Jan  Feb  Mar  Apr
```

**Features:**
- Scrubbable: Show exact weight on touch
- Context: "↓2.3kg this month"
- Goal line: Dashed horizontal line at target
- Trend line: 7-day moving average

### 2.2 Body Measurements Comparison

**Location:** Progress tab
**Type:** Grouped bar chart

```
           Before   Now
Chest    ████████ ██████████
Waist    ██████   ████
Hips     ████████ ████████
Arms     ████     ██████
```

**Data:**
- Starting vs Current measurements
- Percentage change labels

### 2.3 Progress Photo Timeline

**Location:** Progress tab
**Type:** Horizontal scroll with thumbnails

```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│Day │ │Day │ │Day │ │Day │
│ 1  │ │ 30 │ │ 60 │ │ 90 │
└────┘ └────┘ └────┘ └────┘
  ●──────●──────●──────●
```

---

## 3. Workout Analytics (Premium+)

### 3.1 Volume Load Chart

**Location:** Stats > Training Volume
**Type:** Stacked area chart

```
kg lifted
50k ┤            ╱███
40k ┤        ╱███████
30k ┤    ╱█████████████
20k ┤╱███████████████████
10k ┼────────────────────
    W1   W2   W3   W4
```

**Sections by muscle group:**
- Chest (red)
- Back (blue)
- Legs (green)
- Shoulders (orange)
- Arms (purple)
- Core (yellow)

**Calculation:**
```
Volume = Sets × Reps × Weight
Weekly Volume = Sum of all exercises
```

### 3.2 One Rep Max (1RM) Trends

**Location:** Stats > Strength
**Type:** Multi-line chart

```
kg
120 ┤        Deadlift ──●
100 ┤   Squat ─────●
 80 ┤  Bench ────●
 60 ┼────────────────────
    Jan  Feb  Mar  Apr
```

**Features:**
- One line per major lift
- Estimated 1RM calculated from logged sets
- PR markers (star icon at peaks)

**1RM Estimation Formula (Epley):**
```
1RM = Weight × (1 + Reps/30)
```

### 3.3 Muscle Balance Radar Chart

**Location:** Stats > Balance
**Type:** Radar/Spider chart

```
           Chest
             ╱╲
      Shoulders  Back
           ╱    ╲
         ╱   ●●  ╲
        Arms ── Legs
             Core
```

**Data:**
- Volume per muscle group (last 4 weeks)
- Identifies imbalances
- Recommendation: "Your back training is lagging"

### 3.4 Training Frequency Heatmap

**Location:** Stats > Consistency
**Type:** Calendar heatmap (GitHub-style)

```
     Mon Tue Wed Thu Fri Sat Sun
W1   ░░  ██  ░░  ██  ░░  ██  ░░
W2   ██  ░░  ██  ░░  ██  ░░  ░░
W3   ░░  ██  ░░  ██  ░░  ██  ██
W4   ██  ░░  ██  ░░  ██  ░░  ░░
```

**Legend:**
- ░░ = Rest day
- ▓▓ = Light workout
- ██ = Full workout

### 3.5 Rest Time Distribution

**Location:** Workout summary
**Type:** Histogram

```
Sets
15 ┤    ██
10 ┤ ██ ██ ██
 5 ┤ ██ ██ ██ ██
 0 ┼────────────────
   30s 60s 90s 120s
```

---

## 4. Exercise-Specific Charts

### 4.1 Exercise History Line

**Location:** Exercise detail screen
**Type:** Line chart

```
Best Set (kg × reps)
100 ┤              ●
 90 ┤        ●────●
 80 ┤   ●────●
 70 ┤●──●
 60 ┼────────────────
    1   2   3   4   5
         Session
```

**Shows:**
- Best set each session (weight × reps)
- Personal record marker

### 4.2 Set Comparison Bar

**Location:** During workout, between sets
**Type:** Horizontal comparison

```
Last Session:  ████████████ 80kg × 10
This Set:      ██████████   75kg × 8
               ──────────────────────
               Try to match or beat!
```

### 4.3 Force/Effort Curve (Educational)

**Location:** Exercise detail > "Learn" tab
**Type:** Area chart with phases

```
Effort
100% ┤    ╱╲
 75% ┤   ╱  ╲
 50% ┤  ╱    ╲
 25% ┤ ╱      ╲
  0% ┼──────────────
     Start  Mid  End

     ◄─Concentric─►◄Eccentric►
```

**Phases:**
1. Concentric (lifting) - Harder
2. Peak contraction
3. Eccentric (lowering) - Controlled

---

## 5. Nutrition Charts

### 5.1 Daily Macro Timeline

**Location:** Nutrition > Day view
**Type:** Stacked bar by meal

```
         B    L    D    S
Protein ██   ███  ████ █
Carbs   ███  ████ ███  ██
Fat     █    ██   ██   █
        ─────────────────
        6am  12pm 6pm  9pm
```

### 5.2 Weekly Calorie Trend

**Location:** Nutrition > Week view
**Type:** Bar chart with target line

```
kcal
2500 ┤        ────────── Target
2000 ┤ ██ ██    ██    ██
1500 ┤ ██ ██ ██ ██ ██ ██
1000 ┼─────────────────────
     Mon Tue Wed Thu Fri Sat Sun
```

### 5.3 Protein Timing Distribution

**Location:** Nutrition > Analysis
**Type:** Clock/Radial chart

```
        12pm
          │
    ████  │  ████
   █    █ │ █    █
  9am──────●──────3pm
   █    █   █    █
    ████     ████
          │
        6pm
```

**Shows:** When user typically consumes protein

---

## 6. Trainer Dashboard Charts

### 6.1 Client Compliance Rate

**Location:** Trainer > Client list
**Type:** Mini donut per client

```
┌─────────────────────────────┐
│ Ahmed    [●●●○] 75%         │
│ Sara     [●●●●] 92%         │
│ Mohamed  [●●○○] 50%  ⚠️     │
└─────────────────────────────┘
```

### 6.2 Client Progress Comparison

**Location:** Trainer > Analytics
**Type:** Multi-line chart

```
Weight Loss (kg)
-8 ┤Ahmed ────●
-6 ┤Sara ──────●
-4 ┤Mohamed ●
-2 ┤
 0 ┼────────────────
   W1   W2   W3   W4
```

### 6.3 Revenue by Client

**Location:** Trainer > Earnings
**Type:** Pie chart

```
      Ahmed 35%
         ╱╲
        ╱  ╲
       ╱Sara╲
      │ 28% │
       ╲    ╱
        ╲  ╱
         ╲╱
    Mohamed 20%
    Others 17%
```

---

## 7. Implementation Guidelines

### 7.1 Animation Standards

```javascript
// Chart animations
const animationConfig = {
  duration: 800,           // ms
  easing: 'ease-out',
  delay: index * 100,      // stagger
};

// Scrubbing feedback
const hapticConfig = {
  enabled: true,
  style: 'light',
};
```

### 7.2 Color Constants

```javascript
const chartColors = {
  primary: '#00D4AA',      // Forma Teal
  secondary: '#3B82F6',    // Info Blue
  protein: '#3B82F6',
  carbs: '#F97316',
  fat: '#EAB308',
  fiber: '#22C55E',
  gridLine: '#374151',     // Dark mode
  gridLineLight: '#E5E7EB',// Light mode
};
```

### 7.3 Accessibility

- Provide text alternatives for all charts
- Use patterns (not just color) for pie charts
- Support screen reader descriptions
- Minimum touch target: 44x44px

### 7.4 Performance

- Limit data points to 30-50 visible
- Downsample for large datasets
- Use `requestAnimationFrame` for animations
- Memoize chart components

---

## 8. Data Aggregation Endpoints

Backend should provide pre-calculated data:

```typescript
// GET /api/stats/weekly
{
  workouts_completed: 4,
  workouts_target: 5,
  total_volume_kg: 45000,
  volume_by_muscle: {
    chest: 12000,
    back: 15000,
    legs: 18000
  },
  calories_avg: 2100,
  protein_avg: 165,
  weight_change: -0.8
}

// GET /api/stats/exercise/:id
{
  exercise_id: "BW-CHEST-001",
  total_sets: 24,
  total_reps: 288,
  best_set: { weight: 0, reps: 25 },
  estimated_1rm: null, // bodyweight
  history: [
    { date: "2024-01-15", best: { weight: 0, reps: 20 } },
    { date: "2024-01-18", best: { weight: 0, reps: 22 } },
    { date: "2024-01-22", best: { weight: 0, reps: 25 } }
  ]
}
```

---

## 9. Chart Component Library

### Standard Props

```typescript
interface ChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  scrubbable?: boolean;
  onDataPointPress?: (point: DataPoint) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
}
```

### Usage Example

```tsx
<WeightTrendChart
  data={weightHistory}
  height={200}
  showGrid
  scrubbable
  onDataPointPress={(point) => {
    showTooltip(`${point.value}kg on ${point.date}`);
  }}
/>
```
