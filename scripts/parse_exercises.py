
import os
import json
import re
from typing import List, Dict, Any

# These mappings are based on the seed.ts file to ensure consistency
def map_difficulty(diff: str) -> str:
    diff_map = {
        'beginner': 'BEGINNER',
        'intermediate': 'INTERMEDIATE',
        'advanced': 'ADVANCED',
        'expert': 'EXPERT',
    }
    return diff_map.get(diff.lower(), 'BEGINNER')

def map_muscle(muscle: str) -> str:
    muscle_map = {
        'chest': 'CHEST', 'back': 'BACK', 'shoulders': 'SHOULDERS', 'biceps': 'BICEPS',
        'triceps': 'TRICEPS', 'forearms': 'FOREARMS', 'abs': 'ABS', 'core': 'ABS',
        'obliques': 'OBLIQUES', 'lower back': 'LOWER_BACK', 'lower_back': 'LOWER_BACK',
        'glutes': 'GLUTES', 'quadriceps': 'QUADRICEPS', 'quads': 'QUADRICEPS',
        'hamstrings': 'HAMSTRINGS', 'calves': 'CALVES', 'full body': 'FULL_BODY',
        'full_body': 'FULL_BODY', 'cardio': 'CARDIO', 'rear delts': 'SHOULDERS',
        'rhomboids': 'BACK', 'hip flexors': 'LEGS', 'power': 'FULL_BODY', 'grip': 'FOREARMS',
        'triceps': 'TRICEPS', 'wrist': 'FOREARMS', 'mid back': 'BACK',
        'lats': 'BACK', 'lats (width)': 'BACK', 'lats (lower)': 'BACK',
        'lats (unilateral)': 'BACK', 'lats (isolation)': 'BACK', 'lats, rhomboids': 'BACK',
        'lats, core': 'BACK', 'lats, biceps': 'BACK', 'rear delts, lats': 'BACK',
        'lats, mid back': 'BACK', 'lats, rear delts': 'BACK', 'lats (upper)': 'BACK',
        'lats (lower)': 'BACK', 'lats, chest': 'BACK', 'lats, shoulders': 'BACK'
    }
    return muscle_map.get(muscle.lower(), 'FULL_BODY')


def map_equipment(equip: str) -> str:
    equip_map = {
        'none': 'NONE', 'bodyweight': 'BODYWEIGHT', 'body weight': 'BODYWEIGHT',
        'dumbbells': 'DUMBBELLS', 'dumbbell': 'DUMBBELLS', 'db': 'DUMBBELLS',
        'db + bench': 'DUMBBELLS', 'heavy db': 'DUMBBELLS', 'light dbs': 'DUMBBELLS',
        'barbell': 'BARBELL', 'bar': 'BARBELL', 'barbell + bench': 'BARBELL',
        'bar/rings': 'BARBELL', 'bar/trx': 'BARBELL', 'bar + band': 'BARBELL',
        'bar + weight': 'BARBELL',
        'kettlebell': 'KETTLEBELL', 'cables': 'CABLES', 'cable': 'CABLES',
        'high pulley': 'CABLES', 'low pulley': 'CABLES',
        'machines': 'MACHINES', 'machine': 'MACHINES', 'plate-loaded': 'MACHINES',
        'landmine': 'MACHINES', 'machine lat pulldown': 'MACHINES',
        'resistance bands': 'RESISTANCE_BANDS', 'bands': 'RESISTANCE_BANDS', 'band': 'RESISTANCE_BANDS',
        'band + anchor': 'RESISTANCE_BANDS',
        'trx': 'TRX', 'suspension': 'TRX', 'rings': 'TRX',
        'pull-up bar': 'PULL_UP_BAR', 'pull up bar': 'PULL_UP_BAR', 'pullup bar': 'PULL_UP_BAR',
        'bench': 'BENCH', 'incline': 'BENCH', 'decline': 'BENCH', 'db + incline': 'BENCH',
        'stability ball': 'STABILITY_BALL', 'swiss ball': 'STABILITY_BALL',
        'foam roller': 'FOAM_ROLLER', 'jump rope': 'JUMP_ROPE', 'treadmill': 'TREADMILL',
        'bike': 'BIKE', 'rowing': 'ROWING',
    }
    # First, check for exact match
    if equip.lower() in equip_map:
        return equip_map[equip.lower()]
    # If no exact match, check for keywords
    for keyword, eq_type in equip_map.items():
        if keyword in equip.lower():
            return eq_type
    return 'NONE'

def map_category(cat: str) -> str:
    # We will derive category from the file path for now
    return cat.upper()


def parse_markdown_table(content: str, muscle_group_from_path: str) -> List[Dict[str, Any]]:
    """Parses all markdown tables in a string and returns a list of exercise dicts."""
    
    # Regex to find markdown tables
    table_regex = re.compile(
        r"\|(?P<header>.+?)\|\n"  # Header row
        r"\|(?P<separator>[-|: ]+)\|\n"  # Separator row
        r"(?P<rows>(?:\|.*?(?:\n|$))+)",  # Data rows
        re.MULTILINE
    )
    
    exercises = []
    
    for match in table_regex.finditer(content):
        header = [h.strip().lower() for h in match.group('header').split('|') if h.strip()]
        
        raw_rows = match.group('rows').strip().split('\n')
        
        for row_str in raw_rows:
            if not row_str.strip().startswith('|'):
                continue

            values = [v.strip() for v in row_str.split('|') if v.strip()]
            
            if len(values) != len(header):
                # Malformed row, skip
                continue

            row_data = dict(zip(header, values))

            # --- Data Transformation ---
            secondary_muscles_raw = row_data.get('secondary', '')
            secondary_muscles_list = [m.strip() for m in re.split(r',|/', secondary_muscles_raw) if m.strip()]

            equipment_raw = row_data.get('equipment', 'bodyweight')
            equipment_list = [e.strip() for e in re.split(r',|/', equipment_raw) if e.strip()]

            # This structure mirrors the `ExerciseData` interface in seed.ts
            exercise = {
                "id": row_data.get('id', '').strip(),
                "name_en": row_data.get('exercise', 'Unknown Exercise').strip(),
                "name_ar": f"{row_data.get('exercise', 'Unknown').strip()} (AR)", # Placeholder
                "description_en": f"A {muscle_group_from_path} exercise focusing on the {row_data.get('primary', 'muscles')}.", # Placeholder
                "description_ar": f"تمرين {muscle_group_from_path} يركز على {row_data.get('primary', 'muscles')}.", # Placeholder
                "category": muscle_group_from_path.upper(),
                "primary_muscle": map_muscle(row_data.get('primary', muscle_group_from_path)),
                "secondary_muscles": [map_muscle(m) for m in secondary_muscles_list],
                "equipment": [map_equipment(e) for e in equipment_list],
                "difficulty": map_difficulty(row_data.get('difficulty', 'beginner')),
                "instructions_en": [ # Placeholder
                    "Step 1: Assume starting position.",
                    "Step 2: Perform the movement.",
                    "Step 3: Return to start."
                ],
                "instructions_ar": [
                    "الخطوة ١: اتخذ وضعية البداية.",
                    "الخطوة ٢: قم بأداء الحركة.",
                    "الخطوة ٣: عد إلى وضعية البداية."
                ],
                "tips_en": [],
                "tips_ar": [],
                "is_time_based": False,
                "default_sets": 3,
                "default_reps": 12,
                "default_duration": None,
                "default_rest": 60,
                "tags": [muscle_group_from_path] + [e.lower().replace(' ', '-') for e in equipment_list]
            }
            exercises.append(exercise)
            
    return exercises


def main():
    """Main function to find MD files, parse them, and write JSON."""
    
    root_docs_dir = os.path.abspath(os.path.join(__file__, '..', '..', 'docs'))
    exercises_dir = os.path.join(root_docs_dir, 'exercises')
    
    if not os.path.isdir(exercises_dir):
        print(f"Error: Directory not found '{exercises_dir}'")
        return

    print(f"Starting scan in: {exercises_dir}")
    total_files_processed = 0
    total_exercises_found = 0

    for root, _, files in os.walk(exercises_dir):
        for file in files:
            if file.endswith('.md'):
                md_path = os.path.join(root, file)
                print(f"\nProcessing: {md_path}")
                
                # Derive muscle group from the parent directory name
                muscle_group = os.path.basename(root)

                try:
                    with open(md_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    exercises = parse_markdown_table(content, muscle_group)

                    if not exercises:
                        print("  - No tables found or parsed.")
                        continue
                    
                    total_exercises_found += len(exercises)
                    total_files_processed += 1
                    
                    # Write to JSON file
                    json_path = os.path.splitext(md_path)[0] + '.json'
                    with open(json_path, 'w', encoding='utf-8') as f:
                        json.dump(exercises, f, indent=2, ensure_ascii=False)
                    
                    print(f"  [OK] Found {len(exercises)} exercises. Saved to {os.path.basename(json_path)}")

                except Exception as e:
                    print(f"  [ERROR] Error processing file {file}: {e}")

    print("\n-----------------------------------------")
    print("All files processed!")
    print(f"Total Markdown files parsed: {total_files_processed}")
    print(f"Total exercises generated: {total_exercises_found}")
    print("-----------------------------------------\\n")


if __name__ == '__main__':
    main()
