# FitApp Calculation Formulas Master Reference

## Scientific Foundations for Calorie and Macro Calculations

**Last Updated:** January 2026
**Sources:** NIH, ISSN, American Council on Exercise, Peer-reviewed literature

---

## 1. BASAL METABOLIC RATE (BMR) FORMULAS

### 1.1 Mifflin-St Jeor Equation (RECOMMENDED - Most Accurate)

**Scientific Validation:** Predicts BMR within 10% of measured values in 82% of cases. Validated in 2024 study showing 50.4% of measurements within ±10% of indirect calorimetry (gold standard).

**Formula:**
```
Men:    BMR = (10 × weight[kg]) + (6.25 × height[cm]) - (5 × age[years]) + 5
Women:  BMR = (10 × weight[kg]) + (6.25 × height[cm]) - (5 × age[years]) - 161
```

**Example Calculation (80kg male, 180cm, 30 years):**
```
BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5
BMR = 800 + 1125 - 150 + 5
BMR = 1780 kcal/day
```

**Source:** [Mifflin-St Jeor Original Study (1990)](https://pubmed.ncbi.nlm.nih.gov/15883556/)

---

### 1.2 Harris-Benedict Equation (Revised 1984)

**Scientific Validation:** ±14% accuracy. 95% confidence range: ±213 kcal/day (men), ±201 kcal/day (women)

**Original Formula (1919):**
```
Men:    BMR = 66.5 + (13.75 × weight[kg]) + (5.003 × height[cm]) - (6.775 × age[years])
Women:  BMR = 655.1 + (9.563 × weight[kg]) + (1.850 × height[cm]) - (4.676 × age[years])
```

**Revised Formula (Roza & Shizgal, 1984):**
```
Men:    BMR = 88.362 + (13.397 × weight[kg]) + (4.799 × height[cm]) - (5.677 × age[years])
Women:  BMR = 447.593 + (9.247 × weight[kg]) + (3.098 × height[cm]) - (4.330 × age[years])
```

**Source:** [Harris-Benedict Wikipedia](https://en.wikipedia.org/wiki/Harris–Benedict_equation)

---

### 1.3 Katch-McArdle Formula (Best for Lean Individuals)

**Use When:** User knows their body fat percentage. More accurate for athletic/lean individuals.

**Formula:**
```
BMR = 370 + (21.6 × Lean Body Mass[kg])
```

**Calculating Lean Body Mass:**
```
LBM = Total Weight[kg] × (1 - Body Fat Percentage)

Example: 80kg person with 20% body fat
LBM = 80 × (1 - 0.20) = 80 × 0.80 = 64 kg
BMR = 370 + (21.6 × 64) = 370 + 1382.4 = 1752.4 kcal/day
```

**Boer Formula for LBM Estimation (when body fat unknown):**
```
Men:    LBM = (0.407 × weight[kg]) + (0.267 × height[cm]) - 19.2
Women:  LBM = (0.252 × weight[kg]) + (0.473 × height[cm]) - 48.3
```

**Source:** [Katch-McArdle Calculator](https://www.omnicalculator.com/health/bmr-katch-mcardle)

---

### 1.4 BMR Formula Selection Guide

| User Profile | Recommended Formula | Why |
|--------------|---------------------|-----|
| General population | Mifflin-St Jeor | Most validated, best accuracy |
| Athletes with known body fat | Katch-McArdle | Accounts for lean mass |
| Quick estimate needed | Mifflin-St Jeor | Single formula, good accuracy |
| Obese individuals | Mifflin-St Jeor | Validated in obese populations |
| Research/clinical setting | All three + average | Cross-validation |

---

## 2. TOTAL DAILY ENERGY EXPENDITURE (TDEE)

### 2.1 Activity Multipliers (Katch-McArdle)

**Formula:**
```
TDEE = BMR × Activity Multiplier
```

| Activity Level | Multiplier | Description |
|----------------|------------|-------------|
| Sedentary | 1.2 | Little/no exercise, desk job |
| Lightly Active | 1.375 | Light exercise 1-3 days/week |
| Moderately Active | 1.55 | Moderate exercise 3-5 days/week |
| Very Active | 1.725 | Heavy exercise 6-7 days/week |
| Extremely Active | 1.9 | Very heavy exercise, physical job, 2x/day training |

**Example (BMR 1780, moderately active):**
```
TDEE = 1780 × 1.55 = 2759 kcal/day
```

**Accuracy Note:** TDEE calculators produce estimates within 500 kcal/day ~80% of the time, but errors >250 kcal/day occur ~50% of the time. **Recommend users track and adjust.**

**Source:** [ResearchGate - Katch-McArdle Multipliers](https://www.researchgate.net/figure/Katch-McArdle-Multipliers-for-Calculating-TDEE_fig4_337655510)

---

### 2.2 Detailed Activity Classification

| Activity Level | Steps/Day | Exercise Description | Job Type |
|----------------|-----------|---------------------|----------|
| Sedentary | <5,000 | No intentional exercise | Desk/computer work |
| Lightly Active | 5,000-7,499 | Walking, light yoga 1-3x/week | Standing occasionally |
| Moderately Active | 7,500-9,999 | Gym 3-5x/week, 30-60 min | Mix of sitting/standing |
| Very Active | 10,000-12,499 | Intense training 6-7x/week | Active job (waiter, nurse) |
| Extremely Active | >12,500 | 2+ hours training daily | Physical labor (construction) |

---

## 3. CALORIC TARGETS BY GOAL

### 3.1 Weight Loss

**Scientific Guidelines (NIH/NHLBI):**
- Safe rate: 0.5-1 kg (1-2 lbs) per week
- Required deficit: 500-1000 kcal/day
- Initial goal: 10% body weight loss over 6 months

| Goal | Daily Deficit | Weekly Loss | Notes |
|------|---------------|-------------|-------|
| Conservative | 250-300 kcal | ~0.25 kg | Best for muscle retention |
| Moderate | 500 kcal | ~0.5 kg | Recommended starting point |
| Aggressive | 750-1000 kcal | 0.75-1 kg | Only for higher body fat % |

**Formula:**
```
Weight Loss Calories = TDEE - Deficit
Example: 2759 - 500 = 2259 kcal/day
```

**Minimum Calorie Thresholds:**
- Men: Do not go below 1500 kcal/day without medical supervision
- Women: Do not go below 1200 kcal/day without medical supervision

**Source:** [NIH Clinical Guidelines](https://www.ncbi.nlm.nih.gov/books/NBK2009/)

---

### 3.2 Weight/Muscle Gain (Bulking)

**Scientific Guidelines (ISSN):**
- Optimal rate: 0.25-0.5% of body weight per week
- Required surplus: 10-20% above TDEE (200-500 kcal)

| Approach | Surplus | Weekly Gain | Best For |
|----------|---------|-------------|----------|
| Lean Bulk | 200-300 kcal | 0.1-0.2 kg | Minimizing fat gain |
| Moderate Bulk | 300-500 kcal | 0.2-0.35 kg | Balance muscle/fat |
| Aggressive Bulk | 500+ kcal | 0.35+ kg | Underweight/hardgainers |

**Formula:**
```
Bulking Calories = TDEE + Surplus
Example: 2759 + 300 = 3059 kcal/day
```

**Source:** [Stronger By Science](https://www.strongerbyscience.com/is-body-recomposition-possible/)

---

### 3.3 Body Recomposition

**Scientific Evidence:** Possible even for trained individuals with proper approach.

**Requirements:**
- Small caloric deficit: 100-300 kcal below maintenance
- High protein: 2.0-2.4 g/kg/day minimum
- Progressive resistance training
- Adequate sleep (7-9 hours)

**Best Candidates:**
1. Beginners (first 1-2 years training)
2. Returning after layoff (muscle memory)
3. Higher body fat individuals (>20% men, >28% women)
4. Those on performance-enhancing substances

**Formula:**
```
Recomp Calories = TDEE - 100 to 300 kcal
Example: 2759 - 200 = 2559 kcal/day
```

**Key Study:** Young men at 40% energy deficit with 2.4 g/kg protein gained 1.2 kg lean mass while losing 4.8 kg fat.

**Source:** [PMC - Body Recomposition Research](https://pmc.ncbi.nlm.nih.gov/articles/PMC11405322/)

---

## 4. MACRONUTRIENT CALCULATIONS

### 4.1 Protein Requirements by Goal

| Goal | Protein Intake | Notes |
|------|----------------|-------|
| Sedentary Adult | 0.8 g/kg/day | RDA minimum |
| Active Individual | 1.4-2.0 g/kg/day | ISSN recommendation |
| Muscle Building | 1.6-2.2 g/kg/day | Optimal MPS |
| During Caloric Deficit | 2.3-3.1 g/kg/day | Preserve muscle |
| Body Recomposition | 2.4+ g/kg/day | Critical for success |
| Aggressive Fat Loss | >3.0 g/kg/day | May have positive effects |

**Per-Meal Protein:**
- Optimal: 0.25-0.40 g/kg per meal (20-40g absolute)
- Leucine threshold: 700-3000 mg per meal
- Distribution: Every 3-4 hours across day

**Pre-Sleep Protein:** 30-40g casein protein before bed enhances overnight muscle protein synthesis

**Source:** [ISSN Position Stand on Protein](https://pubmed.ncbi.nlm.nih.gov/28642676/)

---

### 4.2 Carbohydrate Requirements by Goal

| Activity Level | Carb Intake | Notes |
|----------------|-------------|-------|
| Sedentary/Low Activity | 2-3 g/kg/day | Maintain blood glucose |
| Moderate Exercise | 3-5 g/kg/day | Support training |
| Endurance Athletes | 6-10 g/kg/day | Maximize glycogen |
| Ultra-Endurance | 8-12 g/kg/day | High volume training |
| Strength/Bodybuilding | 4-7 g/kg/day | Support muscle growth |

**Post-Workout:**
- 0.6-1.0 g/kg within 30 minutes post-exercise
- Continue every 2 hours for 4-6 hours for maximal glycogen replenishment

**Source:** [ISSN Nutrient Timing Position Stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC5596471/)

---

### 4.3 Fat Requirements

| Goal | Fat Intake | Notes |
|------|------------|-------|
| Minimum Health | 0.5-0.6 g/kg/day | Never go below |
| Standard | 0.8-1.0 g/kg/day | General fitness |
| Bulking | 1.0-1.5 g/kg/day | Calorie support |
| Hormone Optimization | 25-35% of calories | Supports testosterone |

**Critical Minimums:**
- Never below 15% of total calories
- Never below 0.5 g/kg/day

**Source:** [ISSN Guidelines](https://www.tandfonline.com/doi/full/10.1186/s12970-017-0189-4)

---

### 4.4 Macro Ratio Templates

**Weight Loss:**
| Macro | Percentage | g/kg Example |
|-------|------------|--------------|
| Protein | 30-40% | 2.0-2.5 g/kg |
| Carbs | 30-40% | 2-3 g/kg |
| Fat | 25-35% | 0.8-1.0 g/kg |

**Muscle Gain (Bulking):**
| Macro | Percentage | g/kg Example |
|-------|------------|--------------|
| Protein | 25-30% | 1.6-2.2 g/kg |
| Carbs | 40-50% | 4-7 g/kg |
| Fat | 25-35% | 1.0-1.5 g/kg |

**Maintenance:**
| Macro | Percentage | g/kg Example |
|-------|------------|--------------|
| Protein | 25-30% | 1.4-2.0 g/kg |
| Carbs | 40-50% | 3-5 g/kg |
| Fat | 25-30% | 0.8-1.0 g/kg |

**Body Recomposition:**
| Macro | Percentage | g/kg Example |
|-------|------------|--------------|
| Protein | 35-40% | 2.4-3.0 g/kg |
| Carbs | 30-40% | 2-4 g/kg |
| Fat | 25-30% | 0.6-1.0 g/kg |

---

## 5. THERMIC EFFECT OF FOOD (TEF)

### 5.1 TEF by Macronutrient

| Macronutrient | Calories/gram | TEF Range | Effective Calories |
|---------------|---------------|-----------|-------------------|
| Protein | 4 | 20-30% | 2.8-3.2 cal/g |
| Carbohydrate | 4 | 5-10% | 3.6-3.8 cal/g |
| Fat | 9 | 0-3% | 8.73-9 cal/g |
| Alcohol | 7 | 10-30% | 4.9-6.3 cal/g |

**Mixed Diet TEF:** ~10% of total caloric intake

**Example:**
```
100 calories of protein → ~75 net calories (25% TEF)
100 calories of carbs → ~92 net calories (8% TEF)
100 calories of fat → ~98 net calories (2% TEF)
```

**Implication for App:** Higher protein diets have a slight metabolic advantage.

**Source:** [The Thermic Effect of Food - PubMed](https://pubmed.ncbi.nlm.nih.gov/31021710/)

---

## 6. METABOLIC ADAPTATION (IMPORTANT FOR PLATEAUS)

### 6.1 What Happens During Weight Loss

| Component | Change | Contribution to Plateau |
|-----------|--------|------------------------|
| BMR Reduction | ~5% decrease | 40% of adaptation |
| NREE Reduction | ~20% decrease | 60% of adaptation |
| Total TEE Decrease | ~15% | After 10% weight loss |
| Adaptive Thermogenesis | ~31% of deficit compensation | Causes plateau |

### 6.2 Practical Implications

**Diet Breaks:**
- Every 8-12 weeks, return to maintenance for 1-2 weeks
- Helps mitigate metabolic adaptation

**Reverse Dieting:**
- After extended deficit, slowly increase calories
- Add 50-100 kcal/week until reaching new maintenance

**Recalculation Schedule:**
- Recalculate TDEE for every 5 kg of weight loss
- Or every 4-6 weeks during active dieting

**Source:** [Metabolic Adaptation in Athletes](https://www.tandfonline.com/doi/full/10.1186/1550-2783-11-7)

---

## 7. HYDRATION CALCULATIONS

### 7.1 Base Water Intake

**Formula (Metric):**
```
Daily Water (Liters) = Body Weight (kg) × 0.033
Example: 80kg × 0.033 = 2.64 L/day
```

**Formula (Imperial):**
```
Daily Water (oz) = Body Weight (lbs) ÷ 2
Example: 176 lbs ÷ 2 = 88 oz/day (~2.6 L)
```

### 7.2 Exercise Adjustments

| Factor | Additional Water |
|--------|------------------|
| Per 30 min exercise | +350-500 ml (12-17 oz) |
| Hot climate | +500-1000 ml/day |
| High altitude | +500 ml/day |
| High protein diet | +250-500 ml/day |

**During Exercise (ACSM Guidelines):**
- 500-600 ml 2 hours before exercise
- 200-300 ml every 15-20 minutes during exercise
- 450-675 ml per 0.5 kg body weight lost

### 7.3 Total Daily Recommendations

| Category | Men | Women |
|----------|-----|-------|
| Sedentary | 3.0 L (101 oz) | 2.2 L (74 oz) |
| Moderately Active | 3.5 L (118 oz) | 2.7 L (91 oz) |
| Very Active | 4.0+ L (135+ oz) | 3.2+ L (108+ oz) |

**Note:** ~20% of water intake typically comes from food.

---

## 8. COMPLETE CALCULATION WORKFLOW

### Step 1: Calculate BMR
```
Use Mifflin-St Jeor (or Katch-McArdle if body fat known)
```

### Step 2: Calculate TDEE
```
TDEE = BMR × Activity Multiplier
```

### Step 3: Determine Caloric Target
```
Weight Loss: TDEE - 500
Maintenance: TDEE
Weight Gain: TDEE + 300
Recomp: TDEE - 200
```

### Step 4: Calculate Macros
```
Protein: [target g/kg] × body weight
Fat: [target g/kg] × body weight × 9 = fat calories
Carbs: (Total calories - protein calories - fat calories) ÷ 4
```

### Step 5: Calculate Water
```
Base: Weight (kg) × 0.033 L
+ Exercise adjustment
+ Climate adjustment
```

---

## 9. SAMPLE CALCULATIONS

### Example 1: 80kg Male, 180cm, 30 years, Moderately Active, Weight Loss Goal

**Step 1 - BMR (Mifflin-St Jeor):**
```
BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 1780 kcal
```

**Step 2 - TDEE:**
```
TDEE = 1780 × 1.55 = 2759 kcal
```

**Step 3 - Caloric Target (500 deficit):**
```
Target = 2759 - 500 = 2259 kcal
```

**Step 4 - Macros:**
```
Protein: 2.2 g/kg × 80 = 176g (704 kcal)
Fat: 0.9 g/kg × 80 = 72g (648 kcal)
Carbs: (2259 - 704 - 648) ÷ 4 = 227g (907 kcal)

Final: 176g P / 227g C / 72g F = 2259 kcal
```

**Step 5 - Water:**
```
Base: 80 × 0.033 = 2.64 L
+ Exercise (1 hour): +0.7 L
Total: 3.34 L/day
```

---

### Example 2: 65kg Female, 165cm, 25 years, Lightly Active, Muscle Gain Goal

**Step 1 - BMR:**
```
BMR = (10 × 65) + (6.25 × 165) - (5 × 25) - 161 = 1370 kcal
```

**Step 2 - TDEE:**
```
TDEE = 1370 × 1.375 = 1884 kcal
```

**Step 3 - Caloric Target (300 surplus):**
```
Target = 1884 + 300 = 2184 kcal
```

**Step 4 - Macros:**
```
Protein: 2.0 g/kg × 65 = 130g (520 kcal)
Fat: 1.0 g/kg × 65 = 65g (585 kcal)
Carbs: (2184 - 520 - 585) ÷ 4 = 270g (1079 kcal)

Final: 130g P / 270g C / 65g F = 2184 kcal
```

---

## 10. APP IMPLEMENTATION RECOMMENDATIONS

### 10.1 Formula Selection Logic
```
if (user.knowsBodyFat && user.isAthletic):
    use Katch-McArdle
else:
    use Mifflin-St Jeor
```

### 10.2 Activity Level Assessment Questions
1. How many days per week do you exercise?
2. What is your typical exercise duration?
3. What is your job type? (sedentary/standing/active/very active)
4. What is your daily step count?

### 10.3 Goal-Based Defaults

| Goal | Deficit/Surplus | Protein | Protein Priority |
|------|-----------------|---------|------------------|
| Lose Weight | -500 | 2.2 g/kg | HIGH |
| Build Muscle | +300 | 2.0 g/kg | HIGH |
| Maintain | 0 | 1.6 g/kg | MEDIUM |
| Recomp | -200 | 2.4 g/kg | CRITICAL |

### 10.4 Recalculation Triggers
- Weight change > 2 kg
- Activity level change
- Goal change
- Every 4 weeks (auto-prompt)

---

## 11. SOURCES AND REFERENCES

1. **Mifflin-St Jeor Validation:** [PubMed 15883556](https://pubmed.ncbi.nlm.nih.gov/15883556/)
2. **Harris-Benedict Equation:** [Wikipedia](https://en.wikipedia.org/wiki/Harris–Benedict_equation)
3. **Katch-McArdle Formula:** [Omni Calculator](https://www.omnicalculator.com/health/bmr-katch-mcardle)
4. **ISSN Protein Position Stand:** [PubMed 28642676](https://pubmed.ncbi.nlm.nih.gov/28642676/)
5. **ISSN Nutrient Timing:** [PMC 5596471](https://pmc.ncbi.nlm.nih.gov/articles/PMC5596471/)
6. **NIH Weight Loss Guidelines:** [NCBI Books NBK2009](https://www.ncbi.nlm.nih.gov/books/NBK2009/)
7. **Body Recomposition Research:** [PMC 11405322](https://pmc.ncbi.nlm.nih.gov/articles/PMC11405322/)
8. **Thermic Effect of Food:** [PubMed 31021710](https://pubmed.ncbi.nlm.nih.gov/31021710/)
9. **Metabolic Adaptation:** [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1186/1550-2783-11-7)
10. **TDEE Activity Multipliers:** [ResearchGate](https://www.researchgate.net/figure/Katch-McArdle-Multipliers-for-Calculating-TDEE_fig4_337655510)

---

*Document compiled for FitApp Egypt - All formulas validated against peer-reviewed scientific literature*
