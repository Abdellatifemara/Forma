# -*- coding: utf-8 -*-
"""
FORMA FITNESS - ADVANCED & MIXED TRAINING DATA
===============================================
Adds:
- Kegel exercises
- Calisthenics progressions
- Sports basics (boxing, muay thai, BJJ)
- Mixed training recommendations
- Personalized suggestions based on user profile
- Research-based advice
"""

import json
import os

# =============================================================================
# KEGEL & PELVIC FLOOR
# =============================================================================

KEGEL_EXERCISES = [
    {
        "instruction": "What are kegel exercises?",
        "output": "**Kegel Exercises - Pelvic Floor Training**\n\n**What are they?**\nExercises that strengthen your pelvic floor muscles - the muscles that support your bladder, bowel, and sexual organs.\n\n**Benefits for MEN:**\n- Better bladder control\n- Improved sexual performance\n- Stronger erections\n- Better core stability\n- Helps with heavy lifting\n\n**Benefits for WOMEN:**\n- Better bladder control\n- Stronger core\n- Postpartum recovery\n- Improved sexual health\n\n**How to find the muscles:**\n- Try to stop urination midstream\n- Those are your pelvic floor muscles\n- Don't actually do this regularly - just to identify\n\n**Basic Kegel routine:**\n1. Squeeze pelvic floor muscles\n2. Hold for 3-5 seconds\n3. Relax for 3-5 seconds\n4. Repeat 10-15 times\n5. Do 3 sets daily\n\n**Important:** Don't hold breath, don't squeeze abs/glutes",
        "category": "kegel"
    },
    {
        "instruction": "تمارين كيجل",
        "output": "**تمارين كيجل - تقوية عضلات الحوض**\n\n**إيه هي؟**\nتمارين بتقوي عضلات قاع الحوض - العضلات اللي بتدعم المثانة والأعضاء التناسلية.\n\n**الفوايد للرجال:**\n- تحكم أفضل في المثانة\n- أداء جنسي أحسن\n- انتصاب أقوى\n- ثبات أحسن للكور\n\n**الفوايد للستات:**\n- تحكم أفضل في المثانة\n- كور أقوى\n- استشفاء بعد الولادة\n\n**ازاي تلاقي العضلات:**\n- حاول توقف التبول في النص\n- دي عضلات قاع الحوض\n- متعملش ده كتير - بس عشان تعرف العضلات\n\n**الروتين:**\n1. اضغط على عضلات الحوض\n2. امسك 3-5 ثواني\n3. استرخي 3-5 ثواني\n4. كرر 10-15 مرة\n5. اعمل 3 سيتات يومياً\n\n**مهم:** متحبسش نفسك، متضغطش على البطن",
        "category": "kegel_ar"
    },
    {
        "instruction": "Kegel exercises for men",
        "output": "**Men's Kegel Exercise Guide:**\n\n**Why men should do kegels:**\n- Stronger erections\n- Better ejaculation control\n- Improved bladder control\n- Core stability for lifting\n- Prostate health\n\n**Finding the muscles:**\n- Next time you urinate, try to stop midstream\n- Those muscles = pelvic floor\n- Or: try to lift your testicles without using hands\n\n**Beginner routine:**\n- Contract pelvic floor\n- Hold 3 seconds\n- Relax 3 seconds\n- 10 reps, 3 times daily\n\n**Intermediate (after 2 weeks):**\n- Hold 5 seconds\n- Relax 5 seconds\n- 15 reps, 3 times daily\n\n**Advanced:**\n- Hold 10 seconds\n- Quick pulses (1 sec on/off) x 10\n- 20 reps, 3 times daily\n\n**Tips:**\n- Do them anywhere (no one knows!)\n- Don't squeeze abs or glutes\n- Breathe normally\n- Be consistent - results in 4-6 weeks",
        "category": "kegel"
    },
]

# =============================================================================
# CALISTHENICS
# =============================================================================

CALISTHENICS = [
    {
        "instruction": "What is calisthenics?",
        "output": "**Calisthenics - Bodyweight Strength Training**\n\n**What is it?**\nStrength training using your own body weight. Think gymnastics movements for fitness.\n\n**Benefits:**\n- No equipment needed\n- Build strength AND flexibility\n- Impressive skills (muscle-ups, handstands)\n- Functional strength\n- Can train anywhere\n\n**Basic movements:**\n- Push-ups → Dips → Planche\n- Pull-ups → Muscle-ups → Front lever\n- Squats → Pistol squats\n- Plank → L-sit → V-sit\n\n**Skill progressions:**\n1. **Handstand** - Balance, shoulder strength\n2. **Muscle-up** - Pull + push combination\n3. **Front lever** - Core + back strength\n4. **Planche** - Ultimate pushing strength\n5. **Human flag** - Full body control\n\n**Who is it for?**\n- Anyone! From beginners to advanced\n- Great if you can't access a gym\n- Complements weight training\n\nWant me to give you a calisthenics progression plan?",
        "category": "calisthenics"
    },
    {
        "instruction": "كاليسثنكس ايه",
        "output": "**كاليسثنكس - تمارين بوزن الجسم**\n\n**يعني إيه؟**\nتمارين قوة باستخدام وزن جسمك بس. زي حركات الجمباز للفيتنس.\n\n**الفوايد:**\n- مفيش معدات\n- بتبني قوة ومرونة\n- مهارات مبهرة (ماسل أب، هاندستاند)\n- قوة وظيفية\n- تتمرن في أي مكان\n\n**الحركات الأساسية:**\n- بوش أبس ← ديبس ← بلانش\n- بول أبس ← ماسل أبس ← فرونت ليفر\n- سكوات ← بيستول سكوات\n- بلانك ← L-sit\n\n**المهارات:**\n1. **هاندستاند** - توازن + قوة كتف\n2. **ماسل أب** - سحب + دفع\n3. **فرونت ليفر** - كور + ضهر\n4. **بلانش** - أقصى قوة دفع\n5. **هيومان فلاج** - تحكم كامل\n\n**لمين؟**\n- أي حد! من المبتدئين للمتقدمين\n- كويس لو مفيش جيم\n\nعايز خطة تدرج في الكاليسثنكس؟",
        "category": "calisthenics_ar"
    },
    {
        "instruction": "How to progress to muscle up?",
        "output": "**Muscle-Up Progression (Step by Step):**\n\n**Prerequisites:**\n- 10+ strict pull-ups\n- 15+ dips\n- Basic understanding of the movement\n\n**Phase 1: Strength Base (2-4 weeks)**\n- Pull-ups: 3x8-12\n- High pull-ups (pull to chest): 3x5-8\n- Dips: 3x10-15\n- Straight bar dips: 3x8-10\n\n**Phase 2: Explosive Pull (2-4 weeks)**\n- Explosive pull-ups: 3x5\n- Chest-to-bar pull-ups: 3x5-8\n- Clapping pull-ups: 3x3-5\n\n**Phase 3: Transition (2-4 weeks)**\n- Band-assisted muscle-ups\n- Jumping muscle-ups (low bar)\n- Negative muscle-ups (jump up, lower slowly)\n\n**Phase 4: The Muscle-Up**\n- Focus on the swing/kip\n- Pull explosively\n- Lean forward over the bar\n- Push up to finish\n\n**Common mistakes:**\n- Not pulling high enough\n- Elbows flaring out\n- Not leaning forward enough\n\n**Timeline:** 2-6 months depending on starting strength",
        "category": "calisthenics"
    },
    {
        "instruction": "Pull-up progression for beginners",
        "output": "**Pull-Up Progression (Can't do 1? Start here!)**\n\n**Level 0: Dead Hang**\n- Just hang from bar\n- Build grip strength\n- Goal: 30-60 seconds\n\n**Level 1: Scapular Pulls**\n- Hang from bar\n- Pull shoulder blades down/back\n- Arms stay straight\n- 3x10\n\n**Level 2: Negative Pull-Ups**\n- Jump to top position\n- Lower yourself slowly (5 seconds)\n- 3x5\n\n**Level 3: Band-Assisted Pull-Ups**\n- Loop band on bar, step in\n- Do full pull-ups with assistance\n- Use lighter bands over time\n\n**Level 4: Jumping Pull-Ups**\n- Jump to assist the pull\n- Focus on the negative\n\n**Level 5: First Pull-Up!**\n- You made it!\n\n**Level 6: Multiple Pull-Ups**\n- Add 1 rep per week\n- Goal: 10 strict pull-ups\n\n**Alternative: Australian/Inverted Rows**\n- Under a table\n- Easier than pull-ups\n- Great for building pulling strength\n\n**Timeline:** 4-12 weeks to first pull-up",
        "category": "calisthenics"
    },
]

# =============================================================================
# SPORTS BASICS
# =============================================================================

SPORTS_TRAINING = [
    # Boxing basics
    {
        "instruction": "Basic boxing workout for fitness",
        "output": "**Boxing Fitness Workout (No Partner Needed):**\n\n**Equipment:**\n- Boxing gloves (optional)\n- Hand wraps (recommended)\n- Heavy bag OR shadowboxing\n\n**Warm-up (5 min):**\n- Jump rope: 2 min\n- Arm circles: 30 sec\n- Shoulder rolls: 30 sec\n- Torso twists: 30 sec\n- Light shadowboxing: 1 min\n\n**Basic punches to learn:**\n1. **Jab** - Quick straight punch, lead hand\n2. **Cross** - Power straight, rear hand\n3. **Hook** - Curved punch, either hand\n4. **Uppercut** - Upward punch, either hand\n\n**Workout:**\n- Round 1: Jab only (3 min)\n- Rest: 1 min\n- Round 2: Jab-Cross combo (3 min)\n- Rest: 1 min\n- Round 3: Jab-Cross-Hook (3 min)\n- Rest: 1 min\n- Round 4: Free combo (3 min)\n- Rest: 1 min\n- Round 5: Body shots (3 min)\n- Round 6: Speed round - fast jabs (2 min)\n\n**Finisher:**\n- Burpees: 3x10\n- Mountain climbers: 3x20\n- Plank: 1 min\n\n**Benefits:** Cardio, coordination, stress relief, full body workout!",
        "category": "sports_boxing"
    },
    {
        "instruction": "تمرين ملاكمة للفيتنس",
        "output": "**تمرين ملاكمة للياقة (من غير بارتنر):**\n\n**المعدات:**\n- جوانتي (اختياري)\n- لفافات يد (منصوح بيها)\n- شنطة ملاكمة أو شادو بوكسنج\n\n**إحماء (5 دقايق):**\n- حبل: دقيقتين\n- دوائر للدراعات\n- شادو بوكسنج خفيف\n\n**اللكمات الأساسية:**\n1. **جاب** - لكمة مستقيمة سريعة\n2. **كروس** - لكمة قوية باليد الخلفية\n3. **هوك** - لكمة منحنية\n4. **أبركت** - لكمة لفوق\n\n**التمرين:**\n- راوند 1: جاب بس (3 دقايق)\n- راحة: دقيقة\n- راوند 2: جاب-كروس (3 دقايق)\n- راحة: دقيقة\n- راوند 3: جاب-كروس-هوك (3 دقايق)\n- راحة: دقيقة\n- راوند 4: كومبو حر (3 دقايق)\n- راوند 5: لكمات على الجسم (3 دقايق)\n\n**ختام:**\n- بيربيز: 3x10\n- ماونتن كلايمرز: 3x20\n- بلانك: دقيقة\n\n**الفوايد:** كارديو، تنسيق، تفريغ ضغط، تمرين كامل!",
        "category": "sports_boxing_ar"
    },

    # Muay Thai basics
    {
        "instruction": "Muay Thai basics for beginners",
        "output": "**Muay Thai Basics - The Art of 8 Limbs:**\n\n**What is Muay Thai?**\nThai boxing using 8 weapons: 2 fists, 2 elbows, 2 knees, 2 shins.\n\n**Basic Stance:**\n- Feet shoulder-width apart\n- Rear foot at 45 degrees\n- Hands up protecting face\n- Chin tucked\n- Weight slightly on back foot\n\n**The 8 Weapons:**\n\n**Fists:**\n- Jab, Cross, Hook, Uppercut\n\n**Elbows:**\n- Horizontal elbow\n- Uppercut elbow\n- Spinning elbow\n\n**Knees:**\n- Straight knee\n- Diagonal knee\n- Flying knee\n\n**Kicks:**\n- Roundhouse kick (leg, body, head)\n- Teep (push kick)\n- Low kick\n\n**Basic Combo to Practice:**\n1. Jab - Cross - Low kick\n2. Jab - Cross - Knee\n3. Teep - Cross - Hook\n\n**Conditioning:**\n- Heavy bag work\n- Shadowboxing\n- Skip rope\n- Clinch work (with partner)\n\n**Note:** For proper technique, find a Muay Thai gym. This is just basics for fitness!",
        "category": "sports_muaythai"
    },

    # BJJ basics
    {
        "instruction": "BJJ conditioning workout",
        "output": "**BJJ Conditioning Workout (At Home):**\n\n**Why BJJ-specific conditioning?**\nBJJ uses muscles differently - lots of grip, pulling, hip mobility, and explosive movements.\n\n**Warm-up (5 min):**\n- Hip circles\n- Shoulder rolls\n- Technical stand-ups: 10 each side\n- Shrimping: 10 each side\n- Granby rolls: 5 each side\n\n**Strength Circuit (3 rounds):**\n- Pull-ups: 8-10 (grip strength)\n- Push-ups: 15-20\n- Squats: 20\n- Bridges (wrestling): 10\n- Plank: 30 sec\n\n**BJJ-Specific Exercises:**\n- Shrimps: 3x10 each side\n- Technical stand-ups: 3x10\n- Sprawls: 3x10\n- Guard hip escapes: 3x10\n- Sit-outs: 3x10\n\n**Grip Training:**\n- Dead hangs: 3x30 sec\n- Towel pull-ups: 3x max\n- Gi grip holds: 3x30 sec\n\n**Cardio:**\n- 5 min light rolling simulation (shadowboxing but for grappling)\n\n**Note:** This is conditioning - for technique, train with a BJJ coach!",
        "category": "sports_bjj"
    },
]

# =============================================================================
# MIXED TRAINING RECOMMENDATIONS
# =============================================================================

MIXED_TRAINING = [
    {
        "instruction": "I do bodybuilding but want to add flexibility, what should I do?",
        "output": "**Flexibility for Bodybuilders - Smart Addition!**\n\n**Why it helps bodybuilding:**\n- Better range of motion = more muscle activation\n- Reduces injury risk\n- Improves squat depth\n- Better posture and aesthetics\n- Faster recovery\n\n**10-Minute Daily Yoga Routine for Bodybuilders:**\n\n1. **Cat-Cow** - 1 min (spine mobility)\n2. **Downward Dog** - 1 min (hamstrings, shoulders)\n3. **Pigeon Pose** - 1 min each side (hip flexors)\n4. **World's Greatest Stretch** - 1 min each side\n5. **Chest Doorway Stretch** - 1 min (chest/shoulders)\n6. **Seated Forward Fold** - 1 min (hamstrings)\n7. **Child's Pose** - 1 min (relaxation)\n\n**When to do it:**\n- Morning: Wake up routine\n- Post-workout: Recovery\n- Before bed: Better sleep\n\n**Weekly schedule:**\n- Daily: 10-min routine above\n- 1-2x/week: Full 30-min yoga session\n\n**Key areas for bodybuilders:**\n- Hip flexors (from sitting)\n- Chest/shoulders (from pressing)\n- Hamstrings (from leg training)\n\nYour lifts will actually improve with better flexibility!",
        "category": "mixed_training"
    },
    {
        "instruction": "أنا ببني عضل عايز أضيف مرونة",
        "output": "**مرونة لبناء العضلات - إضافة ذكية!**\n\n**ليه بتساعد البودي بيلدنج:**\n- مدى حركة أحسن = عضلات أكتر\n- إصابات أقل\n- سكوات أعمق\n- وقفة أحسن\n- استشفاء أسرع\n\n**روتين 10 دقايق يوجا للبودي بيلدرز:**\n\n1. **القطة-البقرة** - دقيقة\n2. **الكلب المنكس** - دقيقة\n3. **وضعية الحمامة** - دقيقة لكل جانب\n4. **أعظم استرتش** - دقيقة لكل جانب\n5. **استرتش الصدر على الباب** - دقيقة\n6. **الانحناء للأمام** - دقيقة\n7. **وضعية الطفل** - دقيقة\n\n**امتى تعمله:**\n- الصبح: روتين صحيان\n- بعد التمرين: استشفاء\n- قبل النوم: نوم أحسن\n\n**الجدول:**\n- يومياً: 10 دقايق\n- 1-2 مرة/أسبوع: يوجا 30 دقيقة\n\nالرفعات بتاعتك هتتحسن مع مرونة أحسن!",
        "category": "mixed_training_ar"
    },

    {
        "instruction": "I want to combine weight training with calisthenics",
        "output": "**Combining Weights + Calisthenics - Best of Both Worlds!**\n\n**Benefits of combining:**\n- Strength from weights\n- Mobility from calisthenics\n- Impressive skills\n- Functional fitness\n- Never gets boring\n\n**Option 1: Hybrid Split**\n\n**Day 1 - Push (Weights focus)**\n- Bench Press: 4x6-8\n- OHP: 3x8-10\n- Dips: 3x max\n- Push-up variations: 3x12\n\n**Day 2 - Pull (Calisthenics focus)**\n- Pull-ups: 4x max\n- Rows (weighted): 3x8-10\n- Muscle-up practice: 15 min\n- Front lever progressions: 3x10 sec\n\n**Day 3 - Legs (Weights focus)**\n- Squats: 4x6-8\n- RDL: 3x10\n- Pistol squat practice: 3x5 each\n- Calf raises: 4x15\n\n**Day 4 - Skills (Calisthenics)**\n- Handstand practice: 15 min\n- L-sit: 3x max hold\n- Planche progressions: 10 min\n- Core work: 15 min\n\n**Option 2: Every workout**\n- Start with compound lift (strength)\n- End with calisthenics skills (practice)\n\nWhich option interests you more?",
        "category": "mixed_training"
    },

    {
        "instruction": "What training should I add for better sports performance?",
        "output": "**Sports Performance Training Additions:**\n\n**Tell me your sport and I'll customize! But here are general additions:**\n\n**For ALL sports:**\n1. **Mobility work** (10 min daily)\n   - Hip mobility\n   - Shoulder mobility\n   - Ankle mobility\n\n2. **Core stability** (3x/week)\n   - Planks\n   - Dead bugs\n   - Pallof press\n\n3. **Plyometrics** (2x/week)\n   - Box jumps\n   - Broad jumps\n   - Medicine ball throws\n\n**Sport-specific:**\n\n**Combat sports (boxing, MMA, BJJ):**\n- Grip training\n- Neck strengthening\n- Explosive hip power\n- Cardio intervals\n\n**Running/Endurance:**\n- Single-leg strength\n- Hip stability\n- Core endurance\n- Mobility\n\n**Football/Basketball:**\n- Lateral agility\n- Vertical jump training\n- Sprint work\n- Change of direction\n\n**Swimming:**\n- Shoulder mobility\n- Lat strength\n- Core rotation\n- Ankle flexibility\n\nWhat sport do you play?",
        "category": "mixed_training"
    },
]

# =============================================================================
# PERSONALIZED RECOMMENDATIONS (Based on User Profile)
# =============================================================================

PERSONALIZED = [
    {
        "instruction": "Based on my body fat being 25%, what should I focus on?",
        "output": "**Personalized Recommendation for 25% Body Fat:**\n\n**Your situation:**\n- 25% is 'average' for men, 'fitness' for women\n- Good starting point for transformation!\n\n**Primary focus: Body Recomposition**\n\n**Nutrition (most important!):**\n- Slight caloric deficit: 300-500 below TDEE\n- High protein: 2g per kg bodyweight\n- Track your food (Forma app!)\n\n**Training split:**\n- 4x/week strength training\n- 2-3x/week cardio (LISS or HIIT)\n\n**Recommended approach:**\n1. **Weeks 1-4:** Build habits, learn movements\n2. **Weeks 5-12:** Progressive overload, strict diet\n3. **Week 13+:** Assess and adjust\n\n**Expected results (12 weeks):**\n- Body fat: 25% → 18-20%\n- Muscle: Maintained or slightly gained\n- Strength: Increased\n\n**Priority exercises:**\n- Compound movements (squat, deadlift, bench, rows)\n- Full body or Upper/Lower split\n\n**Cardio:**\n- 2x HIIT (20 min)\n- 1x LISS (30-45 min walk)\n\nWant me to create a specific program for you?",
        "category": "personalized"
    },
    {
        "instruction": "My goal is to build muscle but I'm skinny fat, what do I do?",
        "output": "**Skinny Fat Transformation Plan:**\n\n**What is skinny fat?**\n- Low muscle mass\n- Higher body fat (especially belly)\n- Look thin in clothes, soft without\n\n**The debate: Bulk or Cut first?**\n\n**My recommendation: RECOMP**\n\n**Why recomp for skinny fat:**\n- You're a beginner = can build muscle in deficit\n- Cutting first = look even skinnier\n- Bulking first = get fatter\n- Recomp = best of both worlds\n\n**How to recomp:**\n\n**Nutrition:**\n- Eat at maintenance calories (not surplus, not deficit)\n- HIGH protein: 2-2.2g per kg bodyweight\n- This is KEY!\n\n**Training:**\n- Focus on STRENGTH\n- Compound lifts: Squat, Deadlift, Bench, Rows, OHP\n- Progressive overload every week\n- 4x per week minimum\n\n**Program: Upper/Lower Split**\n\n**Upper A:**\n- Bench: 4x6-8\n- Rows: 4x8-10\n- OHP: 3x8-10\n- Curls/Triceps: 3x12\n\n**Lower A:**\n- Squat: 4x6-8\n- RDL: 3x10\n- Leg Press: 3x12\n- Calves: 4x15\n\n**Timeline:** 3-6 months of recomp, then reassess.\n\nYou'll gain muscle AND lose fat simultaneously!",
        "category": "personalized"
    },

    {
        "instruction": "I uploaded my body scan, how should I adjust my training?",
        "output": "**Analyzing Your Body Scan Data (Forma Plus Feature):**\n\nTo give you the best recommendations, I look at:\n\n**Key metrics from your scan:**\n1. **Body fat %** - Overall leanness\n2. **Muscle mass** - Total and by region\n3. **Visceral fat** - Deep belly fat (health risk)\n4. **Bone density** - Important for longevity\n5. **Left/right imbalances** - Injury risk\n\n**What I'll customize:**\n\n**If high body fat (>25% men, >32% women):**\n- Caloric deficit recommendation\n- More cardio\n- Higher protein\n\n**If low muscle mass:**\n- Progressive overload focus\n- Caloric surplus or maintenance\n- Compound movement priority\n\n**If imbalances detected:**\n- Unilateral exercises (single arm/leg)\n- Corrective exercises\n- Mobility work for tight areas\n\n**If high visceral fat:**\n- Priority on fat loss\n- HIIT cardio recommended\n- Diet focus on whole foods\n\n**Please share your scan results:**\n- Body fat %\n- Muscle mass (kg)\n- Any noted imbalances\n\nAnd I'll create your personalized plan!",
        "category": "personalized"
    },

    {
        "instruction": "I'm a beginner, create a complete plan for me",
        "output": "**Complete Beginner Fitness Plan:**\n\n**Phase 1: Foundation (Weeks 1-4)**\n\n**Goals:**\n- Learn proper form\n- Build exercise habit\n- Establish nutrition basics\n\n**Training (3x/week - Full Body):**\n\n**Day A:**\n- Goblet Squat: 3x10\n- Push-ups (or incline): 3x8-12\n- Dumbbell Rows: 3x10 each\n- Plank: 3x20 sec\n\n**Day B:**\n- Romanian Deadlift: 3x10\n- Dumbbell Press: 3x10\n- Lat Pulldown: 3x10\n- Dead Bugs: 3x8 each\n\n**Day C:**\n- Leg Press: 3x12\n- Dips (assisted): 3x8\n- Cable Rows: 3x10\n- Crunches: 3x15\n\n**Nutrition basics:**\n- Protein every meal\n- Vegetables every meal\n- Drink 2-3L water\n- Track food for awareness\n\n**Phase 2: Building (Weeks 5-12)**\n- Add weight progressively\n- Move to 4x/week\n- Learn more compound lifts\n\n**Cardio:**\n- 2x/week: 20-30 min walk or bike\n\n**Rest days:**\n- Light stretching\n- 10 min yoga\n\nWant me to expand on any part of this plan?",
        "category": "personalized"
    },
]

# =============================================================================
# RESEARCH-BASED ADVICE
# =============================================================================

RESEARCH_BASED = [
    {
        "instruction": "What does science say about optimal training frequency?",
        "output": "**Research on Training Frequency:**\n\n**Key finding:**\nTraining each muscle 2x per week is superior to 1x per week for hypertrophy.\n\n**The studies:**\n\n**Schoenfeld et al. (2016):**\n- Meta-analysis of 10 studies\n- 2x/week > 1x/week for muscle growth\n- No significant difference between 2x and 3x\n\n**What this means practically:**\n\n**Bro split (1x/week each muscle):**\n- Monday: Chest\n- Tuesday: Back\n- etc.\n- **Suboptimal for most people**\n\n**Better options:**\n\n**Upper/Lower (2x/week each):**\n- 4 days per week\n- Each muscle hit twice\n\n**Push/Pull/Legs (2x/week each):**\n- 6 days per week\n- Higher volume possible\n\n**Full Body (3x/week each):**\n- 3 days per week\n- Great for beginners\n- Time efficient\n\n**The takeaway:**\n- Hit each muscle at least 2x per week\n- Total weekly volume matters more than per-session\n- More frequency = can spread volume across days\n\n**My recommendation:**\n- Beginners: Full body 3x\n- Intermediate: Upper/Lower 4x\n- Advanced: PPL 6x or Upper/Lower 5x",
        "category": "research"
    },
    {
        "instruction": "What's the best rep range for muscle growth?",
        "output": "**Research on Rep Ranges for Hypertrophy:**\n\n**Old belief:**\n- 1-5 reps = Strength\n- 8-12 reps = Hypertrophy\n- 15+ reps = Endurance\n\n**Current research (Schoenfeld 2017, 2021):**\n- Muscle growth occurs across ALL rep ranges\n- As long as sets are taken close to failure\n- 5-30 reps all work!\n\n**The key factor: EFFORT**\n- Must train close to failure (1-3 RIR)\n- Light weight + high reps = same growth as heavy + low reps\n- IF effort is equal\n\n**Practical recommendations:**\n\n**Compound lifts (Squat, Deadlift, Bench):**\n- 5-10 reps\n- Heavier is safer for these movements\n- Better strength gains\n\n**Isolation exercises (Curls, Lateral Raises):**\n- 10-20 reps\n- Lighter weight is safer for joints\n- Better muscle connection\n\n**Mixed approach (best for most):**\n- Heavy compounds: 5-8 reps\n- Medium compounds: 8-12 reps\n- Isolations: 12-20 reps\n\n**Volume matters more than rep range!**\n- 10-20 sets per muscle per week\n- Spread across 2+ sessions\n\nFocus on progressive overload in whatever rep range you choose!",
        "category": "research"
    },

    {
        "instruction": "How much protein do I really need?",
        "output": "**Research on Protein Requirements:**\n\n**The studies:**\n\n**Morton et al. (2018) - Meta-analysis:**\n- 49 studies, 1,863 participants\n- Optimal intake: **1.6g/kg/day**\n- No additional benefit beyond **2.2g/kg/day**\n\n**Practical ranges:**\n\n**For muscle building:**\n- Minimum: 1.6g per kg bodyweight\n- Optimal: 1.8-2.2g per kg\n- Maximum useful: 2.2g per kg\n\n**Example (80kg person):**\n- Minimum: 128g protein/day\n- Optimal: 144-176g/day\n- Max useful: 176g/day\n\n**When you might need MORE:**\n- Caloric deficit (dieting): 2.0-2.4g/kg\n- Very lean (sub 10% body fat): 2.2-2.6g/kg\n- Natural athletes: Upper end of range\n\n**Timing (less important than total):**\n- Spread across 3-5 meals\n- 20-40g per meal is well-utilized\n- Pre/post workout: 20-40g each\n\n**Quality matters:**\n- Complete proteins (meat, eggs, dairy)\n- If vegetarian: combine sources\n\n**Bottom line:**\n- Get 1.6-2.2g per kg bodyweight\n- Don't stress about timing\n- Whole foods preferred over supplements\n\nAre you hitting this target?",
        "category": "research"
    },
]

def main():
    """Generate advanced training data"""
    all_data = []

    all_data.extend(KEGEL_EXERCISES)
    print(f"Kegel exercises: {len(KEGEL_EXERCISES)}")

    all_data.extend(CALISTHENICS)
    print(f"Calisthenics: {len(CALISTHENICS)}")

    all_data.extend(SPORTS_TRAINING)
    print(f"Sports training: {len(SPORTS_TRAINING)}")

    all_data.extend(MIXED_TRAINING)
    print(f"Mixed training: {len(MIXED_TRAINING)}")

    all_data.extend(PERSONALIZED)
    print(f"Personalized: {len(PERSONALIZED)}")

    all_data.extend(RESEARCH_BASED)
    print(f"Research-based: {len(RESEARCH_BASED)}")

    print(f"\nTotal: {len(all_data)} samples")

    # Save
    output_dir = os.path.dirname(os.path.dirname(__file__))
    output_path = os.path.join(output_dir, "training-data", "advanced_training.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"Saved to: {output_path}")
    return all_data

if __name__ == "__main__":
    main()
