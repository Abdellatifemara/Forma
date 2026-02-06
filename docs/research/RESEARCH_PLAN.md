# AI Feature Research Plan

## Executive Summary

This research plan validates our AI feature limits and pricing strategy for Premium (79 EGP/mo) vs Premium+ (449 EGP/mo).

**Key Questions:**
1. Are 20 AI queries/month enough for Premium users?
2. What's the optimal limit before frustration?
3. Does the limit drive upgrades or churn?
4. Which AI features justify Premium+ pricing?

---

## Research Timeline

```
Month 1                    Month 2                    Month 3
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Setup & Initial Data     │ Deep Analysis            │ Decisions & Iteration    │
│                          │                          │                          │
│ • Deploy analytics       │ • Survey analysis        │ • Finalize limits        │
│ • Launch survey 1-3      │ • A/B test limits        │ • Implement changes      │
│ • Begin tracking         │ • Competitor research    │ • Monitor impact         │
│ • Baseline metrics       │ • User interviews        │ • Report findings        │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## Study 1: Query Frequency Tracking

### Objective
Understand how often users naturally use AI features.

### Methodology
- Track all AI queries in analytics table
- Segment by: tier, user type (beginner/intermediate/advanced), goal
- Duration: 3 months continuous

### Metrics
- Average queries/week per tier
- Median queries/month
- 95th percentile usage
- Time between queries
- Query frequency decay (week 1 vs week 4)

### Implementation

```typescript
// Track each AI query
interface AIQueryEvent {
  userId: string;
  tier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
  userType: 'beginner' | 'intermediate' | 'advanced';
  queryType: string;
  timestamp: Date;
  responseTime: number;
  userSatisfaction?: number;
}
```

### Expected Outcomes
- FREE users: 2-5 queries/month (limited)
- PREMIUM users: 10-25 queries/month
- PREMIUM+ users: 30-50 queries/month

---

## Study 2: Query Type Analysis

### Objective
Identify which query types provide most value.

### Methodology
- Categorize all queries: workout, nutrition, form, progress, general
- Track satisfaction rating per category
- Correlate with retention and upgrade

### Metrics
- Query distribution by category
- Satisfaction score by category
- Retention correlation by category
- NPS impact by category

### Expected Outcomes
| Category | % of Queries | Avg Satisfaction | Retention Impact |
|----------|--------------|------------------|------------------|
| Workout | 35% | 4.2/5 | High |
| Nutrition | 30% | 3.8/5 | Medium |
| Form | 15% | 4.5/5 | High |
| Progress | 10% | 3.5/5 | Medium |
| General | 10% | 3.0/5 | Low |

---

## Study 3: Drop-off Analysis

### Objective
Understand user behavior when hitting limits.

### Methodology
- Track users who hit their monthly limit
- Follow their behavior for 30 days
- Segment by tier and usage pattern

### Metrics
- Limit hit rate per tier
- Days from signup to first limit hit
- Post-limit behavior (upgrade/wait/churn)
- Time to upgrade decision
- Churn rate after limit hit

### Key Questions
1. What % of users hit their limit?
2. How many days before they hit it?
3. What % upgrade vs wait vs churn?
4. Is there a "magic number" of queries that triggers upgrade?

### Implementation

```typescript
// Track limit hit events
interface LimitHitEvent {
  userId: string;
  tier: 'FREE' | 'PREMIUM';
  queriesUsed: number;
  daysSinceSignup: number;
  daysSinceLastQuery: number;
}

// Track post-limit behavior
interface PostLimitBehavior {
  userId: string;
  action: 'upgraded' | 'waited' | 'churned';
  daysToAction: number;
  newTier?: string;
}
```

---

## Study 4: Competitor Benchmarking

### Objective
Understand market expectations for AI features.

### Methodology
- Analyze competitors: MyFitnessPal, Fitbod, Noom, etc.
- Document their AI features and limits
- Review app store reviews for AI feedback
- Compare pricing

### Competitors to Analyze

| App | Monthly Price | AI Features | Limits |
|-----|---------------|-------------|--------|
| MyFitnessPal | $19.99 | Meal suggestions | Unlimited |
| Fitbod | $12.99 | Workout AI | Unlimited |
| Noom | $59/mo | Coach chat | Daily |
| Freeletics | $9.99/mo | AI workouts | Unlimited |
| Future | $149/mo | Human + AI | Unlimited |

### Key Questions
1. What AI limits are industry standard?
2. Do competitors limit AI or make it unlimited?
3. What's the price point for unlimited AI?
4. How do users review competitor AI limits?

---

## Study 5: Value Perception Survey

### Objective
Understand user expectations for AI query limits.

### Methodology
- Survey users after 7 days of usage
- Ask about expected value and willingness to pay
- Segment by usage level

### Sample Size
- Minimum: 200 responses
- Target: 400 responses
- Duration: 6 weeks

### Key Survey Questions
See `SURVEY_TEMPLATES.md` Survey #1

### Analysis Plan
1. Calculate expected queries/month distribution
2. Segment by user type
3. Compare expectation vs reality
4. Identify "acceptable" limit range

---

## Study 6: A/B Test - Limit Levels

### Objective
Test different limit levels for conversion impact.

### Methodology
- A/B test Premium limit: 15 vs 20 vs 30 queries
- Measure: conversion rate, satisfaction, churn
- Duration: 6 weeks minimum

### Test Groups

| Group | Premium Limit | Sample Size |
|-------|---------------|-------------|
| A (Control) | 20/month | 500 |
| B | 15/month | 500 |
| C | 30/month | 500 |

### Metrics
- Upgrade rate (Premium → Premium+)
- Churn rate
- Satisfaction score
- Revenue per user

### Success Criteria
- Optimal limit has highest: (Upgrade Rate + Satisfaction) / Churn Rate

---

## Study 7: Cost Analysis

### Objective
Understand unit economics of AI features.

### Methodology
- Calculate cost per AI query
- Project costs at different usage levels
- Model margin impact of limit changes

### Variables
- AI API cost per query: ~$0.002-0.01
- Infrastructure overhead: ~20%
- User queries/month at each tier

### Model

```
Tier        | Limit | Avg Usage | Cost/User/Mo | Revenue | Margin
------------|-------|-----------|--------------|---------|-------
FREE        |   3   |    2      | $0.02        | $0      | -$0.02
PREMIUM     |  20   |   12      | $0.12        | $1.60   | $1.48
PREMIUM+    | Unlim |   40      | $0.40        | $9.15   | $8.75
```

### Break-even Analysis
- At what usage level does Premium become unprofitable?
- What's the max cost we can sustain for FREE tier?

---

## Study 8: Technical Feasibility - Offline AI

### Objective
Evaluate feasibility of offline/cached AI for cost reduction.

### Research Questions
1. Can we cache common Q&A to reduce API calls?
2. What's the cache hit rate for fitness queries?
3. Can we run a small model on-device?
4. What's the quality trade-off?

### Phases

**Phase A: Query Clustering**
- Analyze query logs for common patterns
- Identify cacheable query categories
- Estimate cache hit rate

**Phase B: Local Model Evaluation**
- Test TensorFlow Lite models for form checking
- Evaluate quality vs cloud AI
- Measure device requirements

**Phase C: Hybrid Architecture**
- Design cached + cloud hybrid
- A/B test quality perception
- Measure cost reduction

---

## Decision Framework

After research completion, use this framework:

### Limit Decision Matrix

| If Research Shows... | Then... |
|---------------------|---------|
| 20 queries = 80%+ satisfied | Keep at 20 |
| 20 queries = <70% satisfied | Increase to 30 |
| High limit hit → upgrade rate | Keep limits tight |
| High limit hit → churn rate | Relax limits |
| Competitors unlimited | Consider unlimited for Premium+ |

### Price Decision Matrix

| If Research Shows... | Then... |
|---------------------|---------|
| Premium value = high | Keep at 79 EGP |
| Premium+ upgrade = low | Reduce Premium+ price |
| AI main upgrade driver | Consider AI-only tier |
| Personal trainer = main driver | Emphasize coaching more |

---

## Resources Needed

### Team
- Product Manager: 20% time
- Data Analyst: 40% time
- Backend Engineer: 20% time (analytics setup)
- UX Designer: 10% time (surveys)

### Tools
- Analytics: Mixpanel or Amplitude
- Surveys: Typeform or in-app
- A/B Testing: LaunchDarkly or custom
- Data Analysis: Python/Jupyter

### Budget
- Analytics tool: $0-500/month
- Survey tool: $0-100/month
- AI API costs for testing: ~$100
- Total: ~$200-700/month

---

## Timeline & Milestones

### Week 1-2: Setup
- [ ] Deploy analytics tracking
- [ ] Create survey templates
- [ ] Set up A/B test infrastructure

### Week 3-6: Data Collection (Phase 1)
- [ ] Launch surveys 1-3
- [ ] Begin query tracking
- [ ] Competitor research

### Week 7-10: Analysis (Phase 2)
- [ ] Analyze initial data
- [ ] Run A/B tests
- [ ] User interviews (5-10)

### Week 11-12: Decisions (Phase 3)
- [ ] Compile findings
- [ ] Make limit recommendations
- [ ] Plan implementation

---

## Success Metrics

Research is successful if we can confidently answer:

1. **Optimal Limit**: What's the ideal Premium limit?
   - Target: +/- 5 queries confidence

2. **Upgrade Motivation**: What drives Premium → Premium+ upgrades?
   - Target: Top 3 reasons identified

3. **Churn Prevention**: How to reduce limit-related churn?
   - Target: Actionable strategies identified

4. **Pricing Validation**: Is Premium+ priced correctly?
   - Target: Price elasticity understood

---

## Appendix: Query Tracking Schema

```sql
CREATE TABLE ai_usage_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR(20),
  query_type VARCHAR(50),
  query_text TEXT,
  response_text TEXT,
  response_time_ms INTEGER,
  satisfaction_rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user ON ai_usage_events(user_id);
CREATE INDEX idx_ai_usage_tier ON ai_usage_events(tier);
CREATE INDEX idx_ai_usage_date ON ai_usage_events(created_at);
```
