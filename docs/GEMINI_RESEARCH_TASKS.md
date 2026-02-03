# Gemini Research Tasks for Forma App

Use Gemini to generate this data. Copy each section and ask Gemini to create JSON data.

---

## 1. EGYPTIAN FOODS DATABASE (Priority: HIGH)

### Prompt for Gemini:
```
Create a JSON array of 100 Egyptian foods with nutritional data. Include:
- Traditional Egyptian dishes (Koshari, Foul Medames, Molokhia, etc.)
- Egyptian street foods
- Common Egyptian ingredients
- Egyptian breakfast items
- Egyptian desserts

Each food should have:
{
  "name": "English name",
  "nameAr": "Arabic name",
  "category": "PROTEIN|CARBS|VEGETABLES|FRUITS|DAIRY|GRAINS|SNACKS|DESSERTS|BEVERAGES",
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fat": number (grams per 100g),
  "fiber": number (grams per 100g),
  "servingSize": number,
  "servingUnit": "g|ml|piece|cup",
  "isEgyptian": true,
  "description": "Brief description"
}
```

### Foods to Include:
- Koshari, Foul Medames, Ta'ameya (Falafel), Molokhia
- Mahshi (stuffed vegetables), Kofta, Shawarma
- Ful Medames, Fatta, Hawawshi
- Basbousa, Konafa, Om Ali, Feteer
- Egyptian bread (Aish Baladi, Aish Shami)
- Egyptian cheeses (Gibna Domyati, Mish)
- Sugarcane juice, Hibiscus (Karkade), Sahlab

---

## 2. INTERNATIONAL FOODS DATABASE (Priority: MEDIUM)

### Prompt for Gemini:
```
Create a JSON array of 200 common international foods with nutritional data:
- Proteins (chicken, beef, fish, eggs, legumes)
- Carbs (rice, pasta, bread, potatoes)
- Vegetables (all common ones)
- Fruits (all common ones)
- Dairy (milk, yogurt, cheese)
- Snacks and processed foods

Same JSON structure as Egyptian foods but with "isEgyptian": false
```

---

## 3. EXERCISES DATABASE (Priority: HIGH)

### Prompt for Gemini:
```
Create a JSON array of exercises for each muscle group. Include:

MUSCLE GROUPS:
- CHEST (15 exercises)
- BACK (15 exercises)
- SHOULDERS (12 exercises)
- BICEPS (10 exercises)
- TRICEPS (10 exercises)
- LEGS (20 exercises - quads, hamstrings, calves)
- CORE (15 exercises)
- GLUTES (10 exercises)

Each exercise should have:
{
  "name": "Exercise name",
  "nameAr": "Arabic name",
  "muscleGroup": "CHEST|BACK|SHOULDERS|BICEPS|TRICEPS|LEGS|CORE|GLUTES",
  "secondaryMuscles": ["array of secondary muscles worked"],
  "equipment": "BARBELL|DUMBBELL|CABLE|MACHINE|BODYWEIGHT|RESISTANCE_BAND|KETTLEBELL",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "tips": ["Tip 1", "Tip 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "targetReps": "8-12",
  "targetSets": 3
}
```

---

## 4. WORKOUT PLANS (Priority: HIGH)

### Prompt for Gemini:
```
Create 10 pre-built workout plans:

1. Beginner Full Body (3 days/week, 4 weeks)
2. Intermediate Push/Pull/Legs (6 days/week, 8 weeks)
3. Advanced Powerlifting (4 days/week, 12 weeks)
4. Home Bodyweight Only (4 days/week, 6 weeks)
5. Women's Glute Focus (4 days/week, 8 weeks)
6. Muscle Building Hypertrophy (5 days/week, 12 weeks)
7. Fat Loss Circuit Training (4 days/week, 6 weeks)
8. Upper/Lower Split (4 days/week, 8 weeks)
9. Athletic Performance (5 days/week, 8 weeks)
10. Calisthenics Progression (4 days/week, 12 weeks)

Each plan should have:
{
  "name": "Plan name",
  "nameAr": "Arabic name",
  "description": "What this plan achieves",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "goal": "MUSCLE_GAIN|FAT_LOSS|STRENGTH|ENDURANCE|ATHLETIC",
  "durationWeeks": number,
  "daysPerWeek": number,
  "equipment": ["required equipment"],
  "workouts": [
    {
      "dayNumber": 1,
      "name": "Day name (e.g., Push Day)",
      "exercises": [
        {
          "exerciseName": "Exercise name",
          "sets": 3,
          "reps": "8-12",
          "restSeconds": 90
        }
      ]
    }
  ]
}
```

---

## 5. PRE-GENERATED AI RESPONSES (Priority: HIGH)

### For "Offline AI" - Free Tier

#### Workout Tips (50 tips):
```
Generate 50 workout tips for beginners covering:
- Form and technique
- Progressive overload
- Recovery
- Nutrition timing
- Common mistakes

Format: JSON array of { "category": "...", "tip": "...", "tipAr": "..." }
```

#### Nutrition Tips (50 tips):
```
Generate 50 nutrition tips covering:
- Egyptian diet optimization
- Protein intake
- Meal timing
- Hydration
- Healthy Egyptian alternatives

Format: JSON array
```

#### Motivational Quotes (30 quotes):
```
Generate 30 fitness motivational quotes in English and Arabic
Format: JSON array of { "quote": "...", "quoteAr": "...", "author": "..." }
```

#### FAQ Responses (30 questions):
```
Generate 30 common fitness FAQ with answers:
- How much protein do I need?
- Should I do cardio before or after weights?
- How often should I work out?
- Best time to work out?
- How to break a plateau?
etc.

Format: JSON array of { "question": "...", "questionAr": "...", "answer": "...", "answerAr": "..." }
```

---

## 6. PREMIUM AI FEATURES (Future)

These will use real-time Gemini API:
- Personalized workout recommendations based on user data
- Custom meal plans based on goals and preferences
- Form check analysis (with video)
- Progress analysis and predictions
- Interactive coaching conversations

---

## HOW TO USE THIS DATA

1. Ask Gemini to generate each section as JSON
2. Save the JSON files in `apps/api/prisma/seed-data/`
3. Create seed scripts to load into database
4. Run `npx prisma db seed` to populate database

---

## FILE STRUCTURE FOR SEED DATA

```
apps/api/prisma/
├── seed-data/
│   ├── foods-egyptian.json
│   ├── foods-international.json
│   ├── exercises.json
│   ├── workout-plans.json
│   ├── tips-workout.json
│   ├── tips-nutrition.json
│   ├── quotes.json
│   └── faq.json
├── seed.ts (main seed script)
└── schema.prisma
```

---

## PRIORITY ORDER

1. Egyptian Foods (investor demo - show local relevance)
2. Exercises (core functionality)
3. Workout Plans (user engagement)
4. Pre-generated tips (offline AI feature)
5. International Foods (expand database)
6. Premium AI integration (future phase)
