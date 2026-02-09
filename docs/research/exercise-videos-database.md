# Exercise Videos Database - Complete Research

## 1. PRIMARY VIDEO SOURCES

### ExerciseDB API (11,000+ Exercises)
- **GitHub**: https://github.com/ExerciseDB/exercisedb-api
- **Website**: https://exercisedb.dev
- **Features**: Videos, GIFs, instructions, muscle targeting
- **License**: AGPL-3.0
- **Best For**: Bulk video mapping

```json
{
  "exerciseId": "0001",
  "name": "3/4 Sit-Up",
  "target": "abs",
  "equipment": "body weight",
  "gifUrl": "https://v2.exercisedb.io/image/...",
  "videoUrl": "https://...",
  "instructions": ["Lie flat on your back...", "..."]
}
```

### ExRx.net (2,100+ Exercises with Videos)
- **Website**: https://exrx.net
- **Access**: Free API (requires application)
- **Contact**: Fill inquiry form for credentials
- **Features**: Professional demonstrations, anatomical accuracy

### Free Exercise DB (800+ Open Source)
- **GitHub**: https://github.com/yuhonas/free-exercise-db
- **License**: Public domain
- **Format**: JSON, direct download
- **Best For**: Fallback source

---

## 2. YOUTUBE CHANNELS FOR EXERCISE DEMOS

### English - Professional Form

| Channel | Subscribers | Videos | Specialty |
|---------|-------------|--------|-----------|
| **ATHLEAN-X** | 13.7M | 1,430+ | Anatomical accuracy, injury prevention |
| **Jeff Nippard** | 5M+ | 500+ | Science-based, research-backed |
| **Renaissance Periodization** | 1.5M | 800+ | Hypertrophy, form technique |
| **Squat University** | 1M+ | 300+ | Mobility, injury prevention |
| **MindPump TV** | 800K | 600+ | Practical coaching |

### Arabic - Native Content

| Channel | Content | Best For |
|---------|---------|----------|
| **Coach_Sabrine** | Daily classes, Ramadan routines | Arabic-speaking audiences |
| **Ahmed Elbasuony** | Egyptian coaching | Local market |
| **Fit Arabs** | MENA fitness | Regional content |

### YouTube Data API v3 Implementation

```javascript
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function findExerciseVideo(exerciseName, language = 'en') {
  const query = language === 'ar'
    ? `${exerciseName} تمرين شرح الشكل الصحيح`
    : `${exerciseName} proper form technique tutorial`;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
  );

  const data = await response.json();

  return data.items.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high.url,
    url: `https://youtube.com/watch?v=${item.id.videoId}`
  }));
}
```

**Quota**: 10,000 units/day free (1 search = 1 unit)

---

## 3. 3D ANIMATION ALTERNATIVES

### Open Source Libraries

**ozz-animation** (C++)
```cpp
// Load skeleton and animation
ozz::animation::Skeleton skeleton;
ozz::animation::Animation animation;

// Sample animation
ozz::animation::SamplingJob sampling_job;
sampling_job.animation = &animation;
sampling_job.context = &context;
sampling_job.ratio = time_ratio;
sampling_job.output = make_span(locals);
sampling_job.Run();
```

**Three.js Skeleton** (JavaScript)
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('exercise-model.glb', (gltf) => {
  const model = gltf.scene;
  const mixer = new THREE.AnimationMixer(model);

  gltf.animations.forEach((clip) => {
    if (clip.name === 'squat') {
      mixer.clipAction(clip).play();
    }
  });
});
```

### Motion Capture Datasets

| Dataset | Size | Format | License |
|---------|------|--------|---------|
| **CMU MoCap** | 2,500+ motions | BVH, C3D | Free research |
| **Bandai Namco** | 3,000+ moves | BVH | Free personal/research |
| **AMASS** | 40 hours | SMPL | Academic |
| **HDM05** | 3+ hours | C3D, AMC | Research |

---

## 4. DAREBEE - FREE ANIMATIONS

- **Website**: https://darebee.com
- **Content**: 2,500+ workouts, free animations
- **License**: Free, nonprofit
- **Best For**: Bodyweight exercises, no-equipment workouts

```javascript
// DAREBEE scraping structure (for reference)
const darebeeExercise = {
  name: "Push-Up",
  url: "https://darebee.com/exercises/push-up-exercise.html",
  gifUrl: "https://darebee.com/images/exercises/push-up-exercise.gif",
  muscles: ["chest", "triceps", "shoulders"],
  difficulty: "beginner"
};
```

---

## 5. VIDEO MAPPING STRATEGY

### Database Schema

```prisma
model Exercise {
  id            String   @id @default(cuid())
  externalId    String   @unique
  nameEn        String
  nameAr        String?
  targetMuscle  String
  equipment     String[]
  videoSources  ExerciseVideo[]
}

model ExerciseVideo {
  id          String   @id @default(cuid())
  exerciseId  String
  exercise    Exercise @relation(fields: [exerciseId], references: [id])
  platform    String   // youtube, exercisedb, darebee, custom
  videoId     String?  // YouTube video ID
  url         String
  thumbnailUrl String?
  duration    Int?     // seconds
  language    String   // en, ar
  quality     Int      // 1-10 score
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@unique([exerciseId, platform, language])
}
```

### Mapping Algorithm

```javascript
async function mapExerciseToVideos(exercise) {
  const sources = [];

  // 1. Check ExerciseDB first (fastest, most reliable)
  const exerciseDbMatch = await searchExerciseDB(exercise.nameEn);
  if (exerciseDbMatch?.videoUrl) {
    sources.push({
      platform: 'exercisedb',
      url: exerciseDbMatch.videoUrl,
      quality: 9,
      language: 'en'
    });
  }

  // 2. Check DAREBEE for bodyweight exercises
  if (exercise.equipment.includes('body weight')) {
    const darebeeMatch = await searchDarebee(exercise.nameEn);
    if (darebeeMatch) {
      sources.push({
        platform: 'darebee',
        url: darebeeMatch.gifUrl,
        quality: 7,
        language: 'en'
      });
    }
  }

  // 3. YouTube fallback
  const youtubeVideos = await findExerciseVideo(exercise.nameEn, 'en');
  if (youtubeVideos.length > 0) {
    sources.push({
      platform: 'youtube',
      videoId: youtubeVideos[0].videoId,
      url: youtubeVideos[0].url,
      quality: calculateQuality(youtubeVideos[0]),
      language: 'en'
    });
  }

  // 4. Arabic YouTube
  const arabicVideos = await findExerciseVideo(exercise.nameAr || exercise.nameEn, 'ar');
  if (arabicVideos.length > 0) {
    sources.push({
      platform: 'youtube',
      videoId: arabicVideos[0].videoId,
      url: arabicVideos[0].url,
      quality: calculateQuality(arabicVideos[0]),
      language: 'ar'
    });
  }

  return sources;
}

function calculateQuality(video) {
  let score = 5;

  // Trusted channels get bonus
  const trustedChannels = ['ATHLEAN-X', 'Jeff Nippard', 'Squat University'];
  if (trustedChannels.some(c => video.channelTitle.includes(c))) {
    score += 3;
  }

  // Keywords in title
  const formKeywords = ['form', 'technique', 'proper', 'tutorial', 'how to'];
  if (formKeywords.some(k => video.title.toLowerCase().includes(k))) {
    score += 1;
  }

  return Math.min(score, 10);
}
```

---

## 6. IMPLEMENTATION PLAN

### Week 1: Data Collection
- [ ] Download ExerciseDB full dataset
- [ ] Set up YouTube Data API credentials
- [ ] Create video mapping database schema
- [ ] Build initial mapping for 500 exercises

### Week 2: Bulk Mapping
- [ ] Map remaining 2300 exercises
- [ ] Implement quality scoring
- [ ] Add Arabic video search
- [ ] Manual review of top 100 exercises

### Week 3: Integration
- [ ] Build video player component
- [ ] Add to exercise detail pages
- [ ] Implement lazy loading
- [ ] Add offline caching

### Week 4: Polish
- [ ] Community reporting for bad videos
- [ ] Admin interface for video management
- [ ] Analytics on video engagement
- [ ] A/B test video vs GIF

---

## 7. ESTIMATED COVERAGE

| Source | Exercises | Coverage |
|--------|-----------|----------|
| ExerciseDB | 11,000 | 90% of common exercises |
| YouTube | Unlimited | 99% with search |
| DAREBEE | 2,500 | 80% bodyweight |
| Combined | - | **99%+ coverage** |

---

## 8. RESOURCES

- ExerciseDB: https://github.com/ExerciseDB/exercisedb-api
- YouTube API: https://developers.google.com/youtube/v3
- DAREBEE: https://darebee.com
- ozz-animation: https://github.com/guillaumeblanc/ozz-animation
- Three.js: https://threejs.org/docs/#manual/en/introduction/Loading-3D-models
