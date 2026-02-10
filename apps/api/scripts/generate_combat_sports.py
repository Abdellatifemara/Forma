# -*- coding: utf-8 -*-
"""
FORMA FITNESS - EXTENSIVE COMBAT SPORTS TRAINING DATA
======================================================
Comprehensive coverage of:
- Boxing (extensive)
- Muay Thai (extensive)
- BJJ (extensive)
"""

import json
import os

# =============================================================================
# BOXING - EXTENSIVE
# =============================================================================

BOXING = [
    # Basic punches
    {
        "instruction": "How to throw a jab?",
        "output": "**The Jab - Your Most Important Punch**\n\n**What it is:**\nQuick, straight punch with your lead hand (left for orthodox, right for southpaw).\n\n**Technique:**\n1. Start in boxing stance\n2. Extend lead arm straight out\n3. Rotate fist so palm faces down at impact\n4. Snap it back immediately\n5. Keep rear hand protecting chin\n\n**Key points:**\n- Speed over power\n- Don't wind up or telegraph\n- Return hand to guard FAST\n- Slight step forward optional\n- Exhale sharply on punch\n\n**Uses:**\n- Measure distance\n- Set up power punches\n- Keep opponent at bay\n- Score points\n- Disrupt opponent's rhythm\n\n**Common mistakes:**\n- Dropping rear hand\n- Leaning forward too much\n- Slow return\n- Flaring elbow\n\n**Drills:**\n- Jab in mirror: 3x1 min\n- Double jab: 3x1 min\n- Jab while moving: 3x1 min\n\nThe jab is 80% of boxing. Master it!",
        "category": "boxing_technique"
    },
    {
        "instruction": "ازاي ارمي جاب؟",
        "output": "**الجاب - أهم لكمة في الملاكمة**\n\n**يعني إيه:**\nلكمة مستقيمة سريعة باليد الأمامية.\n\n**التكنيك:**\n1. ابدأ من وقفة الملاكمة\n2. مد دراعك الأمامي بشكل مستقيم\n3. لف قبضتك عشان الكف يبقى لتحت وقت الضربة\n4. ارجعها فوراً\n5. خلي اليد التانية تحمي دقنك\n\n**نقط مهمة:**\n- السرعة أهم من القوة\n- متعملش حركة تحضيرية\n- ارجع ايدك بسرعة\n- متفتحش كوعك\n- اطلع نفسك بحدة مع اللكمة\n\n**استخدامات:**\n- قياس المسافة\n- تحضير للكمات القوية\n- إبعاد الخصم\n- تسجيل نقط\n\n**أخطاء شائعة:**\n- نزول اليد الخلفية\n- الميل للأمام كتير\n- الرجوع البطيء\n\n**تدريبات:**\n- جاب في المراية: 3x1 دقيقة\n- دبل جاب: 3x1 دقيقة\n\nالجاب 80% من الملاكمة. اتقنه!",
        "category": "boxing_technique_ar"
    },
    {
        "instruction": "How to throw a cross?",
        "output": "**The Cross (Straight Right/Left) - Your Power Punch**\n\n**What it is:**\nPowerful straight punch from your rear hand.\n\n**Technique:**\n1. Start in stance, weight on back foot\n2. Rotate back hip and shoulder forward\n3. Extend rear arm straight\n4. Pivot on back foot (heel comes up)\n5. Fist rotates palm down at impact\n6. Chin stays tucked behind shoulder\n\n**Power generation:**\n- Power comes from HIPS, not arm\n- Think: foot → hip → shoulder → fist\n- Full body rotation\n- Drive off back foot\n\n**Key points:**\n- Don't reach or lean\n- Keep lead hand up\n- Snap back to guard\n- Land with first two knuckles\n\n**Common mistakes:**\n- Arm punch (no hip rotation)\n- Dropping lead hand\n- Winding up (telegraphing)\n- Leaning off balance\n\n**Best setup:**\n- Jab → Cross (the basic 1-2)\n- Slip → Cross (counter)\n- Feint → Cross\n\n**Drills:**\n- Shadow 1-2: 5x2 min\n- Heavy bag cross: 3x2 min\n- Cross with hip rotation focus: 3x1 min",
        "category": "boxing_technique"
    },
    {
        "instruction": "How to throw a hook?",
        "output": "**The Hook - Devastating Close-Range Power**\n\n**What it is:**\nCurved punch targeting the side of head or body.\n\n**Lead Hook Technique:**\n1. Start in stance\n2. Rotate lead hip and shoulder\n3. Arm stays bent at 90 degrees\n4. Elbow stays at shoulder height\n5. Pivot on lead foot\n6. Palm can face down or towards you\n\n**Rear Hook Technique:**\n- Same principles\n- Bigger rotation needed\n- Often follows a jab or cross\n\n**Power generation:**\n- Hip rotation is everything\n- Think: rotating a door on hinges\n- Short, compact movement\n- Don't swing wide\n\n**Target areas:**\n- **Head hook:** Temple, jaw, ear\n- **Body hook:** Liver (right side), ribs, floating ribs\n\n**Common mistakes:**\n- Winding up (looping too wide)\n- Arm too straight or too bent\n- Dropping opposite hand\n- Not rotating hips\n\n**Liver shot (left hook to body):**\n- One of the most devastating punches\n- Right side of opponent's body\n- Causes instant pain and shutdown\n\n**Drills:**\n- Hook on heavy bag: 3x2 min\n- 1-2-3 combo (jab-cross-hook): 5x2 min\n- Body hooks: 3x2 min",
        "category": "boxing_technique"
    },
    {
        "instruction": "How to throw an uppercut?",
        "output": "**The Uppercut - Rising Power**\n\n**What it is:**\nUpward punch targeting chin or body.\n\n**Lead Uppercut Technique:**\n1. Slight dip/bend knees\n2. Drop lead hand slightly\n3. Drive upward with legs\n4. Rotate hip and shoulder\n5. Palm faces you at impact\n6. Punch rises at 45-degree angle\n\n**Rear Uppercut Technique:**\n- Same mechanics\n- More power potential\n- Bigger hip rotation\n\n**Power generation:**\n- Power from legs driving up\n- Hip rotation adds torque\n- Short, compact movement\n- Explode upward\n\n**Targets:**\n- **Chin:** Knockout punch\n- **Body:** Solar plexus, gut\n- **Inside:** When in close range\n\n**When to use:**\n- Inside fighting (close range)\n- After slipping punches\n- Against crouching opponents\n- Mixed in combinations\n\n**Common mistakes:**\n- Winding up too low\n- Leaning back\n- Telegraphing\n- Looping instead of straight up\n\n**Combinations:**\n- Jab → Cross → Lead uppercut\n- Slip outside → Rear uppercut\n- Body jab → Head uppercut\n\n**Drills:**\n- Uppercut on bag: 3x2 min\n- 1-2-uppercut: 3x2 min\n- Close range work: 3x2 min",
        "category": "boxing_technique"
    },

    # Boxing defense
    {
        "instruction": "Boxing defense techniques",
        "output": "**Boxing Defense - The Art of Not Getting Hit**\n\n**1. Slip**\n- Small head movement to avoid punch\n- Bend at waist, move head off centerline\n- Inside slip: head goes toward opponent\n- Outside slip: head goes away\n- Stay in punching range\n\n**2. Bob and Weave**\n- Bend knees, dip under hooks\n- Move in U-shape motion\n- Great for getting inside\n- Follow with counter hooks\n\n**3. Parry**\n- Deflect punch with open hand\n- Small movement, redirect punch\n- Don't reach or push\n- Sets up counter punches\n\n**4. Block**\n- High guard: gloves protect head\n- Body block: elbows protect ribs\n- Shell defense: tight guard\n- Last resort, not ideal\n\n**5. Roll**\n- Roll shoulder to deflect punch\n- Great for hooks\n- Sets up counters\n\n**6. Pull/Lean Back**\n- Move head back to avoid punch\n- Don't overcommit\n- Counter with jab\n\n**7. Footwork**\n- Best defense = not being there\n- Angles, pivots, step back\n- Circle away from power hand\n\n**Defensive drill (3 rounds each):**\n- Partner throws jabs, you slip\n- Partner throws hooks, you bob and weave\n- Partner throws combos, you mix defenses\n\n**Golden rule:** Always counter after defending!",
        "category": "boxing_defense"
    },
    {
        "instruction": "تقنيات الدفاع في الملاكمة",
        "output": "**الدفاع في الملاكمة**\n\n**1. السليب (Slip)**\n- حركة رأس صغيرة لتفادي اللكمة\n- اتني من الوسط، حرك راسك من خط النص\n- ابقى في مسافة اللكم\n\n**2. البوب آند ويف (Bob & Weave)**\n- اتني ركبك، انزل تحت الهوكات\n- اتحرك بشكل حرف U\n- كويس للدخول جوه\n\n**3. الباري (Parry)**\n- حول اللكمة بايدك المفتوحة\n- حركة صغيرة\n- بيحضر للكمة مضادة\n\n**4. البلوك (Block)**\n- الجارد العالي: الجوانتي بيحمي الراس\n- بلوك الجسم: الكوع بيحمي الضلوع\n- آخر حل، مش مثالي\n\n**5. الرول (Roll)**\n- لف الكتف عشان تحول اللكمة\n- كويس للهوكات\n\n**6. السحب للخلف (Pull)**\n- حرك راسك للخلف\n- متبالغش\n- رد بالجاب\n\n**7. الفوتورك (Footwork)**\n- أحسن دفاع = متبقاش هناك\n- زوايا، لفات، خطوة للخلف\n\n**قاعدة ذهبية:** دايماً رد بعد الدفاع!",
        "category": "boxing_defense_ar"
    },

    # Boxing footwork
    {
        "instruction": "Boxing footwork basics",
        "output": "**Boxing Footwork - Foundation of Everything**\n\n**Basic Stance:**\n- Feet shoulder-width apart\n- Lead foot forward, rear foot back at 45°\n- Weight on balls of feet\n- Knees slightly bent\n- Hands up, chin down\n\n**The Step-Drag:**\n- Moving forward: lead foot steps, rear drags\n- Moving back: rear foot steps, lead drags\n- Never cross feet\n- Never jump\n- Stay balanced\n\n**Lateral Movement:**\n- Moving left: left foot steps, right follows\n- Moving right: right foot steps, left follows\n- Same step-drag principle\n\n**Pivots:**\n- Pivot on lead foot to change angle\n- Great for avoiding attacks\n- Sets up counter angles\n- Essential for inside fighting\n\n**Circle Movement:**\n- Circle away from opponent's power hand\n- Orthodox vs Orthodox: circle left\n- Stay on your toes\n- Maintain stance while moving\n\n**Cutting off the Ring:**\n- Don't chase, cut angles\n- Step to where they're going\n- Use pivots to cut off escape\n\n**Drills:**\n- Shadow boxing with movement: 5x3 min\n- Ladder drills: 3x2 min\n- Pivot drill: 3x1 min\n- Circle the heavy bag: 3x2 min\n\n**Key principle:** Punch then move, move then punch. Never stand still!",
        "category": "boxing_footwork"
    },

    # Boxing combinations
    {
        "instruction": "Best boxing combinations",
        "output": "**Essential Boxing Combinations**\n\n**Basic Combos (Learn First):**\n\n**1-2 (Jab-Cross)**\n- The bread and butter\n- Jab sets up the cross\n- Most used combo in boxing\n\n**1-1-2 (Jab-Jab-Cross)**\n- Double jab creates rhythm\n- Cross lands when they expect jab\n\n**1-2-3 (Jab-Cross-Hook)**\n- Classic 3-punch combo\n- Hook catches them after cross\n\n**1-2-3-2 (Jab-Cross-Hook-Cross)**\n- 4-punch combo\n- Finish with power\n\n**Intermediate Combos:**\n\n**1-2-1-2 (Double 1-2)**\n- Overwhelming volume\n- Second cross often lands\n\n**2-3-2 (Cross-Hook-Cross)**\n- Lead with power\n- Unexpected start\n\n**1-6-3-2 (Jab-Uppercut-Hook-Cross)**\n- Changes levels\n- Uppercut opens guard\n\n**Body Attack Combos:**\n\n**1-2-body-head**\n- Jab-Cross to head\n- Hook to body\n- Hook to head\n\n**Body-body-head**\n- Classic setup\n- Drop their guard, go up\n\n**Advanced:**\n\n**1-2-slip-2**\n- Throw 1-2\n- Slip their counter\n- Counter cross\n\n**Drill:** Practice each combo 50 times slow, then 50 times fast!",
        "category": "boxing_combos"
    },
    {
        "instruction": "كومبوهات الملاكمة",
        "output": "**كومبوهات الملاكمة الأساسية**\n\n**للمبتدئين:**\n\n**1-2 (جاب-كروس)**\n- أهم كومبو\n- الجاب بيحضر للكروس\n\n**1-1-2 (جاب-جاب-كروس)**\n- الجاب المزدوج بيعمل إيقاع\n- الكروس بيوقع لما يتوقعوا جاب\n\n**1-2-3 (جاب-كروس-هوك)**\n- كومبو 3 لكمات كلاسيكي\n- الهوك بيمسكهم بعد الكروس\n\n**1-2-3-2 (جاب-كروس-هوك-كروس)**\n- كومبو 4 لكمات\n- اختم بقوة\n\n**متوسط:**\n\n**1-2-1-2 (دبل 1-2)**\n- حجم لكمات كبير\n- الكروس التاني غالباً بيوقع\n\n**2-3-2 (كروس-هوك-كروس)**\n- ابدأ بقوة\n- بداية مش متوقعة\n\n**هجوم الجسم:**\n\n**جسم-جسم-راس**\n- سيت أب كلاسيكي\n- نزل جاردهم، اطلع فوق\n\n**تدريب:** مارس كل كومبو 50 مرة ببطء، بعدين 50 مرة بسرعة!",
        "category": "boxing_combos_ar"
    },

    # Boxing conditioning
    {
        "instruction": "Boxing conditioning workout",
        "output": "**Boxing Conditioning Workout**\n\n**Warm-up (10 min):**\n- Jump rope: 3 min\n- Shadow boxing: 3 min\n- Dynamic stretches: 4 min\n\n**Round 1-3: Heavy Bag (3 min each, 1 min rest)**\n- Round 1: Jab only, focus on speed\n- Round 2: 1-2 combos, focus on power\n- Round 3: Free combinations\n\n**Round 4-6: Shadow Boxing (3 min each)**\n- Round 4: Footwork focus\n- Round 5: Defense (slip, bob, weave)\n- Round 6: Full simulation (offense + defense)\n\n**Round 7-8: Speed Work**\n- Speed bag: 2x2 min\n- Or: Fast straight punches on bag\n\n**Conditioning Circuit (3 rounds):**\n- Burpees: 10\n- Mountain climbers: 20\n- Push-ups: 15\n- Squat jumps: 10\n- Plank: 30 sec\n- Rest: 1 min between rounds\n\n**Core Work:**\n- Russian twists: 3x20\n- Bicycle crunches: 3x20\n- Leg raises: 3x15\n- Plank: 3x45 sec\n\n**Cool-down:**\n- Light shadow boxing: 2 min\n- Stretching: 5 min\n\n**Total time:** ~60 minutes\n**Do this:** 3-4x per week",
        "category": "boxing_conditioning"
    },

    # Boxing for fitness
    {
        "instruction": "Boxing workout for weight loss",
        "output": "**Boxing for Weight Loss - High Calorie Burn!**\n\n**Why boxing burns fat:**\n- 500-800 calories per hour\n- Full body workout\n- HIIT-style training\n- Builds muscle while burning fat\n- Fun and stress-relieving\n\n**30-Minute Fat Burning Boxing Workout:**\n\n**Warm-up (5 min):**\n- Jumping jacks: 1 min\n- High knees: 1 min\n- Shadow boxing light: 3 min\n\n**Round 1 (3 min):** Jab-Cross-Jab-Cross non-stop\n- Rest: 30 sec\n\n**Round 2 (3 min):** Hooks and uppercuts\n- Rest: 30 sec\n\n**Round 3 (3 min):** All punches freestyle\n- Rest: 30 sec\n\n**HIIT Rounds (2 min each):**\n- 20 sec: Fast punches\n- 10 sec: Rest\n- Repeat 4x = 2 min\n- Do 3 rounds with 30 sec rest\n\n**Finisher:**\n- Burpees with punches: 10\n- Squat + jab-cross: 20\n- Mountain climbers: 30\n- Plank punches: 20\n\n**Cool-down:** 3 min stretching\n\n**Calories burned:** 400-500 in 30 minutes!\n\n**Tips:**\n- Wear hand wraps to protect wrists\n- Stay hydrated\n- Do 4-5x per week for best results\n- Combine with clean eating",
        "category": "boxing_fitness"
    },

    # Boxing equipment
    {
        "instruction": "What boxing equipment do I need?",
        "output": "**Boxing Equipment Guide**\n\n**Essential (Must Have):**\n\n**1. Hand Wraps (50-100 EGP)**\n- Protects wrists and knuckles\n- 180 inch (4.5m) length\n- Mexican style recommended\n- ALWAYS wrap before training\n\n**2. Boxing Gloves (300-1500 EGP)**\n- Bag gloves: 12-14 oz\n- Sparring gloves: 14-16 oz\n- Brands: Everlast, Venum, Twins\n\n**Good to Have:**\n\n**3. Heavy Bag (1000-3000 EGP)**\n- 70-100 lbs for adults\n- Hanging or standing\n- Essential for power work\n\n**4. Jump Rope (50-200 EGP)**\n- Best boxing cardio tool\n- Speed rope or beaded rope\n\n**5. Timer App (Free)**\n- Boxing round timer\n- 3 min rounds, 1 min rest\n\n**For Gym/Sparring:**\n\n**6. Headgear (400-1200 EGP)**\n- For sparring only\n- Full face protection recommended\n\n**7. Mouthguard (100-500 EGP)**\n- Essential for sparring\n- Boil and bite type works\n\n**8. Groin Protector (200-600 EGP)**\n- For sparring\n\n**Budget Setup (Home):**\n- Hand wraps: 80 EGP\n- Gloves: 400 EGP\n- Jump rope: 100 EGP\n- Total: ~600 EGP\n\nStart with wraps + gloves, add rest over time!",
        "category": "boxing_equipment"
    },

    # More boxing Q&A
    {
        "instruction": "How to improve punching power?",
        "output": "**How to Increase Punching Power**\n\n**Power comes from (in order):**\n1. Technique (biggest factor!)\n2. Hip rotation\n3. Leg drive\n4. Core strength\n5. Arm strength (least important)\n\n**Technique improvements:**\n- Full hip rotation\n- Drive off back foot\n- Stay balanced\n- Land with proper fist alignment\n- Don't reach or lean\n\n**Strength exercises:**\n\n**Legs (power base):**\n- Squats: 4x6\n- Deadlifts: 4x5\n- Box jumps: 3x8\n- Lunges: 3x10 each\n\n**Core (power transfer):**\n- Medicine ball rotational throws: 3x10\n- Russian twists: 3x20\n- Pallof press: 3x12\n- Landmine rotations: 3x10\n\n**Upper body:**\n- Bench press: 4x6\n- Push-ups: 3x max\n- Shoulder press: 3x8\n- Rows: 4x8\n\n**Boxing-specific:**\n- Heavy bag power shots: 5x2 min\n- Medicine ball throws: 3x10\n- Resistance band punches: 3x20\n\n**Important:**\n- Don't sacrifice speed for power\n- Power = mass × speed²\n- Fast punch > slow strong punch\n- Relax until impact, then tense",
        "category": "boxing_training"
    },
    {
        "instruction": "Boxing stance for beginners",
        "output": "**Boxing Stance - The Foundation**\n\n**Orthodox Stance (right-handed):**\n- Left foot forward\n- Right foot back at 45°\n- Feet shoulder-width apart\n\n**Southpaw Stance (left-handed):**\n- Right foot forward\n- Left foot back at 45°\n- Mirror of orthodox\n\n**Body position:**\n- Knees slightly bent (not stiff)\n- Weight on balls of feet\n- Hips slightly angled (not square)\n- Shoulders relaxed\n- Chin tucked down\n\n**Hand position:**\n- Lead hand at eyebrow level\n- Rear hand touching cheek\n- Elbows close to body\n- Fists relaxed (not clenched tight)\n\n**Common mistakes:**\n- Feet too wide or narrow\n- Flat-footed (stay on balls)\n- Chin up (keep it down!)\n- Hands too low\n- Too tense (stay relaxed)\n- Square stance (angle your body)\n\n**Practice drill:**\n- Stand in stance for 5 min\n- Check in mirror\n- Shadow box maintaining stance\n- Move forward/back/side keeping stance\n\n**Remember:**\n- Return to this stance after every punch\n- Stance = your home base\n- Good stance = good boxing",
        "category": "boxing_basics"
    },
]

# =============================================================================
# MUAY THAI - EXTENSIVE
# =============================================================================

MUAY_THAI = [
    {
        "instruction": "Complete Muay Thai guide for beginners",
        "output": "**Muay Thai Complete Beginner Guide**\n\n**What is Muay Thai?**\nThe Art of 8 Limbs - using fists, elbows, knees, and shins.\n\n**The 8 Weapons:**\n- 2 Fists (punches)\n- 2 Elbows\n- 2 Knees\n- 2 Shins/Feet (kicks)\n\n**Basic Stance:**\n- Square-ish (more than boxing)\n- Hands higher (protect from elbows)\n- Weight centered\n- On balls of feet\n- Chin down, eyes up\n\n**Basic Techniques to Learn:**\n\n**Punches:** Jab, Cross, Hook, Uppercut\n(Same as boxing)\n\n**Kicks:**\n- Roundhouse (leg, body, head)\n- Teep (push kick)\n- Low kick\n\n**Knees:**\n- Straight knee\n- Diagonal knee\n- Clinch knees\n\n**Elbows:**\n- Horizontal elbow\n- Uppercut elbow\n- Spinning elbow\n\n**The Clinch:**\n- Unique to Muay Thai\n- Control opponent's head\n- Throw knees and elbows\n- Essential skill\n\n**Training structure:**\n1. Warm-up (skip rope, shadow)\n2. Technique drills\n3. Pad work\n4. Bag work\n5. Clinch work\n6. Conditioning\n\n**Start with:** Jab, cross, teep, low kick, roundhouse",
        "category": "muaythai_basics"
    },
    {
        "instruction": "مواي تاي للمبتدئين",
        "output": "**دليل المواي تاي الكامل للمبتدئين**\n\n**إيه هو المواي تاي؟**\nفن الأطراف الثمانية - استخدام القبضات، الأكواع، الركب، والسيقان.\n\n**الأسلحة الثمانية:**\n- 2 قبضات (لكمات)\n- 2 أكواع\n- 2 ركب\n- 2 سيقان/أقدام (ركلات)\n\n**الوقفة الأساسية:**\n- مربعة أكتر من الملاكمة\n- الأيدي أعلى (حماية من الأكواع)\n- الوزن متوزع\n- على أطراف القدم\n- الدقن لتحت، العيون لفوق\n\n**التقنيات الأساسية:**\n\n**اللكمات:** جاب، كروس، هوك، أبركت\n\n**الركلات:**\n- راوند هاوس (رجل، جسم، راس)\n- تييب (ركلة دفع)\n- لو كيك\n\n**الركب:**\n- ركبة مستقيمة\n- ركبة مائلة\n- ركب في الكلينش\n\n**الأكواع:**\n- كوع أفقي\n- كوع أبركت\n- كوع دوار\n\n**الكلينش:**\n- فريد للمواي تاي\n- تحكم في راس الخصم\n- ارمي ركب وأكواع\n\n**ابدأ بـ:** جاب، كروس، تييب، لو كيك، راوند هاوس",
        "category": "muaythai_basics_ar"
    },

    # Muay Thai kicks
    {
        "instruction": "How to throw a roundhouse kick in Muay Thai?",
        "output": "**The Muay Thai Roundhouse Kick**\n\n**The most powerful kick in martial arts!**\n\n**Technique (rear leg kick):**\n1. Start in stance\n2. Step out at 45° with lead foot\n3. Pivot on lead foot (heel turns out)\n4. Swing rear leg like a baseball bat\n5. Turn hips COMPLETELY over\n6. Strike with shin (not foot)\n7. Arm swings down for momentum\n8. Follow through the target\n\n**Key points:**\n- Kick THROUGH the target\n- Hip rotation is everything\n- Land with shin, not foot\n- Keep hands up\n- Return to stance quickly\n\n**Targets:**\n- **Low kick:** Opponent's thigh (inside or outside)\n- **Body kick:** Ribs, liver, floating ribs\n- **Head kick:** Temple, jaw, neck\n\n**Common mistakes:**\n- Not turning hip over\n- Kicking with foot (ouch!)\n- Not pivoting\n- Leaning back too much\n- Dropping hands\n\n**Drills:**\n- Kick heavy bag: 50 each leg\n- Slow motion kicks (form): 20 each\n- Kick pads with partner: 5x2 min\n\n**Conditioning:**\n- Kick banana trees (traditional)\n- Heavy bag kicks daily\n- Roll shin on PVC pipe",
        "category": "muaythai_kicks"
    },
    {
        "instruction": "How to throw a teep (push kick)?",
        "output": "**The Teep - Muay Thai Push Kick**\n\n**What it is:**\nFront push kick to create distance or damage.\n\n**Lead Teep Technique:**\n1. Lift lead knee high\n2. Extend leg straight out\n3. Push with ball of foot\n4. Snap hip forward\n5. Target: stomach, chest, face\n6. Retract quickly\n\n**Rear Teep Technique:**\n- Same mechanics\n- More power\n- Slower, more telegraphed\n- Step first, then kick\n\n**Uses:**\n- Keep distance\n- Stop opponent coming forward\n- Off-balance opponent\n- Set up other attacks\n- Damage (solar plexus)\n- Counter against kicks\n\n**Targets:**\n- Solar plexus (winding)\n- Hip (off-balance)\n- Thigh (stopping)\n- Face (damage + disrespect)\n\n**Common mistakes:**\n- Leaning back too much\n- Kicking too low\n- Not retracting fast\n- Dropping hands\n\n**Drill:**\n- Teep on bag: 50 each leg\n- Teep → roundhouse combo\n- Partner distance drill\n\n**The teep is like the jab of kicks - use it constantly!**",
        "category": "muaythai_kicks"
    },
    {
        "instruction": "Low kick technique Muay Thai",
        "output": "**The Low Kick - Leg Destroyer**\n\n**What it is:**\nRoundhouse kick targeting opponent's legs.\n\n**Outside Low Kick (most common):**\n1. Same technique as roundhouse\n2. Target: outside of thigh\n3. Aim for the nerve (mid-thigh)\n4. Kick THROUGH the leg\n5. Can calf kick (lower target)\n\n**Inside Low Kick:**\n- Target: inside of thigh\n- Painful and unexpected\n- Opens up for other attacks\n\n**Calf Kick:**\n- Target: calf muscle\n- Very popular now\n- Hard to check\n- Can end fights\n\n**Power generation:**\n- Full hip turn\n- Step in at 45°\n- Drive through target\n- Don't stop at surface\n\n**Defense against low kicks:**\n- Check: lift knee, turn shin out\n- Move back out of range\n- Catch and sweep\n\n**Setting up the low kick:**\n- Jab → low kick\n- Cross → low kick\n- Feint high → low kick\n- After they punch (counter)\n\n**Conditioning:**\n- Kick hard things regularly\n- Your shins will adapt\n- Takes months/years\n- Don't rush it\n\n**Accumulation:** Low kicks add up. 5-10 good ones = opponent can't walk.",
        "category": "muaythai_kicks"
    },

    # Muay Thai elbows
    {
        "instruction": "Muay Thai elbow techniques",
        "output": "**Muay Thai Elbows - The Cutting Weapons**\n\n**Why elbows?**\n- Extremely sharp and hard bone\n- Cause cuts easily\n- Devastating at close range\n- Hard to see coming\n\n**Types of Elbows:**\n\n**1. Horizontal Elbow (Sok Tad)**\n- Most common\n- Swing elbow parallel to ground\n- Target: temple, eyebrow\n- Like slashing motion\n\n**2. Uppercut Elbow (Sok Ngad)**\n- Elbow rises upward\n- Target: chin, nose\n- Great in clinch\n- Very powerful\n\n**3. Diagonal Elbow (Sok Chieng)**\n- Comes down at 45°\n- Target: top of head, eyebrow\n- Cuts easily\n\n**4. Spinning Elbow (Sok Klap)**\n- Spin body, lead with elbow\n- Devastating if landed\n- High risk, high reward\n- Very advanced\n\n**5. Downward Elbow (Sok Tong)**\n- Brings elbow straight down\n- Target: back of head, spine\n- In clinch when opponent ducks\n\n**Setup for elbows:**\n- Clinch → elbow\n- Slip → elbow counter\n- Catch kick → step in → elbow\n- After punches when in range\n\n**Key points:**\n- Close range only\n- Rotate hips for power\n- Land with point of elbow\n- Follow through\n\n**Warning:** Elbows cause serious cuts. Be careful in training!",
        "category": "muaythai_elbows"
    },

    # Muay Thai knees
    {
        "instruction": "Muay Thai knee techniques",
        "output": "**Muay Thai Knee Strikes**\n\n**Why knees?**\n- Extremely powerful\n- Hard to defend\n- Great in clinch\n- Can knock out\n\n**Types of Knees:**\n\n**1. Straight Knee (Kao Trong)**\n- Drive knee straight up\n- Target: body, face\n- Pull opponent's head down\n- Most common knee\n\n**2. Diagonal Knee (Kao Chieng)**\n- Knee comes up at angle\n- Target: ribs, thigh\n- Good in clinch\n\n**3. Curving Knee (Kao Khong)**\n- Knee swings in from side\n- Target: ribs, thigh\n- When opponent is sideways\n\n**4. Flying Knee (Kao Loi)**\n- Jump and drive knee\n- Spectacular and powerful\n- High risk if missed\n- Advanced technique\n\n**5. Step Knee (Kao Yiep)**\n- Step forward into knee\n- Good at mid-range\n- Sets up clinch\n\n**In the Clinch:**\n- Control head (double collar tie)\n- Pull head down\n- Drive knees up\n- Alternate knees\n- Don't let them breathe\n\n**Knee setups:**\n- Catch kick → knee\n- Clinch → knee\n- Pull guard down → knee\n- Jab → step in → knee\n\n**Drill:**\n- Knees on bag: 50 each\n- Clinch knees with partner: 3x2 min\n- Knee + punch combos",
        "category": "muaythai_knees"
    },

    # Muay Thai clinch
    {
        "instruction": "How to clinch in Muay Thai?",
        "output": "**The Muay Thai Clinch - Essential Skill**\n\n**What is the clinch?**\nClose-range grappling unique to Muay Thai. Control opponent and attack with knees and elbows.\n\n**Basic Clinch Positions:**\n\n**1. Double Collar Tie (Plum)**\n- Both hands behind opponent's head\n- Fingers interlocked\n- Elbows tight together\n- Pull their head down\n- Dominant position\n\n**2. Single Collar Tie**\n- One hand behind head\n- Other hand controlling arm\n- Less dominant but versatile\n\n**3. Arm Control**\n- Control biceps\n- Prevent their offense\n- Set up sweeps\n\n**Clinch Offense:**\n- Pull head down → knee to face\n- Turn them → knee to body\n- Off-balance → knee\n- Elbows when space opens\n\n**Clinch Defense:**\n- Don't let them lock hands\n- Posture up (don't let head drop)\n- Swim hands inside\n- Push their hips away\n\n**Sweeps and Throws:**\n- Inside trip\n- Hip throw\n- Foot sweep\n- Dump (twist and push)\n\n**Clinch Drill:**\n- Partner clinch work: 5x3 min\n- Focus on position first\n- Add knees when comfortable\n- Practice sweeps\n\n**Key:** Whoever controls the head, controls the fight!",
        "category": "muaythai_clinch"
    },

    # Muay Thai conditioning
    {
        "instruction": "Muay Thai conditioning workout",
        "output": "**Muay Thai Conditioning Workout**\n\n**Warm-up (10 min):**\n- Skip rope: 5 min\n- Shadow boxing with kicks: 3 min\n- Dynamic stretching: 2 min\n\n**Technical Rounds (5 rounds x 3 min):**\n- Round 1: Jab-Cross-Low kick\n- Round 2: Teep and roundhouse\n- Round 3: Knee combinations\n- Round 4: Elbow techniques\n- Round 5: All weapons freestyle\n\n**Heavy Bag (5 rounds x 3 min):**\n- Round 1: Punches only\n- Round 2: Kicks only\n- Round 3: Knees only\n- Round 4: Elbows (light)\n- Round 5: Full Muay Thai\n\n**Conditioning Circuit (3 rounds):**\n- Burpees: 10\n- Jump squats: 15\n- Push-ups: 15\n- Roundhouse kicks (air): 10 each\n- Clinch knees (shadow): 20\n- Mountain climbers: 20\n- Rest: 1 min\n\n**Core Work:**\n- Sit-ups with twist: 3x20\n- Leg raises: 3x15\n- Plank: 3x1 min\n- Russian twists: 3x20\n\n**Flexibility (Essential!):**\n- Hip flexor stretch: 2 min each\n- Hamstring stretch: 2 min\n- Groin stretch: 2 min\n- Quad stretch: 1 min each\n\n**Total: ~90 minutes**\n**Frequency: 4-5x per week**",
        "category": "muaythai_conditioning"
    },
]

# =============================================================================
# BJJ - EXTENSIVE
# =============================================================================

BJJ = [
    # BJJ basics
    {
        "instruction": "BJJ basics for beginners",
        "output": "**Brazilian Jiu-Jitsu Beginner Guide**\n\n**What is BJJ?**\nGround fighting martial art focused on submissions (chokes, joint locks) and positional control.\n\n**The Philosophy:**\n- Technique beats strength\n- Small person can beat big person\n- Position before submission\n- Use leverage, not power\n\n**Basic Positions (Hierarchy):**\n\n**Top positions (best to worst):**\n1. Back control (most dominant)\n2. Mount\n3. Side control\n4. Knee on belly\n5. Half guard top\n6. Full guard (opponent's)\n\n**Bottom positions:**\n1. Full guard (your legs around them)\n2. Half guard\n3. Side control bottom (bad)\n4. Mount bottom (worse)\n5. Back taken (worst)\n\n**First things to learn:**\n1. How to fall safely (breakfall)\n2. Basic guard position\n3. Mount escape (upa/bridge)\n4. Side control escape\n5. Basic submissions from guard\n\n**Etiquette:**\n- Bow entering/leaving mat\n- Tap early, tap often\n- Cut nails\n- Wear clean gi\n- Respect training partners\n\n**Training structure:**\n- Warm-up drills\n- Technique instruction\n- Drilling with partner\n- Positional sparring\n- Free rolling (sparring)",
        "category": "bjj_basics"
    },
    {
        "instruction": "جوجيتسو برازيلي للمبتدئين",
        "output": "**دليل الجوجيتسو البرازيلي للمبتدئين**\n\n**إيه هو BJJ؟**\nفن قتال أرضي بيركز على السابميشنز (الخنق، كسر المفاصل) والتحكم في الوضعيات.\n\n**الفلسفة:**\n- التكنيك بيغلب القوة\n- الشخص الصغير يقدر يغلب الكبير\n- الوضعية قبل السابميشن\n- استخدم الرافعة مش القوة\n\n**الوضعيات الأساسية:**\n\n**وضعيات فوق (من الأحسن للأسوأ):**\n1. باك كونترول (الأقوى)\n2. ماونت\n3. سايد كونترول\n4. ني أون بيلي\n5. هاف جارد فوق\n\n**وضعيات تحت:**\n1. فول جارد (رجلك حواليه)\n2. هاف جارد\n3. سايد كونترول تحت (وحش)\n4. ماونت تحت (أوحش)\n5. الضهر مأخود (الأسوأ)\n\n**أول حاجات تتعلمها:**\n1. ازاي تقع بأمان\n2. وضعية الجارد\n3. هروب من الماونت\n4. هروب من السايد كونترول\n5. سابميشنز بسيطة من الجارد\n\n**الآداب:**\n- انحني عند الدخول والخروج\n- تاب بدري، تاب كتير\n- قص أظافرك\n- البدلة نظيفة",
        "category": "bjj_basics_ar"
    },

    # BJJ positions
    {
        "instruction": "BJJ positions explained",
        "output": "**BJJ Positions - Complete Guide**\n\n**MOUNT (Full Mount)**\n- Sitting on opponent's chest/stomach\n- Legs on either side\n- Very dominant position\n- Many submission options\n\n**BACK CONTROL**\n- Behind opponent\n- Hooks in (feet inside thighs)\n- Seatbelt grip\n- MOST dominant position\n- Rear naked choke available\n\n**SIDE CONTROL**\n- Chest on chest, perpendicular\n- Control head and hip\n- Stable, safe position\n- Transition to mount or attacks\n\n**KNEE ON BELLY**\n- Knee on stomach\n- Other leg posted\n- Very uncomfortable for bottom\n- Good for transitions\n\n**FULL GUARD (Closed Guard)**\n- On back, legs wrapped around opponent\n- Defensive but has attacks\n- Many submissions possible\n- Sweep opportunities\n\n**HALF GUARD**\n- Control one leg with yours\n- Can be offensive or defensive\n- Important transition position\n\n**OPEN GUARD VARIATIONS:**\n- Spider guard\n- De La Riva\n- Lasso guard\n- Butterfly guard\n- X-guard\n\n**Key concept:**\n- Top: Maintain position, advance, submit\n- Bottom: Escape, sweep, or submit\n\n**Hierarchy matters:** Always try to improve your position!",
        "category": "bjj_positions"
    },

    # Basic submissions
    {
        "instruction": "Basic BJJ submissions",
        "output": "**Basic BJJ Submissions**\n\n**CHOKES (Blood/Air):**\n\n**1. Rear Naked Choke (RNC)**\n- From back control\n- Arm around neck\n- \"Seatbelt\" grip\n- Squeeze like closing a book\n- Most effective submission\n\n**2. Guillotine**\n- Arm around neck from front\n- Chin in their neck\n- Squeeze and arch back\n- Standing or guard\n\n**3. Triangle Choke**\n- From guard\n- Legs form triangle around neck/arm\n- Squeeze knees, pull head down\n- Classic BJJ technique\n\n**JOINT LOCKS:**\n\n**4. Armbar (Juji-gatame)**\n- Hyperextend elbow\n- Control arm between legs\n- Hips tight against shoulder\n- From guard, mount, side\n\n**5. Kimura**\n- Figure-4 grip on arm\n- Rotate shoulder behind back\n- Control their wrist\n- From many positions\n\n**6. Americana**\n- Similar to kimura\n- But push arm toward head\n- Paint brush motion\n- From mount or side control\n\n**Key principles:**\n- Control position first\n- Secure grips before attacking\n- Squeeze slowly and controlled\n- Tap before injury!\n\n**Learn these 6 first, then expand!**",
        "category": "bjj_submissions"
    },

    # Escapes
    {
        "instruction": "How to escape mount in BJJ?",
        "output": "**Mount Escapes - Essential Techniques**\n\n**Why learn this first?**\nMount is one of the worst positions. You MUST know how to escape.\n\n**ESCAPE 1: Upa (Bridge and Roll)**\n\n**Steps:**\n1. Trap one arm (same side)\n2. Trap same side foot with yours\n3. Bridge EXPLOSIVELY with hips\n4. Turn toward trapped side\n5. End up in their guard\n\n**Keys:**\n- Bridge high with hips\n- Turn your whole body\n- Keep their arm/foot trapped\n- Time it when they're off-balance\n\n**ESCAPE 2: Elbow-Knee Escape (Shrimp)**\n\n**Steps:**\n1. Frame against their hip\n2. Bridge slightly\n3. Shrimp (hip escape) to side\n4. Get knee inside\n5. Get to half guard or full guard\n\n**Keys:**\n- Create space with frames\n- Shrimp away from them\n- Protect neck\n- Be patient, work gradually\n\n**ESCAPE 3: Heel Drag**\n\n**Steps:**\n1. Trap their foot with your hand\n2. Drag their heel over your thigh\n3. Get to half guard\n\n**General tips:**\n- Don't panic\n- Protect your neck\n- Keep elbows in\n- Create space gradually\n- Escape to guard, not just flat\n\n**Drill these 100 times each!**",
        "category": "bjj_escapes"
    },

    # BJJ guard
    {
        "instruction": "Playing guard in BJJ",
        "output": "**Playing Guard in BJJ**\n\n**What is guard?**\nUsing your legs to control opponent from bottom position.\n\n**CLOSED GUARD:**\n- Legs wrapped around waist\n- Ankles locked\n- Control their posture (pull head down)\n- Safe position with many attacks\n\n**Attacks from closed guard:**\n- Armbar\n- Triangle\n- Kimura\n- Guillotine\n- Sweeps (hip bump, scissor)\n\n**Key concepts:**\n- Break their posture (head down)\n- Control their arms\n- Create angles\n- Be active, not passive\n\n**OPEN GUARD:**\n- Legs not locked around them\n- Using feet to control\n- More dynamic, more options\n\n**Types of open guard:**\n\n**Spider Guard:**\n- Feet in biceps\n- Control their arms with grips\n- Push/pull to off-balance\n\n**Butterfly Guard:**\n- Sitting up, feet as hooks inside thighs\n- Great for sweeps\n- Underhook is key\n\n**De La Riva:**\n- Hook leg behind their lead leg\n- Great for sweeps\n- Can take back\n\n**Guard principles:**\n- Never be flat on back\n- Always be moving/attacking\n- Control distance with feet\n- Grip fighting is essential\n\n**Being passive in guard = getting passed!**",
        "category": "bjj_guard"
    },

    # BJJ drilling
    {
        "instruction": "BJJ drilling and solo drills",
        "output": "**BJJ Drills - Solo and Partner**\n\n**SOLO DRILLS (can do at home):**\n\n**1. Shrimping (Hip Escape)**\n- On back, push off feet\n- Move hips away\n- Essential for escapes\n- Do 20 down the mat\n\n**2. Technical Stand-up**\n- From ground to standing\n- Post hand, kick leg through\n- Stand in fighting stance\n- 10 each side\n\n**3. Bridging**\n- On back, drive hips up\n- Weight on shoulders and feet\n- Hold 3-5 seconds\n- 20 reps\n\n**4. Granby Roll**\n- Shoulder roll, invert\n- Creates space under side control\n- 10 each direction\n\n**5. Sprawls**\n- Drop hips, kick legs back\n- Defends takedowns\n- 20 reps\n\n**6. Sit-outs**\n- From all fours, sit through\n- Escape from turtle\n- 10 each side\n\n**PARTNER DRILLS:**\n\n**1. Positional Drilling**\n- Start in position\n- One person escapes/attacks\n- Other maintains/counters\n- 3 min each role\n\n**2. Guard Passing vs Retention**\n- One passes, one plays guard\n- Great cardio and technique\n\n**3. Flow Rolling**\n- Light sparring\n- No resistance\n- Work on transitions\n\n**Drill at least 30 min per class!**",
        "category": "bjj_drilling"
    },

    # BJJ conditioning
    {
        "instruction": "BJJ conditioning workout",
        "output": "**BJJ Strength & Conditioning Workout**\n\n**Why BJJ-specific conditioning?**\n- Need grip strength\n- Need hip mobility\n- Need pulling strength\n- Need cardio endurance\n\n**WARM-UP (10 min):**\n- Shrimping: 2x mat length\n- Technical stand-ups: 20\n- Sprawls: 20\n- Bridges: 20\n- Sit-outs: 20\n- Granby rolls: 10 each\n\n**STRENGTH (3 rounds):**\n\n**Grip:**\n- Dead hangs: 30-60 sec\n- Towel pull-ups: 5-8\n- Gi grip holds: 30 sec\n\n**Pulling:**\n- Pull-ups: 8-12\n- Rows: 12\n- Face pulls: 15\n\n**Pushing:**\n- Push-ups: 20\n- Dips: 10\n- Shoulder press: 10\n\n**Legs/Hips:**\n- Squats: 15\n- Hip bridges: 15\n- Lunges: 10 each\n- Hip circles: 10 each\n\n**Core:**\n- Plank: 45 sec\n- Side plank: 30 sec each\n- Dead bugs: 10 each\n- Hollow body hold: 30 sec\n\n**BJJ CARDIO:**\n- Guard passing drill: 3 min\n- Positional sparring: 5x3 min\n- Flow roll: 2x5 min\n\n**FLEXIBILITY:**\n- Hip 90/90: 2 min each\n- Pigeon pose: 2 min each\n- Figure 4 stretch: 1 min each\n- Spinal twists: 1 min each\n\n**Frequency: 2-3x per week (separate from BJJ class)**",
        "category": "bjj_conditioning"
    },

    # BJJ belt system
    {
        "instruction": "BJJ belt system explained",
        "output": "**BJJ Belt System**\n\n**Adult Belts (16+):**\n\n**1. White Belt**\n- Beginner\n- Learn basic positions\n- Learn survival\n- Learn to tap\n- 1-2 years typically\n\n**2. Blue Belt**\n- Intermediate\n- Know all positions\n- Have a \"game\"\n- Dangerous to untrained\n- 2-3 years at blue\n\n**3. Purple Belt**\n- Advanced\n- Smooth transitions\n- Teaching ability\n- Can beat most people\n- 1.5-3 years at purple\n\n**4. Brown Belt**\n- Expert level\n- Refining details\n- Developing style\n- 1-2 years at brown\n\n**5. Black Belt**\n- Master level\n- 8-15+ years total\n- Continuous learning\n- Degrees (1st-6th)\n\n**Stripes:**\n- 4 stripes per belt\n- Mark progress within belt\n- Given by instructor\n\n**Timeline:**\n- Black belt: 8-15 years average\n- Minimum: 8 years (prodigies)\n- No skipping belts\n- Time requirements between belts\n\n**Kids Belts:**\nWhite → Grey → Yellow → Orange → Green\nThen adult belts at 16\n\n**Remember:**\n- Focus on learning, not belts\n- Belt doesn't make you good\n- Training makes you good\n- Trust your coach's timing",
        "category": "bjj_general"
    },

    # BJJ terms
    {
        "instruction": "Common BJJ terms and terminology",
        "output": "**BJJ Terminology Dictionary**\n\n**Positions:**\n- **Mount** - Sitting on opponent's chest\n- **Guard** - Using legs to control from bottom\n- **Side control** - Chest to chest, perpendicular\n- **Back** - Behind opponent, hooks in\n- **Turtle** - On hands and knees, curled up\n- **Half guard** - Controlling one leg with yours\n\n**Submissions:**\n- **Armbar** - Hyperextending elbow\n- **Triangle** - Legs around neck/arm choke\n- **Kimura** - Figure-4 shoulder lock\n- **Americana** - Shoulder lock (paint brush)\n- **RNC** - Rear naked choke\n- **Guillotine** - Front headlock choke\n- **Omoplata** - Shoulder lock with legs\n\n**Movements:**\n- **Shrimp** - Hip escape\n- **Bridge** - Drive hips up\n- **Sprawl** - Drop hips, kick legs back\n- **Roll** - Shoulder roll or full roll\n\n**Actions:**\n- **Tap** - Submit (tap hand or say tap)\n- **Sweep** - Reverse position from bottom\n- **Pass** - Get past their guard\n- **Submit** - Force tap via lock/choke\n- **Roll/Spar** - Free practice\n\n**Training:**\n- **Gi** - Traditional uniform\n- **No-Gi** - Without uniform (rashguard/shorts)\n- **OSS** - Respectful greeting/acknowledgment\n- **Flow roll** - Light sparring\n\n**Phrases:**\n- \"Position before submission\"\n- \"Tap early, tap often\"\n- \"Leave your ego at the door\"",
        "category": "bjj_general"
    },
]

def main():
    """Generate combat sports training data"""
    all_data = []

    all_data.extend(BOXING)
    print(f"Boxing: {len(BOXING)} samples")

    all_data.extend(MUAY_THAI)
    print(f"Muay Thai: {len(MUAY_THAI)} samples")

    all_data.extend(BJJ)
    print(f"BJJ: {len(BJJ)} samples")

    print(f"\nTotal combat sports: {len(all_data)} samples")

    # Save
    output_dir = os.path.dirname(os.path.dirname(__file__))
    output_path = os.path.join(output_dir, "training-data", "combat_sports_training.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"Saved to: {output_path}")
    return all_data

if __name__ == "__main__":
    main()
