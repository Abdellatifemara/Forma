# FITSTN Competitor Analysis & Forma Roadmap

## What FITSTN Does Well (Manual, 1 Coach)
- Personal touch with Coach Ahmed Elbasuony
- Medical supervision integration
- Structured follow-up system (daily/weekly)
- Video calls and meetings
- Clear tier differentiation

## What Forma Does Better (Scalable, Multi-Trainer)
- AI-powered workout generation
- Automatic PDF parsing to programs
- 2800+ exercise database
- Scalable for 100s of trainers
- Real-time chat (WhatsApp-like)
- Arabic + English bilingual

---

## Priority Features to Add

### Phase 1: Match Their Core (2-3 weeks)
1. **Workout Videos Integration**
   - Link exercises to YouTube/uploaded videos
   - Auto-play in workout view
   - Schema: Add `videoUrl` to Exercise model

2. **Food/Workout Alternatives**
   - AI-powered suggestions
   - "Swap this exercise" button
   - "Swap this food" with similar macros

3. **Automated Check-ins**
   - Daily notification: "How was your workout?"
   - Weekly progress quiz
   - Auto-generate compliance reports for trainer

4. **Program Auto-Updates**
   - Progressive overload suggestions
   - Deload week detection
   - "Your program updated" notifications

### Phase 2: Beat Them (3-4 weeks)
5. **Video Calls Integration**
   - Daily.co or Twilio integration
   - Schedule calls in app
   - Call history and notes

6. **Medical Supervision Module**
   - Blood work tracking
   - Health metrics (BP, glucose, etc.)
   - Doctor notes section
   - Medication reminders

7. **Group Sessions**
   - Trainer can host live group workouts
   - Screen share for form checks
   - Record and save sessions

8. **Onboarding Call System**
   - Auto-schedule post-registration call
   - Call checklist for trainers
   - Client questionnaire before call

### Phase 3: Dominate (1-2 months)
9. **AI Coach Assistant**
   - Answer common questions automatically
   - Suggest adjustments based on progress
   - Natural language: "I'm tired today" → lighter workout

10. **Gamification**
    - Streak tracking
    - Achievement badges
    - Leaderboards (opt-in)
    - Monthly challenges

11. **Smart Notifications**
    - "You haven't logged food today"
    - "Rest day tomorrow, eat at maintenance"
    - "Great week! You hit all workouts"

12. **White-Label for Gyms**
    - Custom branding
    - Gym-specific exercise library
    - Multi-trainer management

---

## Quick Wins (This Week)
- [ ] Add workout video URLs to exercises
- [ ] "Swap exercise" with similar muscle group
- [ ] Daily check-in notification
- [ ] Progress photos comparison view
- [ ] Export program as PDF (like they do, but auto-generated)

## Database Changes Needed
```prisma
// Add to Exercise
videoUrl     String?
videoSource  String? // youtube, vimeo, cloudinary

// Add to User
lastCheckIn  DateTime?
streakDays   Int @default(0)

// New model
model HealthMetric {
  id        String   @id @default(cuid())
  userId    String
  type      String   // weight, blood_pressure, glucose, etc.
  value     Float
  unit      String
  date      DateTime
  notes     String?
  user      User     @relation(fields: [userId], references: [id])
}

// New model
model ScheduledCall {
  id          String   @id @default(cuid())
  trainerId   String
  clientId    String
  scheduledAt DateTime
  duration    Int      // minutes
  type        String   // onboarding, followup, checkup
  status      String   // scheduled, completed, cancelled
  notes       String?
  recordingUrl String?
}
```

---

## The Big Difference

**FITSTN** = 1 coach, manual everything, doesn't scale
**Forma** = Platform for 1000s of trainers, AI-powered, scales infinitely

They charge for the personal touch.
We automate the personal touch at scale.
