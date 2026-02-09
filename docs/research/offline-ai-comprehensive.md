# Comprehensive Offline AI Research for Fitness Apps

## 1. LOCAL LLM OPTIONS

### Top Models for Mobile/Web

| Model | Size | Memory | Context | Best For |
|-------|------|--------|---------|----------|
| **Llama 3.2 1B** | ~2GB | 1.8GB GPU | 128K | Mobile, fastest |
| **Llama 3.2 3B** | ~6GB | 3.4GB GPU | 128K | Best balance |
| **Phi-3-mini** | 3.8B params | ~4GB | 4K | iPhone 14+, 12+ tok/s |
| **Gemma 2 2B** | ~5GB | 3GB | 8K | Laptops, torch compile 6x faster |
| **Mistral 7B** | ~14GB | 8GB | 32K | Desktop, best reasoning |

### Frameworks

**llama.cpp** - Pure C/C++, runs everywhere
```bash
# Build
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make

# Run
./main -m models/llama-3.2-1b.Q4_K_M.gguf -p "Create a workout plan"
```

**ONNX Runtime** - Cross-platform, NPU acceleration
```javascript
// Browser/Node.js
import * as ort from 'onnxruntime-web';
const session = await ort.InferenceSession.create('model.onnx');
```

**TensorFlow Lite** - Mobile optimized
```dart
// Flutter
final interpreter = await Interpreter.fromAsset('model.tflite');
interpreter.run(input, output);
```

**Core ML** - Apple Neural Engine (9x faster, 1/10 energy)
```swift
let model = try! FitnessModel(configuration: .init())
let prediction = try! model.prediction(input: userInput)
```

---

## 2. EMBEDDING MODELS FOR SEMANTIC SEARCH

### Best Options for Fitness App

| Model | Params | Dimensions | Speed | Size |
|-------|--------|------------|-------|------|
| **all-MiniLM-L6-v2** | 22M | 384 | 14.7ms/1K tokens | ~44MB |
| **all-MiniLM-L12-v2** | 33M | 384 | 20ms/1K tokens | ~66MB |
| **bge-small-en-v1.5** | 33M | 384 | 18ms/1K tokens | ~66MB |

### Implementation - Semantic Exercise Search

```javascript
// Using Transformers.js (browser)
import { pipeline } from '@xenova/transformers';

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Embed exercise database
const exercises = ['bench press', 'pushup', 'chest fly', 'incline press'];
const embeddings = await Promise.all(
  exercises.map(ex => embedder(ex, { pooling: 'mean', normalize: true }))
);

// Search
async function findSimilarExercises(query) {
  const queryEmbed = await embedder(query, { pooling: 'mean', normalize: true });

  // Cosine similarity
  const similarities = embeddings.map((emb, i) => ({
    exercise: exercises[i],
    score: cosineSimilarity(queryEmbed.data, emb.data)
  }));

  return similarities.sort((a, b) => b.score - a.score);
}

// User types "chest workout" -> finds bench press, pushup, chest fly
```

---

## 3. SIZE VS CAPABILITY TRADEOFFS

### 50MB Budget (Browser/PWA)
- **all-MiniLM-L6-v2** (22MB quantized) - Semantic search
- **TensorFlow.js Pose** (5MB) - Form detection
- **Custom classifier** (5MB) - Exercise recognition
- **Total: ~32MB** - Fits in IndexedDB, works offline

### 100MB Budget (Mobile App)
- **Phi-3-mini Q4** (~100MB) - Full instruction following
- **Llama 3.2 1B Q4** (~100MB) - General fitness AI
- Good for: Workout generation, nutrition advice, form tips

### 500MB Budget (Premium App)
- **Llama 3.2 3B Q4** (~500MB) - Excellent performance
- **Mistral 7B Q5** (~500MB) - Best reasoning
- Good for: Personalized coaching, complex meal planning

### Quantization Quick Reference
```
Q8 (8-bit): 4x compression, 97% quality - recommended
Q4 (4-bit): 8x compression, 90% quality - good for mobile
Q2 (2-bit): 16x compression, 70% quality - extreme edge cases
```

---

## 4. FINE-TUNING FOR FITNESS DOMAIN

### LoRA Fine-Tuning (Recommended)

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load base model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-3B")

# LoRA config - only trains 0.1% of parameters
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)

# Training data format
training_data = [
    {"instruction": "Create a chest workout", "output": "1. Bench Press 4x8\n2. Incline DB Press 3x10..."},
    {"instruction": "Suggest breakfast for muscle gain", "output": "4 eggs, 100g oats, banana..."},
    # 1000-5000 quality examples
]
```

### QLoRA - 4-bit Fine-tuning (8GB GPU)

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.2-3B",
    quantization_config=bnb_config
)
```

### Training Data Categories for Fitness AI
1. Exercise instructions (2000+ examples)
2. Nutrition advice (1000+ examples)
3. Workout programming (500+ examples)
4. Form corrections (500+ examples)
5. Motivation/coaching (300+ examples)
6. Arabic translations (mirror all above)

---

## 5. EDGE AI FRAMEWORKS

### TensorFlow.js (Browser)

```javascript
// Load model from IndexedDB (offline)
const model = await tf.loadLayersModel('indexeddb://fitness-model');

// Pose detection
const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
);

const poses = await detector.estimatePoses(video);
// poses[0].keypoints = [{x, y, score, name: 'left_shoulder'}, ...]
```

### MediaPipe Pose (33 Body Landmarks)

```javascript
import { Pose } from '@mediapipe/pose';

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,  // 0=lite, 1=full, 2=heavy
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults((results) => {
  // results.poseLandmarks = 33 points with x, y, z, visibility
  const leftShoulder = results.poseLandmarks[11];
  const leftElbow = results.poseLandmarks[13];
  const leftWrist = results.poseLandmarks[15];

  // Calculate elbow angle for bicep curl form check
  const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
});
```

### ONNX Runtime Web

```javascript
import * as ort from 'onnxruntime-web';

// Enable WASM multi-threading for 2-30x speedup
ort.env.wasm.numThreads = navigator.hardwareConcurrency;

const session = await ort.InferenceSession.create('model.onnx', {
  executionProviders: ['wasm'],
  graphOptimizationLevel: 'all'
});

const feeds = { input: new ort.Tensor('float32', inputData, [1, 384]) };
const results = await session.run(feeds);
```

---

## 6. VECTOR DATABASES (LOCAL/EMBEDDED)

### sqlite-vec (Recommended)

```sql
-- Install extension
.load ./vec0

-- Create exercise embeddings table
CREATE VIRTUAL TABLE exercise_embeddings USING vec0(
  exercise_id TEXT PRIMARY KEY,
  embedding FLOAT[384]
);

-- Insert
INSERT INTO exercise_embeddings VALUES (
  'bench_press',
  vec_f32('[0.1, 0.2, ...]')
);

-- KNN Search - find 5 most similar exercises
SELECT exercise_id, distance
FROM exercise_embeddings
WHERE embedding MATCH vec_f32('[query embedding]')
ORDER BY distance
LIMIT 5;
```

### JavaScript Implementation

```javascript
import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});

const db = new SQL.Database();

// Load vec0 extension (requires custom build)
// Store embeddings as BLOB
db.run(`
  CREATE TABLE exercises (
    id TEXT PRIMARY KEY,
    name TEXT,
    name_ar TEXT,
    embedding BLOB
  )
`);

// Search function
function findSimilar(queryEmbedding, limit = 5) {
  const results = db.exec(`
    SELECT id, name, name_ar,
           cosine_similarity(embedding, ?) as score
    FROM exercises
    ORDER BY score DESC
    LIMIT ?
  `, [queryEmbedding, limit]);

  return results[0].values;
}
```

---

## 7. COMPLETE OFFLINE FITNESS AI STACK

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FORMA FITNESS APP                      │
├─────────────────────────────────────────────────────────┤
│  UI Layer (React/React Native)                           │
├─────────────────────────────────────────────────────────┤
│  AI Services Layer                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │ Embedding   │ │ LLM         │ │ Pose Detection      ││
│  │ MiniLM-L6   │ │ Llama 3.2 1B│ │ MediaPipe/MoveNet   ││
│  │ (22MB)      │ │ (100MB Q4)  │ │ (5MB)               ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  Data Layer                                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │ SQLite + sqlite-vec                                  ││
│  │ - 2800 exercises with embeddings (~10MB)             ││
│  │ - 800 foods with embeddings (~3MB)                   ││
│  │ - User workout history                               ││
│  │ - Cached AI responses                                ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  Total Size: ~140MB (fits on any modern device)          │
└─────────────────────────────────────────────────────────┘
```

### Offline Capabilities

1. **Exercise Search** - Semantic search "chest exercises" finds all relevant
2. **Workout Generation** - LLM creates personalized plans offline
3. **Form Checking** - Camera-based pose detection, no internet needed
4. **Nutrition Lookup** - Embedded food database with Arabic names
5. **Progress Tracking** - All data stored locally, syncs when online

---

## 8. OPEN SOURCE FITNESS AI PROJECTS

### Exercise Recognition
- **Fitness-AI-Trainer**: 99% accuracy, real-time counting
- **Exercise_Recognition_AI**: LSTM 97.78%, Attention-LSTM 100%
- **GymLytics**: Computer vision posture feedback

### Databases
- **ExerciseDB**: 11,000 exercises with videos/GIFs
- **wger**: Self-hosted FLOSS fitness tracker
- **DAREBEE**: 2,500 free workouts, open source

### Motion Capture
- **CMU MoCap**: Free research database
- **Bandai Namco**: 3,000+ free mocap moves
- **AMASS**: Unified human motion database

---

## 9. IMPLEMENTATION CHECKLIST

### Phase 1: Semantic Search (Week 1)
- [ ] Integrate all-MiniLM-L6-v2 via Transformers.js
- [ ] Generate embeddings for 2800 exercises
- [ ] Generate embeddings for 800 foods
- [ ] Implement sqlite-vec for storage
- [ ] Build search API

### Phase 2: Pose Detection (Week 2)
- [ ] Integrate MediaPipe Pose
- [ ] Implement rep counting
- [ ] Add form feedback for 10 key exercises
- [ ] Test on mobile browsers

### Phase 3: Local LLM (Week 3-4)
- [ ] Fine-tune Llama 3.2 1B on fitness data
- [ ] Quantize to Q4 format
- [ ] Integrate via llama.cpp WASM
- [ ] Build chat interface

### Phase 4: Arabic Support (Week 4-5)
- [ ] Translate all exercise names
- [ ] Translate all food names
- [ ] Train bilingual embeddings
- [ ] Test Arabic semantic search

---

## 10. RESOURCES

### Models
- https://huggingface.co/meta-llama/Llama-3.2-3B
- https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- https://huggingface.co/microsoft/phi-3-mini-4k-instruct

### Frameworks
- https://github.com/ggerganov/llama.cpp
- https://www.tensorflow.org/js
- https://developers.google.com/mediapipe
- https://onnxruntime.ai/

### Databases
- https://github.com/asg017/sqlite-vec
- https://github.com/nicmcd/free-exercise-db
- https://github.com/wger-project/wger
