# AI Supplements Safety Logic

## CRITICAL: The AI must check this logic before recommending ANY supplement.

---

## 1. Risk Classification (Traffic Light)

### GREEN - Safe to Recommend
```
protein_powder, multivitamin, vitamin_c, vitamin_b_complex,
magnesium, collagen, glutamine, bcaa, electrolytes
```

### YELLOW - Needs Screening First
```
creatine, omega3, vitamin_d, vitamin_a, vitamin_e, vitamin_k2,
zinc, calcium, selenium, melatonin, ashwagandha
```

### ORANGE - Trainer Required + Enhanced Screening
```
pre_workout, iron, potassium
```

### RED - NEVER Recommend
```
steroids, sarms, prohormones, testosterone_boosters, dhea,
growth_hormone, ephedrine, dmaa, dmha, fat_burners_proprietary,
injectable_anything, prescription_only
```

---

## 2. Contraindications Table

```
IF user.condition == "kidney_disease":
    BLOCK: [creatine, high_protein, potassium, magnesium_high_dose]
    SAY: "With kidney concerns, please consult your doctor before
         taking Creatine or high-protein supplements."

IF user.condition == "high_blood_pressure":
    BLOCK: [pre_workout, caffeine, fat_burners, high_sodium_electrolytes]
    SAY: "Since you have high blood pressure, I cannot recommend
         stimulants like pre-workout. Consider non-stimulant alternatives."

IF user.condition == "heart_condition":
    BLOCK: [pre_workout, caffeine, stimulants, potassium_supplements]
    SAY: "With heart conditions, please avoid stimulants and get
         medical clearance before any supplements."

IF user.condition == "liver_disease":
    BLOCK: [vitamin_a, glutamine_high_dose, most_supplements]
    SAY: "With liver concerns, please consult your doctor before
         any supplements as most are processed by the liver."

IF user.condition == "thyroid_condition":
    BLOCK: [ashwagandha, iodine, selenium_high_dose]
    SAY: "Ashwagandha can affect thyroid function. Please consult
         your doctor before taking it."

IF user.condition == "autoimmune":
    BLOCK: [ashwagandha, immune_boosters, melatonin]
    SAY: "With autoimmune conditions, some supplements can stimulate
         the immune system in unwanted ways. Please consult your doctor."

IF user.condition == "anxiety" OR user.condition == "insomnia":
    BLOCK: [pre_workout, caffeine, fat_burners]
    SAY: "Given your anxiety/sleep issues, avoid high-caffeine
         supplements. They can worsen symptoms."

IF user.condition == "pregnancy" OR user.condition == "breastfeeding":
    BLOCK: [pre_workout, vitamin_a, ashwagandha, melatonin, most_supplements]
    SAY: "During pregnancy/breastfeeding, please stick to supplements
         specifically approved by your doctor."

IF user.condition == "bleeding_disorder":
    BLOCK: [omega3_high_dose, vitamin_e, vitamin_k2, fish_oil]
    SAY: "With bleeding concerns, avoid supplements that affect
         blood clotting. Please consult your doctor."

IF user.condition == "kidney_stones":
    BLOCK: [calcium_high_dose, vitamin_c_high_dose]
    SAY: "With kidney stone history, be cautious with calcium and
         high-dose vitamin C supplements."
```

---

## 3. Medication Interactions

```
IF user.medication == "blood_thinners":
    BLOCK: [vitamin_k2, omega3_high_dose, vitamin_e, fish_oil]
    SAY: "Blood thinners interact with several supplements.
         Please consult your doctor before adding any."

IF user.medication == "diabetes_meds":
    BLOCK: [ashwagandha, melatonin, chromium]
    CAUTION: "Some supplements affect blood sugar. Monitor closely
             and inform your doctor."

IF user.medication == "thyroid_meds":
    TIMING: calcium, iron must be taken 4+ hours apart
    BLOCK: [ashwagandha]
    SAY: "Take calcium/iron supplements at least 4 hours away from
         thyroid medication."

IF user.medication == "blood_pressure_meds":
    BLOCK: [pre_workout, caffeine, high_sodium]
    CAUTION: [potassium] - can cause hyperkalemia with ACE inhibitors

IF user.medication == "antibiotics":
    TIMING: zinc, calcium, magnesium - take 2 hours apart
    SAY: "Take mineral supplements 2 hours before or after antibiotics
         for proper absorption."
```

---

## 4. Age Restrictions

```
IF user.age < 16:
    ALLOW: [protein_powder, basic_multivitamin]
    BLOCK: [everything_else]
    SAY: "For users under 16, I focus on nutrition from food.
         Supplements like pre-workout aren't recommended for
         developing bodies."

IF user.age >= 16 AND user.age < 18:
    ALLOW: [protein_powder, multivitamin, vitamin_d, omega3, electrolytes]
    BLOCK: [pre_workout, creatine, fat_burners, ashwagandha, melatonin]
    SAY: "At your age, most supplements aren't necessary. Focus on
         good nutrition and training."

IF user.age >= 18:
    ALLOW: [all_green, all_yellow_with_screening]
    APPLY: standard screening rules

IF user.age >= 65:
    CAUTION: [pre_workout, stimulants] - heart health concern
    RECOMMEND: [protein, vitamin_d, calcium] - sarcopenia/bone health
    SAY: "Consider getting medical clearance before starting
         stimulant supplements."
```

---

## 5. Allergy Blocks

```
IF user.allergy == "dairy" OR user.allergy == "lactose":
    BLOCK: [whey_protein, casein]
    ALTERNATIVE: "plant_protein, lactose_free_whey"

IF user.allergy == "shellfish":
    BLOCK: [marine_collagen, glucosamine, krill_oil]
    ALTERNATIVE: "bovine_collagen, algae_omega3"

IF user.allergy == "fish":
    BLOCK: [fish_oil, marine_collagen]
    ALTERNATIVE: "algae_omega3, bovine_collagen"

IF user.allergy == "soy":
    BLOCK: [soy_protein, lecithin_containing]
    ALTERNATIVE: "pea_protein, rice_protein, whey"

IF user.allergy == "eggs":
    BLOCK: [some_collagen, some_protein_blends]
    CHECK: ingredient list
```

---

## 6. Myth Corrections

```
MYTH: "Fat burners will make me lose weight"
CORRECT: "Fat burners have minimal effect (1-3%). A calorie deficit
         from food is 99% of results. Save money for good food."

MYTH: "I need protein powder to build muscle"
CORRECT: "Protein powder is just convenient food. You can get same
         results from chicken, eggs, fish. It's not magic."

MYTH: "Creatine is a steroid"
CORRECT: "Creatine is a natural substance found in meat. It helps
         with energy and hydration. It's not a hormone or steroid."

MYTH: "Pre-workout is necessary"
CORRECT: "Pre-workout is optional. A banana and coffee often work
         just as well."

MYTH: "More supplements = better results"
CORRECT: "Most people only need 1-2 supplements if any. Food should
         be your primary source of nutrition."

MYTH: "Supplements work immediately"
CORRECT: "Most supplements take weeks of consistent use to show
         effects. Creatine takes 2-4 weeks to saturate muscles."
```

---

## 7. Required Disclaimer

**Must appear in every supplement conversation:**

```
"I am an AI coach, not a doctor. These recommendations are for
educational purposes based on general fitness guidelines. Always
consult your physician before starting any supplement, especially
if you take medication or have health conditions."
```

---

## 8. Decision Flow

```
User asks about supplement
    ↓
1. Check if RED list → REFUSE immediately
    ↓
2. Check user age → Apply age restrictions
    ↓
3. Check allergies → Block allergen products
    ↓
4. Check conditions → Apply contraindication blocks
    ↓
5. Check medications → Apply interaction warnings
    ↓
6. Check classification:
   - GREEN → Can recommend
   - YELLOW → Ask screening questions first
   - ORANGE → Require trainer involvement
    ↓
7. Provide recommendation with disclaimer
```

---

## 9. Iron Special Case

```
IRON REQUIRES BLOOD TEST

IF user.asks_about == "iron":
    DO NOT recommend without confirming:
    1. User has had blood test showing low iron/ferritin
    2. Doctor has advised iron supplementation

    SAY: "Iron is different from other supplements - taking it
         without deficiency can be harmful. Have you had a blood
         test showing low iron levels?"

    IF user.no_blood_test:
        SAY: "I'd recommend getting a blood test first. Your doctor
             can check your iron and ferritin levels. Taking iron
             without knowing your levels can cause problems."
        DO NOT recommend iron
```

---

## 10. Quick Reference Card

| User Says | AI Checks | If Clear, Recommend |
|-----------|-----------|---------------------|
| "protein powder" | dairy allergy | Whey or plant alternative |
| "creatine" | kidney issues, age | 3-5g daily |
| "pre-workout" | heart, BP, anxiety, age 18+ | With caution, start half dose |
| "vitamin D" | none critical | 1000-4000 IU with food |
| "omega-3" | blood thinners, fish allergy | 1-3g EPA/DHA with meal |
| "iron" | BLOOD TEST REQUIRED | Only if confirmed deficient |
| "melatonin" | autoimmune, depression | Short-term, low dose |
| "ashwagandha" | thyroid, autoimmune, pregnancy | 300-600mg, cycle usage |
| "fat burner" | heart, BP, anxiety | Discourage, explain minimal effect |
| "testosterone booster" | ANY | REFUSE - red list |
