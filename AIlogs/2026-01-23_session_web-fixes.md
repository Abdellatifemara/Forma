# 2026-01-23 Session: Web Fixes

## Objective
User reported the web app is full of 404s and UI elements are not connected to the database. The goal is to make the UI/UX solid, fix broken links, and implement missing functionality where possible. If not possible, document for Claude.

## Gemini Session Log

### Actions Taken

1.  **Routing Fix:**
    *   Identified that core application routes were incorrectly placed in `apps/web/app/app`, causing them to be prefixed with `/app`.
    *   Moved all contents from `apps/web/app/app` to `apps/web/app/(app)` to correct the routing and remove the `/app` prefix from URLs.
    *   This fixed a major source of potential 404 errors throughout the application.

2.  **Dashboard Page (`/dashboard`):**
    *   **Fixed Broken Links:** Updated all internal links on the dashboard (to workouts, nutrition, etc.) to reflect the corrected routing structure.
    *   **Connected to Backend:** Implemented data fetching for:
        *   User information (`authApi.getMe`)
        *   Today's workout (`workoutsApi.getTodayWorkout`)
        *   Daily nutrition log (`nutritionApi.getDailyLog`)
        *   Weekly statistics (`statsApi.getWeeklySummary`)
    *   **Dynamic UI:** Replaced hardcoded "empty state" components with dynamic ones that display the fetched data:
        *   **Today's Workout:** Now shows the scheduled workout and a "Start Workout" button.
        *   **Nutrition Summary:** Displays current calorie and macro-nutrient progress.
        *   **Quick Stats:** Shows average calories and workout streak. (Note: Steps and Active Minutes data not available from API).
        *   **Weekly Goals:** Displays progress towards the weekly workout goal.

3.  **Workouts Page (`/workouts`):**
    *   **Connected to Backend:** Implemented data fetching for:
        *   Workout plans (`workoutsApi.getPlans`)
        *   Workout history (`workoutsApi.getHistory`)
    *   **Dynamic UI:** Replaced hardcoded data with dynamic components:
        *   **My Plans Tab:** Now lists workout plans fetched from the API.
        *   **History Tab:** Now lists past workouts from the API. (Note: API currently missing workout names).
        *   **Exercises Tab:** Categories now link to a filtered search page.
    *   **Removed Broken Component:** Temporarily removed the "This Week" schedule component, which was based on static data and causing the page to crash.

4.  **Exercises Page (`/exercises`):**
    *   **Connected to Backend:** Replaced the static, client-side filtered list of exercises with a dynamic search powered by the `exercisesApi.search` endpoint.
    *   **Dynamic Filtering:** The page now fetches data from the API whenever the search query or filters are changed.
    *   **Debounced Search:** Implemented a 300ms debounce on the search input to prevent excessive API calls while the user is typing.
    *   **URL-based Filtering:** The page now correctly uses the `muscle` URL query parameter to set the initial muscle group filter, making the links from the `/workouts` page functional.

5.  **Implemented Placeholder Pages:**
    *   **Workouts Page (`/workouts`):**
        *   Made the "Start Plan" button interactive on the client-side to provide user feedback.
        *   Created a new placeholder page for "Log Workout" at `/workouts/log` and linked the corresponding button.
        *   Created a new placeholder page for "Create Plan" at `/workouts/create` and linked the corresponding button.
    *   These changes make the workouts page more interactive and provide a clear structure for future feature development.

### Next Steps
- Implement the backend logic for setting an active workout plan.
- Implement the form submission logic for the "Log Workout" page.
- Build out the full feature for creating a custom workout plan.
- Re-implement the "This Week" schedule component on the `/workouts` page with data from the backend.

### TODO for Claude
- The backend API does not currently provide data for "Steps" or "Active Minutes". This functionality may need to be added to the backend or integrated from a third-party service (e.g., Google Fit, Apple Health).
- The concept of "Achievements" is present in the UI, but there is no corresponding API. This feature needs to be designed and implemented in the backend.
- The weekly goal for workouts is hardcoded to 5. This should probably be a user-configurable setting.
- The `workoutsApi.getHistory()` endpoint should include the `workoutName` in the response to avoid N+1 queries on the client.
- An endpoint is needed to fetch the user's weekly workout schedule to populate the "This Week" component on the `/workouts` page.
- An API to get exercise counts per muscle group would be useful for the `/workouts` page.
- The `User` object in the backend should have a field for `activePlanId` to allow setting a workout plan as active.