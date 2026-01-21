# Forma Asset Manifest

## Directory Structure

```
assets/
├── icons/
│   ├── ui/                    # Interface icons (lucide-react-native)
│   ├── muscles/               # Muscle group icons (custom SVG)
│   ├── equipment/             # Equipment icons (custom SVG)
│   ├── food/                  # Food category icons (custom SVG)
│   └── achievements/          # Badge/achievement icons
├── images/
│   ├── onboarding/            # Onboarding illustrations
│   ├── empty-states/          # Empty state illustrations
│   ├── exercises/             # Exercise thumbnails (generated)
│   └── foods/                 # Food thumbnails (scraped/generated)
├── animations/
│   ├── lottie/                # Lottie JSON animations
│   └── rive/                  # Rive animations (optional)
├── fonts/
│   └── Cairo/                 # Cairo font files
└── videos/
    └── exercises/             # Exercise demo videos (AI-generated)
```

---

## Icon Library

### UI Icons (lucide-react-native)

| Icon | Name | Usage |
|------|------|-------|
| 🏠 | `home` | Home tab |
| 🔍 | `search` | Search |
| 📊 | `bar-chart-2` | Stats/Analytics |
| 👤 | `user` | Profile |
| ⚙️ | `settings` | Settings |
| ➕ | `plus` | Add action |
| ✓ | `check` | Complete/success |
| ✕ | `x` | Close/cancel |
| ◀ | `chevron-left` | Back (LTR) |
| ▶ | `chevron-right` | Back (RTL) |
| 🔔 | `bell` | Notifications |
| ❤️ | `heart` | Favorites |
| 📅 | `calendar` | Schedule |
| ⏱️ | `timer` | Timer/duration |
| 🏋️ | `dumbbell` | Workout |
| 🍽️ | `utensils` | Nutrition |
| 💬 | `message-circle` | Chat |
| 📷 | `camera` | Photo/scan |
| 🔄 | `refresh-cw` | Sync/refresh |
| ⬆️ | `trending-up` | Increase |
| ⬇️ | `trending-down` | Decrease |

### Custom Muscle Icons (SVG)

| File | Muscle | Dimensions |
|------|--------|------------|
| `muscle_chest.svg` | Chest | 48x48 |
| `muscle_back.svg` | Back | 48x48 |
| `muscle_shoulders.svg` | Shoulders | 48x48 |
| `muscle_biceps.svg` | Biceps | 48x48 |
| `muscle_triceps.svg` | Triceps | 48x48 |
| `muscle_forearms.svg` | Forearms | 48x48 |
| `muscle_abs.svg` | Abs/Core | 48x48 |
| `muscle_obliques.svg` | Obliques | 48x48 |
| `muscle_quads.svg` | Quadriceps | 48x48 |
| `muscle_hamstrings.svg` | Hamstrings | 48x48 |
| `muscle_glutes.svg` | Glutes | 48x48 |
| `muscle_calves.svg` | Calves | 48x48 |
| `muscle_full_body.svg` | Full Body | 48x48 |

### Custom Equipment Icons (SVG)

| File | Equipment | Dimensions |
|------|-----------|------------|
| `equip_barbell.svg` | Barbell | 48x48 |
| `equip_dumbbell.svg` | Dumbbell | 48x48 |
| `equip_kettlebell.svg` | Kettlebell | 48x48 |
| `equip_cable.svg` | Cable machine | 48x48 |
| `equip_machine.svg` | Machine | 48x48 |
| `equip_bodyweight.svg` | Bodyweight | 48x48 |
| `equip_bands.svg` | Resistance bands | 48x48 |
| `equip_trx.svg` | TRX/Suspension | 48x48 |
| `equip_pullup_bar.svg` | Pull-up bar | 48x48 |
| `equip_bench.svg` | Bench | 48x48 |
| `equip_mat.svg` | Yoga mat | 48x48 |
| `equip_foam_roller.svg` | Foam roller | 48x48 |

### Custom Food Icons (SVG)

| File | Category | Dimensions |
|------|----------|------------|
| `food_protein.svg` | Proteins | 48x48 |
| `food_carbs.svg` | Carbohydrates | 48x48 |
| `food_fats.svg` | Fats | 48x48 |
| `food_vegetables.svg` | Vegetables | 48x48 |
| `food_fruits.svg` | Fruits | 48x48 |
| `food_dairy.svg` | Dairy | 48x48 |
| `food_grains.svg` | Grains | 48x48 |
| `food_supplements.svg` | Supplements | 48x48 |
| `food_beverages.svg` | Beverages | 48x48 |
| `food_snacks.svg` | Snacks | 48x48 |

---

## Lottie Animations

| File | Animation | Duration | Usage |
|------|-----------|----------|-------|
| `confetti.json` | Confetti explosion | 2s | Achievement unlocked |
| `checkmark.json` | Animated checkmark | 0.5s | Task complete |
| `loading_dots.json` | Loading dots | Loop | Data loading |
| `streak_fire.json` | Fire flame | Loop | Streak display |
| `progress_ring.json` | Circular progress | Variable | Workout progress |
| `weight_scale.json` | Scale bouncing | 1s | Weight logged |
| `muscle_flex.json` | Arm flexing | 1.5s | PR achieved |
| `heart_beat.json` | Heart pulsing | Loop | Health data |
| `trophy.json` | Trophy shine | 2s | Goal achieved |
| `stars.json` | Stars sparkle | 1.5s | Rating/review |

---

## Image Assets

### Onboarding Illustrations

| File | Screen | Style |
|------|--------|-------|
| `onboard_welcome.png` | Welcome | Character waving |
| `onboard_goals.png` | Goals selection | Target/mountain |
| `onboard_equipment.png` | Equipment | Gym items |
| `onboard_schedule.png` | Schedule | Calendar |
| `onboard_ready.png` | Ready to start | Character flexing |

**Specifications:**
- Format: PNG with transparency
- Dimensions: 300x300 @1x (provide @2x, @3x)
- Style: Flat illustration, matches brand colors

### Empty State Illustrations

| File | Screen | Message |
|------|--------|---------|
| `empty_workouts.png` | No workouts | "Start your fitness journey" |
| `empty_meals.png` | No meals logged | "Track your nutrition" |
| `empty_progress.png` | No progress photos | "Capture your transformation" |
| `empty_search.png` | No search results | "Try different keywords" |
| `empty_messages.png` | No messages | "Connect with trainers" |

### Exercise Thumbnails

**Naming Convention:**
```
exercise_{id}_thumb.jpg
exercise_{id}_video.mp4
```

**Example:**
```
exercise_BW-CHEST-001_thumb.jpg   # Standard Push-Up thumbnail
exercise_BW-CHEST-001_video.mp4   # Standard Push-Up video
```

**Specifications:**
- Thumbnail: 400x400, JPEG, 80% quality
- Video: 720p, MP4/H.264, 15-30 seconds

---

## Font Files

```
fonts/
└── Cairo/
    ├── Cairo-Regular.ttf
    ├── Cairo-Medium.ttf
    ├── Cairo-SemiBold.ttf
    └── Cairo-Bold.ttf
```

**Download:** https://fonts.google.com/specimen/Cairo

---

## Placeholder Generator Script

For development, generate placeholder assets:

```python
# scripts/generate_placeholders.py

import os
from PIL import Image, ImageDraw, ImageFont

ASSET_DIR = "../assets"

def create_placeholder(path, width, height, text, bg_color="#1A2744", text_color="#00D4AA"):
    """Create a placeholder image with text."""
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Center text
    bbox = draw.textbbox((0, 0), text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) / 2
    y = (height - text_height) / 2

    draw.text((x, y), text, fill=text_color)

    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f"Created: {path}")

# Generate muscle icons
muscles = ["chest", "back", "shoulders", "biceps", "triceps", "forearms",
           "abs", "obliques", "quads", "hamstrings", "glutes", "calves"]

for muscle in muscles:
    create_placeholder(
        f"{ASSET_DIR}/icons/muscles/muscle_{muscle}.png",
        48, 48, muscle[:3].upper()
    )

# Generate equipment icons
equipment = ["barbell", "dumbbell", "kettlebell", "cable", "machine",
             "bodyweight", "bands", "trx", "pullup_bar", "bench"]

for equip in equipment:
    create_placeholder(
        f"{ASSET_DIR}/icons/equipment/equip_{equip}.png",
        48, 48, equip[:3].upper()
    )

# Generate onboarding placeholders
for i, name in enumerate(["welcome", "goals", "equipment", "schedule", "ready"]):
    create_placeholder(
        f"{ASSET_DIR}/images/onboarding/onboard_{name}.png",
        300, 300, f"Onboard {i+1}"
    )

print("Placeholder generation complete!")
```

---

## Asset Checklist for MVP

### Required for v1.0

- [x] App icon (all sizes)
- [x] Splash screen
- [ ] Cairo font files
- [ ] UI icons (lucide-react-native - auto)
- [ ] Muscle group icons (13)
- [ ] Equipment icons (12)
- [ ] Food category icons (10)
- [ ] Onboarding illustrations (5)
- [ ] Empty state illustrations (5)
- [ ] Lottie animations (5 core)
- [ ] Exercise thumbnails (top 100 exercises)

### Phase 2

- [ ] All exercise thumbnails (3000+)
- [ ] Exercise videos (AI-generated)
- [ ] Achievement badges (20+)
- [ ] Social sharing templates
- [ ] Marketing assets

---

## CDN & Caching Strategy

### Image Delivery
- Use Cloudflare Images or similar CDN
- Serve WebP with JPEG fallback
- Implement responsive images (srcset)

### Caching
- Static icons: 1 year cache
- Exercise images: 1 month cache
- User photos: 1 day cache

### Lazy Loading
- Below-fold images load on scroll
- Use BlurHash for placeholders
- Prefetch next screen's assets
