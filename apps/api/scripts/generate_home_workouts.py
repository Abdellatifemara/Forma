# -*- coding: utf-8 -*-
"""
FORMA FITNESS - HOME WORKOUTS & ALTERNATIVES
=============================================
Adds:
- Equipment alternatives
- Resistance band exercises
- Bodyweight exercises
- Yoga poses
- Home workout routines
"""

import json
import os

# =============================================================================
# EQUIPMENT ALTERNATIVES
# =============================================================================

EQUIPMENT_ALTERNATIVES = [
    # No dumbbells
    {
        "instruction": "I don't have dumbbells, what can I use?",
        "output": "**No dumbbells? No problem!** Here are alternatives:\n\n**Household items:**\n- Water bottles (500ml = 0.5kg, 1.5L = 1.5kg)\n- Backpack filled with books\n- Rice/sugar bags (1kg, 2kg, 5kg)\n- Laundry detergent bottles\n- Paint cans\n\n**Better alternatives:**\n- Resistance bands (cheap and versatile!)\n- Kettlebell (one is enough for many exercises)\n- Adjustable dumbbells (good investment)\n\n**Or go bodyweight:**\n- Push-ups, pull-ups, dips\n- Squats, lunges, step-ups\n- Planks, leg raises\n\nWhat exercise are you trying to do? I can suggest a specific alternative!",
        "category": "equipment_alternative"
    },
    {
        "instruction": "مفيش عندي دامبلز اعمل ايه؟",
        "output": "**مفيش دامبلز؟ مفيش مشكلة!**\n\n**حاجات من البيت:**\n- زجاجات مية (نص لتر = نص كيلو)\n- شنطة فيها كتب\n- أكياس رز أو سكر\n- جركن مية\n\n**بدائل أحسن:**\n- رزستنس باند (رخيصة ومفيدة!)\n- كيتل بيل\n- دامبلز قابلة للتعديل\n\n**أو تمارين بوزن الجسم:**\n- بوش أبس، بول أبس، ديبس\n- سكوات، لنجز\n- بلانك\n\nبتحاول تعمل تمرين إيه؟ أقولك البديل!",
        "category": "equipment_alternative_ar"
    },
    {
        "instruction": "ma3ndeesh dumbbells",
        "output": "No dumbbells? Use:\n- Water bottles\n- Backpack with books\n- Rice bags\n- Resistance bands (best alternative!)\n\nOr do bodyweight exercises: push-ups, squats, lunges, planks.\n\nWhat exercise do you need alternative for?",
        "category": "equipment_alternative_franco"
    },

    # No pull-up bar
    {
        "instruction": "I can't do pull-ups, what else can I do for back?",
        "output": "**No pull-up bar? Here are back alternatives:**\n\n**With Resistance Bands:**\n- Band lat pulldown (attach to door)\n- Band rows (standing or seated)\n- Band face pulls\n- Band pullovers\n\n**Bodyweight:**\n- Inverted rows (under a table)\n- Superman holds\n- Reverse snow angels\n- Door rows (hold door frame, lean back, pull)\n\n**With Household Items:**\n- Backpack rows (fill with books)\n- Water jug rows\n- Towel rows (wrap around pole)\n\n**Progression to pull-ups:**\n1. Dead hangs\n2. Negative pull-ups (jump up, lower slowly)\n3. Band-assisted pull-ups\n4. Full pull-ups\n\nWhich option works best for your situation?",
        "category": "equipment_alternative"
    },
    {
        "instruction": "مش قادر اعمل بول أبس، اعمل ايه للضهر؟",
        "output": "**مفيش بول أب بار؟ البدائل:**\n\n**بالرزستنس باند:**\n- لات بول داون بالباند\n- رو بالباند\n- فيس بولز بالباند\n\n**بوزن الجسم:**\n- انفرتد رو (تحت الترابيزة)\n- سوبرمان\n- دور رو (امسك باب واسحب)\n\n**بحاجات من البيت:**\n- رو بشنطة فيها كتب\n- رو بجركن مية\n\n**عشان توصل للبول أبس:**\n1. ديد هانج (اتعلق بس)\n2. نيجاتيف (انزل ببطء)\n3. بول أب بالباند\n4. بول أب كامل\n\nإيه اللي متاح عندك؟",
        "category": "equipment_alternative_ar"
    },

    # No cable machine
    {
        "instruction": "I don't have a cable machine, what can I use instead?",
        "output": "**Resistance bands are the PERFECT cable replacement!**\n\n**Cable → Band alternatives:**\n- Cable flyes → Band flyes\n- Lat pulldown → Band pulldown (door anchor)\n- Cable rows → Band rows\n- Tricep pushdown → Band pushdown\n- Face pulls → Band face pulls\n- Cable curls → Band curls\n- Woodchops → Band woodchops\n\n**How to set up:**\n- Door anchor (comes with most band sets)\n- Wrap around pole/pillar\n- Step on band for low anchor\n- Anchor high for pulldowns\n\n**Band advantages:**\n- Cheap (100-300 EGP for set)\n- Portable (travel-friendly)\n- Variable resistance\n- Safe (no dropping weights)\n\nResistance bands can replace 90% of cable exercises!",
        "category": "equipment_alternative"
    },
    {
        "instruction": "مفيش عندي كيبل ماشين",
        "output": "**الرزستنس باند أحسن بديل للكيبل!**\n\n**البدائل:**\n- كيبل فلاي ← باند فلاي\n- لات بول داون ← باند بول داون\n- كيبل رو ← باند رو\n- تراي بوش داون ← باند بوش داون\n- فيس بولز ← باند فيس بولز\n\n**طريقة التركيب:**\n- علقها في الباب (بيجي معاها أنكور)\n- لفها حوالين عمود\n- ادوس عليها للتمارين الواطية\n\n**مميزات الباند:**\n- رخيصة (100-300 جنيه)\n- خفيفة للسفر\n- آمنة\n\nالباند بتعوض 90% من تمارين الكيبل!",
        "category": "equipment_alternative_ar"
    },

    # No bench
    {
        "instruction": "I don't have a bench, how can I do chest exercises?",
        "output": "**No bench? Here are alternatives:**\n\n**Floor exercises:**\n- Floor press (dumbbells or barbell)\n- Floor flyes\n- Push-up variations\n\n**Using furniture:**\n- Couch/bed for decline push-ups\n- Chair for incline push-ups\n- Stable table edge for dips\n\n**Push-up variations for full chest:**\n- Regular push-ups (mid chest)\n- Decline push-ups (feet elevated - upper chest)\n- Incline push-ups (hands elevated - lower chest)\n- Wide push-ups (outer chest)\n- Diamond push-ups (inner chest + triceps)\n- Archer push-ups (advanced)\n\n**With resistance bands:**\n- Standing band press\n- Band flyes\n- Band crossovers\n\nPush-ups done right can build serious chest muscle!",
        "category": "equipment_alternative"
    },

    # Home gym on budget
    {
        "instruction": "What equipment should I buy for home workouts?",
        "output": "**Home gym on a budget - priority order:**\n\n**Level 1 (0-200 EGP):**\n- Resistance bands set ← BEST VALUE!\n- Yoga mat\n- Jump rope\n\n**Level 2 (200-500 EGP):**\n- Pull-up bar (door frame)\n- Ab wheel\n- Adjustable jump rope\n\n**Level 3 (500-1500 EGP):**\n- Pair of adjustable dumbbells\n- Kettlebell (12-16kg)\n- Dip station\n\n**Level 4 (1500+ EGP):**\n- Barbell + weights\n- Squat rack\n- Bench\n\n**My recommendation for beginners:**\nStart with resistance bands + pull-up bar + yoga mat.\nTotal: ~300-400 EGP. You can do a FULL workout!\n\nWhat's your budget?",
        "category": "home_gym"
    },
    {
        "instruction": "اشتري ايه عشان اتمرن في البيت؟",
        "output": "**جيم في البيت بميزانية:**\n\n**المستوى 1 (0-200 جنيه):**\n- رزستنس باند ← أهم حاجة!\n- مرتبة يوجا\n- حبل\n\n**المستوى 2 (200-500 جنيه):**\n- بول أب بار (للباب)\n- أب ويل\n\n**المستوى 3 (500-1500 جنيه):**\n- دامبلز قابلة للتعديل\n- كيتل بيل\n\n**المستوى 4 (1500+ جنيه):**\n- باربل + أوزان\n- سكوات راك\n- بنش\n\n**نصيحتي للمبتدئين:**\nرزستنس باند + بول أب بار + مرتبة\nالتوتال: 300-400 جنيه وتقدر تعمل كل حاجة!\n\nميزانيتك كام؟",
        "category": "home_gym_ar"
    },
]

# =============================================================================
# RESISTANCE BAND EXERCISES
# =============================================================================

RESISTANCE_BAND_EXERCISES = [
    # Overview
    {
        "instruction": "What exercises can I do with resistance bands?",
        "output": "**Resistance bands can train your ENTIRE body!**\n\n**Chest:**\n- Band push-ups (band around back)\n- Band chest press\n- Band flyes\n- Band crossovers\n\n**Back:**\n- Band rows (seated/standing)\n- Band lat pulldown\n- Band face pulls\n- Band pullovers\n\n**Shoulders:**\n- Band overhead press\n- Band lateral raises\n- Band front raises\n- Band reverse flyes\n\n**Arms:**\n- Band bicep curls\n- Band tricep pushdowns\n- Band hammer curls\n- Band overhead extensions\n\n**Legs:**\n- Band squats\n- Band deadlifts\n- Band lunges\n- Band leg curls\n- Band hip thrusts\n- Band clamshells (glutes)\n\n**Core:**\n- Band woodchops\n- Band pallof press\n- Band dead bugs\n\nWant me to explain any specific exercise?",
        "category": "resistance_bands"
    },
    {
        "instruction": "تمارين بالرزستنس باند",
        "output": "**الباند بتدرب الجسم كله!**\n\n**الصدر:**\n- بوش أب بالباند\n- تشيست بريس بالباند\n- فلاي بالباند\n\n**الضهر:**\n- رو بالباند\n- لات بول داون بالباند\n- فيس بولز بالباند\n\n**الكتف:**\n- شولدر بريس بالباند\n- لاترال رايز بالباند\n\n**الدراعات:**\n- باي كيرل بالباند\n- تراي بوش داون بالباند\n\n**الرجل:**\n- سكوات بالباند\n- ديد ليفت بالباند\n- لنجز بالباند\n- هيب ثراست بالباند\n\n**البطن:**\n- وود تشوب بالباند\n- بالوف بريس\n\nعايز أشرحلك تمرين معين؟",
        "category": "resistance_bands_ar"
    },

    # Specific band exercises
    {
        "instruction": "How to do band lat pulldown at home?",
        "output": "**Band Lat Pulldown - Home Setup:**\n\n**Equipment:**\n- Resistance band\n- Door anchor OR high anchor point\n\n**Setup options:**\n1. Door anchor at top of door\n2. Wrap band over pull-up bar\n3. Hook on top of door frame\n4. Wrap around high pole\n\n**How to do it:**\n1. Kneel or sit facing the anchor\n2. Grab band handles with arms extended up\n3. Pull down to your upper chest\n4. Squeeze your lats at the bottom\n5. Slowly return to start\n\n**Tips:**\n- Keep chest up\n- Lead with elbows, not hands\n- Control the negative (going back up)\n- Don't lean back too much\n\n**Sets/Reps:** 3-4 sets of 12-15 reps",
        "category": "resistance_bands"
    },
    {
        "instruction": "How to do band rows?",
        "output": "**Band Rows - Multiple Variations:**\n\n**1. Seated Band Row:**\n- Sit on floor, legs extended\n- Loop band around feet\n- Pull handles to waist\n- Squeeze shoulder blades\n\n**2. Standing Band Row:**\n- Anchor band at mid-height (door handle)\n- Step back for tension\n- Pull to waist, squeeze back\n\n**3. Bent Over Band Row:**\n- Stand on band\n- Hinge at hips\n- Pull band to lower chest\n\n**4. Single Arm Band Row:**\n- Anchor band low\n- One arm at a time\n- Great for core stability\n\n**Key points:**\n- Squeeze shoulder blades together\n- Don't shrug shoulders\n- Control the movement\n- Full range of motion\n\n**Sets/Reps:** 3-4 sets of 12-15 reps",
        "category": "resistance_bands"
    },
]

# =============================================================================
# BODYWEIGHT EXERCISES
# =============================================================================

BODYWEIGHT_EXERCISES = [
    {
        "instruction": "Full body workout with no equipment",
        "output": "**Full Body Bodyweight Workout:**\n\n**Warm-up (5 min):**\n- Jumping jacks x 30\n- Arm circles x 20\n- Leg swings x 10 each\n- Bodyweight squats x 10\n\n**Workout:**\n\n**1. Push-ups** - 3 sets x max reps\n(Chest, shoulders, triceps)\n\n**2. Inverted Rows** (under table) - 3 sets x 10-12\n(Back, biceps)\n\n**3. Squats** - 3 sets x 15-20\n(Quads, glutes)\n\n**4. Lunges** - 3 sets x 10 each leg\n(Quads, glutes, balance)\n\n**5. Pike Push-ups** - 3 sets x 8-12\n(Shoulders)\n\n**6. Glute Bridges** - 3 sets x 15\n(Glutes, hamstrings)\n\n**7. Plank** - 3 sets x 30-60 sec\n(Core)\n\n**8. Mountain Climbers** - 3 sets x 20\n(Core, cardio)\n\n**Rest:** 60-90 sec between sets\n**Total time:** ~30-40 minutes\n\nDo this 3x per week!",
        "category": "bodyweight_workout"
    },
    {
        "instruction": "تمرين كامل من غير معدات",
        "output": "**تمرين كامل بوزن الجسم:**\n\n**إحماء (5 دقايق):**\n- جمبنج جاكس x 30\n- دوائر للدراعات x 20\n- سكوات خفيف x 10\n\n**التمرين:**\n\n**1. بوش أبس** - 3 سيتات x أقصى عدد\n(صدر، كتف، تراي)\n\n**2. انفرتد رو** (تحت الترابيزة) - 3 سيتات x 10-12\n(ضهر، باي)\n\n**3. سكوات** - 3 سيتات x 15-20\n(رجل، مؤخرة)\n\n**4. لنجز** - 3 سيتات x 10 لكل رجل\n(رجل، توازن)\n\n**5. بايك بوش أبس** - 3 سيتات x 8-12\n(كتف)\n\n**6. جلوت بريدج** - 3 سيتات x 15\n(مؤخرة)\n\n**7. بلانك** - 3 سيتات x 30-60 ثانية\n(بطن)\n\n**الراحة:** 60-90 ثانية\n**الوقت:** 30-40 دقيقة\n\nاعمله 3 مرات في الأسبوع!",
        "category": "bodyweight_workout_ar"
    },

    # Push-up variations
    {
        "instruction": "What are different types of push-ups?",
        "output": "**Push-up Variations (Easiest to Hardest):**\n\n**Beginner:**\n1. Wall push-ups\n2. Incline push-ups (hands on chair)\n3. Knee push-ups\n\n**Intermediate:**\n4. Regular push-ups\n5. Wide push-ups (chest focus)\n6. Diamond push-ups (triceps focus)\n7. Decline push-ups (upper chest)\n\n**Advanced:**\n8. Archer push-ups\n9. Pseudo planche push-ups\n10. Clap push-ups\n11. One-arm push-ups\n\n**Muscle targeting:**\n- Wide grip → Outer chest\n- Close grip → Inner chest + triceps\n- Decline → Upper chest\n- Incline → Lower chest\n- Pike push-ups → Shoulders\n\n**Can't do regular push-ups yet?**\nStart with wall → incline → knee → full\n\nWhat's your current level?",
        "category": "bodyweight_exercises"
    },

    # Squat variations
    {
        "instruction": "Squat variations without weights",
        "output": "**Bodyweight Squat Variations:**\n\n**Standard:**\n1. Regular squat\n2. Sumo squat (wide stance)\n3. Narrow squat\n\n**Single leg (harder):**\n4. Bulgarian split squat\n5. Pistol squat (very advanced)\n6. Shrimp squat\n7. Skater squat\n\n**Plyometric (explosive):**\n8. Jump squats\n9. Box jumps\n10. Squat jacks\n\n**Isometric (holds):**\n11. Wall sit\n12. Squat hold\n\n**Adding difficulty without weights:**\n- Slow tempo (3 sec down, 3 sec up)\n- Pause at bottom\n- 1.5 reps (down, half up, down, full up)\n- Single leg variations\n- Add jump\n\n**Sets/Reps:**\n- Strength: 3-4 sets x 8-12 reps\n- Endurance: 3 sets x 20+ reps\n\nWhich one do you want to learn?",
        "category": "bodyweight_exercises"
    },
]

# =============================================================================
# YOGA & FLEXIBILITY
# =============================================================================

YOGA_EXERCISES = [
    {
        "instruction": "Basic yoga poses for beginners",
        "output": "**Beginner Yoga Poses:**\n\n**Standing:**\n1. **Mountain Pose (Tadasana)** - Foundation pose\n2. **Warrior I (Virabhadrasana I)** - Strength + balance\n3. **Warrior II** - Hip opener\n4. **Tree Pose (Vrksasana)** - Balance\n\n**Floor:**\n5. **Child's Pose (Balasana)** - Rest + stretch\n6. **Cat-Cow (Marjaryasana)** - Spine mobility\n7. **Downward Dog (Adho Mukha)** - Full body stretch\n8. **Cobra (Bhujangasana)** - Back extension\n\n**Seated:**\n9. **Seated Forward Fold** - Hamstring stretch\n10. **Butterfly Pose** - Hip opener\n\n**Lying:**\n11. **Corpse Pose (Savasana)** - Relaxation\n12. **Supine Twist** - Spine rotation\n\n**Beginner routine (15 min):**\nMountain → Forward fold → Plank → Cobra → Downward dog → Warrior I → Warrior II → Tree → Child's pose → Savasana\n\nHold each pose 30-60 seconds!",
        "category": "yoga"
    },
    {
        "instruction": "تمارين يوجا للمبتدئين",
        "output": "**وضعيات يوجا للمبتدئين:**\n\n**واقف:**\n1. **وضعية الجبل** - الأساس\n2. **المحارب 1** - قوة + توازن\n3. **المحارب 2** - فتح الورك\n4. **الشجرة** - توازن\n\n**على الأرض:**\n5. **وضعية الطفل** - راحة + استرتش\n6. **القطة-البقرة** - مرونة العمود الفقري\n7. **الكلب المنكس** - استرتش كامل\n8. **الكوبرا** - فرد الضهر\n\n**جالس:**\n9. **الانحناء للأمام** - استرتش الفخذ الخلفي\n10. **الفراشة** - فتح الورك\n\n**روتين 15 دقيقة:**\nالجبل ← الانحناء ← البلانك ← الكوبرا ← الكلب المنكس ← المحارب ← الشجرة ← الطفل ← الاسترخاء\n\nامسك كل وضعية 30-60 ثانية!",
        "category": "yoga_ar"
    },

    {
        "instruction": "Yoga for muscle recovery",
        "output": "**Yoga for Post-Workout Recovery:**\n\n**Why yoga helps recovery:**\n- Increases blood flow to muscles\n- Reduces muscle tension\n- Improves flexibility\n- Reduces stress and cortisol\n- Better sleep\n\n**Recovery sequence (20 min):**\n\n**1. Child's Pose** - 1 min\n(Relaxation, back stretch)\n\n**2. Cat-Cow** - 1 min\n(Spine mobility)\n\n**3. Downward Dog** - 1 min\n(Hamstrings, calves, shoulders)\n\n**4. Pigeon Pose** - 1 min each side\n(Hip flexors, glutes)\n\n**5. Seated Forward Fold** - 1 min\n(Hamstrings, lower back)\n\n**6. Supine Twist** - 1 min each side\n(Spine, lower back)\n\n**7. Legs Up Wall** - 3 min\n(Reduces leg swelling, relaxation)\n\n**8. Savasana** - 5 min\n(Complete relaxation)\n\n**When to do it:**\n- After workouts\n- On rest days\n- Before bed\n\nThis routine reduces soreness and improves recovery!",
        "category": "yoga"
    },

    {
        "instruction": "Stretches for tight hip flexors",
        "output": "**Hip Flexor Stretches (Important for desk workers!):**\n\n**1. Kneeling Hip Flexor Stretch**\n- Kneel on one knee\n- Push hips forward\n- Hold 30-60 sec each side\n\n**2. Pigeon Pose**\n- Front leg bent, back leg straight\n- Sink hips down\n- Hold 1-2 min each side\n\n**3. Couch Stretch**\n- Back foot on couch/wall\n- Front foot forward in lunge\n- Intense stretch!\n- Hold 1-2 min each side\n\n**4. Lizard Pose**\n- Low lunge position\n- Both hands inside front foot\n- Hold 1 min each side\n\n**5. 90/90 Stretch**\n- Both legs at 90 degrees\n- Great for hip rotation\n\n**Why tight hip flexors matter:**\n- Cause lower back pain\n- Affect squat depth\n- Limit glute activation\n- Common from sitting\n\n**Do these daily if you sit a lot!**",
        "category": "flexibility"
    },

    {
        "instruction": "Morning stretch routine",
        "output": "**5-Minute Morning Stretch Routine:**\n\n**1. Neck rolls** - 30 sec\n- Slowly roll head in circles\n- Both directions\n\n**2. Shoulder rolls** - 30 sec\n- Forward and backward\n\n**3. Cat-Cow** - 1 min\n- On hands and knees\n- Arch and round spine\n\n**4. World's Greatest Stretch** - 1 min\n- Lunge position\n- Rotate torso to ceiling\n- Switch sides\n\n**5. Standing Forward Fold** - 30 sec\n- Let head hang\n- Bend knees if needed\n\n**6. Hip circles** - 30 sec\n- Hands on hips\n- Big circles\n\n**7. Arm circles** - 30 sec\n- Small to big circles\n\n**Benefits:**\n- Wake up your body\n- Reduce stiffness\n- Improve posture\n- Better mobility for the day\n\nDo this every morning before anything else!",
        "category": "flexibility"
    },
]

# =============================================================================
# HOME WORKOUT PROGRAMS
# =============================================================================

HOME_WORKOUT_PROGRAMS = [
    {
        "instruction": "Give me a home workout program with no equipment",
        "output": "**4-Week Home Workout Program (No Equipment)**\n\n**Schedule:** Mon/Wed/Fri (or any 3 days)\n\n**WEEK 1-2: Foundation**\n\n**Day A - Push:**\n- Push-ups: 3x8-12\n- Pike push-ups: 3x6-10\n- Diamond push-ups: 3x6-10\n- Dips (chair): 3x8-12\n\n**Day B - Pull & Core:**\n- Inverted rows (table): 3x8-12\n- Superman: 3x12\n- Plank: 3x30sec\n- Dead bugs: 3x10 each\n\n**Day C - Legs:**\n- Squats: 3x15-20\n- Lunges: 3x10 each\n- Glute bridges: 3x15\n- Calf raises: 3x20\n\n**WEEK 3-4: Progression**\n- Add 1-2 reps per set\n- Slower tempo (3 sec down)\n- Add jump variations\n- Reduce rest time\n\n**Rest:** 60-90 sec between sets\n\n**Progression:**\n- Can do all reps easily? Make it harder!\n- Add pause at bottom\n- Single leg variations\n- Explosive versions\n\nWant week 5-8 program?",
        "category": "home_program"
    },
    {
        "instruction": "برنامج تمارين في البيت من غير معدات",
        "output": "**برنامج 4 أسابيع في البيت (بدون معدات)**\n\n**الجدول:** السبت/الاتنين/الأربعاء\n\n**الأسبوع 1-2:**\n\n**يوم A - دفع:**\n- بوش أبس: 3x8-12\n- بايك بوش أبس: 3x6-10\n- ديموند بوش أبس: 3x6-10\n- ديبس (كرسي): 3x8-12\n\n**يوم B - سحب + بطن:**\n- انفرتد رو (ترابيزة): 3x8-12\n- سوبرمان: 3x12\n- بلانك: 3x30 ثانية\n- ديد باج: 3x10 لكل جانب\n\n**يوم C - رجل:**\n- سكوات: 3x15-20\n- لنجز: 3x10 لكل رجل\n- جلوت بريدج: 3x15\n- كالف رايز: 3x20\n\n**الأسبوع 3-4:**\n- زود 1-2 عدة\n- ابطء الحركة\n- أضف قفز\n\n**الراحة:** 60-90 ثانية\n\nعايز البرنامج للأسابيع 5-8؟",
        "category": "home_program_ar"
    },

    {
        "instruction": "Resistance band workout program",
        "output": "**4-Day Resistance Band Program:**\n\n**Day 1 - Chest & Triceps:**\n- Band chest press: 4x12\n- Band flyes: 3x15\n- Band push-ups: 3x12\n- Band tricep pushdown: 3x15\n- Band overhead extension: 3x12\n\n**Day 2 - Back & Biceps:**\n- Band lat pulldown: 4x12\n- Band rows: 4x12\n- Band face pulls: 3x15\n- Band curls: 3x15\n- Band hammer curls: 3x12\n\n**Day 3 - Legs:**\n- Band squats: 4x15\n- Band Romanian deadlift: 3x12\n- Band lunges: 3x10 each\n- Band leg curls: 3x15\n- Band hip thrusts: 3x15\n- Band clamshells: 3x15 each\n\n**Day 4 - Shoulders & Core:**\n- Band overhead press: 4x12\n- Band lateral raises: 3x15\n- Band front raises: 3x12\n- Band face pulls: 3x15\n- Band woodchops: 3x12 each\n- Band pallof press: 3x12 each\n\n**Progressive overload:**\n- Use heavier band\n- More reps\n- Slower tempo\n- Less rest",
        "category": "band_program"
    },
]

def main():
    """Generate home workout training data"""
    all_data = []

    all_data.extend(EQUIPMENT_ALTERNATIVES)
    print(f"Equipment alternatives: {len(EQUIPMENT_ALTERNATIVES)}")

    all_data.extend(RESISTANCE_BAND_EXERCISES)
    print(f"Resistance band exercises: {len(RESISTANCE_BAND_EXERCISES)}")

    all_data.extend(BODYWEIGHT_EXERCISES)
    print(f"Bodyweight exercises: {len(BODYWEIGHT_EXERCISES)}")

    all_data.extend(YOGA_EXERCISES)
    print(f"Yoga & flexibility: {len(YOGA_EXERCISES)}")

    all_data.extend(HOME_WORKOUT_PROGRAMS)
    print(f"Home workout programs: {len(HOME_WORKOUT_PROGRAMS)}")

    print(f"\nTotal: {len(all_data)} samples")

    # Save
    output_dir = os.path.dirname(os.path.dirname(__file__))
    output_path = os.path.join(output_dir, "training-data", "home_workouts_training.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"Saved to: {output_path}")
    return all_data

if __name__ == "__main__":
    main()
