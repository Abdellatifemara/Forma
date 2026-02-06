# AI Feature Research Survey Templates

## Survey 1: AI Value Perception Survey

**Target**: All users with 1+ week of app usage
**Goal**: Understand expected value of AI features

### Questions

1. **How often do you expect to use AI coaching features?**
   - Daily
   - Few times a week
   - Weekly
   - Few times a month
   - Rarely

2. **What type of AI assistance would be most valuable to you?**
   (Select up to 3)
   - [ ] Workout recommendations
   - [ ] Nutrition advice
   - [ ] Form checking
   - [ ] Progress analysis
   - [ ] Motivation/accountability
   - [ ] Injury prevention tips

3. **How many AI questions per month would make you feel the feature is valuable?**
   - 5 or fewer
   - 10-15
   - 20-30
   - 30-50
   - Unlimited (50+)

4. **At 79 EGP/month (Premium), how many AI questions would you expect?**
   - 5
   - 10
   - 20
   - 30
   - Unlimited

5. **Would you pay 449 EGP/month (Premium+) for unlimited AI access plus personal trainer?**
   - Definitely yes
   - Probably yes
   - Not sure
   - Probably no
   - Definitely no

---

## Survey 2: AI Satisfaction Survey (Post-Query)

**Target**: Users immediately after AI interaction
**Goal**: Measure query-level satisfaction

### Questions

1. **Did the AI answer help you?**
   - Very helpful (5)
   - Helpful (4)
   - Somewhat helpful (3)
   - Not very helpful (2)
   - Not helpful at all (1)

2. **How accurate was the information?**
   - Very accurate
   - Mostly accurate
   - Somewhat accurate
   - Inaccurate
   - Don't know

3. **Will you use this advice?**
   - Definitely
   - Probably
   - Maybe
   - Probably not
   - No

4. **What would have made this answer better?** (Optional, open text)

---

## Survey 3: Limit Hit Experience Survey

**Target**: Users who hit their monthly AI limit
**Goal**: Understand frustration and upgrade motivation

### Questions

1. **You've reached your monthly AI question limit. How does this make you feel?**
   - Very frustrated
   - Somewhat frustrated
   - Neutral
   - Understanding
   - Fine, I've asked enough

2. **What will you do now?**
   - Wait for reset
   - Upgrade to get more questions
   - Search online instead
   - Stop using AI features
   - Other

3. **How many more questions would you have wanted to ask this month?**
   - 1-5
   - 5-10
   - 10-20
   - 20+

4. **Would you upgrade to Premium+ (449 EGP/month) for unlimited AI?**
   - Yes, I'm upgrading now
   - Maybe later
   - Too expensive
   - No, don't need unlimited

---

## Survey 4: Upgrade Decision Survey

**Target**: Users who upgraded from FREE or PREMIUM
**Goal**: Understand upgrade motivations

### Questions

1. **What was the main reason you upgraded?**
   - More AI questions
   - AI form checker
   - AI workout generator
   - Personal trainer access
   - All premium features
   - Other

2. **How important was the AI feature limit in your decision?**
   - Very important (main reason)
   - Important (one of top reasons)
   - Somewhat important
   - Not very important
   - Not a factor

3. **Did you feel the FREE/PREMIUM AI limit was too restrictive?**
   - Way too restrictive
   - Somewhat restrictive
   - About right
   - Not restrictive

4. **At what price point would you consider the upgrade not worth it?**
   - Current price is fine
   - 500 EGP would be too much
   - 600 EGP would be too much
   - 700+ EGP would be too much

---

## Survey 5: Churn Prevention Survey

**Target**: Users who cancelled or stopped using the app
**Goal**: Understand if AI limits contributed to churn

### Questions

1. **Why did you stop using Forma?**
   (Select all that apply)
   - [ ] Too expensive
   - [ ] Not enough features
   - [ ] AI limits too restrictive
   - [ ] Found a better app
   - [ ] Achieved my goals
   - [ ] Life circumstances
   - [ ] Other

2. **If AI was a factor, what would have made you stay?**
   - More free AI questions
   - Lower price for unlimited AI
   - Better AI quality
   - Nothing, AI wasn't the issue

3. **What would bring you back?**
   - Lower prices
   - More free features
   - Better AI
   - Nothing, moved on
   - Other

---

## Survey 6: Feature Prioritization Survey

**Target**: Premium users
**Goal**: Understand which AI features to prioritize

### Questions

1. **Rank these AI features by importance (1 = most important):**
   - AI Coach (Q&A)
   - AI Form Checker
   - AI Workout Generator
   - AI Meal Planner
   - AI Progress Insights

2. **Which feature would make you upgrade to Premium+?**
   (Select one)
   - Unlimited AI Coach
   - AI Form Checker (video analysis)
   - AI Workout Generator
   - Personal trainer matching
   - None of these

3. **If you could only have ONE AI feature, which would it be?**
   - Open text

---

## Implementation Notes

### Survey Triggers

| Survey | Trigger Event |
|--------|---------------|
| Value Perception | 7 days after signup |
| Satisfaction | After each AI query (10% sample) |
| Limit Hit | When user hits monthly limit |
| Upgrade Decision | 3 days after upgrading |
| Churn Prevention | When user cancels or 30 days inactive |
| Feature Priority | 30 days after Premium subscription |

### Sample Sizes Needed

| Survey | Minimum Sample | Statistical Power |
|--------|----------------|-------------------|
| Value Perception | 200 | 80% |
| Satisfaction | 500 | 90% |
| Limit Hit | 100 | 70% |
| Upgrade Decision | 50 | 70% |
| Churn Prevention | 100 | 70% |
| Feature Priority | 150 | 80% |

### Data Collection Period

- **Phase 1 (Month 1-2)**: Deploy surveys 1, 2, 3
- **Phase 2 (Month 2-3)**: Add surveys 4, 5
- **Phase 3 (Month 3-4)**: Deploy survey 6, analyze all data

### Key Metrics to Extract

1. Expected queries/month by user segment
2. Correlation between limit frustration and churn
3. Upgrade conversion rate at limit hit
4. Feature priority ranking for roadmap
5. Price sensitivity for Premium+
