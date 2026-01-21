# FitApp System Architecture: The "Google Mind" Blueprint

## 1. Core Philosophy: Structured Data + AI Reasoning

To be world-class, the LLM (Large Language Model) cannot be the database. It must be the **reasoning engine** that queries a structured database.

**The Flow:**
1. **User:** "I have 200 EGP, I need a protein supplement available in Cairo."
2. **LLM (Brain):** Understands intent -> Calls Tool `search_products(category="protein", max_price=200, location="Cairo")`.
3. **Database (Memory):** Returns "MuscleAdd Whey (Local), ON Gold Standard (Imported - Sachet)".
4. **LLM (Response):** Formulates the answer in Egyptian Arabic using the retrieved data.

---

## 2. Database Schema (PostgreSQL + Vector)

We need a relational database for facts and a vector database for "vibe" and semantic search.

### A. Ingredients & Nutrition (The "Egyptian Pantry")
*Unlike generic apps, we map ingredients to Egyptian market realities.*

```sql
CREATE TABLE ingredients (
    id UUID PRIMARY KEY,
    name_en VARCHAR,
    name_ar VARCHAR, -- e.g., "Jibna Romy", "Freek"
    calories_per_100g FLOAT,
    protein_per_100g FLOAT,
    carbs_per_100g FLOAT,
    fats_per_100g FLOAT,
    is_local_staple BOOLEAN, -- True for Baladi bread, Fava beans
    seasonality_egypt VARCHAR[], -- ['Winter', 'All Year']
    average_price_egp FLOAT, -- For "Budget Meal" AI generation
    embedding VECTOR(1536) -- For AI to understand "salty cheese" matches "Romy"
);
```

### B. Egyptian Market Products (Supplements & Packaged Food)
*This fills the gap Claude missed: Real products sold in pharmacies/gyms.*

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    barcode VARCHAR,
    brand_name VARCHAR, -- e.g., "MuscleAdd", "MaxMuscle", "Optimum Nutrition"
    product_name VARCHAR,
    category VARCHAR, -- 'Whey', 'Creatine', 'Oats', 'Peanut Butter'
    is_local_brand BOOLEAN, -- True for Egyptian brands (cheaper)
    average_price_egp FLOAT,
    store_availability VARCHAR[], -- ['El Ezaby', 'Amazon.eg', 'Gourmet']
    image_url VARCHAR,
    verified_halal BOOLEAN DEFAULT TRUE
);
```

### C. Exercise Library (AI Video Ready)
*Structured for generation and retrieval.*

```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    name_en VARCHAR,
    name_ar VARCHAR, -- "Bench Press" / "بنش بريس"
    difficulty_level VARCHAR,
    target_muscles VARCHAR[], -- ['Chest', 'Triceps']
    equipment_needed VARCHAR[], -- ['Barbell', 'Bench']
    
    -- AI Video Generation Fields
    ai_video_prompt TEXT, -- "Cinematic shot, fit Egyptian male model, gym setting, performing bench press, 45 degree angle, perfect form"
    video_url VARCHAR, -- URL to generated/hosted video
    
    -- Visuals
    muscle_heatmap_url VARCHAR, -- Image showing active muscles
    
    -- Metadata
    common_mistakes_ar TEXT[],
    cues_ar TEXT[] -- "Touch your chest", "Don't arch back"
);
```

---

## 3. AI System Prompt (The "Persona")

To ensure "Native Arabic" output, the LLM must be instructed strictly.

**System Prompt Template:**
```text
You are "Captain Fit", an expert Egyptian fitness coach.

LANGUAGE RULES:
- Speak in "Egyptian Colloquial Arabic" (العامية المصرية).
- Use gym slang commonly used in Cairo (e.g., "عاش يا وحش", "بنش", "تراي", "سخن كويس").
- NEVER use Modern Standard Arabic (الفصحى) for conversation.
- When mentioning numbers, use digits (١، ٢، ٣) or standard numbers.

DATA RULES:
- Do not invent calorie counts. Use the `lookup_food` tool.
- Do not invent supplement prices. Use the `lookup_product` tool.
- If a user asks for a meal plan, prioritize ingredients available in Egyptian households (Rice, Pasta, Chicken, Fava Beans, Cottage Cheese).

CONTEXT:
- The user is in Egypt.
- Weather is hot in summer; suggest hydration.
- Gyms can be crowded; suggest alternatives if asked.
```

---

## 4. Video Generation Pipeline (Future-Proofing)

To compete globally, we will generate custom exercise videos using AI instead of filming 3000 clips manually.

**Pipeline:**
1. **Prompt Construction:** Use the `ai_video_prompt` from the database.
2. **Generation API:** Send to Stable Video Diffusion (SVD) or Runway Gen-2 API.
3. **Post-Processing:** Overlay "FitApp" watermark and rep counter UI.
4. **Storage:** Save to Cloudflare R2 (cheaper than AWS S3).
5. **Delivery:** Stream via HLS to the mobile app.

**Example Prompt:**
> "Photorealistic 4k video, side view, athletic male wearing modern sportswear, performing a perfect form push-up on a gym floor, neutral lighting, continuous loop."

---

## 5. Retrieval Speed & Reliability

To make the application "Fast and Reliable":

1. **Edge Caching:**
   - The `ingredients` and `exercises` tables are synced to the user's phone (SQLite/WatermelonDB).
   - **Result:** Instant search results (0ms latency) even offline.

2. **Vector Search (The "Smart" Part):**
   - When online, user types "Something for my knees".
   - Vector DB finds exercises tagged with "knee stability" or "rehab" even if the word "knee" isn't in the title.

3. **Image Optimization:**
   - All images/graphs converted to WebP format.
   - Muscle heatmaps are SVGs (tiny file size, infinite scaling).
```