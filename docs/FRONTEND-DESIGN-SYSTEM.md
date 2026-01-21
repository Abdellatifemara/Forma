# FitApp - Design System & UI Specifications

## CRITICAL: READ THIS FIRST

**This app must look PREMIUM and feel FAST.**

Even if loading takes time, animations must be smooth. Every interaction should feel instant and satisfying. Users should think "wow, this is beautiful" before they even use a feature.

**Inspiration: Gymshark Training App** - Dark, bold, minimalist, athletic.

---

## 1. Color System

### Primary Palette (Dark Theme - DEFAULT)

```
Background Primary:    #0D0D0D (near black)
Background Secondary:  #1A1A1A (card backgrounds)
Background Tertiary:   #262626 (elevated elements)

Text Primary:          #FFFFFF (white)
Text Secondary:        #A0A0A0 (gray, secondary info)
Text Muted:            #666666 (hints, placeholders)

Accent Primary:        #00D4AA (teal/cyan - energy, action)
Accent Secondary:      #FF6B35 (coral/orange - motivation, warnings)
Accent Tertiary:       #8B5CF6 (purple - Premium+ features)

Success:               #22C55E (green)
Error:                 #EF4444 (red)
Warning:               #F59E0B (amber)

Premium Badge:         Linear gradient #FFD700 → #FFA500 (gold)
Premium+ Badge:        Linear gradient #E8E8E8 → #B8B8B8 → #E8E8E8 (platinum shimmer)
```

### Light Theme (Optional)

```
Background Primary:    #FFFFFF
Background Secondary:  #F5F5F5
Background Tertiary:   #EBEBEB

Text Primary:          #0D0D0D
Text Secondary:        #666666
Text Muted:            #999999

(Accents remain the same)
```

### Gradient Presets

```css
/* Hero sections, buttons */
.gradient-primary {
  background: linear-gradient(135deg, #00D4AA 0%, #00A88A 100%);
}

/* Motivation, calories */
.gradient-energy {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
}

/* Premium+ features */
.gradient-premium {
  background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
}

/* Subtle card highlights */
.gradient-card {
  background: linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%);
}

/* Progress rings */
.gradient-progress {
  background: conic-gradient(#00D4AA var(--progress), #333 0);
}
```

---

## 2. Typography

### Font Family

```
Primary:     'SF Pro Display', 'Inter', -apple-system, sans-serif
Arabic:      'Cairo', 'Tajawal', sans-serif
Monospace:   'SF Mono', 'JetBrains Mono', monospace (for numbers/stats)
```

### Type Scale

```
Display:     48px / 56px line-height / Bold (900)      - Hero headlines
H1:          32px / 40px line-height / Bold (700)      - Screen titles
H2:          24px / 32px line-height / Semibold (600)  - Section headers
H3:          20px / 28px line-height / Semibold (600)  - Card titles
H4:          18px / 24px line-height / Medium (500)    - Subsections
Body:        16px / 24px line-height / Regular (400)   - Main text
Body Small:  14px / 20px line-height / Regular (400)   - Secondary text
Caption:     12px / 16px line-height / Medium (500)    - Labels, hints
Micro:       10px / 14px line-height / Medium (500)    - Badges, tags
```

### Typography Rules

- **Headers: UPPERCASE** for workout names, section titles (Gymshark style)
- **Numbers: Tabular figures** for stats, timers, weights
- **Letter spacing: +2% on uppercase headers**
- **Arabic: Right-aligned, same scale, Cairo font**

---

## 3. Spacing System

```
4px   - Micro (icon padding, badge margins)
8px   - XS (tight groupings)
12px  - S (related elements)
16px  - M (standard spacing)
24px  - L (section gaps)
32px  - XL (major sections)
48px  - 2XL (screen sections)
64px  - 3XL (hero spacing)
```

### Container Padding
- Screen horizontal: 20px
- Card internal: 16px
- Bottom nav height: 80px (safe area included)
- Status bar clearance: Dynamic (iOS/Android)

---

## 4. Component Library

### 4.1 Cards

**Standard Card**
```
Background:     #1A1A1A
Border Radius:  16px
Padding:        16px
Shadow:         0 4px 20px rgba(0,0,0,0.3)
Border:         1px solid rgba(255,255,255,0.05)

Hover/Press:    Scale 0.98, shadow increases
```

**Workout Card (Horizontal Scroll)**
```
Width:          280px
Height:         180px
Border Radius:  20px
Image:          Full bleed with gradient overlay
Title:          Bottom left, white, bold, uppercase
Duration Badge: Top right, pill shape, semi-transparent
```

**Exercise Card (Grid)**
```
Aspect Ratio:   16:9
Border Radius:  12px
Thumbnail:      Video preview
Title:          Below image, 14px semibold
Equipment:      Icon row below title
```

**Stat Card**
```
Background:     Gradient or solid #1A1A1A
Border Radius:  20px
Large Number:   32-48px, bold, accent color
Label:          12px, uppercase, muted
Icon:           24px, top right or left of number
```

### 4.2 Buttons

**Primary Button**
```
Background:     Gradient primary (teal)
Height:         56px
Border Radius:  28px (pill shape)
Text:           16px, bold, white, uppercase
Shadow:         0 4px 20px rgba(0,212,170,0.3)

Press:          Scale 0.96, shadow reduces
Loading:        Spinner replaces text, same size
```

**Secondary Button**
```
Background:     Transparent
Border:         2px solid #00D4AA
Height:         56px
Border Radius:  28px
Text:           16px, bold, #00D4AA, uppercase

Press:          Background fills with 10% accent
```

**Ghost Button**
```
Background:     rgba(255,255,255,0.05)
Height:         48px
Border Radius:  24px
Text:           14px, medium, white

Press:          Background 10%
```

**Icon Button**
```
Size:           48px x 48px
Border Radius:  24px (circle)
Background:     rgba(255,255,255,0.1)
Icon:           24px, white

Press:          Scale 0.9
```

### 4.3 Inputs

**Text Input**
```
Background:     #1A1A1A
Border:         2px solid #333
Border Radius:  12px
Height:         56px
Padding:        16px
Text:           16px, white

Focus:          Border color → #00D4AA
Error:          Border color → #EF4444, shake animation
```

**Search Input**
```
Background:     #1A1A1A
Border Radius:  28px (pill)
Height:         48px
Icon:           Search icon left, 20px
Placeholder:    "Search exercises, food..."
```

### 4.4 Navigation

**Bottom Tab Bar**
```
Background:     #0D0D0D with blur
Height:         80px (includes safe area)
Border Top:     1px solid rgba(255,255,255,0.1)

Icons:          28px
Labels:         10px, uppercase
Active:         Accent color + filled icon
Inactive:       #666 + outline icon
```

**Top App Bar**
```
Background:     Transparent → Solid on scroll
Height:         56px
Title:          Left aligned or centered
Actions:        Right side, icon buttons
```

### 4.5 Progress Indicators

**Circular Progress (Calories, Macros)**
```
Size:           120px - 200px
Stroke Width:   8-12px
Background:     #333
Progress:       Gradient stroke
Center:         Large number + label
Animation:      Draw from 0 to value (1s ease-out)
```

**Linear Progress**
```
Height:         8px
Border Radius:  4px
Background:     #333
Progress:       Accent gradient
Animation:      Width transition 0.5s
```

**Step Indicator (Onboarding)**
```
Dots:           8px circles
Active:         Accent color, slightly larger (10px)
Inactive:       #333
Spacing:        12px between
```

---

## 5. Graphs & Charts

### 5.1 Line Charts (Steps, Weight, Heart Rate)

```
Background:     Transparent or subtle grid
Line:           2px stroke, accent color
Fill:           Gradient from line color to transparent (20% opacity)
Points:         6px circles on data points
Grid:           Horizontal lines only, #333, dashed
Labels:         X-axis (dates), Y-axis (values)
Animation:      Draw line left to right (1.5s)

Interactive:    Touch to see value tooltip
Tooltip:        Dark pill with value and date
```

**Time Range Selector**
```
Options:        7D | 30D | 90D | 1Y | ALL
Style:          Segmented control, pill shape
Active:         Filled with accent
Animation:      Slide indicator
```

### 5.2 Circular/Ring Charts (Macros)

```
Size:           160px
Rings:          3 concentric (Protein, Carbs, Fat)
Gap:            4px between rings
Stroke:         12px
Colors:         Protein: #00D4AA, Carbs: #FF6B35, Fat: #8B5CF6
Center:         Total calories, large number
Legend:         Below, horizontal, color dots + labels
Animation:      Each ring draws separately (staggered 0.2s)
```

### 5.3 Bar Charts (Weekly Workouts)

```
Bars:           Rounded top (8px radius)
Width:          Fixed, equal spacing
Color:          Accent gradient
Today:          Highlighted, slightly wider
Labels:         Day abbreviations below (M T W T F S S)
Animation:      Grow from bottom (staggered)
```

### 5.4 Progress Ring (Workout Completion)

```
Size:           200px (main), 80px (mini)
Stroke:         16px
Background:     #333
Progress:       Conic gradient
Center:         Percentage or "3/5 sets"
Animation:      Smooth rotation on update
Celebration:    Confetti burst when 100%
```

---

## 6. Animations & Micro-interactions

### CRITICAL: The app must FEEL fast

### 6.1 Timing Functions

```css
/* Snappy interactions */
--ease-out-fast: cubic-bezier(0.25, 0.1, 0.25, 1);
duration: 150ms;

/* Smooth movements */
--ease-out-smooth: cubic-bezier(0.16, 1, 0.3, 1);
duration: 300ms;

/* Bouncy/playful */
--ease-out-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
duration: 400ms;

/* Dramatic entrances */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
duration: 500ms;
```

### 6.2 Page Transitions

```
Push (forward):     Slide in from right, fade in
Pop (back):         Slide out to right, fade out
Modal:              Slide up from bottom + scale from 0.95
Dismiss:            Slide down + fade out
Tab switch:         Cross-fade (200ms)
```

### 6.3 Element Animations

**On Appear:**
```
Cards:          Fade in + slide up 20px (staggered 50ms each)
Stats:          Fade in + count up animation
Graphs:         Draw animation (lines), grow animation (bars)
Images:         Fade in + slight scale (1.02 → 1)
```

**On Tap/Press:**
```
Buttons:        Scale 0.96 → 1 (spring)
Cards:          Scale 0.98 → 1 (spring)
Icons:          Scale 0.85 → 1 (bounce)
Haptic:         Light impact on press
```

**Loading States:**
```
Skeleton:       Shimmer animation (gradient slide)
Spinner:        Rotating ring (accent color)
Progress:       Indeterminate sliding bar
Pull-refresh:   Custom animation (brand element)
```

**Success States:**
```
Checkmark:      Draw animation (stroke)
Confetti:       Burst from center (completion)
Number:         Count up to final value
Badge:          Pop in with bounce
```

### 6.4 Scroll Behaviors

```
Parallax:       Hero images scroll at 0.5x speed
Sticky:         Headers stick with blur background
Collapse:       Large headers shrink on scroll
Reveal:         Elements fade in as they enter viewport
Pull-refresh:   Custom branded animation
```

---

## 7. Screen Templates

### 7.1 Home Screen

```
┌─────────────────────────────────────────┐
│ [Profile Pic]  Good Morning, Ahmed      │  ← Greeting + avatar
│                Today, Jan 12            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │  ← Today's Summary Card
│  │     🔥 1,450 / 2,200 kcal       │   │     (large, prominent)
│  │     ████████████░░░░░           │   │
│  │                                  │   │
│  │  P: 98g    C: 180g    F: 45g   │   │
│  │  ●━━━━━   ●━━━━━━   ●━━━━      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TODAY'S WORKOUT                        │  ← Section header (uppercase)
│  ┌─────────────────────────────────┐   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │  ← Workout card with image
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │  CHEST & TRICEPS     45 min    │   │
│  │  [START WORKOUT]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  TOMORROW: BACK & BICEPS →             │  ← Tomorrow hint (subtle)
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  ← Quick stats row
│  │ 8,432│ │  7.5h│ │   72 │ │  12  │  │
│  │steps │ │sleep │ │  bpm │ │streak│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  ACTIVITY THIS WEEK                     │
│  ┌─────────────────────────────────┐   │  ← Weekly bar chart
│  │  █   █       █   █              │   │
│  │  █   █   █   █   █       █      │   │
│  │  M   T   W   T   F   S   S      │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  🏠    💪    🍽️    📈    👤           │  ← Bottom nav
│ Home  Workout Nutrition Progress Profile│
└─────────────────────────────────────────┘
```

### 7.2 Active Workout Screen

```
┌─────────────────────────────────────────┐
│ ←  CHEST & TRICEPS           ⏱️ 12:34  │  ← Timer, back button
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                  │   │  ← Exercise video
│  │        [VIDEO PLAYER]           │   │     (loops automatically)
│  │         Auto-playing            │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  BENCH PRESS                           │  ← Exercise name (large)
│  Set 2 of 4                            │
│                                         │
│  ┌─────────┐        ┌─────────┐        │  ← Weight + Reps inputs
│  │   80    │  kg    │   12    │  reps  │
│  │  [−][+] │        │  [−][+] │        │
│  └─────────┘        └─────────┘        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        COMPLETE SET             │   │  ← Primary action button
│  └─────────────────────────────────┘   │
│                                         │
│  REST: 90 sec                          │  ← Rest timer (appears after)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░       │
│                                         │
│  NEXT: Incline Dumbbell Press →        │  ← Next exercise preview
│                                         │
│  ●●●○○○○○ 2/8 exercises               │  ← Progress dots
│                                         │
└─────────────────────────────────────────┘
```

### 7.3 Nutrition/Meal Screen

```
┌─────────────────────────────────────────┐
│ NUTRITION               Jan 12         │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────┐                │
│         │   1,450     │                │  ← Calories ring (large)
│         │    kcal     │                │
│         │   ╱    ╲    │                │
│         └─────────────┘                │
│          of 2,200 goal                 │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐     │  ← Macro rings (smaller)
│  │ ○ 98g │ │ ○ 180g │ │ ○ 45g │      │
│  │Protein │ │ Carbs  │ │  Fat   │     │
│  └────────┘ └────────┘ └────────┘     │
│                                         │
│  MEALS                          [+ Add] │
│  ┌─────────────────────────────────┐   │
│  │ ☀️ BREAKFAST          420 kcal │   │
│  │    Ful medames, eggs, bread     │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🌤️ LUNCH              680 kcal │   │
│  │    Koshary, salad               │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🌙 DINNER             + Add     │   │  ← Empty state
│  │    Tap to log your dinner       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🤖 WHAT CAN I MAKE?             │   │  ← AI feature (prominent)
│  │    Enter ingredients →          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 7.4 Progress Screen with Graphs

```
┌─────────────────────────────────────────┐
│ PROGRESS                               │
├─────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐     │  ← Time range selector
│  │   7D   │ │  30D   │ │  90D   │     │
│  └────────┘ └────────┘ └────────┘     │
│                                         │
│  WEIGHT                                │
│  ┌─────────────────────────────────┐   │
│  │  85.2 kg        ↓ 2.3 kg       │   │  ← Current + change
│  │                                  │   │
│  │    ╭──╮                         │   │  ← Line chart
│  │   ╱    ╲    ╭──╮               │   │
│  │  ╱      ╲──╯    ╲──            │   │
│  │ ╱                   ╲          │   │
│  │ Jan 5    Jan 8    Jan 12       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  STEPS                                 │
│  ┌─────────────────────────────────┐   │
│  │  Avg: 7,234 steps/day           │   │
│  │                                  │   │
│  │  █       █   █                  │   │  ← Bar chart
│  │  █   █   █   █   █       █     │   │
│  │  M   T   W   T   F   S   S     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  WORKOUTS COMPLETED                    │
│  ┌─────────────────────────────────┐   │
│  │     ╭───────────────╮           │   │  ← Ring progress
│  │     │      12       │           │   │
│  │     │   workouts    │           │   │
│  │     ╰───────────────╯           │   │
│  │        this month               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View All Stats →]                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Premium+ Visual Treatment

### Make Premium+ Feel SPECIAL

**Locked State (Non-subscribers):**
```
- Blur/frost effect over content
- Lock icon overlay
- "Unlock with Premium+" badge
- Subtle purple glow around edges
- Tap shows upgrade modal
```

**Premium+ Exclusive Screens:**
```
- Purple accent color instead of teal
- Shimmer animation on headers
- Premium+ badge in corner
- "Premium+ Feature" label
- Richer animations, more particles
```

**Upgrade Modal:**
```
- Full screen takeover
- Animated background (subtle gradient shift)
- Feature list with checkmarks (animated in)
- Price prominent
- "Start Free Trial" or "Upgrade Now"
- Close button (don't trap users)
```

---

## 9. Empty States

Every empty state should:
1. Have a relevant illustration/icon
2. Clear message of what goes here
3. Action button to fix it

**Examples:**
```
No workouts yet:
  [Dumbbell illustration]
  "Your fitness journey starts here"
  [Browse Workouts]

No meals logged:
  [Plate illustration]
  "What did you eat today?"
  [Log Your First Meal]

No trainer yet:
  [Person with clipboard illustration]
  "Get personalized guidance"
  [Find a Trainer]
```

---

## 10. Loading & Error States

### Loading
- **Skeleton screens** - Not spinners. Show layout with shimmer.
- **Progressive loading** - Show content as it loads, don't wait for everything.
- **Optimistic updates** - Show success immediately, rollback if fails.

### Errors
- **Friendly messages** - "Oops! Something went wrong" not "Error 500"
- **Retry button** - Always give a way to try again
- **Offline indicator** - Show what's available offline

---

## 11. Accessibility

- Minimum touch target: 44px x 44px
- Color contrast: 4.5:1 minimum
- Support dynamic type scaling
- VoiceOver/TalkBack labels
- Reduce motion option

---

## 12. Files to Give to Claude Web

When working with Claude Web for mockups, provide:
1. This file (FRONTEND-DESIGN-SYSTEM.md)
2. FRONTEND-BRIEF.md (screens and flows)
3. Reference images from Gymshark app
4. Specific screen you want designed

**Ask Claude to:**
- Create high-fidelity mockups
- Use the exact color codes
- Show both light and dark themes
- Include animation notes
- Show multiple states (empty, loading, filled)
