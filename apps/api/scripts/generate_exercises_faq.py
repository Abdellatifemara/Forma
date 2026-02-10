#!/usr/bin/env python3
"""
Comprehensive Exercise FAQs and Instructions
Teaches the AI about proper exercise form, common mistakes, and variations
"""

import json

training_data = []

# ============================================================================
# CHEST EXERCISES
# ============================================================================

chest_exercises = [
    # Bench Press
    {
        "instruction": "How do I do a bench press?",
        "output": "**Bench Press - Step by Step:**\n\n**Setup:**\n1. Lie flat, eyes under the bar\n2. Grip slightly wider than shoulder width\n3. Pinch shoulder blades together\n4. Slight arch in lower back, feet flat on floor\n5. Unrack with straight arms\n\n**The Lift:**\n1. Lower bar to mid-chest (nipple line)\n2. Touch chest lightly, don't bounce\n3. Press up and slightly back\n4. Lock out at top\n\n**Key Points:**\n- Keep wrists straight, not bent back\n- Elbows at ~45° angle, not flared\n- Breathe in on the way down, out on the way up\n- Full range of motion\n\nWant me to show alternatives if you don't have a bench?",
        "category": "exercise_chest"
    },
    {
        "instruction": "My wrists hurt during bench press",
        "output": "Wrist pain during bench press is usually a grip issue:\n\n**The Problem:**\nYou're probably holding the bar too high in your palm, causing your wrist to bend backward under load.\n\n**The Fix:**\n1. Place bar lower in palm, over your wrist bones\n2. Grip should feel like you're \"punching the ceiling\"\n3. Keep wrists straight, not cocked back\n4. Squeeze the bar hard - creates stability\n\n**Extra Help:**\n- Wrist wraps can provide support\n- Strengthen wrists with wrist curls\n- Check your grip width - too wide strains wrists\n\nIf pain persists after fixing form, see a doctor.",
        "category": "exercise_faq"
    },
    {
        "instruction": "ازاي اعمل bench press صح؟",
        "output": "**البنش بريس - خطوة بخطوة:**\n\n**التجهيز:**\n1. نام مستوي، عينيك تحت البار\n2. امسك أعرض من كتفك شوية\n3. اضغط لوحي الكتف على بعض\n4. قوس خفيف في ضهرك\n5. شيل البار بدراعات مفرودة\n\n**الحركة:**\n1. نزل البار لنص صدرك\n2. لمس الصدر بخفة، متنطش\n3. ادفع لفوق\n4. افرد دراعاتك في الآخر\n\n**نقاط مهمة:**\n- ريشة ايدك مستقيمة\n- الكوع 45 درجة، مش مفتوح\n- خد نفس وإنت نازل، طلعه وإنت طالع",
        "category": "exercise_chest"
    },

    # Push-ups
    {
        "instruction": "How to do push-ups correctly?",
        "output": "**Push-Up Perfect Form:**\n\n**Start Position:**\n1. Hands slightly wider than shoulders\n2. Fingers pointing forward or slightly out\n3. Body in straight line from head to heels\n4. Core tight, glutes squeezed\n\n**The Movement:**\n1. Lower chest to floor, not stomach\n2. Elbows at 45° to body (not flared at 90°)\n3. Go until chest nearly touches floor\n4. Push back up, fully extending arms\n\n**Common Mistakes:**\n- Sagging hips (weak core) - squeeze glutes harder\n- Piking hips up - you're avoiding work\n- Half reps - full range of motion!\n- Flared elbows - leads to shoulder injury\n\n**Too Hard?** Start on knees or against a wall\n**Too Easy?** Try diamond, archer, or weighted push-ups",
        "category": "exercise_chest"
    },
    {
        "instruction": "I can't do a single push-up",
        "output": "That's okay! Here's how to build up to push-ups:\n\n**Progression (do until you can do 15-20 reps):**\n\n1. **Wall Push-ups** - Stand arm's length from wall, do push-ups against it\n\n2. **Incline Push-ups** - Hands on table or bench, body at angle\n\n3. **Knee Push-ups** - On your knees instead of toes\n\n4. **Negative Push-ups** - Start at top, lower yourself slowly (5 seconds), use knees to push back up\n\n5. **Full Push-ups** - You made it!\n\n**Tips:**\n- Practice every day or every other day\n- Focus on form, not speed\n- Core strength helps a lot - do planks too\n\nMost people can do their first real push-up within 2-4 weeks of practice!",
        "category": "exercise_faq"
    },
]

training_data.extend(chest_exercises)

# ============================================================================
# BACK EXERCISES
# ============================================================================

back_exercises = [
    # Deadlift
    {
        "instruction": "How do I deadlift properly?",
        "output": "**Deadlift - Step by Step:**\n\n**Setup:**\n1. Stand with feet hip-width, bar over mid-foot\n2. Bend down, grip just outside knees\n3. Shins touch the bar\n4. Chest up, back flat (not rounded!)\n5. Take slack out of the bar\n\n**The Lift:**\n1. Drive through heels, push floor away\n2. Bar stays close to body (drag up legs)\n3. Hips and shoulders rise together\n4. Stand tall at top, squeeze glutes\n5. Lower with control, don't drop\n\n**Key Points:**\n- NEVER round your lower back\n- Bar path is straight up, not around knees\n- Breathe and brace before each rep\n- Start light, master form first\n\nThis is the king of exercises but demands respect. Want form cues for any specific part?",
        "category": "exercise_back"
    },
    {
        "instruction": "What's the difference between conventional and sumo deadlift?",
        "output": "**Conventional vs Sumo Deadlift:**\n\n**Conventional:**\n- Feet hip-width, hands outside legs\n- More back and hamstring focused\n- Longer range of motion\n- Better for: longer arms, shorter torso\n- Most common style\n\n**Sumo:**\n- Wide stance, hands inside legs\n- More quad and hip focused\n- Shorter range of motion\n- Better for: longer torso, shorter arms, tight hips\n- Popular in powerlifting\n\n**Which to choose?**\n- Try both for 4 weeks each\n- Choose what feels stronger and more natural\n- Both are equally valid, neither is \"cheating\"\n- You can train both for variety\n\nWant me to explain how to set up for sumo?",
        "category": "exercise_back"
    },

    # Pull-ups
    {
        "instruction": "How to do a pull-up?",
        "output": "**Pull-Up Perfect Form:**\n\n**The Grip:**\n- Hands shoulder-width or slightly wider\n- Overhand grip (palms away)\n- Wrap thumbs around bar\n\n**The Pull:**\n1. Start from dead hang (arms fully extended)\n2. Engage lats - think \"bend the bar\"\n3. Pull elbows down and back\n4. Chin over bar at top\n5. Lower with control to full extension\n\n**Key Points:**\n- Don't swing or kip (that's cheating gains)\n- Lead with chest, not chin\n- Squeeze shoulder blades together at top\n- Full range of motion every rep\n\n**Can't do one yet?**\n- Assisted pull-ups (band or machine)\n- Negative pull-ups (jump up, lower slowly)\n- Lat pulldowns to build strength\n\nPull-ups are hard! Most beginners can't do them. Build up to it.",
        "category": "exercise_back"
    },
    {
        "instruction": "مش قادر اعمل pull-up",
        "output": "طبيعي! الـ pull-up صعب. هكذا تبني قوتك:\n\n**التدرج:**\n\n1. **Dead Hang** - علق على البار أطول وقت ممكن\n\n2. **Negative Pull-ups** - انط فوق، نزل ببطء (5 ثواني)\n\n3. **Band Assisted** - استخدم رباط مطاطي يساعدك\n\n4. **Half Pull-ups** - ابدأ من نص المسافة\n\n5. **Full Pull-up** - وصلت!\n\n**تمارين مساعدة:**\n- Lat pulldown\n- Inverted rows\n- Bicep curls\n\n**الجدول:**\n- تمرن 3 مرات في الأسبوع\n- اعمل negatives كل مرة\n- معظم الناس تقدر تعمل أول pull-up في 4-8 أسابيع",
        "category": "exercise_faq"
    },

    # Rows
    {
        "instruction": "How to do barbell rows?",
        "output": "**Barbell Row - Step by Step:**\n\n**Setup:**\n1. Stand with feet hip-width\n2. Hinge at hips, back at 45° angle\n3. Grip slightly wider than shoulder-width\n4. Keep back flat, core braced\n\n**The Pull:**\n1. Pull bar to lower chest/upper abs\n2. Drive elbows back, not out\n3. Squeeze shoulder blades together at top\n4. Lower with control\n\n**Common Mistakes:**\n- Standing too upright (becomes a shrug)\n- Rounding the back (injury risk)\n- Using momentum (cheating)\n- Not full range of motion\n\n**Variations:**\n- Underhand grip = more biceps\n- Pendlay rows = from floor each rep\n- Dumbbell rows = unilateral work\n\nKeep the weight moderate until form is perfect!",
        "category": "exercise_back"
    },
]

training_data.extend(back_exercises)

# ============================================================================
# LEG EXERCISES
# ============================================================================

leg_exercises = [
    # Squats
    {
        "instruction": "How to do squats?",
        "output": "**Squat - Step by Step:**\n\n**Setup:**\n1. Bar on upper back (not neck!), squeeze it tight\n2. Feet shoulder-width or slightly wider\n3. Toes pointed out 15-30°\n4. Brace core, chest up\n\n**The Squat:**\n1. Break at hips AND knees together\n2. Sit down between your legs\n3. Go until hip crease below knee (parallel minimum)\n4. Knees track over toes (push them out)\n5. Drive up through whole foot\n\n**Key Points:**\n- Keep chest up, don't fold forward\n- Heels stay on floor (if they rise, work on ankle mobility)\n- Breathe in at top, hold during rep\n- Control the weight, don't dive bomb\n\n**Common Problems:**\n- Knees caving = push them out\n- Heels rising = elevate heels or work mobility\n- Butt wink = don't go too deep for now",
        "category": "exercise_legs"
    },
    {
        "instruction": "How deep should I squat?",
        "output": "**Squat Depth Guide:**\n\n**Minimum:** Parallel\n- Hip crease at same level as knee\n- This is the standard for most purposes\n\n**Ideal:** Slightly below parallel\n- Better quad and glute activation\n- Full range of motion\n\n**ATG (Ass to Grass):**\n- Olympic lifters need this\n- Requires good mobility\n- Not necessary for everyone\n\n**What limits depth:**\n1. Ankle mobility - most common issue\n2. Hip mobility - second most common\n3. Muscle tightness - calves, hip flexors\n\n**If you can't hit parallel:**\n- Elevate heels (plates or squat shoes)\n- Widen stance\n- Work on mobility daily\n- Don't ego lift, use lighter weight\n\nDepth > weight. A full squat with 60kg beats a quarter squat with 100kg.",
        "category": "exercise_faq"
    },
    {
        "instruction": "ازاي اعمل سكوات صح؟",
        "output": "**السكوات - خطوة بخطوة:**\n\n**التجهيز:**\n1. البار على أعلى ضهرك (مش الرقبة!)\n2. قدميك بعرض كتفك أو أوسع\n3. صوابعك لبرا 15-30 درجة\n4. شد بطنك، صدرك لفوق\n\n**الحركة:**\n1. انزل بالركب والحوض مع بعض\n2. انزل لحد ما ركبتك تبقى على مستوى الحوض\n3. الركب تتحرك لبرا مع صوابع رجلك\n4. ادفع بكل رجلك\n\n**نقاط مهمة:**\n- صدرك مرفوع، متنزلش لقدام\n- كعبك على الأرض\n- خد نفس قبل ما تنزل\n- تحكم في الوزن\n\n**مشاكل شائعة:**\n- الركب بتدخل لجوا = ادفعها لبرا\n- الكعب بيرتفع = اشتغل على الـ mobility",
        "category": "exercise_legs"
    },

    # Lunges
    {
        "instruction": "How to do lunges correctly?",
        "output": "**Lunges - Perfect Form:**\n\n**Starting Position:**\n1. Stand tall, feet hip-width\n2. Core braced, chest up\n3. Hands on hips or holding weights at sides\n\n**The Lunge:**\n1. Step forward with one leg\n2. Lower until back knee nearly touches floor\n3. Front knee at 90°, over ankle (not over toes!)\n4. Push through front foot to return\n5. Alternate legs or do one side at a time\n\n**Key Points:**\n- Keep torso upright, don't lean forward\n- Front knee tracks over toes, doesn't cave in\n- Step far enough that back knee goes straight down\n- Control the movement, don't crash down\n\n**Variations:**\n- Reverse lunges (step back) - easier on knees\n- Walking lunges - more challenging\n- Bulgarian split squats - advanced",
        "category": "exercise_legs"
    },
]

training_data.extend(leg_exercises)

# ============================================================================
# SHOULDER EXERCISES
# ============================================================================

shoulder_exercises = [
    {
        "instruction": "How to do overhead press?",
        "output": "**Overhead Press - Step by Step:**\n\n**Setup:**\n1. Bar in front rack position (on shoulders)\n2. Grip just outside shoulders\n3. Feet hip-width, squeeze glutes\n4. Elbows slightly in front of bar\n\n**The Press:**\n1. Take breath, brace core\n2. Press straight up\n3. Move head back to clear the bar\n4. Lock out overhead, head through\n5. Bar over mid-foot at top\n6. Lower with control to shoulders\n\n**Key Points:**\n- Don't lean back excessively (not a standing incline press)\n- Keep core tight throughout\n- Full lockout at top\n- Forearms vertical when viewed from side\n\n**Common Mistakes:**\n- Pressing in front of face (bad leverage)\n- Excessive back arch (lower back stress)\n- Not locking out (partial reps)",
        "category": "exercise_shoulders"
    },
    {
        "instruction": "How to do lateral raises?",
        "output": "**Lateral Raises - Step by Step:**\n\n**Setup:**\n1. Stand with dumbbells at sides\n2. Slight bend in elbows (keep it fixed)\n3. Lean slightly forward\n\n**The Raise:**\n1. Raise arms out to sides\n2. Lead with elbows, not hands\n3. Stop at shoulder height\n4. Pinky slightly higher than thumb (pour water from a jug)\n5. Lower with control\n\n**Key Points:**\n- Use LIGHT weight - ego killer exercise\n- Don't swing or use momentum\n- Feel the burn in side delts\n- 12-20 rep range works best\n\n**Common Mistakes:**\n- Going too heavy (using traps instead)\n- Raising too high (traps take over)\n- Swinging the weights\n- Thumbs up position (front delt emphasis)\n\nThis exercise is about feeling the muscle, not moving heavy weight!",
        "category": "exercise_shoulders"
    },
]

training_data.extend(shoulder_exercises)

# ============================================================================
# ARM EXERCISES
# ============================================================================

arm_exercises = [
    {
        "instruction": "How to do bicep curls?",
        "output": "**Bicep Curls - Perfect Form:**\n\n**Setup:**\n1. Stand with dumbbells at sides\n2. Palms facing forward (supinated)\n3. Elbows pinned to sides\n\n**The Curl:**\n1. Curl weight up by bending elbow only\n2. Squeeze bicep hard at top\n3. Lower with control (2-3 seconds)\n4. Full extension at bottom\n\n**Key Points:**\n- Elbows stay stationary - don't swing them\n- Don't use momentum or rock your body\n- Full range of motion\n- Squeeze at the top\n\n**Variations:**\n- Hammer curls (neutral grip) - brachialis focus\n- Incline curls - long head stretch\n- Preacher curls - strict form enforced\n- Barbell curls - heavier loading\n\nBiceps are small muscles - you don't need super heavy weight. Feel the muscle work!",
        "category": "exercise_arms"
    },
    {
        "instruction": "How to grow bigger arms?",
        "output": "**Big Arms Guide:**\n\n**The Truth:**\n- Triceps are 2/3 of arm size - train them more!\n- Arms grow when your whole body grows\n- Can't just train arms and skip everything else\n\n**Triceps (2/3 of arm):**\n- Close grip bench press\n- Dips\n- Overhead tricep extensions\n- Pushdowns\n\n**Biceps (1/3 of arm):**\n- Barbell curls\n- Dumbbell curls\n- Hammer curls (don't skip!)\n- Incline curls\n\n**Training Tips:**\n- 10-15 sets per muscle per week\n- Mix heavy (6-10) and light (12-20) reps\n- Full range of motion\n- Progressive overload\n\n**The Secret:**\n- Compound lifts (bench, rows, OHP) already train arms\n- Add 6-10 sets of direct arm work per week\n- Eat enough protein and calories\n- Be patient - arms take time!",
        "category": "exercise_faq"
    },
    {
        "instruction": "How to do tricep dips?",
        "output": "**Tricep Dips - Step by Step:**\n\n**Setup:**\n1. Grip parallel bars, arms locked out\n2. Cross feet behind you\n3. Slight forward lean for chest, upright for triceps\n\n**The Dip:**\n1. Lower until upper arms parallel to floor\n2. Elbows track backward (not flared)\n3. Push up to lockout\n4. Control the movement\n\n**For Tricep Focus:**\n- Stay upright (don't lean forward)\n- Elbows close to body\n- Don't go too deep\n\n**For Chest Focus:**\n- Lean forward ~30°\n- Wider grip if possible\n- Deeper range of motion\n\n**Can't do bodyweight?**\n- Use assisted dip machine\n- Bench dips (easier version)\n\n**Too easy?**\n- Add weight belt\n- Slow down the negative",
        "category": "exercise_arms"
    },
]

training_data.extend(arm_exercises)

# ============================================================================
# CORE EXERCISES
# ============================================================================

core_exercises = [
    {
        "instruction": "How to do planks?",
        "output": "**Plank - Perfect Form:**\n\n**Setup:**\n1. Forearms on ground, elbows under shoulders\n2. Feet hip-width apart\n3. Body in straight line from head to heels\n\n**The Hold:**\n1. Squeeze glutes hard\n2. Brace core like expecting a punch\n3. Tuck pelvis slightly (no sag or pike)\n4. Breathe normally\n5. Hold position\n\n**Key Points:**\n- Straight line! No sagging hips\n- Don't look up (neck neutral)\n- Squeeze everything - glutes, core, quads\n- Quality over time\n\n**Common Mistakes:**\n- Hips too high (piking)\n- Hips sagging (weak core)\n- Holding breath\n- Looking up/forward\n\n**Progression:**\n- Start with 3x20 seconds\n- Build to 3x60 seconds\n- Then progress to harder variations",
        "category": "exercise_core"
    },
    {
        "instruction": "How to get abs?",
        "output": "**Getting Visible Abs:**\n\n**The Truth:**\nAbs are made in the kitchen, not the gym. Everyone HAS abs - they're just covered by fat.\n\n**Step 1: Lose Fat**\n- Men need <12-15% body fat to see abs\n- Women need <18-22% body fat\n- This requires calorie deficit\n- No ab exercise burns belly fat specifically\n\n**Step 2: Build the Muscle**\n- Train abs 2-3x per week\n- Progressive overload (add weight)\n- Hit all parts: upper, lower, obliques\n\n**Best Ab Exercises:**\n1. Cable crunches (weighted)\n2. Hanging leg raises\n3. Ab wheel rollouts\n4. Pallof press (anti-rotation)\n5. Planks and variations\n\n**The Reality:**\n- 80% nutrition, 20% training\n- Takes months of consistency\n- Genetics affect ab shape (4-pack vs 6-pack vs 8-pack)\n\nWhat's your current body fat level?",
        "category": "exercise_faq"
    },
]

training_data.extend(core_exercises)

# ============================================================================
# GENERAL EXERCISE FAQS
# ============================================================================

general_faqs = [
    {
        "instruction": "How many sets and reps should I do?",
        "output": "**Sets and Reps Guide:**\n\n**For Muscle Building (Hypertrophy):**\n- 3-4 sets per exercise\n- 8-12 reps per set\n- 10-20 total sets per muscle per week\n- Rest 60-90 seconds between sets\n\n**For Strength:**\n- 4-5 sets per exercise\n- 3-6 reps per set\n- Heavy weight (85%+ of max)\n- Rest 2-5 minutes between sets\n\n**For Endurance:**\n- 2-3 sets per exercise\n- 15-25 reps per set\n- Lighter weight\n- Rest 30-60 seconds\n\n**General Rule:**\n- Take sets close to failure (1-3 reps left in tank)\n- Progressive overload is what matters most\n- Log your workouts to track progress\n\nWhat's your goal - muscle size, strength, or endurance?",
        "category": "exercise_faq"
    },
    {
        "instruction": "How long should I rest between sets?",
        "output": "**Rest Time Guide:**\n\n**30-60 seconds:**\n- Isolation exercises (curls, lateral raises)\n- Pump work / metabolic stress\n- Endurance training\n\n**60-90 seconds:**\n- Most hypertrophy training\n- Moderate compound lifts\n- Good balance of recovery and intensity\n\n**2-3 minutes:**\n- Heavy compound lifts (squat, bench, deadlift)\n- Strength-focused training\n- When you need full recovery\n\n**3-5 minutes:**\n- Max strength / powerlifting\n- 1-3 rep maxes\n- Competition prep\n\n**Tips:**\n- Use a timer - most people rest too long\n- If you're gasping, rest more\n- If you're scrolling TikTok for 5 mins, rest less\n- Shorter rest = more fatigue = more growth stimulus\n- Longer rest = more strength = heavier weights",
        "category": "exercise_faq"
    },
    {
        "instruction": "Should I train to failure?",
        "output": "**Training to Failure - The Answer:**\n\n**Not every set!** Here's why:\n\n**Pros of failure:**\n- Maximizes muscle fiber recruitment\n- Great for isolation exercises\n- Useful for final set\n\n**Cons of failure:**\n- Very fatiguing - hurts recovery\n- Compromises form (injury risk)\n- Reduces total training volume\n- Diminishing returns after 1-3 RIR\n\n**The Sweet Spot:**\n- Keep 1-3 reps in reserve (RIR) on most sets\n- Last set of an exercise can go to failure\n- Failure on machines/isolation = safer\n- Never fail on heavy compounds (squat, deadlift)\n\n**In Practice:**\n- Set 1: 3 RIR (could do 3 more)\n- Set 2: 2 RIR\n- Set 3: 1 RIR or failure\n\nFailure is a tool, not a requirement. Most gains come from the reps BEFORE failure.",
        "category": "exercise_faq"
    },
    {
        "instruction": "What weight should I use?",
        "output": "**Choosing the Right Weight:**\n\n**The Rule:**\nUse a weight where your last rep is HARD but doable with good form.\n\n**For 8-12 reps:**\n- If you can do 15, it's too light\n- If you fail at 6, it's too heavy\n- Sweet spot: struggle on rep 10-12\n\n**For Beginners:**\n- Start lighter than you think\n- Focus on form for 2-4 weeks\n- Add weight when reps feel easy\n\n**Progressive Overload:**\n- Add weight when you hit top of rep range\n- Example: aiming for 8-12 reps\n  - Week 1: 10kg x 10 reps\n  - Week 2: 10kg x 11 reps\n  - Week 3: 10kg x 12 reps\n  - Week 4: 12.5kg x 8-9 reps\n\n**Log Everything:**\n- Write down weights and reps\n- Beat last week's numbers\n- This is how you grow\n\nForma tracks this for you automatically! Just log your sets.",
        "category": "exercise_faq"
    },
    {
        "instruction": "How often should I train each muscle?",
        "output": "**Training Frequency Guide:**\n\n**Research Says:**\n- Training each muscle 2x per week is optimal for most\n- 1x per week works but is suboptimal\n- 3x per week is fine for smaller muscles\n\n**Popular Splits:**\n\n**Full Body (3x/week):**\n- Each muscle 3x per week\n- Great for beginners\n- Less volume per session\n\n**Upper/Lower (4x/week):**\n- Each muscle 2x per week\n- Good for intermediates\n- Good balance\n\n**Push/Pull/Legs (6x/week):**\n- Each muscle 2x per week\n- More volume\n- For advanced lifters\n\n**Bro Split (5x/week):**\n- Each muscle 1x per week\n- Classic but not optimal\n- Works if you train HARD\n\n**My Recommendation:**\n- Beginners: Full body 3x/week\n- Intermediate: Upper/Lower 4x/week\n- Advanced: PPL or whatever you recover from\n\nWhat's your current schedule?",
        "category": "exercise_faq"
    },
]

training_data.extend(general_faqs)

# ============================================================================
# EXERCISE ALTERNATIVES (No Equipment)
# ============================================================================

alternatives = [
    {
        "instruction": "What can I do instead of bench press at home?",
        "output": "**Bench Press Alternatives (No Equipment):**\n\n**Bodyweight:**\n1. Push-ups (standard) - closest substitute\n2. Wide push-ups - more chest\n3. Diamond push-ups - more triceps\n4. Decline push-ups (feet elevated) - upper chest\n5. Archer push-ups - unilateral work\n\n**With Resistance Bands:**\n1. Banded chest press (anchor behind you)\n2. Banded flyes\n\n**With Household Items:**\n1. Floor press with water bottles/backpack\n2. Dips between two chairs\n\n**Make It Harder:**\n- Slow down (4 seconds down, 1 up)\n- Pause at bottom\n- Elevate feet\n- Wear a backpack with weight\n\nPush-ups are actually excellent for chest development - don't underestimate them!",
        "category": "exercise_alternatives"
    },
    {
        "instruction": "What can I do instead of squats without weights?",
        "output": "**Squat Alternatives (Bodyweight):**\n\n**Basic:**\n1. Air squats - high reps (20-50)\n2. Jump squats - explosive power\n3. Pause squats - 3 seconds at bottom\n\n**Unilateral (Harder):**\n1. Bulgarian split squats - leg on chair\n2. Pistol squats - single leg (advanced!)\n3. Shrimp squats - hold back foot\n\n**With Resistance Bands:**\n1. Banded squats\n2. Banded leg press (lying down)\n\n**With Household Items:**\n1. Goblet squat with heavy backpack\n2. Sissy squats holding door frame\n\n**Make It Harder:**\n- 1.5 reps (down, half up, down, full up = 1)\n- Tempo (4 seconds down, 2 seconds up)\n- Isometric holds at bottom\n- Single leg work\n\nFor legs, high reps + tempo + unilateral work can build serious muscle without weights!",
        "category": "exercise_alternatives"
    },
    {
        "instruction": "ازاي اتمرن من غير جيم؟",
        "output": "**تمارين بدون جيم:**\n\n**صدر:**\n- Push-ups (كل الأنواع)\n- Dips على كراسي\n- Decline push-ups (رجلك على السرير)\n\n**ضهر:**\n- Inverted rows تحت ترابيزة\n- Superman holds\n- Pull-ups على باب (لو عندك بار)\n\n**رجل:**\n- Air squats (كتير!)\n- Bulgarian split squats\n- Lunges\n- Jump squats\n\n**كتف:**\n- Pike push-ups\n- Handstand hold على الحيط\n\n**دراع:**\n- Diamond push-ups (triceps)\n- Chin-ups (biceps)\n\n**Tips:**\n- زود العدات\n- بطء الحركة (4 ثواني نزول)\n- استخدم شنطة فيها حاجات تقيلة\n- Resistance bands لو عندك\n\nتقدر تبني جسم كويس أوي من البيت!",
        "category": "exercise_alternatives"
    },
]

training_data.extend(alternatives)

# ============================================================================
# SAVE THE DATA
# ============================================================================

output_file = "C:/Users/pc/Desktop/G/FitApp/apps/api/training-data/exercises_faq_training.json"

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(training_data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(training_data)} exercise FAQ samples")
print(f"Saved to: {output_file}")

# Category breakdown
categories = {}
for item in training_data:
    cat = item.get("category", "other")
    categories[cat] = categories.get(cat, 0) + 1

print("\nCategory breakdown:")
for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count}")
