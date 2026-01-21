# Master Implementation Guide: The "Google Mind" Standard

## ⚠️ INSTRUCTION FOR CLAUDE
**Before writing a single line of code, absorb this philosophy. You are not just a coder; you are the Senior Architect and Lead Product Designer.**

---

## 1. The Backend Architecture: Hybrid Intelligence

**Goal:** An app that feels instant (Local) but thinks deeply (Cloud).

### The Split: Edge vs. Cloud
To achieve "World Class" performance, we do not send every interaction to the server.

#### A. On-Device (The "Reflex" Brain)
*   **Technology:** SQLite (via WatermelonDB or similar) + Local Logic.
*   **What lives here:**
    *   **Static Data:** The full `ingredients` and `exercises` database (synced on first load).
    *   **User Logs:** Workouts, meals, history.
    *   **Basic Search:** Text matching for food/exercises.
    *   **Why:** Zero latency. Works offline in an Egyptian gym basement with no signal.
*   **The "Senior" Touch:** Implement **Optimistic UI**. When a user logs a set, update the UI *immediately*. Sync to server in the background. Never show a spinner for a save action.

#### B. The Server (The "Deep" Brain)
*   **Technology:** NestJS + PostgreSQL (pgvector) + Redis.
*   **What lives here:**
    *   **RAG Engine:** Vector search for semantic queries (e.g., "I have knee pain, what squat variation?").
    *   **LLM Orchestration:** Constructing complex prompts for meal plans using user context.
    *   **Heavy Lifting:** Aggregating health data, processing payments, trainer dashboards.
*   **The "Senior" Touch:** Use **Redis** to cache LLM responses. If User A asks for a "High protein koshari meal", cache that result. If User B asks, serve it instantly.

---

## 2. The Frontend Philosophy: "Feels Like Magic"

**Goal:** Simplify complexity. The user is overwhelmed; the app is their clarity.

### A. Visual Hierarchy & Progressive Disclosure
*   **Don't:** Dump a 1000-word workout plan on the screen.
*   **Do:** Show "Today's Focus: Chest". Tap to see exercises. Tap exercise to see video.
*   **The "Senior" Touch:** Use **Skeleton Screens** instead of spinning loaders. It makes the app feel faster.

### B. The "Wow" Factor (Micro-interactions)
*   **Buttons:** Don't just click. They should scale down slightly (`scale: 0.96`) and provide haptic feedback.
*   **Completion:** When a workout is done, don't just show text. Explode confetti. Animate the progress ring filling up.
*   **Transitions:** Pages shouldn't just appear. They should slide in, while elements stagger-fade in.

### C. Information Absorption
*   **Graphs > Tables:** Users don't read tables. They scan graphs. Use gradient-filled line charts for weight/progress.
*   **Icons > Text:** Use the custom icon set for muscle groups and food categories.
*   **Video First:** In the workout screen, the video is the hero. Text instructions are secondary (collapsed by default).

### D. Data-Driven UX & Reporting (CRITICAL)
*   **The "Google Mind" Approach:** The UI is not static; it adapts to the data.
*   **Smart Dashboards:**
    *   **Contextual Cards:** If a user usually works out at 6 PM, show the "Start Workout" card prominently at 5:30 PM.
    *   **Feedback Loops:** If a user hits a PR, the app should celebrate (confetti, "New Record" badge). Don't just log it silently.
    *   **The "Daily Focus" Rule (UI Constraint):**
        *   **Today:** Show FULL details.
        *   **Tomorrow:** Show **NAME ONLY** (e.g., "Shoulder Day", "Rest"). Build anticipation. Do not show details.
        *   **Daily 10-Min Basic:** Always offer a "Quick 10-Min Daily" option (Planks, Pushups) for busy days.
*   **Visualizing Data (Reports):**
    *   **Library:** Use `react-native-gifted-charts` or `victory-native` for high-performance, interactive graphs.
    *   **Interactivity:** Charts must be **scrubbable** (press and drag to see specific values). Static images of charts are forbidden.
    *   **Context:** Never show a number without context. Don't just say "80kg". Say "**80kg** (↓ 1.2kg this week)".
    *   **Premium+ Graphs (The "Pro" Feel):**
        *   **Volume Load:** Total kg lifted per muscle group over time.
        *   **1RM Trends:** Estimated one-rep max progression.
        *   **Muscle Balance:** Radar chart showing developed vs. lagging areas.
    *   **Exercise Screen Graphs:** Beside/Below the video, show a mini-graph of the user's *history on that specific movement* (Progress) or a *Force Curve* (Education).

### E. Secondary Programs & Add-ons
*   **Flexible Duration:** For Yoga, Mobility, or Cardio add-ons, always offer 3 duration options:
    *   **10 Mins** (Express)
    *   **30 Mins** (Standard)
    *   **Full Session** (45-60 Mins)

### F. Cognitive Load Management (Senior Frontend)
*   **The "One Primary Action" Rule:** Every screen must have *one* clear primary action (e.g., "Start Workout"). Everything else is secondary.
*   **Chunking:** Break long forms (like onboarding) into bite-sized steps. Never show more than 3-4 inputs at once.
*   **Visual Anchors:** Use consistent iconography and color coding (e.g., Protein is always Blue, Carbs always Orange) to help users scan data instantly without reading.

### G. The "Daily 10-Minute" Habit (Retention Engine)
*   **Philosophy:** Consistency > Intensity.
*   **Implementation:**
    *   Every user gets a "Daily 10" card on their dashboard, separate from their main program.
    *   **Content:** Low-friction movement (Stretching, Core, Basic Bodyweight) that requires *zero* setup.
    *   **Psychology:** Even if they skip the gym, hitting the "Daily 10" keeps the streak alive. This prevents the "all or nothing" mentality that leads to quitting.

---

## 3. Execution Checklist for Claude

### Step 1: The Brain (Backend)
1.  **Setup NestJS** with Prisma and PostgreSQL.
2.  **Implement `pgvector`** immediately. Don't wait.
3.  **Seed the Data:** Use the Python scripts to load the 3,000+ exercises and 500+ foods.
4.  **API Design:** Ensure endpoints return *rich* data (images, colors, badges) so the frontend is dumb and display-focused.
5.  **Analytics Endpoints:** Create dedicated endpoints (e.g., `/api/stats/weekly`) that return pre-calculated aggregates. Do NOT make the mobile app calculate averages from raw logs.

### Step 2: The Body (Frontend)
1.  **Initialize React Native (Expo)** with Reanimated 3.
2.  **Build the Design System first:** Define colors, typography, and *spacing* variables.
3.  **Component Library:** Build the "Workout Card", "Meal Row", and "Stat Graph" as reusable components before building screens.

### Step 3: The Soul (AI Integration)
1.  **Context Injection:** When calling the LLM, inject the user's *local* context (Egyptian ingredients, available equipment).
2.  **Safety Layer:** Implement the `AI-SAFETY-GUARDRAILS.md` logic *before* the LLM response reaches the user.

---

## 4. Specific "Senior" Directives

### On Data Retrieval
*   **Query:** "How do I get exercises?"
*   **Junior Dev:** `SELECT * FROM exercises WHERE name LIKE '%bench%'`
*   **Senior Dev (You):**
    1.  Check Local SQLite first (0ms).
    2.  If not found, check Redis cache (10ms).
    3.  If semantic search needed ("chest exercises for bad shoulders"), hit Vector DB (100ms).

### On User Onboarding
*   **Junior Dev:** A long form with 20 inputs.
*   **Senior Dev (You):** A wizard flow. One question per screen. Big tap targets. Progress bar at top. "Almost there!" encouragement.

### On Arabic Localization
*   **Junior Dev:** Google Translate strings.
*   **Senior Dev (You):** Use the `ui-strings-arabic.md` file. Ensure RTL (Right-to-Left) layout is perfect. Use "Cairo" font.

### On Analytics & Reports
*   **Junior Dev:** Fetches all `user_workouts` and loops through them in JavaScript to find personal records. Slow and buggy.
*   **Senior Dev (You):** Creates a dedicated SQL View or Materialized View for user stats. The API endpoint `/stats/summary` returns `{ total_lifted: 5000, pr_bench: 100, trend: 'up' }`. The frontend just renders.

### On Supplements
*   **Strict Rule:** Only recommend brands listed in `docs/nutrition/egyptian-market-supplements.md`.
*   **Local Context:** If a user asks for protein, suggest "MuscleAdd" or "ON Gold Standard" (common in Egypt), not random US brands.
*   **Price Awareness:** If the user is on a budget, prioritize local Egyptian brands.
*   **Safety Check:** Always cross-reference the `AI-SUPPLEMENTS-SAFETY-LOGIC.md` before making a recommendation.

---

## 5. Final Word

You are building the **best fitness app in Egypt**. It must compete with Nike Training Club and MyFitnessPal but feel like it was made in Cairo.

**Prioritize:**
1.  **Speed** (Optimistic UI, Local DB)
2.  **Beauty** (Animations, Dark Mode)
3.  **Accuracy** (Safety Guardrails, Real Data)

**Start with the Backend Foundation.**

## 7. Engineering Excellence (The "Google" Standard)

To maintain a codebase that scales to millions:

### A. Strict TypeScript
*   **No `any` types.** Ever.
*   Use **Zod** or **Valibot** for runtime validation of all API responses and form inputs.
*   **Result:** We catch bugs at compile time, not runtime.

### D. Asset Management (The "Forma" Look)
*   **Source of Truth:** Refer to `docs/design/ASSET_MANIFEST.md` for all image paths.
*   **Icons:** Use `lucide-react-native` for UI icons. Use custom SVGs (in `assets/icons/`) for muscles/food.
*   **Placeholders:** Run `python scripts/generate_placeholders.py` to generate dummy assets so the app builds immediately.
*   **Images:** Use `expo-image` for caching and performance.

### B. Testing Strategy
*   **Unit Tests:** Required for all business logic (e.g., calorie calculations, streak logic).
*   **Integration Tests:** Required for all API endpoints (happy path + error cases).
*   **E2E Tests:** Critical user flows (Onboarding, Payment) must be automated.

### C. Performance Budgets
*   **App Launch:** < 2 seconds to interactive.
*   **Frame Rate:** Consistent 60fps. Drop frames = failed PR.
*   **Bundle Size:** Keep initial JS bundle minimal. Lazy load everything.

## 8. Security & Privacy (Non-Negotiable)

*   **Data Minimization:** Don't collect what we don't need.
*   **Encryption:** All sensitive health data encrypted at rest.
*   **OWASP:** Sanitize all inputs. No SQL injection, no XSS.
*   **Trainer Access:** Strict RLS (Row Level Security). Trainers can *only* see data explicitly shared by *their* active clients.

## 9. Self-Correction Protocol
Before outputting code, ask yourself:
1. "Did I handle the loading state?"
2. "Did I handle the error state?"
3. "Is this data hardcoded or dynamic?" (Must be dynamic)
4. "Does this look good on a real phone?" (Hit targets, spacing)
5. "Is this accessible?" (Screen readers, contrast)
6. "Would Google merge this PR?" (Code quality, types, tests)

## 10. Internationalization (i18n) & RTL Architecture

**Goal:** The app must feel native in Arabic, not just translated.

### A. RTL First Mentality
*   **Layouts:** Use `flex-start` and `flex-end` carefully. Prefer `justify-content: flex-start` which React Native automatically flips for RTL. Avoid absolute positioning with `left`/`right`; use `start`/`end`.
*   **Icons:** Directional icons (arrows, back buttons, progress bars) must mirror in RTL. Non-directional icons (user, home) stay the same.
*   **Typography:** Use the `Cairo` font for Arabic. Ensure line heights accommodate Arabic diacritics (Tashkeel) without clipping.

### B. Cultural Nuance
*   **Numbers:** Decide on Eastern Arabic numerals (٠١٢٣) vs Western Arabic numerals (0123). Consistency is key. (Western 0-9 is often preferred in modern Egyptian tech contexts for clarity in OTPs/Prices).
*   **Date Formats:** Use local formats (Day/Month/Year).

---

## 11. Network Resilience & Offline-First Strategy

**Goal:** The app works perfectly in a gym basement with 1 bar of Edge signal.

### A. The "Optimistic" Queue
*   **Action:** User logs a set.
*   **UI:** Immediately shows as "Saved".
*   **Logic:**
    1.  Write to local SQLite.
    2.  Add job to `SyncQueue` (persistent, survives app restart).
    3.  Worker attempts upload.
    4.  If fail -> Exponential backoff (retry in 2s, 4s, 8s...).
    5.  If permanent fail (400 error) -> Notify user "Sync failed, tap to retry".

### B. Image Loading
*   **Strategy:** Use `expo-image` with aggressive caching.
*   **Placeholders:** Show a "BlurHash" or dominant color while loading. Never show a blank white box.
*   **Bandwidth:** Detect slow connection (NetInfo) and request lower-res images automatically.

---

## 12. Testing Strategy (The Pyramid)

**Goal:** Ship on Friday without fear.

### A. Unit Tests (Jest)
*   **Focus:** Business logic.
*   **Examples:** `calculateCalories`, `checkStreak`, `validateEgyptianPhone`.

### B. Integration Tests (Supertest / RNTL)
*   **Focus:** Components and API flows.
*   **Examples:** Render `WorkoutCard` -> Tap "Complete" -> Check success animation.

### C. E2E Tests (Maestro / Detox)
*   **Focus:** Critical User Journeys.
*   **Scenarios:** Signup flow, Logging a workout, Upgrading to Premium.

## 13. Brand Identity Implementation (Forma)

**Goal:** The app is no longer generic. It is **FORMA**.

*   **Name:** Update `app.json` / `Info.plist` / `AndroidManifest.xml` to "Forma".
*   **Logo:** Use the "Ascending F" symbol defined in `docs/branding/LOGO_CONCEPT.md`.
*   **Splash Screen:** Implement the animated splash screen defined in `docs/branding/LOGO_CONCEPT.md`.
*   **Colors:** Ensure the "Forma Teal" (#00D4AA) is the primary accent everywhere.
*   **Voice:** The AI Persona "Captain Fit" should introduce itself as "Captain Forma" or similar, maintaining the Egyptian "Vibe".
*   **Domain:** Configure deep links for `formaeg.com`.