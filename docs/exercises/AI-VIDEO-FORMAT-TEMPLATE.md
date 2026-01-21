# AI Video Generation - Exercise Format Template

## Purpose

This template defines the precise format required for AI video generation (Gemini, etc.) to create accurate exercise demonstration videos. Each exercise must contain enough detail for the AI to understand exact body positions, movements, timing, and camera angles.

---

## REQUIRED FIELDS FOR EACH EXERCISE

```yaml
exercise:
  id: "UNIQUE_ID"
  name: "Exercise Name"
  arabic_name: "الاسم بالعربي"

  category:
    primary: "Chest/Back/Legs/etc"
    secondary: "Upper/Middle/Lower/etc"
    movement_type: "Push/Pull/Hinge/Squat/Lunge/Carry/Rotation"
    equipment_category: "Barbell/Dumbbell/Bodyweight/Cable/Machine"

  equipment:
    required: ["list of required equipment"]
    optional: ["list of optional equipment"]
    setup: "Detailed equipment setup instructions"

  difficulty:
    level: "Beginner/Intermediate/Advanced"
    prerequisites: ["exercises that should be mastered first"]
    progression_to: ["harder variations"]
    regression_from: ["easier variations"]

  muscles:
    primary: ["main muscles worked"]
    secondary: ["assisting muscles"]
    stabilizers: ["stabilizing muscles"]

  video_production:
    recommended_angles: ["Front 45°", "Side", "Rear 45°", etc]
    key_frames: ["list of important positions to capture"]
    slow_motion_points: ["parts of movement that benefit from slow-mo"]
    duration_per_rep: "X seconds"
    demo_reps: "X reps recommended for video"

  starting_position:
    body_placement: "Detailed description"
    foot_position: "Exact placement"
    foot_width: "Specific measurement or reference"
    knee_position: "Angle and alignment"
    hip_position: "Angle and orientation"
    spine_position: "Neutral/flexed/extended, specific cueing"
    shoulder_position: "Placement relative to body"
    arm_position: "Starting position of arms"
    hand_position: "Grip type and placement"
    head_position: "Where to look, neck alignment"
    core_engagement: "Level and type of bracing"

  execution:
    phases:
      - phase_name: "Eccentric/Lowering/Setup"
        movement_description: "What moves and how"
        joint_actions: ["list of joint movements"]
        tempo: "X seconds"
        breathing: "Inhale/Exhale"
        cues: ["verbal cues for this phase"]
        end_position: "Description of position at end of phase"

      - phase_name: "Concentric/Lifting/Return"
        movement_description: "What moves and how"
        joint_actions: ["list of joint movements"]
        tempo: "X seconds"
        breathing: "Inhale/Exhale"
        cues: ["verbal cues for this phase"]
        end_position: "Description of position at end of phase"

  form_cues:
    key_points: ["most important form reminders"]
    mental_imagery: ["visualization cues that help"]
    feeling: "What it should feel like when done correctly"

  common_mistakes:
    - mistake: "Description of mistake"
      why_bad: "Why this is problematic"
      correction: "How to fix it"
      visual_indicator: "What it looks like (for video)"

  contraindications:
    - condition: "Condition name"
      recommendation: "Avoid/Modify/Proceed with caution"
      modification: "Alternative if applicable"

  programming:
    rep_ranges:
      strength: "1-5 reps"
      hypertrophy: "8-12 reps"
      endurance: "15-20+ reps"
    sets: "Typical set range"
    rest: "Rest between sets"
    frequency: "Times per week"
```

---

## EXAMPLE: BARBELL BACK SQUAT (Full Detail)

```yaml
exercise:
  id: "BB-SQ-001"
  name: "Barbell Back Squat (High Bar)"
  arabic_name: "سكوات بالبار الخلفي (وضع البار العالي)"

  category:
    primary: "Legs"
    secondary: "Quadriceps"
    movement_type: "Squat"
    equipment_category: "Barbell"

  equipment:
    required:
      - "Olympic barbell (20kg/45lb)"
      - "Squat rack with safety bars"
      - "Weight plates (as needed)"
    optional:
      - "Weightlifting belt"
      - "Squat shoes (elevated heel)"
      - "Knee sleeves"
    setup: |
      1. Set the barbell on the rack at approximately upper-chest height (just below shoulder level when standing)
      2. Set safety bars at a height just below the bottom of your squat depth
      3. Load appropriate weight plates, secured with collars
      4. Ensure enough floor space (2m x 2m minimum) for safe movement

  difficulty:
    level: "Intermediate"
    prerequisites:
      - "Bodyweight Squat (mastered)"
      - "Goblet Squat"
      - "Front Squat (basic)"
    progression_to:
      - "Barbell Back Squat (Pause)"
      - "Barbell Back Squat (Tempo)"
      - "Low Bar Back Squat"
    regression_from:
      - "Barbell Front Squat"
      - "Goblet Squat"
      - "Leg Press"

  muscles:
    primary:
      - "Quadriceps (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius)"
    secondary:
      - "Gluteus Maximus"
      - "Adductors"
      - "Hamstrings (eccentric)"
    stabilizers:
      - "Erector spinae"
      - "Transverse abdominis"
      - "Obliques"
      - "Rectus abdominis"
      - "Upper back (traps, rhomboids)"

  video_production:
    recommended_angles:
      - "Front 45° (primary view - shows depth, knee tracking, bar path)"
      - "Side view (shows back angle, depth, hip hinge)"
      - "Rear 45° (shows bar placement, upper back, heel position)"
    key_frames:
      - "Standing position with bar racked"
      - "Unracking position"
      - "Standing ready position"
      - "Quarter squat (descent)"
      - "Parallel position (thighs parallel to floor)"
      - "Bottom position (full depth)"
      - "Ascent mid-point"
      - "Lockout at top"
    slow_motion_points:
      - "Transition from descent to ascent (the 'hole')"
      - "Knee tracking over toes"
      - "Hip drive phase"
    duration_per_rep: "4-6 seconds (2 down, 0-1 pause, 2 up, 1 reset)"
    demo_reps: "3-5 reps for video demonstration"

  starting_position:
    body_placement: |
      Stand directly under the barbell with the bar centered across your upper trapezius muscles
      (high bar position). The bar should rest on the muscle shelf created by squeezing your
      shoulder blades together, NOT on the spine or neck bones.

    foot_position: |
      Step back from the rack with 2-3 controlled steps. Feet should be placed:
      - Width: Approximately shoulder-width apart (hip-width to slightly wider)
      - Toe angle: Turned out 15-30 degrees (find comfortable angle)
      - Weight distribution: Even across entire foot (tripod foot - big toe, little toe, heel)

    foot_width: |
      Shoulder-width as baseline. Can adjust wider for those with longer femurs or
      limited ankle mobility. Toes follow knee path.

    knee_position: |
      Knees should be straight but not hyperextended at start. Slight soft bend acceptable.
      Knees will track over toes (in line with foot angle) during descent.

    hip_position: |
      Hips neutral (not anteriorly or posteriorly tilted).
      Pelvis in line with ribcage.
      Slight natural lumbar curve maintained.

    spine_position: |
      Maintain neutral spine throughout:
      - Natural lumbar lordosis (slight lower back arch)
      - Thoracic spine tall and extended (chest up)
      - No rounding of upper or lower back
      - Spine angle will change as you descend but should remain "neutral" relative to pelvis

    shoulder_position: |
      Shoulder blades retracted (squeezed together) and depressed (pulled down).
      This creates the "shelf" for the bar to sit on.
      Shoulders are directly under the bar.

    arm_position: |
      Hands gripping the bar outside shoulders.
      Grip width: As narrow as comfortable while maintaining shelf position.
      Elbows pointed down and slightly back (not flared out).

    hand_position: |
      Full grip around the bar (thumbs wrapped).
      Wrists neutral or slightly extended.
      Grip is to control bar, not to support weight (weight is on traps).

    head_position: |
      Head neutral, looking forward or slightly down (3-4 meters ahead on floor).
      Chin slightly tucked, neck in line with spine.
      DO NOT look up at ceiling or down at feet.

    core_engagement: |
      Deep breath into belly (diaphragmatic breath).
      Brace core as if about to be punched in the stomach.
      Create 360-degree pressure around spine.
      Maintain this brace throughout entire rep.

  execution:
    phases:
      - phase_name: "Unracking"
        movement_description: |
          From rack position, take a breath and brace. Stand up straight to lift bar off hooks.
          Take 2-3 controlled steps backward. Establish foot position. Re-brace if needed.
        joint_actions:
          - "Hip extension (standing up with bar)"
          - "Knee extension"
        tempo: "3-5 seconds total"
        breathing: "Brace before unracking, short breaths during walk-out if needed"
        cues:
          - "Stand tall"
          - "Controlled steps back"
          - "Set your feet"
        end_position: "Standing tall with bar across upper back, feet in squat stance"

      - phase_name: "Descent (Eccentric)"
        movement_description: |
          Initiate descent by simultaneously breaking at hips and knees.
          Sit DOWN and BACK, as if sitting into a chair that's slightly behind you.
          Knees track over toes (in line with foot angle).
          Maintain upright torso as much as hip mobility allows.
          Descend until hip crease is at or below top of knees (parallel or deeper).
          Maintain constant bar path (straight down when viewed from side).
        joint_actions:
          - "Hip flexion (sitting back)"
          - "Knee flexion (bending knees)"
          - "Ankle dorsiflexion (shins move forward)"
        tempo: "2-3 seconds controlled descent"
        breathing: "Breath held (Valsalva) or controlled exhale for lighter weights"
        cues:
          - "Sit back and down"
          - "Knees out over toes"
          - "Chest up"
          - "Control the descent"
          - "Weight in mid-foot"
        end_position: |
          Bottom of squat - hip crease below knee level (or as low as mobility allows with good form).
          Torso angle approximately 45-70 degrees from vertical (varies by anatomy).
          Knees tracking over toes. Weight distributed across full foot.

      - phase_name: "Transition (Bottom Position)"
        movement_description: |
          Brief pause or immediate reversal at bottom position.
          Maintain tension - do not relax or "bounce" out of the hole.
          Initiate ascent by driving feet through the floor.
        joint_actions:
          - "Isometric hold (brief)"
          - "Initiation of hip and knee extension"
        tempo: "0-1 second"
        breathing: "Continue holding breath or begin controlled exhale"
        cues:
          - "Stay tight"
          - "Drive through the floor"
          - "Push the earth away"
        end_position: "Same as descent end, transitioning to ascent"

      - phase_name: "Ascent (Concentric)"
        movement_description: |
          Drive up by pushing feet through the floor.
          Extend hips and knees simultaneously.
          Lead with the chest (prevent forward lean).
          Maintain knee tracking over toes.
          Squeeze glutes as you approach standing.
          Complete lockout at top (full hip and knee extension).
        joint_actions:
          - "Hip extension (standing up)"
          - "Knee extension (straightening legs)"
          - "Ankle plantarflexion (minor, returning from dorsiflexion)"
        tempo: "1.5-2.5 seconds (can be faster for power)"
        breathing: "Exhale through sticking point or at top"
        cues:
          - "Drive up"
          - "Chest up, hips through"
          - "Squeeze glutes at top"
          - "Stand tall"
        end_position: "Standing tall, hips and knees fully extended, ready for next rep"

      - phase_name: "Reset"
        movement_description: |
          At top of movement, take a breath if needed.
          Re-establish core brace.
          Begin next repetition.
        tempo: "0.5-1 second"
        breathing: "Quick breath in, re-brace"
        cues:
          - "Reset breath"
          - "Stay tight"
        end_position: "Ready for next rep"

  form_cues:
    key_points:
      - "Keep weight over mid-foot throughout movement"
      - "Knees track in line with toes (don't cave inward)"
      - "Maintain neutral spine (no rounding or excessive arching)"
      - "Chest stays up (prevents forward lean)"
      - "Brace core before and during every rep"
      - "Bar path should be vertical when viewed from the side"
    mental_imagery:
      - "Imagine spreading the floor apart with your feet"
      - "Think of pushing the floor away rather than lifting the weight"
      - "Imagine a string pulling your chest to the ceiling"
      - "Picture sitting down into a chair that's slightly behind you"
    feeling: |
      You should feel significant tension in your quadriceps (front of thigh),
      glutes, and core. Your back should feel tight and supported, not strained.
      If you feel sharp pain in knees, back, or hips - stop and reassess form.

  common_mistakes:
    - mistake: "Knees caving inward (valgus collapse)"
      why_bad: "Increases knee injury risk, reduces power output"
      correction: "Consciously push knees out over toes, strengthen glutes"
      visual_indicator: "Knees visibly move toward each other, especially during ascent"

    - mistake: "Forward lean / chest dropping"
      why_bad: "Shifts load to lower back, reduces quad activation, injury risk"
      correction: "Keep chest up, strengthen upper back, may need to reduce depth"
      visual_indicator: "Torso approaches horizontal, bar drifts forward of mid-foot"

    - mistake: "Butt wink (posterior pelvic tilt at bottom)"
      why_bad: "Lower back rounds under load, disc injury risk"
      correction: "Reduce depth to where spine stays neutral, work on hip mobility"
      visual_indicator: "Lower back rounds/tucks under at bottom of squat"

    - mistake: "Heels rising off floor"
      why_bad: "Reduces stability, shifts load forward, limits depth"
      correction: "Improve ankle mobility, use squat shoes, widen stance"
      visual_indicator: "Heels visibly lift, weight shifts to toes"

    - mistake: "Rising hips first (good morning squat)"
      why_bad: "Reduces quad activation, stresses lower back"
      correction: "Lead with chest, think 'chest up first'"
      visual_indicator: "Hips rise faster than shoulders, torso becomes more horizontal"

    - mistake: "Not hitting depth"
      why_bad: "Reduces muscle activation, may not count in competition"
      correction: "Improve mobility, reduce weight, use pause squats to learn position"
      visual_indicator: "Thighs don't reach parallel (hip crease above knee)"

    - mistake: "Bouncing out of the hole"
      why_bad: "Uses momentum instead of muscle, less control, injury risk"
      correction: "Practice pause squats, control descent speed"
      visual_indicator: "Rapid, uncontrolled reversal at bottom position"

  contraindications:
    - condition: "Acute lower back injury"
      recommendation: "Avoid"
      modification: "Leg press, goblet squat (if approved by healthcare provider)"

    - condition: "Knee pain/injury"
      recommendation: "Modify/Proceed with caution"
      modification: "Box squat, reduce depth, reduce weight, consult professional"

    - condition: "Hip impingement"
      recommendation: "Modify"
      modification: "Adjust stance width and toe angle, reduce depth, try sumo stance"

    - condition: "Shoulder mobility limitations"
      recommendation: "Modify"
      modification: "Use safety squat bar, high bar position with wider grip, front squat"

    - condition: "Pregnancy (2nd-3rd trimester)"
      recommendation: "Modify/Proceed with caution"
      modification: "Goblet squat, lighter weights, consult healthcare provider"

  programming:
    rep_ranges:
      strength: "1-5 reps @ 80-95% 1RM"
      hypertrophy: "6-12 reps @ 65-80% 1RM"
      endurance: "12-20 reps @ 50-65% 1RM"
    sets: "3-5 sets typical"
    rest: "2-5 minutes for strength, 60-90 seconds for hypertrophy"
    frequency: "1-3 times per week depending on program"
```

---

## EXAMPLE: DUMBBELL BICEP CURL (Full Detail)

```yaml
exercise:
  id: "DB-BI-001"
  name: "Standing Dumbbell Bicep Curl"
  arabic_name: "تمرين البايسبس بالدمبل واقف"

  category:
    primary: "Arms"
    secondary: "Biceps"
    movement_type: "Pull (Elbow Flexion)"
    equipment_category: "Dumbbell"

  equipment:
    required:
      - "Pair of dumbbells (appropriate weight)"
    optional:
      - "Mirror (for form check)"
    setup: |
      Select dumbbells that allow 8-15 controlled reps.
      Ensure floor space to stand comfortably.
      If available, position in front of mirror.

  difficulty:
    level: "Beginner"
    prerequisites: []
    progression_to:
      - "Incline Dumbbell Curl"
      - "Hammer Curl"
      - "Concentration Curl"
      - "Barbell Curl"
    regression_from: []

  muscles:
    primary:
      - "Biceps brachii (long head and short head)"
    secondary:
      - "Brachialis"
      - "Brachioradialis"
    stabilizers:
      - "Anterior deltoid"
      - "Core muscles"
      - "Wrist flexors"

  video_production:
    recommended_angles:
      - "Front view (shows both arms, symmetry)"
      - "Side view (shows elbow position, full ROM)"
      - "Front 45° (shows arm detail and movement)"
    key_frames:
      - "Starting position (arms extended)"
      - "Mid-curl (90° elbow flexion)"
      - "Peak contraction (full flexion)"
      - "Controlled lowering"
    slow_motion_points:
      - "Peak contraction squeeze"
      - "Controlled eccentric (lowering)"
    duration_per_rep: "3-4 seconds (1.5 up, 0.5 squeeze, 1.5 down)"
    demo_reps: "6-8 reps for video demonstration"

  starting_position:
    body_placement: |
      Stand upright with feet hip-width apart.
      Weight evenly distributed across both feet.
      Body forms a straight vertical line from head to heels.

    foot_position: |
      Feet hip-width apart (approximately 30-40cm between feet).
      Toes pointing forward or very slightly outward.
      Weight in mid-foot, slight contact at heels.

    foot_width: "Hip-width apart"

    knee_position: |
      Knees straight with soft/micro bend.
      Not locked out or hyperextended.

    hip_position: |
      Hips neutral, pelvis level.
      No forward or backward tilt.

    spine_position: |
      Spine neutral and vertical.
      Natural lumbar curve.
      No leaning backward or forward.

    shoulder_position: |
      Shoulders pulled back and down (retracted and depressed).
      Chest lifted and open.
      Shoulders remain stationary throughout movement.

    arm_position: |
      Arms hanging at sides, fully extended.
      Elbows close to torso (lightly touching ribs or 2-5cm away).
      Upper arms remain fixed throughout movement.
      Slight bend at elbow acceptable to maintain tension.

    hand_position: |
      Neutral grip at start (palms facing thighs).
      Full grip around dumbbell handles.
      Wrists neutral (not flexed or extended).

    head_position: |
      Head neutral, looking straight ahead.
      Chin level with floor.
      Neck in line with spine.

    core_engagement: |
      Light core engagement to prevent swaying.
      Approximately 20-30% brace.
      Breathe normally while maintaining stability.

  execution:
    phases:
      - phase_name: "Lifting Phase (Concentric)"
        movement_description: |
          Curl the dumbbells up by flexing at the elbows.
          As you lift, rotate (supinate) the forearms so palms face shoulders at top.
          Upper arms remain stationary - only forearms move.
          Bring dumbbells to shoulder level, maintaining elbow position.
          Squeeze biceps hard at the top of the movement.
        joint_actions:
          - "Elbow flexion (primary)"
          - "Forearm supination (rotation)"
        tempo: "1.5-2 seconds up"
        breathing: "Exhale during curl (lifting)"
        cues:
          - "Curl up with control"
          - "Keep elbows pinned"
          - "Rotate palms up as you lift"
          - "Squeeze at the top"
          - "Don't swing"
        end_position: |
          Dumbbells at shoulder level.
          Palms facing shoulders (supinated).
          Elbows still at sides, upper arms vertical.
          Biceps fully contracted.

      - phase_name: "Peak Contraction (Isometric)"
        movement_description: |
          Hold the top position briefly.
          Squeeze the biceps as hard as possible.
          Maintain elbow position.
        joint_actions:
          - "Isometric elbow flexion hold"
        tempo: "0.5-1 second hold"
        breathing: "Brief hold or controlled exhale"
        cues:
          - "Squeeze hard"
          - "Feel the bicep contract"
        end_position: "Same as end of lifting phase"

      - phase_name: "Lowering Phase (Eccentric)"
        movement_description: |
          Lower the dumbbells with control.
          Reverse the supination (palms rotate back to neutral).
          Resist the weight - don't let gravity drop the arms.
          Extend elbows fully but don't lock out aggressively.
          Maintain tension on biceps throughout lowering.
        joint_actions:
          - "Elbow extension (controlled)"
          - "Forearm pronation (return to neutral)"
        tempo: "2-3 seconds down (controlled)"
        breathing: "Inhale during lowering"
        cues:
          - "Control the descent"
          - "Resist the weight"
          - "Don't let it drop"
          - "Keep tension on the muscle"
        end_position: |
          Arms extended at sides.
          Slight bend at elbow (don't fully lock).
          Palms facing thighs (neutral grip).
          Ready for next rep.

  form_cues:
    key_points:
      - "Elbows stay pinned at your sides - NEVER move forward or back"
      - "Upper arm remains completely stationary"
      - "Control the weight both up AND down"
      - "Full range of motion (stretch at bottom, squeeze at top)"
      - "Don't swing or use momentum"
    mental_imagery:
      - "Imagine your upper arms are glued to your sides"
      - "Think of your elbow as a fixed hinge point"
      - "Picture squeezing a ball in your elbow crease at the top"
    feeling: |
      You should feel significant tension and "burn" in the front of your upper arm (bicep).
      You should NOT feel strain in your shoulders, lower back, or wrists.
      The muscle should feel "pumped" after the set.

  common_mistakes:
    - mistake: "Swinging the weight (using momentum)"
      why_bad: "Reduces bicep activation, shifts load to other muscles, injury risk"
      correction: "Use lighter weight, strict form, consider standing against wall"
      visual_indicator: "Body rocks forward/backward, hips thrust, back arches"

    - mistake: "Elbows drifting forward"
      why_bad: "Reduces range of motion, involves front delt, less bicep work"
      correction: "Keep elbows pinned at sides, use lighter weight"
      visual_indicator: "Upper arms move forward as weight is lifted"

    - mistake: "Not using full range of motion"
      why_bad: "Reduces muscle development, misses stretch and contraction"
      correction: "Lower all the way down (with control), curl all the way up"
      visual_indicator: "Arms only bend partially, never fully extend or fully flex"

    - mistake: "Lifting too heavy"
      why_bad: "Form breaks down, uses momentum, less effective"
      correction: "Reduce weight until perfect form can be maintained"
      visual_indicator: "Multiple form errors, excessive body movement"

    - mistake: "Flexing wrists at top"
      why_bad: "Reduces bicep tension, can strain wrist"
      correction: "Keep wrists neutral throughout"
      visual_indicator: "Wrists bend/curl inward at top of movement"

  contraindications:
    - condition: "Elbow injury/pain"
      recommendation: "Avoid or modify"
      modification: "Use lighter weight, reduce ROM, consult professional"

    - condition: "Wrist pain"
      recommendation: "Modify"
      modification: "Use neutral grip (hammer curl) or EZ bar"

  programming:
    rep_ranges:
      strength: "4-6 reps (less common for biceps)"
      hypertrophy: "8-12 reps (most common)"
      endurance: "15-20 reps"
    sets: "3-4 sets typical"
    rest: "60-90 seconds"
    frequency: "2-3 times per week (as part of arm or pull day)"
```

---

## EXAMPLE: PLANK (Bodyweight - Full Detail)

```yaml
exercise:
  id: "BW-CORE-001"
  name: "Forearm Plank"
  arabic_name: "تمرين البلانك على الساعدين"

  category:
    primary: "Core"
    secondary: "Abs / Deep Core"
    movement_type: "Isometric Hold"
    equipment_category: "Bodyweight"

  equipment:
    required: []
    optional:
      - "Exercise mat (comfort)"
    setup: |
      Clear floor space approximately 2m x 1m.
      Use mat if desired for forearm comfort.

  difficulty:
    level: "Beginner"
    prerequisites: []
    progression_to:
      - "Extended Plank (hands)"
      - "Side Plank"
      - "Plank with Leg Lift"
      - "Plank to Push-up"
      - "Long Lever Plank"
    regression_from:
      - "Wall Plank (standing at angle)"
      - "Incline Plank (hands on bench)"
      - "Knee Plank"

  muscles:
    primary:
      - "Rectus abdominis"
      - "Transverse abdominis"
    secondary:
      - "Internal and external obliques"
      - "Erector spinae"
    stabilizers:
      - "Quadriceps"
      - "Gluteus maximus"
      - "Deltoids"
      - "Pectoralis major"
      - "Serratus anterior"

  video_production:
    recommended_angles:
      - "Side view (primary - shows body alignment)"
      - "Front 45° (shows shoulder position)"
      - "Above view (shows body straightness)"
    key_frames:
      - "Starting position on knees"
      - "Transition to full plank"
      - "Perfect plank position (hold)"
      - "Common mistake positions for reference"
    slow_motion_points:
      - "Transition from knees to toes"
    duration_per_rep: "Hold for 20-60+ seconds"
    demo_reps: "One hold with 30-45 seconds demonstrated"

  starting_position:
    body_placement: |
      Position body face-down (prone) on floor.
      Create a straight line from head to heels.
      Body should form one rigid "plank" shape.

    foot_position: |
      Toes tucked under, balls of feet on floor.
      Feet hip-width apart (can be together for harder variation).
      Heels pushing back.

    foot_width: "Hip-width apart (approximately 15-30cm)"

    knee_position: |
      Knees fully extended and lifted off floor.
      Legs straight with slight quad engagement.

    hip_position: |
      Hips in line with shoulders and ankles (when viewed from side).
      Pelvis in slight posterior tilt (tuck tailbone slightly).
      Glutes lightly engaged.
      NO sagging or piking of hips.

    spine_position: |
      Spine neutral - straight line from head to tailbone.
      No excessive lower back arch (lordosis).
      No rounding of upper back.
      Maintain this position throughout hold.

    shoulder_position: |
      Shoulders directly over elbows.
      Shoulder blades slightly protracted (spread apart).
      Shoulders away from ears (depressed).
      Creating a stable upper body platform.

    arm_position: |
      Forearms flat on floor, parallel to each other.
      Forearms shoulder-width apart.
      Elbows directly under shoulders (90° angle at shoulder).
      Upper arms vertical.

    hand_position: |
      Hands can be flat on floor, fists, or fingers interlaced.
      If flat: palms down, fingers spread.
      If interlaced: creates stable base.

    head_position: |
      Head neutral, in line with spine.
      Looking at floor approximately 15-30cm in front of hands.
      Chin slightly tucked.
      Do NOT look up or let head drop.

    core_engagement: |
      Strong core brace - approximately 60-80% engagement.
      Draw belly button toward spine.
      Squeeze abs as if bracing for a punch.
      Maintain breathing while braced.

  execution:
    phases:
      - phase_name: "Setup"
        movement_description: |
          Start on hands and knees.
          Lower to forearms, placing elbows under shoulders.
          Extend one leg back, toes tucked.
          Extend second leg back to match.
          Establish plank position.
        joint_actions:
          - "Hip extension (from kneeling to plank)"
          - "Knee extension"
        tempo: "3-5 seconds to establish position"
        breathing: "Normal breathing during setup"
        cues:
          - "Elbows under shoulders"
          - "Extend legs back"
          - "Create one straight line"
        end_position: "Full plank position"

      - phase_name: "Hold (Isometric)"
        movement_description: |
          Maintain the plank position for prescribed time.
          Body should not move - completely static hold.
          Focus on maintaining perfect alignment.
          Continuously engage core, glutes, and quads.
        joint_actions:
          - "Isometric contraction of all involved muscles"
        tempo: "Hold for 20-60+ seconds"
        breathing: "Continue breathing normally - DO NOT hold breath"
        cues:
          - "Stay tight"
          - "Keep hips level"
          - "Squeeze everything"
          - "Breathe"
          - "Don't let hips sag or pike"
        end_position: "Same plank position maintained throughout"

      - phase_name: "Release"
        movement_description: |
          Lower knees to floor with control.
          Rest briefly before next set if applicable.
        tempo: "2-3 seconds"
        breathing: "Exhale as lowering"
        cues:
          - "Control the descent"
          - "Knees down gently"
        end_position: "Kneeling on floor"

  form_cues:
    key_points:
      - "Body forms ONE STRAIGHT LINE from head to heels"
      - "Hips don't sag down or pike up"
      - "Elbows directly under shoulders"
      - "Core braced throughout - don't let abs relax"
      - "Keep breathing - never hold breath"
      - "Glutes and quads engaged, not just core"
    mental_imagery:
      - "Imagine your body is a rigid wooden plank"
      - "Think of squeezing a walnut between your glutes"
      - "Picture a cup of water balancing on your back - don't spill it"
    feeling: |
      You should feel your entire core working (abs, obliques, lower back).
      Shoulders may fatigue. Quads and glutes should feel engaged.
      There should be NO pain in lower back.
      If lower back hurts, form is likely incorrect.

  common_mistakes:
    - mistake: "Hips sagging down"
      why_bad: "Compresses lower back, not training core effectively, pain risk"
      correction: "Squeeze glutes, tuck pelvis slightly, engage abs harder"
      visual_indicator: "Lower back arches down, hips drop below shoulder level"

    - mistake: "Hips piking up (butt in air)"
      why_bad: "Easier on core, not training plank properly, looks like downward dog"
      correction: "Lower hips to align with shoulders and ankles"
      visual_indicator: "Butt visibly higher than shoulder level, body forms A-shape"

    - mistake: "Holding breath"
      why_bad: "Raises blood pressure, limits hold time, not sustainable"
      correction: "Practice breathing while holding plank, start shorter and build"
      visual_indicator: "Face turns red, visible strain, gasping for air after"

    - mistake: "Elbows too far forward/back"
      why_bad: "Increases shoulder stress, reduces stability"
      correction: "Position elbows directly under shoulders"
      visual_indicator: "Upper arms not vertical, shoulder position off"

    - mistake: "Head dropping or looking up"
      why_bad: "Strains neck, breaks spinal alignment"
      correction: "Keep head neutral, look at floor"
      visual_indicator: "Chin either on chest or looking forward/up"

  contraindications:
    - condition: "Shoulder injury"
      recommendation: "Avoid or modify"
      modification: "Wall plank or incline plank (reduces shoulder load)"

    - condition: "Lower back pain"
      recommendation: "Proceed with caution"
      modification: "Knee plank, focus on perfect form, reduce hold time"

    - condition: "Pregnancy (advanced)"
      recommendation: "Modify"
      modification: "Incline plank, wall plank, consult healthcare provider"

    - condition: "Wrist issues"
      recommendation: "Forearm plank is already the modification"
      modification: "This IS the wrist-friendly version"

  programming:
    rep_ranges:
      strength: "3-5 sets of max hold with perfect form"
      hypertrophy: "N/A (isometric exercise)"
      endurance: "Build toward 60-120 second holds"
    sets: "3-5 sets"
    rest: "30-60 seconds between holds"
    frequency: "Can be done daily or 3-5 times per week"
```

---

## NOTES FOR AI VIDEO GENERATION

### Camera Setup Recommendations
- Primary angle should show the most important form elements
- Always capture at least 2 angles for each exercise
- Lighting should clearly show muscle engagement
- Background should be clean/neutral
- Frame should include full body for compound movements

### Audio Cues to Include
- Breathing timing ("exhale on exertion")
- Form reminders at key points
- Count cadence for tempo guidance

### Common Elements Every Video Needs
1. Equipment setup
2. Starting position demonstration
3. Full movement at normal speed
4. Slow motion of key portions
5. Common mistakes (brief "don't do this" segment)
6. Proper form recap

---

**This template should be applied to all 3,100+ exercises in the database for AI video generation readiness.**
