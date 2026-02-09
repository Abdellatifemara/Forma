# Offline AI Research - Forma Fitness App

## Goal
Enable real AI-powered features that work WITHOUT internet connection, similar to competitors like FITSTN.

---

## Phase 1: On-Device Pose Estimation (PRIORITY)

### Technology Options

| Technology | Platform | Size | Accuracy | Offline? |
|------------|----------|------|----------|----------|
| **MediaPipe BlazePose** | Web/Mobile | ~3-5MB | High | Yes |
| **TensorFlow Lite** | Mobile | ~2-10MB | Very High | Yes |
| **Apple Vision Framework** | iOS only | Built-in | Very High | Yes |
| **ML Kit Pose Detection** | Android/iOS | ~15MB | High | Yes |

### Research Queries to Run

**Query 1:** "How to implement MediaPipe BlazePose in React Native for offline pose detection? Include code examples for detecting body keypoints during exercise."

**Query 2:** "Compare TensorFlow Lite vs MediaPipe for real-time exercise form checking on mobile devices. Which is faster and more accurate?"

**Query 3:** "How to create an offline rep counter using pose estimation? Detect squat, push-up, and deadlift repetitions from video keypoints."

---

## Phase 2: Form Checking Algorithm (No Cloud Needed)

### What We Need
- Rules-based form checking using joint angles
- Compare user's pose to "ideal" pose templates
- Calculate angles between body keypoints
- Trigger feedback when angles exceed thresholds

### Key Angles to Track

| Exercise | Joint Angle | Good Range | Warning |
|----------|-------------|------------|---------|
| Squat | Knee angle | 70-100° | Knees past toes |
| Squat | Hip angle | 70-100° | Back rounding |
| Push-up | Elbow angle | 70-90° (bottom) | Elbows flaring >45° |
| Deadlift | Back angle | 160-180° | Rounding <150° |
| Plank | Hip alignment | 170-180° | Sagging or piking |

### Research Queries

**Query 3:** "Algorithm to detect if user's knees go past toes during squat using body keypoints. Include formula for calculating knee-ankle-toe angle."

**Query 4:** "How to detect back rounding during deadlift using pose estimation keypoints? Python code for angle calculation between shoulder-hip-knee."

---

## Phase 3: Offline Workout Recommendations

### Approach: Pre-computed Templates
- Store 50-100 workout templates locally
- Filter by: equipment, goal, level, time
- No AI needed - just smart filtering

### Alternative: On-Device ML for Recommendations

**Query 5:** "How to run a small recommendation model on-device using TensorFlow Lite? Model should suggest workouts based on user history and goals."

**Query 6:** "What's the smallest useful ML model size for workout recommendations? Can it fit in a React Native app?"

---

## Phase 4: Offline Food Recognition (Advanced)

### Technologies

| Technology | Size | Foods | Offline? |
|------------|------|-------|----------|
| **Google ML Kit** | ~20MB | General | Yes |
| **Custom TFLite Model** | ~5-15MB | Egyptian foods | Yes |
| **Apple Core ML** | ~10MB | General | Yes |

### Research Queries

**Query 7:** "How to train a custom TensorFlow Lite food classification model for Egyptian foods like koshary, ful medames, and ta'meya? Include dataset preparation steps."

**Query 8:** "Best practices for on-device food calorie estimation from images. How accurate can offline models be?"

---

## Phase 5: Offline Voice Commands

### Technologies
- Apple Speech Framework (iOS)
- Android SpeechRecognizer
- Vosk (open-source offline speech)

### Research Queries

**Query 9:** "How to implement offline voice commands in React Native? User should be able to say 'start workout' or 'next exercise' without internet."

---

## Implementation Priority

1. **Week 1-2:** Implement MediaPipe BlazePose in web app (already partially done in form-checker.tsx)
2. **Week 3-4:** Add rep counting algorithm for 5 basic exercises
3. **Week 5-6:** Form checking rules for squat, push-up, deadlift
4. **Week 7-8:** React Native integration for mobile
5. **Month 3:** Food recognition MVP

---

## Competitors Analysis

### FITSTN Features to Research
- How do they do offline rep counting?
- What ML models do they use?
- How accurate is their form checking?

**Query 10:** "Analyze how fitness apps like FITSTN, Nike Training Club, and Peloton implement offline AI features. What technologies do they use?"

---

## Technical Requirements

### Bundle Size Budget
- Web: Max 10MB for ML models (lazy loaded)
- Mobile: Max 30MB for all ML features
- Models should be loaded on-demand, not at startup

### Performance Requirements
- Pose detection: >15 FPS on mid-range phones
- Rep counting: <100ms latency
- Form feedback: Real-time (<200ms)

### Device Requirements
- iOS 13+ (for Core ML)
- Android 8+ (for TFLite)
- Modern browsers with WebGL (for TensorFlow.js)

---

## Resources to Study

1. **MediaPipe Documentation:** https://google.github.io/mediapipe/
2. **TensorFlow Lite Guide:** https://www.tensorflow.org/lite
3. **React Native ML Kit:** https://github.com/a]react-native-ml-kit
4. **BlazePose Paper:** https://arxiv.org/abs/2006.10204
5. **OpenPose for reference:** https://github.com/CMU-Perceptual-Computing-Lab/openpose

---

## Next Steps

1. [ ] Run Query 1-2 to understand best technology choice
2. [ ] Prototype MediaPipe in web (we already have form-checker.tsx)
3. [ ] Create angle calculation functions for 5 exercises
4. [ ] Test on real users with different body types
5. [ ] Build rep counter for squats first
6. [ ] Expand to other exercises

---

## Notes

- Offline AI is possible and competitors are doing it
- Focus on pose estimation first - it's the foundation
- Don't over-promise - form checking is "guidance" not "medical advice"
- Start with web (easier), then port to mobile
