# AI Feature Strategy for Forma

## Overview

This document outlines the AI feature strategy, including usage limits for each subscription tier and research considerations for making the AI experience "solid" for Premium users.

---

## Current AI Features

| Feature | FREE | PREMIUM | PREMIUM+ |
|---------|------|---------|----------|
| AI Coach (Basic) | 3/month | 10/month | Unlimited |
| AI Coach (Advanced) | - | - | Unlimited |
| AI Form Checker | - | - | Unlimited |
| AI Workout Generator | - | - | Unlimited |
| AI Meal Planning | - | - | Unlimited |
| AI Progress Insights | - | - | Unlimited |

---

## Premium AI Usage Analysis

### What Makes It "Solid" for Premium Users?

For Premium users (79 EGP/month), the AI experience should feel **valuable but limited** - enough to provide real utility without giving away everything.

### Typical User Scenarios

**Scenario 1: New User (First Month)**
- "What exercise targets my shoulders?" (1 query)
- "How do I do a proper deadlift?" (1 query)
- "What should I eat to build muscle?" (1 query)
- "Is my squat form correct?" (can't - Premium+ only)
- Total: 3 queries used in first week

**Scenario 2: Active User (Ongoing)**
- Weekly workout suggestion: 4 queries/month
- Meal questions: 4 queries/month
- Progress questions: 2 queries/month
- Total: ~10 queries/month

### Recommended Minimum Queries for "Solid" Experience

| Usage Pattern | Queries Needed | Current Limit | Gap |
|---------------|----------------|---------------|-----|
| Light user | 5-8/month | 10 | OK |
| Medium user | 15-20/month | 10 | -5 to -10 |
| Heavy user | 30+/month | 10 | -20+ |

**Recommendation**: Increase Premium AI Coach to **20 queries/month** to cover medium users adequately.

---

## Research Questions to Validate

### User Behavior Research (5 studies)

1. **Query Frequency Study**
   - Track how often users actually ask AI questions
   - Measure by user type (beginner, intermediate, advanced)
   - Expected sample: 500 users over 3 months

2. **Query Type Analysis**
   - What categories of questions do users ask?
   - Which queries provide most value (NPS impact)?
   - Data source: Existing AI chat logs

3. **Drop-off Analysis**
   - At what query count do users feel frustrated?
   - When do they upgrade vs. churn?
   - Correlation with limit hitting

4. **Competitor Benchmarking**
   - What do MyFitnessPal, Fitbod, etc. offer?
   - What's the market expectation?

5. **Value Perception Study**
   - Survey: "How many AI queries would you expect for 79 EGP/month?"
   - A/B test: 10 vs 20 vs 30 queries

### Technical Research (3 studies)

1. **Cost Analysis**
   - Cost per query (Gemini API)
   - Margin impact at different limit levels
   - Break-even analysis

2. **Caching Effectiveness**
   - Can we cache common answers to reduce costs?
   - Estimated cache hit rate
   - Impact on perceived AI "freshness"

3. **Offline AI Feasibility**
   - Can we run a small model locally?
   - Device requirements (storage, RAM)
   - Quality trade-offs vs cloud AI

---

## Offline AI Considerations

### What "Offline AI" Could Mean

1. **Pre-cached responses** for common questions (~1000 Q&As)
2. **Downloadable workout suggestions** based on user profile
3. **Local ML model** for form checking (TensorFlow Lite)
4. **Offline meal database** with Egyptian foods

### Requirements for Solid Offline Experience

| Feature | Storage | Complexity | Value |
|---------|---------|------------|-------|
| Cached Q&A | ~5MB | Low | Medium |
| Workout suggestions | ~2MB | Low | High |
| Form checker model | ~50-100MB | High | Very High |
| Meal database | ~10MB | Low | High |

### Recommendation

For Premium users, implement:
- **Phase 1**: Cached Q&A + downloadable workouts (~7MB)
- **Phase 2**: Offline meal suggestions with local food DB (~10MB)
- **Phase 3** (Premium+ only): On-device form checking

---

## Pricing Impact Analysis

### Current Model
- FREE: 0 EGP, 3 AI queries
- PREMIUM: 79 EGP, 10 AI queries
- PREMIUM+: 449 EGP, unlimited AI

### Risk Assessment

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Premium users feel limited | Medium | Increase to 20 queries |
| Premium+ seems too expensive | High | Show clear AI value gap |
| FREE users abuse system | Low | 3 is already very limited |

---

## Implementation Roadmap

### Phase 1: Validate Limits (Month 1-2)
- [ ] Implement query tracking
- [ ] Set up analytics dashboard
- [ ] Run user feedback surveys

### Phase 2: Optimize Experience (Month 2-3)
- [ ] Implement query caching
- [ ] Add "query remaining" UI indicator
- [ ] Create upgrade prompts when limits hit

### Phase 3: Offline AI MVP (Month 3-4)
- [ ] Build cached Q&A database
- [ ] Implement offline workout suggestions
- [ ] Test with 100 beta users

### Phase 4: Advanced Offline (Month 5-6)
- [ ] Research on-device form checking
- [ ] Evaluate TensorFlow Lite models
- [ ] Premium+ beta for form checker

---

## Key Metrics to Track

1. **Query Usage Rate**: queries used / queries available
2. **Limit Hit Rate**: % of users hitting monthly limit
3. **Post-Limit Behavior**: upgrade rate vs churn rate
4. **Query-to-Upgrade Conversion**: queries before upgrade decision
5. **AI NPS**: Satisfaction with AI responses

---

## Summary

For Premium users to have a "solid" AI experience:

1. **Increase limit to 20 queries/month** (from 10)
2. **Add smart caching** to make queries feel unlimited for common questions
3. **Build offline basics** (cached Q&A, downloadable workouts)
4. **Clear value communication** on what Premium+ unlocks

### Research Needed: 8 Total Studies
- 5 user behavior studies
- 3 technical/feasibility studies

### Estimated Research Timeline: 2-3 months

---

## Next Steps

1. Approve increased Premium limit (10 → 20)
2. Start query frequency tracking immediately
3. Begin competitor research this week
4. Plan user surveys for next month
