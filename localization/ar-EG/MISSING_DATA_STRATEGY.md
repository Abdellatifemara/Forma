# Missing Data Strategy: Egyptian Market Specifics

To compete with global apps, we need hyper-local data that they don't have.

## 1. The "Egyptian Pantry" (Missing Ingredients)
*Claude provided dishes, but we need raw ingredients for the AI Meal Generator.*

**Action Item:** Create a dataset of 500+ raw items found in:
- **Local Markets (Souq):**
  - Baladi Bread (different weights/sizes)
  - Roumy Cheese (Old vs New)
  - Areesh Cheese (Low fat vs Full fat)
  - Pickles (Turshi) - Sodium content is key
  - Feteer (Meshaltet vs Oven)

- **Supermarkets (Seoudi/Metro/Carrefour):**
  - Specific brands of Tuna (Sunshine, Americana)
  - Local Pasta brands (Regina, El Maleka)
  - Local Rice brands (El Doha)
  - Frozen Vegetables (Giardino, Montana)

**Why?** So the AI can say "Use half a bag of Giardino Okra" instead of "200g Okra".

## 2. Supplements Database (The "Real" Market)
*We need a scraped or curated list of what is actually on shelves in Egypt.*

**Target Stores to Index:**
- Max Muscle
- The Body Company
- TSS (The Supplement Shop)
- Pharmacies (El Ezaby, Seif)

**Data Points Needed:**
- **Product Name:** e.g., "MuscleAdd Whey Add"
- **Flavor:** "Sobya", "Sahlab" (Local flavors are key differentiators)
- **Price History:** To show "Good Deal" badges.
- **Verification:** Is it NFSA (National Food Safety Authority) registered?

## 3. Exercise Visuals & Graphs
*Text descriptions aren't enough.*

**Requirement:**
For every exercise in `exercise-library-complete-arabic.md`, we need:
1. **Muscle Heatmap:** An SVG overlay showing Primary (Red) and Secondary (Orange) muscles.
2. **Force Curve Graph:** A simple line graph showing where the exercise is hardest (Bottom vs Top).
   - *Example:* Bicep Curl is hardest in the middle. Squat is hardest at the bottom.
   - *Value:* Shows users "Science-based" training.

## 4. Native Arabic "Vibe" Check
*The UI strings are good, but the AI generation needs tuning.*

**Missing Nuance:**
- **Motivation:** Needs to vary by user age. A 20yo wants "Beast Mode" (عاش يا وحش), a 40yo wants "Health & Longevity" (صحتك بالدنيا).
- **Food Swaps:** If a user says "I can't afford Salmon", the AI must immediately suggest "Mackerel" or "Tuna" available in Egypt, not "Tilapia" (unless macros match).

## 5. Video Generation Prompts
*We need to write the prompts NOW so we are ready for the AI video tools.*

**Prompt Structure for Database:**
`[Lighting] [Camera Angle] [Subject] [Action] [Environment] [Style]`

**Examples:**
- **Squat:** "Cinematic lighting, side profile view, Egyptian male athlete in black shorts, performing barbell back squat with perfect depth, modern gym background, 4k resolution."
- **Pushup:** "Soft daylight, 45-degree angle top-down, female fitness model, performing pushup on yoga mat, living room background, high detail."

## 6. Execution Plan

1. **Scraping Script:** Write a Python script to scrape nutrition facts from Egyptian supermarket websites (Carrefour.eg).
2. **Crowdsourcing:** Build a simple internal tool for trainers to input "Street Food" macros (e.g., "How much protein in a Zizo liver sandwich?").
3. **SVG Generation:** Use a base body SVG and programmatically color muscles based on the `target_muscles` array in the database.
```