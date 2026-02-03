# FORMA - فورما
## The Egyptian Fitness Revolution
### Complete Development & Data Guide

---

# TABLE OF CONTENTS

1. [Vision & Mission](#1-vision--mission)
2. [App Architecture](#2-app-architecture)
3. [Current Status](#3-current-status)
4. [Egyptian Foods Database](#4-egyptian-foods-database)
5. [Exercise Library](#5-exercise-library)
6. [Workout Plans](#6-workout-plans)
7. [AI Features](#7-ai-features)
8. [API Reference](#8-api-reference)
9. [Database Schema](#9-database-schema)
10. [Deployment Guide](#10-deployment-guide)
11. [Research Tasks for Gemini](#11-research-tasks-for-gemini)
12. [Roadmap](#12-roadmap)

---

# 1. VISION & MISSION

## The Problem
- 90% of fitness apps are Western-focused
- No comprehensive Egyptian food database
- Generic workout plans that don't fit Egyptian lifestyle
- Language barrier (English-only)
- Expensive personal trainers

## Our Solution: FORMA (فورما)
**"Shape Your Future - شكّل مستقبلك"**

An Egyptian-first fitness platform that:
- Speaks Arabic and English
- Knows Egyptian cuisine (Koshari = 840 cal, not a mystery)
- Understands Ramadan fasting patterns
- Offers affordable local trainers
- Uses AI to personalize everything

## Target Market
- **Primary:** Egyptian youth (18-35) interested in fitness
- **Secondary:** Arab world (similar cuisine and culture)
- **Size:** 25M+ Egyptians use smartphones, fitness market growing 15% yearly

---

# 2. APP ARCHITECTURE

```
╔═══════════════════════════════════════════════════════════════════╗
║                     FORMA SYSTEM ARCHITECTURE                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║    ┌────────────────┐          ┌────────────────┐                 ║
║    │   iOS App      │          │  Android App   │                 ║
║    │   (Expo)       │          │   (Expo)       │                 ║
║    └───────┬────────┘          └───────┬────────┘                 ║
║            │                           │                          ║
║            └───────────┬───────────────┘                          ║
║                        │                                          ║
║    ┌───────────────────▼───────────────────┐                      ║
║    │            WEB APP                     │                      ║
║    │    https://forma-web-nine.vercel.app  │                      ║
║    │    Next.js 14 + React 18              │                      ║
║    │    Tailwind CSS + shadcn/ui           │                      ║
║    └───────────────────┬───────────────────┘                      ║
║                        │ HTTPS / REST API                         ║
║    ┌───────────────────▼───────────────────┐                      ║
║    │            BACKEND API                 │                      ║
║    │  https://forma-api-production.up.railway.app │               ║
║    │    NestJS + Prisma + JWT Auth         │                      ║
║    └───────────────────┬───────────────────┘                      ║
║                        │ PostgreSQL                               ║
║    ┌───────────────────▼───────────────────┐                      ║
║    │           SUPABASE DATABASE            │                      ║
║    │    PostgreSQL + pgvector              │                      ║
║    │    31 Tables                          │                      ║
║    └───────────────────────────────────────┘                      ║
║                                                                    ║
║    ┌───────────────────────────────────────┐                      ║
║    │           EXTERNAL SERVICES            │                      ║
║    │    • Google Gemini (AI)               │                      ║
║    │    • Stripe (Payments)                │                      ║
║    │    • YouTube (Exercise Videos)        │                      ║
║    └───────────────────────────────────────┘                      ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

# 3. CURRENT STATUS

## Live URLs
| Service | URL | Status |
|---------|-----|--------|
| Website | https://forma-web-nine.vercel.app | ✅ Live |
| API | https://forma-api-production.up.railway.app | ✅ Live |
| Database | Supabase PostgreSQL | ✅ Connected |

## Test Account
- **Email:** admin@forma.app
- **Password:** Admin123!

## Feature Status

### ✅ Completed
- User registration and login
- JWT authentication system
- Database schema (31 tables)
- API deployment on Railway
- Web deployment on Vercel
- Logout functionality
- Basic dashboard UI
- Stats weekly endpoint

### ⚠️ Partially Done
- Profile page (shows hardcoded data)
- Nutrition page (no real data)
- Workout page (no exercises)
- Exercise library (empty database)

### ❌ Not Started
- Mobile app (Expo)
- Video integration
- AI chat integration
- Payment system
- Trainer dashboard
- Progress photos
- Social features

---

# 4. EGYPTIAN FOODS DATABASE

## Complete Egyptian Food Categories

### 4.1 Traditional Main Dishes (الأطباق الرئيسية)

```json
[
  {
    "name_en": "Koshari",
    "name_ar": "كشري",
    "description_en": "Egypt's national dish - rice, lentils, pasta, chickpeas with tomato sauce and crispy onions",
    "description_ar": "الطبق الوطني المصري - أرز وعدس ومكرونة وحمص مع صلصة الطماطم والبصل المقرمش",
    "category": "CARBS",
    "serving_size_g": 350,
    "calories": 840,
    "protein_g": 22,
    "carbs_g": 145,
    "fat_g": 18,
    "fiber_g": 12,
    "is_egyptian": true,
    "meal_type": ["LUNCH", "DINNER"],
    "preparation_time_min": 45,
    "common_additions": ["hot sauce (shatta)", "garlic vinegar (dakka)"],
    "health_notes": "High in carbs but good protein from lentils"
  },
  {
    "name_en": "Ful Medames",
    "name_ar": "فول مدمس",
    "description_en": "Slow-cooked fava beans with oil, lemon, and cumin - breakfast staple",
    "description_ar": "فول مطبوخ ببطء مع الزيت والليمون والكمون - وجبة فطور أساسية",
    "category": "PROTEIN",
    "serving_size_g": 200,
    "calories": 280,
    "protein_g": 18,
    "carbs_g": 36,
    "fat_g": 8,
    "fiber_g": 9,
    "is_egyptian": true,
    "meal_type": ["BREAKFAST"],
    "variations": ["with egg", "with tahini", "with tomatoes"],
    "health_notes": "Excellent plant protein, high fiber"
  },
  {
    "name_en": "Molokhia",
    "name_ar": "ملوخية",
    "description_en": "Jute leaf soup with garlic, coriander, served over rice with meat",
    "description_ar": "حساء أوراق الملوخية مع الثوم والكزبرة، يقدم مع الأرز واللحم",
    "category": "VEGETABLES",
    "serving_size_g": 250,
    "calories": 180,
    "protein_g": 8,
    "carbs_g": 12,
    "fat_g": 12,
    "fiber_g": 6,
    "is_egyptian": true,
    "meal_type": ["LUNCH", "DINNER"],
    "served_with": ["rice", "bread", "chicken", "rabbit"],
    "health_notes": "Very high in vitamins A and C"
  },
  {
    "name_en": "Ta'ameya (Egyptian Falafel)",
    "name_ar": "طعمية",
    "description_en": "Fava bean fritters with herbs - Egyptian style falafel",
    "description_ar": "أقراص مقلية من الفول مع الأعشاب - الفلافل المصرية",
    "category": "PROTEIN",
    "serving_size_g": 100,
    "calories": 333,
    "protein_g": 13,
    "carbs_g": 31,
    "fat_g": 18,
    "fiber_g": 6,
    "is_egyptian": true,
    "pieces_per_serving": 5,
    "meal_type": ["BREAKFAST"],
    "health_notes": "Good protein but fried, eat in moderation"
  },
  {
    "name_en": "Mahshi (Stuffed Vegetables)",
    "name_ar": "محشي",
    "description_en": "Vegetables stuffed with rice, herbs, and sometimes meat",
    "description_ar": "خضروات محشية بالأرز والأعشاب وأحياناً اللحم",
    "category": "CARBS",
    "serving_size_g": 300,
    "calories": 420,
    "protein_g": 12,
    "carbs_g": 58,
    "fat_g": 16,
    "fiber_g": 8,
    "is_egyptian": true,
    "variations": ["grape leaves", "zucchini", "peppers", "cabbage", "eggplant"],
    "meal_type": ["LUNCH", "DINNER"]
  },
  {
    "name_en": "Fattah",
    "name_ar": "فتة",
    "description_en": "Layered dish of rice, bread, meat, and garlic vinegar sauce",
    "description_ar": "طبق من طبقات الأرز والخبز واللحم وصلصة الثوم والخل",
    "category": "CARBS",
    "serving_size_g": 400,
    "calories": 680,
    "protein_g": 35,
    "carbs_g": 72,
    "fat_g": 28,
    "fiber_g": 4,
    "is_egyptian": true,
    "meal_type": ["LUNCH"],
    "occasions": ["Eid", "celebrations"],
    "health_notes": "High calorie feast dish, save for special occasions"
  },
  {
    "name_en": "Hawawshi",
    "name_ar": "حواوشي",
    "description_en": "Spiced minced meat baked in bread",
    "description_ar": "لحم مفروم متبل مخبوز في العيش",
    "category": "PROTEIN",
    "serving_size_g": 250,
    "calories": 520,
    "protein_g": 28,
    "carbs_g": 42,
    "fat_g": 26,
    "fiber_g": 3,
    "is_egyptian": true,
    "meal_type": ["LUNCH", "DINNER", "SNACK"]
  },
  {
    "name_en": "Kofta",
    "name_ar": "كفتة",
    "description_en": "Spiced ground meat on skewers, grilled",
    "description_ar": "لحم مفروم متبل على أسياخ، مشوي",
    "category": "PROTEIN",
    "serving_size_g": 150,
    "calories": 380,
    "protein_g": 32,
    "carbs_g": 4,
    "fat_g": 26,
    "fiber_g": 1,
    "is_egyptian": true,
    "meal_type": ["LUNCH", "DINNER"]
  },
  {
    "name_en": "Shawarma",
    "name_ar": "شاورما",
    "description_en": "Marinated meat sliced from rotating spit, served in bread",
    "description_ar": "لحم متبل مقطع من السيخ الدوار، يقدم في الخبز",
    "category": "PROTEIN",
    "serving_size_g": 300,
    "calories": 550,
    "protein_g": 35,
    "carbs_g": 40,
    "fat_g": 28,
    "fiber_g": 2,
    "is_egyptian": true,
    "variations": ["chicken", "beef", "mixed"]
  },
  {
    "name_en": "Kebab",
    "name_ar": "كباب",
    "description_en": "Grilled meat chunks on skewers",
    "description_ar": "قطع لحم مشوية على أسياخ",
    "category": "PROTEIN",
    "serving_size_g": 200,
    "calories": 420,
    "protein_g": 45,
    "carbs_g": 2,
    "fat_g": 25,
    "fiber_g": 0,
    "is_egyptian": true
  },
  {
    "name_en": "Bamya (Okra Stew)",
    "name_ar": "بامية",
    "description_en": "Okra cooked in tomato sauce with meat",
    "description_ar": "بامية مطبوخة في صلصة الطماطم مع اللحم",
    "category": "VEGETABLES",
    "serving_size_g": 300,
    "calories": 320,
    "protein_g": 18,
    "carbs_g": 22,
    "fat_g": 18,
    "fiber_g": 8,
    "is_egyptian": true
  },
  {
    "name_en": "Fassolia (White Bean Stew)",
    "name_ar": "فاصوليا",
    "description_en": "White beans in tomato sauce with meat",
    "description_ar": "فاصوليا بيضاء في صلصة الطماطم مع اللحم",
    "category": "PROTEIN",
    "serving_size_g": 300,
    "calories": 380,
    "protein_g": 22,
    "carbs_g": 42,
    "fat_g": 14,
    "fiber_g": 12,
    "is_egyptian": true
  },
  {
    "name_en": "Moussaka (Egyptian)",
    "name_ar": "مسقعة",
    "description_en": "Fried eggplant with tomato sauce and peppers",
    "description_ar": "باذنجان مقلي مع صلصة الطماطم والفلفل",
    "category": "VEGETABLES",
    "serving_size_g": 250,
    "calories": 280,
    "protein_g": 6,
    "carbs_g": 28,
    "fat_g": 16,
    "fiber_g": 8,
    "is_egyptian": true
  }
]
```

### 4.2 Egyptian Breakfast Foods (فطور مصري)

```json
[
  {
    "name_en": "Eggs with Basterma",
    "name_ar": "بيض بالبسطرمة",
    "category": "PROTEIN",
    "serving_size_g": 150,
    "calories": 320,
    "protein_g": 22,
    "carbs_g": 2,
    "fat_g": 25,
    "fiber_g": 0
  },
  {
    "name_en": "Eggs with Sausage (Sogo')",
    "name_ar": "بيض بالسجق",
    "category": "PROTEIN",
    "serving_size_g": 180,
    "calories": 380,
    "protein_g": 20,
    "carbs_g": 4,
    "fat_g": 32
  },
  {
    "name_en": "Shakshuka",
    "name_ar": "شكشوكة",
    "category": "PROTEIN",
    "serving_size_g": 200,
    "calories": 220,
    "protein_g": 14,
    "carbs_g": 12,
    "fat_g": 14
  },
  {
    "name_en": "Foul with Eggs",
    "name_ar": "فول بالبيض",
    "category": "PROTEIN",
    "serving_size_g": 250,
    "calories": 380,
    "protein_g": 24,
    "carbs_g": 38,
    "fat_g": 16
  },
  {
    "name_en": "Foul with Tahini",
    "name_ar": "فول بالطحينة",
    "category": "PROTEIN",
    "serving_size_g": 220,
    "calories": 340,
    "protein_g": 16,
    "carbs_g": 38,
    "fat_g": 14
  }
]
```

### 4.3 Egyptian Breads (الخبز المصري)

```json
[
  {
    "name_en": "Aish Baladi",
    "name_ar": "عيش بلدي",
    "description_en": "Traditional Egyptian whole wheat pita bread",
    "category": "CARBS",
    "serving_size_g": 90,
    "calories": 210,
    "protein_g": 7,
    "carbs_g": 42,
    "fat_g": 1,
    "fiber_g": 6
  },
  {
    "name_en": "Aish Shami",
    "name_ar": "عيش شامي",
    "description_en": "White flour pita bread",
    "category": "CARBS",
    "serving_size_g": 60,
    "calories": 165,
    "protein_g": 5,
    "carbs_g": 33,
    "fat_g": 1,
    "fiber_g": 1
  },
  {
    "name_en": "Aish Fino",
    "name_ar": "عيش فينو",
    "description_en": "Soft white bread rolls",
    "category": "CARBS",
    "serving_size_g": 50,
    "calories": 140,
    "protein_g": 4,
    "carbs_g": 26,
    "fat_g": 2
  },
  {
    "name_en": "Feteer Meshaltet",
    "name_ar": "فطير مشلتت",
    "description_en": "Flaky layered pastry with butter",
    "category": "CARBS",
    "serving_size_g": 150,
    "calories": 520,
    "protein_g": 8,
    "carbs_g": 52,
    "fat_g": 32
  }
]
```

### 4.4 Egyptian Desserts (حلويات مصرية)

```json
[
  {
    "name_en": "Basbousa",
    "name_ar": "بسبوسة",
    "description_en": "Semolina cake soaked in syrup",
    "category": "DESSERTS",
    "serving_size_g": 100,
    "calories": 380,
    "protein_g": 4,
    "carbs_g": 52,
    "fat_g": 18,
    "sugar_g": 38
  },
  {
    "name_en": "Konafa",
    "name_ar": "كنافة",
    "description_en": "Shredded phyllo with cream or nuts, soaked in syrup",
    "category": "DESSERTS",
    "serving_size_g": 150,
    "calories": 520,
    "protein_g": 8,
    "carbs_g": 68,
    "fat_g": 24
  },
  {
    "name_en": "Om Ali",
    "name_ar": "أم علي",
    "description_en": "Bread pudding with milk, nuts, and raisins",
    "category": "DESSERTS",
    "serving_size_g": 200,
    "calories": 480,
    "protein_g": 10,
    "carbs_g": 58,
    "fat_g": 24
  },
  {
    "name_en": "Zalabya",
    "name_ar": "زلابية",
    "description_en": "Deep fried dough balls in syrup",
    "category": "DESSERTS",
    "serving_size_g": 100,
    "calories": 420,
    "protein_g": 4,
    "carbs_g": 56,
    "fat_g": 20
  },
  {
    "name_en": "Qatayef",
    "name_ar": "قطايف",
    "description_en": "Ramadan special - stuffed pancakes",
    "category": "DESSERTS",
    "serving_size_g": 120,
    "calories": 340,
    "protein_g": 6,
    "carbs_g": 48,
    "fat_g": 14
  },
  {
    "name_en": "Roz Bel Laban",
    "name_ar": "رز باللبن",
    "description_en": "Rice pudding with milk and rose water",
    "category": "DESSERTS",
    "serving_size_g": 200,
    "calories": 280,
    "protein_g": 8,
    "carbs_g": 48,
    "fat_g": 6
  },
  {
    "name_en": "Mahalabeya",
    "name_ar": "مهلبية",
    "description_en": "Milk pudding with rose water and nuts",
    "category": "DESSERTS",
    "serving_size_g": 150,
    "calories": 180,
    "protein_g": 6,
    "carbs_g": 28,
    "fat_g": 5
  }
]
```

### 4.5 Egyptian Beverages (مشروبات مصرية)

```json
[
  {
    "name_en": "Karkade (Hibiscus)",
    "name_ar": "كركديه",
    "description_en": "Hibiscus tea, served hot or cold",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 5,
    "protein_g": 0,
    "carbs_g": 1,
    "fat_g": 0,
    "health_benefits": ["lowers blood pressure", "antioxidants"]
  },
  {
    "name_en": "Sahlab",
    "name_ar": "سحلب",
    "description_en": "Hot milk drink with orchid root powder and nuts",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 220,
    "protein_g": 8,
    "carbs_g": 32,
    "fat_g": 8
  },
  {
    "name_en": "Sugarcane Juice (Asab)",
    "name_ar": "عصير قصب",
    "category": "BEVERAGES",
    "serving_size_g": 300,
    "calories": 180,
    "protein_g": 0,
    "carbs_g": 45,
    "fat_g": 0
  },
  {
    "name_en": "Tamarind (Tamar Hindi)",
    "name_ar": "تمر هندي",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 120,
    "protein_g": 1,
    "carbs_g": 30,
    "fat_g": 0
  },
  {
    "name_en": "Carob Drink (Kharoub)",
    "name_ar": "خروب",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 90,
    "protein_g": 1,
    "carbs_g": 22,
    "fat_g": 0
  },
  {
    "name_en": "Licorice (Erk Sous)",
    "name_ar": "عرق سوس",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 45,
    "protein_g": 0,
    "carbs_g": 11,
    "fat_g": 0
  },
  {
    "name_en": "Mango Juice",
    "name_ar": "عصير مانجو",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 150,
    "protein_g": 1,
    "carbs_g": 36,
    "fat_g": 0
  },
  {
    "name_en": "Guava Juice",
    "name_ar": "عصير جوافة",
    "category": "BEVERAGES",
    "serving_size_g": 250,
    "calories": 112,
    "protein_g": 1,
    "carbs_g": 28,
    "fat_g": 0
  }
]
```

### 4.6 Egyptian Cheeses & Dairy (أجبان ومنتجات الألبان)

```json
[
  {
    "name_en": "Gibna Domyati",
    "name_ar": "جبنة دمياطي",
    "description_en": "Soft white Egyptian cheese",
    "category": "DAIRY",
    "serving_size_g": 50,
    "calories": 140,
    "protein_g": 8,
    "carbs_g": 1,
    "fat_g": 12
  },
  {
    "name_en": "Gibna Roumi",
    "name_ar": "جبنة رومي",
    "description_en": "Hard yellow cheese, Egyptian style parmesan",
    "category": "DAIRY",
    "serving_size_g": 30,
    "calories": 110,
    "protein_g": 7,
    "carbs_g": 0,
    "fat_g": 9
  },
  {
    "name_en": "Mish",
    "name_ar": "مش",
    "description_en": "Aged fermented cheese with strong flavor",
    "category": "DAIRY",
    "serving_size_g": 30,
    "calories": 85,
    "protein_g": 5,
    "carbs_g": 1,
    "fat_g": 7
  },
  {
    "name_en": "Areesh Cheese",
    "name_ar": "جبنة قريش",
    "description_en": "Low-fat cottage cheese style",
    "category": "DAIRY",
    "serving_size_g": 100,
    "calories": 72,
    "protein_g": 12,
    "carbs_g": 4,
    "fat_g": 1,
    "health_notes": "Excellent low-fat protein source"
  },
  {
    "name_en": "Laban (Buttermilk)",
    "name_ar": "لبن",
    "category": "DAIRY",
    "serving_size_g": 250,
    "calories": 100,
    "protein_g": 8,
    "carbs_g": 12,
    "fat_g": 3
  },
  {
    "name_en": "Zabadi (Yogurt)",
    "name_ar": "زبادي",
    "category": "DAIRY",
    "serving_size_g": 150,
    "calories": 95,
    "protein_g": 6,
    "carbs_g": 8,
    "fat_g": 5
  }
]
```

### 4.7 Egyptian Street Food (أكل الشارع المصري)

```json
[
  {
    "name_en": "Liver Sandwich (Kebda Eskandarani)",
    "name_ar": "كبدة اسكندراني",
    "category": "PROTEIN",
    "serving_size_g": 200,
    "calories": 380,
    "protein_g": 28,
    "carbs_g": 32,
    "fat_g": 16,
    "iron_mg": 12
  },
  {
    "name_en": "Sausage Sandwich (Sogo')",
    "name_ar": "ساندويتش سجق",
    "category": "PROTEIN",
    "serving_size_g": 180,
    "calories": 420,
    "protein_g": 16,
    "carbs_g": 35,
    "fat_g": 24
  },
  {
    "name_en": "Koshary Cart",
    "name_ar": "كشري العربية",
    "category": "CARBS",
    "serving_size_g": 300,
    "calories": 720,
    "protein_g": 18,
    "carbs_g": 125,
    "fat_g": 15
  },
  {
    "name_en": "Batates (Baked Sweet Potato)",
    "name_ar": "بطاطا",
    "category": "CARBS",
    "serving_size_g": 200,
    "calories": 180,
    "protein_g": 4,
    "carbs_g": 42,
    "fat_g": 0
  },
  {
    "name_en": "Roasted Corn (Dorra)",
    "name_ar": "ذرة مشوية",
    "category": "CARBS",
    "serving_size_g": 150,
    "calories": 135,
    "protein_g": 5,
    "carbs_g": 30,
    "fat_g": 2
  },
  {
    "name_en": "Termis (Lupini Beans)",
    "name_ar": "ترمس",
    "category": "PROTEIN",
    "serving_size_g": 100,
    "calories": 120,
    "protein_g": 16,
    "carbs_g": 10,
    "fat_g": 3,
    "health_notes": "High protein, low calorie snack"
  },
  {
    "name_en": "Hummus Sham",
    "name_ar": "حمص الشام",
    "category": "PROTEIN",
    "serving_size_g": 200,
    "calories": 180,
    "protein_g": 10,
    "carbs_g": 28,
    "fat_g": 4
  }
]
```

---

# 5. EXERCISE LIBRARY

## Muscle Group Categories

### 5.1 Chest Exercises (تمارين الصدر)

```json
[
  {
    "id": "chest-barbell-bench-press",
    "name_en": "Barbell Bench Press",
    "name_ar": "ضغط البار على البنش",
    "primary_muscle": "CHEST",
    "secondary_muscles": ["TRICEPS", "SHOULDERS"],
    "equipment": ["BARBELL", "BENCH"],
    "difficulty": "intermediate",
    "instructions_en": [
      "Lie on bench with eyes under the bar",
      "Grip bar slightly wider than shoulder width",
      "Unrack and lower bar to mid-chest",
      "Press bar up until arms are straight",
      "Keep feet flat on floor throughout"
    ],
    "instructions_ar": [
      "استلق على البنش بحيث تكون عيناك تحت البار",
      "امسك البار بمسافة أوسع قليلاً من الكتفين",
      "أنزل البار إلى منتصف الصدر",
      "ادفع البار للأعلى حتى تستقيم ذراعاك",
      "أبق قدميك مسطحتين على الأرض طوال الوقت"
    ],
    "tips_en": [
      "Keep shoulder blades squeezed together",
      "Don't bounce the bar off your chest",
      "Breathe in on the way down, out on the way up"
    ],
    "common_mistakes": [
      "Flaring elbows too wide",
      "Lifting hips off the bench",
      "Not using full range of motion"
    ],
    "default_sets": 4,
    "default_reps": 8
  },
  {
    "id": "chest-dumbbell-press",
    "name_en": "Dumbbell Bench Press",
    "name_ar": "ضغط الدمبل على البنش",
    "primary_muscle": "CHEST",
    "secondary_muscles": ["TRICEPS", "SHOULDERS"],
    "equipment": ["DUMBBELLS", "BENCH"],
    "difficulty": "beginner",
    "default_sets": 3,
    "default_reps": 10
  },
  {
    "id": "chest-incline-press",
    "name_en": "Incline Bench Press",
    "name_ar": "ضغط البنش المائل",
    "primary_muscle": "CHEST",
    "secondary_muscles": ["SHOULDERS", "TRICEPS"],
    "equipment": ["BARBELL", "BENCH"],
    "difficulty": "intermediate",
    "target_area": "Upper chest"
  },
  {
    "id": "chest-cable-fly",
    "name_en": "Cable Fly",
    "name_ar": "فتح الكيبل",
    "primary_muscle": "CHEST",
    "equipment": ["CABLES"],
    "difficulty": "beginner"
  },
  {
    "id": "chest-pushup",
    "name_en": "Push-Up",
    "name_ar": "ضغط الأرض",
    "primary_muscle": "CHEST",
    "secondary_muscles": ["TRICEPS", "SHOULDERS", "ABS"],
    "equipment": ["BODYWEIGHT"],
    "difficulty": "beginner",
    "variations": ["wide grip", "diamond", "decline", "incline"]
  },
  {
    "id": "chest-dip",
    "name_en": "Chest Dip",
    "name_ar": "ديبس الصدر",
    "primary_muscle": "CHEST",
    "secondary_muscles": ["TRICEPS", "SHOULDERS"],
    "equipment": ["BODYWEIGHT"],
    "difficulty": "intermediate"
  },
  {
    "id": "chest-pec-deck",
    "name_en": "Pec Deck Machine",
    "name_ar": "جهاز الفراشة",
    "primary_muscle": "CHEST",
    "equipment": ["MACHINES"],
    "difficulty": "beginner"
  }
]
```

### 5.2 Back Exercises (تمارين الظهر)

```json
[
  {
    "id": "back-deadlift",
    "name_en": "Conventional Deadlift",
    "name_ar": "رفعة الميتة",
    "primary_muscle": "BACK",
    "secondary_muscles": ["HAMSTRINGS", "GLUTES", "FOREARMS"],
    "equipment": ["BARBELL"],
    "difficulty": "advanced",
    "instructions_en": [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip bar",
      "Keep back straight, chest up",
      "Drive through heels to lift bar",
      "Lock out hips at the top"
    ]
  },
  {
    "id": "back-pullup",
    "name_en": "Pull-Up",
    "name_ar": "سحب العقلة",
    "primary_muscle": "BACK",
    "secondary_muscles": ["BICEPS"],
    "equipment": ["PULL_UP_BAR"],
    "difficulty": "intermediate"
  },
  {
    "id": "back-lat-pulldown",
    "name_en": "Lat Pulldown",
    "name_ar": "سحب علوي",
    "primary_muscle": "BACK",
    "equipment": ["CABLES"],
    "difficulty": "beginner"
  },
  {
    "id": "back-barbell-row",
    "name_en": "Barbell Row",
    "name_ar": "تجديف البار",
    "primary_muscle": "BACK",
    "secondary_muscles": ["BICEPS"],
    "equipment": ["BARBELL"],
    "difficulty": "intermediate"
  },
  {
    "id": "back-dumbbell-row",
    "name_en": "One-Arm Dumbbell Row",
    "name_ar": "تجديف الدمبل",
    "primary_muscle": "BACK",
    "equipment": ["DUMBBELLS", "BENCH"],
    "difficulty": "beginner"
  },
  {
    "id": "back-seated-row",
    "name_en": "Seated Cable Row",
    "name_ar": "تجديف الكيبل جالس",
    "primary_muscle": "BACK",
    "equipment": ["CABLES"],
    "difficulty": "beginner"
  },
  {
    "id": "back-tbar-row",
    "name_en": "T-Bar Row",
    "name_ar": "تجديف تي بار",
    "primary_muscle": "BACK",
    "equipment": ["BARBELL"],
    "difficulty": "intermediate"
  }
]
```

### 5.3 Leg Exercises (تمارين الأرجل)

```json
[
  {
    "id": "legs-squat",
    "name_en": "Barbell Back Squat",
    "name_ar": "سكوات البار",
    "primary_muscle": "QUADRICEPS",
    "secondary_muscles": ["GLUTES", "HAMSTRINGS"],
    "equipment": ["BARBELL"],
    "difficulty": "intermediate"
  },
  {
    "id": "legs-leg-press",
    "name_en": "Leg Press",
    "name_ar": "ضغط الأرجل",
    "primary_muscle": "QUADRICEPS",
    "equipment": ["MACHINES"],
    "difficulty": "beginner"
  },
  {
    "id": "legs-lunges",
    "name_en": "Walking Lunges",
    "name_ar": "الطعنات",
    "primary_muscle": "QUADRICEPS",
    "secondary_muscles": ["GLUTES"],
    "equipment": ["BODYWEIGHT", "DUMBBELLS"],
    "difficulty": "beginner"
  },
  {
    "id": "legs-leg-curl",
    "name_en": "Lying Leg Curl",
    "name_ar": "ثني الأرجل",
    "primary_muscle": "HAMSTRINGS",
    "equipment": ["MACHINES"],
    "difficulty": "beginner"
  },
  {
    "id": "legs-leg-extension",
    "name_en": "Leg Extension",
    "name_ar": "مد الأرجل",
    "primary_muscle": "QUADRICEPS",
    "equipment": ["MACHINES"],
    "difficulty": "beginner"
  },
  {
    "id": "legs-calf-raise",
    "name_en": "Standing Calf Raise",
    "name_ar": "رفع السمانة",
    "primary_muscle": "CALVES",
    "equipment": ["MACHINES", "BODYWEIGHT"],
    "difficulty": "beginner"
  },
  {
    "id": "legs-romanian-deadlift",
    "name_en": "Romanian Deadlift",
    "name_ar": "الرفعة الرومانية",
    "primary_muscle": "HAMSTRINGS",
    "secondary_muscles": ["GLUTES", "LOWER_BACK"],
    "equipment": ["BARBELL", "DUMBBELLS"],
    "difficulty": "intermediate"
  },
  {
    "id": "legs-hip-thrust",
    "name_en": "Hip Thrust",
    "name_ar": "رفع الورك",
    "primary_muscle": "GLUTES",
    "secondary_muscles": ["HAMSTRINGS"],
    "equipment": ["BARBELL", "BENCH"],
    "difficulty": "intermediate"
  }
]
```

### 5.4 Shoulder Exercises (تمارين الكتف)

```json
[
  {
    "id": "shoulders-overhead-press",
    "name_en": "Overhead Press",
    "name_ar": "ضغط علوي",
    "primary_muscle": "SHOULDERS",
    "secondary_muscles": ["TRICEPS"],
    "equipment": ["BARBELL"],
    "difficulty": "intermediate"
  },
  {
    "id": "shoulders-lateral-raise",
    "name_en": "Lateral Raise",
    "name_ar": "رفع جانبي",
    "primary_muscle": "SHOULDERS",
    "equipment": ["DUMBBELLS"],
    "difficulty": "beginner"
  },
  {
    "id": "shoulders-front-raise",
    "name_en": "Front Raise",
    "name_ar": "رفع أمامي",
    "primary_muscle": "SHOULDERS",
    "equipment": ["DUMBBELLS"],
    "difficulty": "beginner"
  },
  {
    "id": "shoulders-rear-delt-fly",
    "name_en": "Rear Delt Fly",
    "name_ar": "فتح خلفي",
    "primary_muscle": "SHOULDERS",
    "equipment": ["DUMBBELLS", "CABLES"],
    "difficulty": "beginner"
  },
  {
    "id": "shoulders-face-pull",
    "name_en": "Face Pull",
    "name_ar": "سحب للوجه",
    "primary_muscle": "SHOULDERS",
    "equipment": ["CABLES"],
    "difficulty": "beginner"
  }
]
```

### 5.5 Arm Exercises (تمارين الذراع)

```json
[
  {
    "id": "biceps-barbell-curl",
    "name_en": "Barbell Curl",
    "name_ar": "ثني البار",
    "primary_muscle": "BICEPS",
    "equipment": ["BARBELL"],
    "difficulty": "beginner"
  },
  {
    "id": "biceps-dumbbell-curl",
    "name_en": "Dumbbell Curl",
    "name_ar": "ثني الدمبل",
    "primary_muscle": "BICEPS",
    "equipment": ["DUMBBELLS"],
    "difficulty": "beginner"
  },
  {
    "id": "biceps-hammer-curl",
    "name_en": "Hammer Curl",
    "name_ar": "ثني المطرقة",
    "primary_muscle": "BICEPS",
    "equipment": ["DUMBBELLS"],
    "difficulty": "beginner"
  },
  {
    "id": "triceps-pushdown",
    "name_en": "Tricep Pushdown",
    "name_ar": "دفع الكيبل للتراي",
    "primary_muscle": "TRICEPS",
    "equipment": ["CABLES"],
    "difficulty": "beginner"
  },
  {
    "id": "triceps-skull-crusher",
    "name_en": "Skull Crusher",
    "name_ar": "كسر الجمجمة",
    "primary_muscle": "TRICEPS",
    "equipment": ["BARBELL", "DUMBBELLS"],
    "difficulty": "intermediate"
  },
  {
    "id": "triceps-overhead-extension",
    "name_en": "Overhead Tricep Extension",
    "name_ar": "مد التراي العلوي",
    "primary_muscle": "TRICEPS",
    "equipment": ["DUMBBELLS", "CABLES"],
    "difficulty": "beginner"
  }
]
```

### 5.6 Core Exercises (تمارين البطن)

```json
[
  {
    "id": "core-plank",
    "name_en": "Plank",
    "name_ar": "اللوح",
    "primary_muscle": "ABS",
    "equipment": ["BODYWEIGHT"],
    "difficulty": "beginner",
    "is_time_based": true,
    "default_duration": 60
  },
  {
    "id": "core-crunches",
    "name_en": "Crunches",
    "name_ar": "كرانش",
    "primary_muscle": "ABS",
    "equipment": ["BODYWEIGHT"],
    "difficulty": "beginner"
  },
  {
    "id": "core-leg-raise",
    "name_en": "Hanging Leg Raise",
    "name_ar": "رفع الأرجل معلق",
    "primary_muscle": "ABS",
    "equipment": ["PULL_UP_BAR"],
    "difficulty": "intermediate"
  },
  {
    "id": "core-russian-twist",
    "name_en": "Russian Twist",
    "name_ar": "اللفة الروسية",
    "primary_muscle": "OBLIQUES",
    "equipment": ["BODYWEIGHT"],
    "difficulty": "beginner"
  },
  {
    "id": "core-mountain-climber",
    "name_en": "Mountain Climbers",
    "name_ar": "تسلق الجبل",
    "primary_muscle": "ABS",
    "equipment": ["BODYWEIGHT"],
    "difficulty": "beginner",
    "is_time_based": true
  }
]
```

---

# 6. WORKOUT PLANS

## Sample Plans

### 6.1 Beginner Full Body (3 Days/Week)

```json
{
  "name": "Beginner Full Body",
  "name_ar": "مبتدئ - جسم كامل",
  "description": "Perfect for beginners. 3 days per week, full body each session.",
  "difficulty": "BEGINNER",
  "goal": "MUSCLE_GAIN",
  "duration_weeks": 4,
  "days_per_week": 3,
  "workouts": [
    {
      "day": 1,
      "name": "Full Body A",
      "exercises": [
        { "exercise": "Barbell Squat", "sets": 3, "reps": "8-10", "rest": 120 },
        { "exercise": "Bench Press", "sets": 3, "reps": "8-10", "rest": 90 },
        { "exercise": "Barbell Row", "sets": 3, "reps": "8-10", "rest": 90 },
        { "exercise": "Overhead Press", "sets": 3, "reps": "8-10", "rest": 90 },
        { "exercise": "Plank", "sets": 3, "duration": "30 sec", "rest": 60 }
      ]
    },
    {
      "day": 3,
      "name": "Full Body B",
      "exercises": [
        { "exercise": "Deadlift", "sets": 3, "reps": "6-8", "rest": 120 },
        { "exercise": "Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 90 },
        { "exercise": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": 90 },
        { "exercise": "Lunges", "sets": 3, "reps": "10 each", "rest": 90 },
        { "exercise": "Crunches", "sets": 3, "reps": "15", "rest": 60 }
      ]
    },
    {
      "day": 5,
      "name": "Full Body C",
      "exercises": [
        { "exercise": "Leg Press", "sets": 3, "reps": "12-15", "rest": 90 },
        { "exercise": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 90 },
        { "exercise": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest": 90 },
        { "exercise": "Lateral Raise", "sets": 3, "reps": "12-15", "rest": 60 },
        { "exercise": "Bicep Curl", "sets": 2, "reps": "12", "rest": 60 },
        { "exercise": "Tricep Pushdown", "sets": 2, "reps": "12", "rest": 60 }
      ]
    }
  ]
}
```

### 6.2 Push/Pull/Legs (6 Days/Week)

```json
{
  "name": "Push/Pull/Legs",
  "name_ar": "دفع/سحب/أرجل",
  "description": "Advanced split for maximum muscle growth",
  "difficulty": "INTERMEDIATE",
  "goal": "MUSCLE_GAIN",
  "duration_weeks": 8,
  "days_per_week": 6,
  "schedule": ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"],
  "workouts": [
    {
      "day": "Push",
      "exercises": [
        { "exercise": "Bench Press", "sets": 4, "reps": "6-8" },
        { "exercise": "Overhead Press", "sets": 4, "reps": "8-10" },
        { "exercise": "Incline Dumbbell Press", "sets": 3, "reps": "10-12" },
        { "exercise": "Cable Fly", "sets": 3, "reps": "12-15" },
        { "exercise": "Lateral Raise", "sets": 4, "reps": "12-15" },
        { "exercise": "Tricep Pushdown", "sets": 3, "reps": "10-12" },
        { "exercise": "Overhead Extension", "sets": 3, "reps": "10-12" }
      ]
    },
    {
      "day": "Pull",
      "exercises": [
        { "exercise": "Deadlift", "sets": 4, "reps": "5-6" },
        { "exercise": "Pull-Up", "sets": 4, "reps": "6-10" },
        { "exercise": "Barbell Row", "sets": 4, "reps": "8-10" },
        { "exercise": "Face Pull", "sets": 3, "reps": "15-20" },
        { "exercise": "Barbell Curl", "sets": 3, "reps": "10-12" },
        { "exercise": "Hammer Curl", "sets": 3, "reps": "10-12" }
      ]
    },
    {
      "day": "Legs",
      "exercises": [
        { "exercise": "Squat", "sets": 4, "reps": "6-8" },
        { "exercise": "Romanian Deadlift", "sets": 4, "reps": "8-10" },
        { "exercise": "Leg Press", "sets": 3, "reps": "10-12" },
        { "exercise": "Leg Curl", "sets": 3, "reps": "10-12" },
        { "exercise": "Leg Extension", "sets": 3, "reps": "12-15" },
        { "exercise": "Calf Raise", "sets": 4, "reps": "12-15" }
      ]
    }
  ]
}
```

---

# 7. AI FEATURES

## 7.1 Offline AI (Free Tier)

Pre-generated content that doesn't require API calls:

### Workout Tips
```json
[
  {
    "tip_en": "Focus on compound exercises first when you have the most energy",
    "tip_ar": "ركز على التمارين المركبة أولاً عندما يكون لديك أكبر قدر من الطاقة",
    "category": "training"
  },
  {
    "tip_en": "Progressive overload is key - add weight or reps each week",
    "tip_ar": "الزيادة التدريجية هي المفتاح - أضف وزناً أو تكرارات كل أسبوع",
    "category": "progression"
  },
  {
    "tip_en": "Get 7-9 hours of sleep for optimal muscle recovery",
    "tip_ar": "احصل على 7-9 ساعات نوم للتعافي العضلي الأمثل",
    "category": "recovery"
  },
  {
    "tip_en": "Drink water before, during, and after your workout",
    "tip_ar": "اشرب الماء قبل وأثناء وبعد التمرين",
    "category": "hydration"
  },
  {
    "tip_en": "Don't skip leg day - strong legs support your entire body",
    "tip_ar": "لا تتجاوز يوم الأرجل - الأرجل القوية تدعم جسمك بالكامل",
    "category": "training"
  }
]
```

### Nutrition Tips
```json
[
  {
    "tip_en": "Eat protein with every meal - aim for 1.6-2.2g per kg body weight",
    "tip_ar": "تناول البروتين مع كل وجبة - استهدف 1.6-2.2 جرام لكل كيلو من وزن الجسم",
    "category": "protein"
  },
  {
    "tip_en": "Ful and Ta'ameya make a complete protein breakfast",
    "tip_ar": "الفول والطعمية يشكلان وجبة فطور بروتين كاملة",
    "category": "egyptian"
  },
  {
    "tip_en": "Areesh cheese is one of the best low-calorie Egyptian protein sources",
    "tip_ar": "جبنة قريش من أفضل مصادر البروتين المصرية منخفضة السعرات",
    "category": "egyptian"
  },
  {
    "tip_en": "Eat carbs around your workout for energy and recovery",
    "tip_ar": "تناول الكربوهيدرات حول وقت التمرين للطاقة والتعافي",
    "category": "timing"
  }
]
```

## 7.2 Premium AI (Gemini API)

Real-time features for premium users:
- Personalized workout recommendations
- Custom meal plans based on preferences
- Form analysis feedback
- Progress predictions
- Interactive chat coach

---

# 8. API REFERENCE

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Mohamed"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "user": { ... },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

## Workouts

### Get Plans
```http
GET /api/workouts/plans
Authorization: Bearer {token}
```

### Get Today's Workout
```http
GET /api/workouts/today
Authorization: Bearer {token}
```

### Log Workout
```http
POST /api/workouts/log
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Push Day",
  "durationMinutes": 60,
  "exercises": [
    {
      "exerciseId": "chest-bench-press",
      "sets": [
        { "reps": 10, "weight": 60 },
        { "reps": 8, "weight": 70 }
      ]
    }
  ]
}
```

## Nutrition

### Search Foods
```http
GET /api/nutrition/foods?query=koshari&isEgyptian=true
```

### Log Meal
```http
POST /api/nutrition/meals
Authorization: Bearer {token}
Content-Type: application/json

{
  "mealType": "BREAKFAST",
  "foods": [
    { "foodId": "foul-medames", "servings": 1 }
  ]
}
```

### Get Daily Log
```http
GET /api/nutrition/daily?date=2026-02-03
Authorization: Bearer {token}
```

## Exercises

### Search Exercises
```http
GET /api/exercises?muscle=CHEST&equipment=BARBELL
```

### Get Exercise
```http
GET /api/exercises/{id}
```

## Stats

### Weekly Summary
```http
GET /api/stats/weekly
Authorization: Bearer {token}

Response:
{
  "workoutsCompleted": 4,
  "totalVolume": 12500,
  "caloriesAvg": 2100,
  "proteinAvg": 150,
  "weightChange": -0.5,
  "streakDays": 7
}
```

---

# 9. DATABASE SCHEMA

## Key Tables

### User
```sql
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  avatarUrl TEXT,
  gender TEXT,
  heightCm INT,
  currentWeightKg FLOAT,
  targetWeightKg FLOAT,
  fitnessGoal TEXT,
  fitnessLevel TEXT DEFAULT 'BEGINNER',
  role TEXT DEFAULT 'USER',
  language TEXT DEFAULT 'en',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Exercise
```sql
CREATE TABLE "Exercise" (
  id TEXT PRIMARY KEY,
  externalId TEXT UNIQUE,
  nameEn TEXT NOT NULL,
  nameAr TEXT,
  descriptionEn TEXT,
  primaryMuscle TEXT NOT NULL,
  secondaryMuscles TEXT[],
  equipment TEXT[],
  difficulty TEXT,
  instructionsEn TEXT[],
  instructionsAr TEXT[],
  tipsEn TEXT[],
  defaultSets INT DEFAULT 3,
  defaultReps INT DEFAULT 10
);
```

### Food
```sql
CREATE TABLE "Food" (
  id TEXT PRIMARY KEY,
  nameEn TEXT NOT NULL,
  nameAr TEXT,
  category TEXT NOT NULL,
  calories FLOAT NOT NULL,
  proteinG FLOAT,
  carbsG FLOAT,
  fatG FLOAT,
  fiberG FLOAT,
  servingSizeG FLOAT,
  isEgyptian BOOLEAN DEFAULT false
);
```

---

# 10. DEPLOYMENT GUIDE

## Railway (API)

1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select Forma repo
4. Set Root Directory: `apps/api`
5. Add Environment Variables:
   - DATABASE_URL
   - DIRECT_URL
   - JWT_SECRET
6. Deploy

## Vercel (Web)

1. Go to vercel.com
2. Import GitHub repo
3. Set Root Directory: `apps/web`
4. Add Environment Variable:
   - NEXT_PUBLIC_API_URL
5. Deploy

---

# 11. RESEARCH TASKS FOR GEMINI

## Prompt 1: Generate Egyptian Foods JSON

Copy this to Gemini and ask it to generate:

```
I need a complete JSON database of Egyptian foods for a fitness app.

Requirements:
1. 100 Egyptian foods total
2. Include: main dishes, breakfast, desserts, beverages, breads, cheeses
3. Each food needs: name_en, name_ar, category, calories, protein_g, carbs_g, fat_g, fiber_g, serving_size_g, is_egyptian: true, description

Please output as a valid JSON array that I can directly save to a file.

Categories: PROTEIN, CARBS, VEGETABLES, FRUITS, DAIRY, GRAINS, DESSERTS, BEVERAGES

Focus on accuracy of nutritional data.
```

## Prompt 2: Generate Exercises JSON

```
I need a complete JSON database of gym exercises for a fitness app.

Requirements:
1. 100 exercises covering all muscle groups
2. Muscle groups: CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, QUADRICEPS, HAMSTRINGS, GLUTES, ABS, CALVES
3. Each exercise needs: id, name_en, name_ar, primary_muscle, secondary_muscles[], equipment[], difficulty, instructions_en[], instructions_ar[], tips_en[], default_sets, default_reps

Equipment options: BARBELL, DUMBBELLS, CABLES, MACHINES, BODYWEIGHT, KETTLEBELL

Please output as valid JSON array.
```

## Prompt 3: Generate Workout Plans JSON

```
I need 10 pre-built workout plans for a fitness app.

Plans needed:
1. Beginner Full Body (3 days, 4 weeks)
2. Push/Pull/Legs (6 days, 8 weeks)
3. Upper/Lower (4 days, 8 weeks)
4. Home Bodyweight (4 days, 6 weeks)
5. Women's Glute Focus (4 days, 8 weeks)
6. Muscle Building (5 days, 12 weeks)
7. Fat Loss Circuit (4 days, 6 weeks)
8. Strength Focus (4 days, 12 weeks)
9. Athletic Performance (5 days, 8 weeks)
10. Calisthenics (4 days, 12 weeks)

Each plan needs: name, name_ar, description, difficulty, goal, duration_weeks, days_per_week, workouts[] with exercises

Output as valid JSON array.
```

---

# 12. ROADMAP

## Phase 1: MVP (Current)
- [x] User auth
- [x] Database schema
- [x] API deployment
- [x] Web deployment
- [ ] Egyptian food database (use Gemini)
- [ ] Exercise database (use Gemini)
- [ ] Fix profile to show real data

## Phase 2: Core Features
- [ ] Workout tracking
- [ ] Meal logging
- [ ] Progress photos
- [ ] Weight tracking
- [ ] Basic stats

## Phase 3: Engagement
- [ ] Achievements
- [ ] Streaks
- [ ] Leaderboards
- [ ] Social sharing

## Phase 4: Premium
- [ ] AI coach (Gemini)
- [ ] Trainer marketplace
- [ ] Video analysis
- [ ] Payment system

## Phase 5: Mobile
- [ ] Expo app
- [ ] Push notifications
- [ ] Offline mode

---

# APPENDIX: Environment Variables

## Railway (Production)
```
DATABASE_URL=postgresql://postgres.dfztxvbdruksednaucdq:RHvw5Xw4IyD3xouY@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.dfztxvbdruksednaucdq:RHvw5Xw4IyD3xouY@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=forma-jwt-secret-key-change-this
NODE_ENV=production
PORT=3001
```

## Vercel (Production)
```
NEXT_PUBLIC_API_URL=https://forma-api-production.up.railway.app/api
```

---

**Last Updated:** February 3, 2026
**Version:** 1.0.0
**Author:** Forma Development Team
