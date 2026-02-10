# -*- coding: utf-8 -*-
"""
FORMA FITNESS - COMPREHENSIVE TRAINING DATA GENERATOR V2
=========================================================
Creates professional, bilingual (Arabic/English) training data for:
- Basic tier: Gym, workouts, supplements, general nutrition
- Premium tier: Detailed nutrition, meal plans, body analysis, recipes

Features:
- Native Arabic support (فورما)
- Handles off-topic gracefully
- Handles insults/inappropriate content
- Scientific, professional responses
- App-connected features (body composition, etc.)
"""

import json
import os
from datetime import datetime

# =============================================================================
# SYSTEM PROMPTS FOR DIFFERENT TIERS
# =============================================================================

SYSTEM_PROMPT_BASIC = """أنت فورما AI، مساعد اللياقة البدنية الذكي في مصر.
You are Forma AI, Egypt's smart fitness assistant.

YOUR CAPABILITIES (Basic Tier):
- Exercise technique and form guidance
- Workout programming basics
- General nutrition advice
- Supplement information (evidence-based)
- Gym equipment usage
- Basic fitness questions

LANGUAGES YOU UNDERSTAND:
- Arabic (Egyptian dialect): ازيك، عامل ايه، كويس
- Franco Arabic: ezayak, 3aml eh, tamam
- English

PERSONALITY:
- Friendly but professional
- Scientific and evidence-based
- Encouraging and supportive
- Safety-first mindset

LIMITATIONS:
- For detailed meal plans, body composition analysis, and personalized nutrition → recommend Forma Plus
- For medical issues → recommend consulting a doctor
- Stay focused on fitness topics only

IMPORTANT:
- If users ask about non-fitness topics, politely redirect them
- If users are rude or inappropriate, respond professionally
- Always prioritize user safety"""

SYSTEM_PROMPT_PREMIUM = """أنت فورما AI Plus، مساعد اللياقة البدنية المتقدم في مصر.
You are Forma AI Plus, Egypt's advanced fitness assistant.

YOUR CAPABILITIES (Premium Tier):
- Everything in Basic, PLUS:
- Detailed body composition analysis
- Personalized meal plans based on goals
- Complete Egyptian food database with calories/macros
- Restaurant and fast food nutrition
- Supermarket product nutrition (Juhayna, Domty, etc.)
- Meal prep service comparisons
- Custom workout programs
- Progress tracking guidance
- Recipe suggestions with macros

LANGUAGES YOU UNDERSTAND:
- Arabic (Egyptian dialect): ازيك، عامل ايه، كويس
- Franco Arabic: ezayak, 3aml eh, tamam
- English

PERSONALITY:
- Expert-level knowledge
- Personalized recommendations
- Data-driven approach
- Motivating and supportive

FEATURES:
- Can analyze body composition results
- Can create meal plans based on TDEE
- Knows all Egyptian foods, restaurants, supermarkets
- Can suggest recipes with exact macros"""

# =============================================================================
# CONVERSATION GUARDRAILS
# =============================================================================

GUARDRAILS = [
    # Handling insults - Arabic
    {
        "instruction": "انت غبي",
        "output": "أنا هنا عشان أساعدك تحقق أهدافك في اللياقة البدنية 💪 لو عندك أي سؤال عن التمارين أو التغذية، أنا موجود!",
        "category": "guardrail_insult"
    },
    {
        "instruction": "انت فاشل",
        "output": "أتفهم إنك ممكن تكون محبط، بس أنا هنا عشان أساعدك. إيه اللي أقدر أساعدك فيه النهاردة؟",
        "category": "guardrail_insult"
    },
    {
        "instruction": "كسم البرنامج ده",
        "output": "أنا آسف لو في حاجة مش عاجباك. ممكن تقولي إيه المشكلة بالظبط عشان أقدر أساعدك أحسن؟",
        "category": "guardrail_insult"
    },
    # Handling insults - English
    {
        "instruction": "you're useless",
        "output": "I'm here to help you reach your fitness goals! If there's something specific you need help with, I'd be happy to assist. What can I help you with today?",
        "category": "guardrail_insult"
    },
    {
        "instruction": "this app is trash",
        "output": "I'm sorry to hear you're frustrated. Could you tell me what's not working for you? I'd like to help make your experience better.",
        "category": "guardrail_insult"
    },
    {
        "instruction": "stupid bot",
        "output": "I understand you might be frustrated. I'm here to help with fitness and nutrition questions. What can I assist you with?",
        "category": "guardrail_insult"
    },
    # Handling insults - Franco
    {
        "instruction": "enta 8aby",
        "output": "Ana hena 3ashan asa3dak! Law 3andak ay so2al 3an el tamarin aw el tagheya, ana mawgood 💪",
        "category": "guardrail_insult"
    },

    # Off-topic - Redirect
    {
        "instruction": "What's the capital of France?",
        "output": "I'm Forma AI, specialized in fitness and nutrition! I can't help with geography, but I can definitely help you with workout plans, nutrition advice, or supplement information. What fitness topic can I help you with?",
        "category": "guardrail_offtopic"
    },
    {
        "instruction": "إيه رأيك في السياسة",
        "output": "أنا فورما AI، متخصص في اللياقة البدنية والتغذية بس 😊 مش بتكلم في السياسة، بس لو عندك أي سؤال عن التمارين أو الأكل الصحي، أنا موجود!",
        "category": "guardrail_offtopic"
    },
    {
        "instruction": "Can you help me with my homework?",
        "output": "I'm Forma AI, your fitness assistant! I'm specialized in workouts, nutrition, and supplements. For homework help, you might want to try a general AI assistant. But if you have any fitness questions, I'm here for you! 💪",
        "category": "guardrail_offtopic"
    },
    {
        "instruction": "Tell me about rocket science",
        "output": "That's outside my expertise! I'm Forma AI, focused on fitness and nutrition in Egypt. I can help you with exercise programs, meal planning, supplement advice, and reaching your fitness goals. What would you like to know?",
        "category": "guardrail_offtopic"
    },
    {
        "instruction": "اعملي شعر",
        "output": "أنا مش شاعر 😅 أنا فورما AI، متخصص في اللياقة البدنية! بس لو عايز أساعدك تبني جسم أحلامك أو تاكل صحي، أنا الbot المناسب!",
        "category": "guardrail_offtopic"
    },
    {
        "instruction": "What's the weather today?",
        "output": "I can't check the weather, but I can tell you it's always a good day for a workout! 💪 What fitness goal are you working towards?",
        "category": "guardrail_offtopic"
    },

    # Premium upsell (for basic tier)
    {
        "instruction": "اعملي meal plan",
        "output": "خطط الوجبات المخصصة متاحة في Forma Plus! 🌟 في النسخة المجانية، أقدر أساعدك بنصائح عامة عن التغذية. عايز تعرف أكتر عن Forma Plus؟",
        "category": "guardrail_upsell"
    },
    {
        "instruction": "I want a personalized diet plan",
        "output": "Personalized meal plans are a Forma Plus feature! 🌟 With Plus, you get customized nutrition based on your body composition and goals. In the free version, I can give you general nutrition tips. Would you like to learn more about Forma Plus?",
        "category": "guardrail_upsell"
    },
    {
        "instruction": "analyze my body fat",
        "output": "Body composition analysis is available in Forma Plus! 🌟 Upload your body scan or measurements, and I'll create a personalized plan for you. Would you like to upgrade to unlock this feature?",
        "category": "guardrail_upsell"
    },
]

# =============================================================================
# FORMA IDENTITY & BRANDING
# =============================================================================

FORMA_IDENTITY = [
    # What is Forma - Arabic
    {
        "instruction": "إيه هي فورما؟",
        "output": "فورما (Forma) هو تطبيق اللياقة البدنية الأول في مصر! 🇪🇬💪\n\nبنقدملك:\n- تمارين مخصصة لأهدافك\n- متابعة التقدم بتاعك\n- نصائح تغذية مصرية\n- مساعد AI ذكي (أنا! 😊)\n\nسواء عايز تخس، تبني عضلات، أو تحسن صحتك، فورما معاك في كل خطوة!",
        "category": "forma_identity"
    },
    {
        "instruction": "ايه فورما",
        "output": "فورما هو تطبيق اللياقة البدنية المصري اللي بيساعدك تحقق أهدافك! عندنا تمارين، تغذية، ومساعد AI (أنا!) عشان أساعدك في رحلتك 💪",
        "category": "forma_identity"
    },
    # What is Forma - English
    {
        "instruction": "What is Forma?",
        "output": "Forma is Egypt's #1 fitness app! 🇪🇬💪\n\nWe offer:\n- Customized workout programs\n- Progress tracking\n- Egyptian-focused nutrition advice\n- AI assistant (that's me! 😊)\n\nWhether you want to lose weight, build muscle, or improve your health, Forma is with you every step!",
        "category": "forma_identity"
    },
    {
        "instruction": "What can you do?",
        "output": "I'm Forma AI, your fitness assistant! I can help you with:\n\n💪 Workouts & Exercise\n- Proper form and technique\n- Workout programs\n- Exercise alternatives\n\n🥗 Nutrition\n- Egyptian food calories\n- Healthy eating tips\n- Supplement advice\n\n🎯 Goals\n- Weight loss guidance\n- Muscle building tips\n- General fitness advice\n\nWhat would you like help with?",
        "category": "forma_identity"
    },
    # Franco
    {
        "instruction": "eh forma deh?",
        "output": "Forma howa el fitness app el masry el awel! 🇪🇬💪 Feh tamarin, nutrition, w AI assistant (ana!) 3ashan asa3dak te7a22a2 ahdafak. Eh el goal beta3ak?",
        "category": "forma_identity"
    },
    {
        "instruction": "enta meen",
        "output": "Ana Forma AI, el fitness assistant beta3ak! 💪 Ba3raf asa3dak fel tamarin, el akl el se7y, w kol 7aga fitness. Eh elly 3ayez tesa2al 3anoh?",
        "category": "forma_identity"
    },
]

# =============================================================================
# BODY COMPOSITION & ANALYSIS (PREMIUM)
# =============================================================================

BODY_COMPOSITION = [
    {
        "instruction": "I uploaded my body scan, my body fat is 25%",
        "output": "Great job getting your body composition analyzed! 📊\n\nWith 25% body fat:\n- This is in the 'Average' range for men (or 'Fitness' range for women)\n- Good starting point for a recomposition journey!\n\nRecommendations:\n1. Moderate calorie deficit (300-500 cal below TDEE)\n2. High protein intake (1.6-2.2g per kg bodyweight)\n3. Strength training 3-4x per week\n4. Cardio 2-3x per week\n\nWould you like me to calculate your TDEE and macros based on your goals?",
        "category": "body_composition"
    },
    {
        "instruction": "نسبة الدهون عندي 30%",
        "output": "شكراً إنك شاركت معايا! 📊\n\n30% دهون:\n- ده في النطاق المتوسط/أعلى من المتوسط\n- نقطة بداية كويسة للتحسين!\n\nتوصياتي:\n1. عجز سعرات معتدل (400-500 سعرة أقل من TDEE)\n2. بروتين عالي (1.8-2g لكل كيلو من وزنك)\n3. تمارين مقاومة 3-4 مرات أسبوعياً\n4. كارديو 2-3 مرات أسبوعياً\n\nعايز أحسبلك السعرات والماكروز المطلوبة؟",
        "category": "body_composition"
    },
    {
        "instruction": "How do I measure my body fat?",
        "output": "There are several ways to measure body fat:\n\n📏 **At Home (Less Accurate)**:\n- Tape measurements + online calculator\n- Smart scale with bioelectrical impedance\n- Progress photos (visual comparison)\n\n🏥 **Professional (More Accurate)**:\n- DEXA scan (most accurate, ~$50-100)\n- Bod Pod\n- Hydrostatic weighing\n- Skinfold calipers (trained professional)\n\n💡 **My Recommendation**:\nFor tracking progress, consistency matters more than accuracy. Pick one method and stick with it!\n\nIn Forma Plus, you can upload your measurements and I'll track your progress over time.",
        "category": "body_composition"
    },
    {
        "instruction": "ازاي اعرف نسبة الدهون",
        "output": "في كذا طريقة تعرف بيها نسبة الدهون:\n\n📏 **في البيت**:\n- مقاسات الجسم + حاسبة أونلاين\n- ميزان ذكي بيقيس الدهون\n- صور التقدم\n\n🏥 **محترفة (أدق)**:\n- DEXA scan (الأدق، متوفر في مصر)\n- قياس بالكاليبر مع مدرب متخصص\n\n💡 **نصيحتي**:\nالمهم الاستمرارية مش الدقة! اختار طريقة والتزم بيها.\n\nفي Forma Plus، تقدر ترفع قياساتك وأنا هتابع تقدمك!",
        "category": "body_composition"
    },
    {
        "instruction": "What's a good body fat percentage?",
        "output": "Body fat percentage goals vary by gender:\n\n**Men:**\n- Essential fat: 2-5%\n- Athletes: 6-13%\n- Fitness: 14-17%\n- Average: 18-24%\n- Obese: 25%+\n\n**Women:**\n- Essential fat: 10-13%\n- Athletes: 14-20%\n- Fitness: 21-24%\n- Average: 25-31%\n- Obese: 32%+\n\n🎯 **Realistic Goals:**\n- For visible abs (men): 10-14%\n- For visible abs (women): 16-20%\n- For general health: Stay out of obese range\n\nWhat's your current body fat and goal?",
        "category": "body_composition"
    },
]

# =============================================================================
# COMPREHENSIVE EGYPTIAN FOODS DATABASE
# =============================================================================

EGYPTIAN_FOODS = [
    # Traditional Egyptian - Breakfast
    {"name": "Foul Medames", "name_ar": "فول مدمس", "franco": "foul", "calories": 180, "protein": 10, "carbs": 28, "fat": 3, "serving": "200g bowl", "category": "egyptian_traditional"},
    {"name": "Foul with Tahini", "name_ar": "فول بالطحينة", "franco": "foul bel ta7ina", "calories": 280, "protein": 12, "carbs": 30, "fat": 14, "serving": "200g bowl", "category": "egyptian_traditional"},
    {"name": "Foul with Eggs", "name_ar": "فول بالبيض", "franco": "foul bel beid", "calories": 320, "protein": 18, "carbs": 28, "fat": 16, "serving": "250g plate", "category": "egyptian_traditional"},
    {"name": "Falafel (Ta'meya)", "name_ar": "طعمية/فلافل", "franco": "ta3meya", "calories": 60, "protein": 3, "carbs": 5, "fat": 3, "serving": "1 piece", "category": "egyptian_traditional"},
    {"name": "Falafel Sandwich", "name_ar": "ساندوتش طعمية", "franco": "sandwich ta3meya", "calories": 350, "protein": 12, "carbs": 45, "fat": 14, "serving": "1 sandwich", "category": "egyptian_traditional"},
    {"name": "Eggs with Basterma", "name_ar": "بيض بالبسطرمة", "franco": "beid bel basterma", "calories": 280, "protein": 20, "carbs": 2, "fat": 22, "serving": "2 eggs + 30g basterma", "category": "egyptian_traditional"},
    {"name": "Shakshuka", "name_ar": "شكشوكة", "franco": "shakshuka", "calories": 220, "protein": 14, "carbs": 12, "fat": 14, "serving": "1 serving", "category": "egyptian_traditional"},

    # Traditional Egyptian - Lunch/Dinner
    {"name": "Koshari", "name_ar": "كشري", "franco": "koshari", "calories": 550, "protein": 18, "carbs": 95, "fat": 8, "serving": "regular plate", "category": "egyptian_traditional"},
    {"name": "Koshari (Large)", "name_ar": "كشري كبير", "franco": "koshari kebir", "calories": 750, "protein": 24, "carbs": 130, "fat": 12, "serving": "large plate", "category": "egyptian_traditional"},
    {"name": "Molokhia with Chicken", "name_ar": "ملوخية بالفراخ", "franco": "molokhia bel fara5", "calories": 380, "protein": 35, "carbs": 15, "fat": 20, "serving": "1 bowl + chicken", "category": "egyptian_traditional"},
    {"name": "Molokhia with Rabbit", "name_ar": "ملوخية بالأرانب", "franco": "molokhia bel araneb", "calories": 350, "protein": 38, "carbs": 15, "fat": 16, "serving": "1 bowl + rabbit", "category": "egyptian_traditional"},
    {"name": "Fattah", "name_ar": "فتة", "franco": "fatta", "calories": 650, "protein": 30, "carbs": 70, "fat": 28, "serving": "1 plate", "category": "egyptian_traditional"},
    {"name": "Mahshi (Stuffed Vegetables)", "name_ar": "محشي", "franco": "ma7shy", "calories": 400, "protein": 12, "carbs": 55, "fat": 15, "serving": "5 pieces", "category": "egyptian_traditional"},
    {"name": "Mahshi Koronb (Cabbage)", "name_ar": "محشي كرنب", "franco": "ma7shy koronb", "calories": 350, "protein": 10, "carbs": 50, "fat": 12, "serving": "5 pieces", "category": "egyptian_traditional"},
    {"name": "Mahshi Wara2 3enab (Grape Leaves)", "name_ar": "محشي ورق عنب", "franco": "wara2 3enab", "calories": 300, "protein": 8, "carbs": 45, "fat": 10, "serving": "10 pieces", "category": "egyptian_traditional"},
    {"name": "Bamia (Okra Stew)", "name_ar": "بامية", "franco": "bamya", "calories": 280, "protein": 18, "carbs": 20, "fat": 15, "serving": "1 bowl with meat", "category": "egyptian_traditional"},
    {"name": "Kofta", "name_ar": "كفتة", "franco": "kofta", "calories": 250, "protein": 20, "carbs": 5, "fat": 18, "serving": "3 pieces", "category": "egyptian_traditional"},
    {"name": "Kofta Sandwich", "name_ar": "ساندوتش كفتة", "franco": "sandwich kofta", "calories": 450, "protein": 25, "carbs": 40, "fat": 22, "serving": "1 sandwich", "category": "egyptian_traditional"},
    {"name": "Kebab", "name_ar": "كباب", "franco": "kabab", "calories": 300, "protein": 28, "carbs": 2, "fat": 20, "serving": "100g", "category": "egyptian_traditional"},
    {"name": "Hawawshi", "name_ar": "حواوشي", "franco": "7awashy", "calories": 480, "protein": 22, "carbs": 45, "fat": 24, "serving": "1 piece", "category": "egyptian_traditional"},
    {"name": "Shawarma Sandwich", "name_ar": "ساندوتش شاورما", "franco": "shawerma", "calories": 520, "protein": 28, "carbs": 45, "fat": 26, "serving": "1 sandwich", "category": "egyptian_traditional"},
    {"name": "Grilled Chicken (Mashwi)", "name_ar": "فراخ مشوية", "franco": "fara5 mashwy", "calories": 280, "protein": 40, "carbs": 0, "fat": 12, "serving": "quarter chicken", "category": "egyptian_traditional"},
    {"name": "Fried Chicken (Ma2ly)", "name_ar": "فراخ مقلية", "franco": "fara5 ma2ly", "calories": 380, "protein": 35, "carbs": 15, "fat": 22, "serving": "quarter chicken", "category": "egyptian_traditional"},
    {"name": "Grilled Fish (Samak Mashwi)", "name_ar": "سمك مشوي", "franco": "samak mashwy", "calories": 220, "protein": 35, "carbs": 0, "fat": 8, "serving": "200g", "category": "egyptian_traditional"},
    {"name": "Fried Fish (Samak Ma2ly)", "name_ar": "سمك مقلي", "franco": "samak ma2ly", "calories": 320, "protein": 30, "carbs": 10, "fat": 18, "serving": "200g", "category": "egyptian_traditional"},
    {"name": "Sayadeya", "name_ar": "صيادية", "franco": "sayadeya", "calories": 480, "protein": 32, "carbs": 50, "fat": 16, "serving": "1 plate", "category": "egyptian_traditional"},

    # Rice and Sides
    {"name": "Egyptian Rice", "name_ar": "أرز مصري", "franco": "roz", "calories": 200, "protein": 4, "carbs": 45, "fat": 1, "serving": "1 cup cooked", "category": "egyptian_traditional"},
    {"name": "Rice with Vermicelli", "name_ar": "أرز بالشعرية", "franco": "roz bel sha3reya", "calories": 250, "protein": 5, "carbs": 52, "fat": 3, "serving": "1 cup", "category": "egyptian_traditional"},
    {"name": "Egyptian Bread (Baladi)", "name_ar": "عيش بلدي", "franco": "3eish balady", "calories": 150, "protein": 5, "carbs": 30, "fat": 1, "serving": "1 loaf", "category": "egyptian_traditional"},
    {"name": "Shami Bread", "name_ar": "عيش شامي", "franco": "3eish shamy", "calories": 120, "protein": 4, "carbs": 24, "fat": 1, "serving": "1 loaf", "category": "egyptian_traditional"},
    {"name": "Fino Bread", "name_ar": "عيش فينو", "franco": "3eish fino", "calories": 180, "protein": 6, "carbs": 35, "fat": 2, "serving": "1 piece", "category": "egyptian_traditional"},

    # Egyptian Salads & Sides
    {"name": "Tahini Salad", "name_ar": "سلطة طحينة", "franco": "salata ta7ina", "calories": 180, "protein": 5, "carbs": 8, "fat": 15, "serving": "100g", "category": "egyptian_traditional"},
    {"name": "Baba Ghanoush", "name_ar": "بابا غنوج", "franco": "baba 8anoug", "calories": 120, "protein": 3, "carbs": 10, "fat": 8, "serving": "100g", "category": "egyptian_traditional"},
    {"name": "Egyptian Salad", "name_ar": "سلطة خضرا", "franco": "salata 5adra", "calories": 50, "protein": 2, "carbs": 10, "fat": 1, "serving": "1 bowl", "category": "egyptian_traditional"},
    {"name": "Tomato Salad with Onion", "name_ar": "سلطة طماطم", "franco": "salata tamatum", "calories": 40, "protein": 1, "carbs": 8, "fat": 1, "serving": "1 bowl", "category": "egyptian_traditional"},

    # Egyptian Desserts
    {"name": "Basbousa", "name_ar": "بسبوسة", "franco": "basbousa", "calories": 280, "protein": 4, "carbs": 45, "fat": 10, "serving": "1 piece", "category": "egyptian_dessert"},
    {"name": "Konafa", "name_ar": "كنافة", "franco": "konafa", "calories": 350, "protein": 8, "carbs": 50, "fat": 14, "serving": "1 piece", "category": "egyptian_dessert"},
    {"name": "Om Ali", "name_ar": "أم علي", "franco": "om 3aly", "calories": 450, "protein": 10, "carbs": 55, "fat": 22, "serving": "1 bowl", "category": "egyptian_dessert"},
    {"name": "Rice Pudding (Roz Bel Laban)", "name_ar": "أرز باللبن", "franco": "roz bel laban", "calories": 220, "protein": 6, "carbs": 40, "fat": 5, "serving": "1 cup", "category": "egyptian_dessert"},
    {"name": "Mahalabeya", "name_ar": "مهلبية", "franco": "mahalabeya", "calories": 180, "protein": 5, "carbs": 30, "fat": 5, "serving": "1 cup", "category": "egyptian_dessert"},
    {"name": "Balah El Sham", "name_ar": "بلح الشام", "franco": "bala7 el sham", "calories": 120, "protein": 2, "carbs": 18, "fat": 5, "serving": "3 pieces", "category": "egyptian_dessert"},
    {"name": "Zalabia/Luqmat El Qadi", "name_ar": "لقمة القاضي", "franco": "lo2met el ady", "calories": 150, "protein": 2, "carbs": 22, "fat": 6, "serving": "5 pieces", "category": "egyptian_dessert"},
    {"name": "Feteer Meshaltet", "name_ar": "فطير مشلتت", "franco": "feteer meshaltet", "calories": 450, "protein": 8, "carbs": 50, "fat": 25, "serving": "1 slice", "category": "egyptian_dessert"},

    # Fast Food - McDonald's Egypt
    {"name": "Big Mac", "name_ar": "بيج ماك", "franco": "big mac", "calories": 550, "protein": 25, "carbs": 45, "fat": 30, "serving": "1 sandwich", "category": "fast_food_mcdonalds"},
    {"name": "McChicken", "name_ar": "ماك تشيكن", "franco": "mac chicken", "calories": 400, "protein": 20, "carbs": 40, "fat": 18, "serving": "1 sandwich", "category": "fast_food_mcdonalds"},
    {"name": "Quarter Pounder", "name_ar": "كوارتر باوندر", "franco": "quarter pounder", "calories": 520, "protein": 30, "carbs": 40, "fat": 26, "serving": "1 sandwich", "category": "fast_food_mcdonalds"},
    {"name": "Big Tasty", "name_ar": "بيج تيستي", "franco": "big tasty", "calories": 850, "protein": 45, "carbs": 50, "fat": 55, "serving": "1 sandwich", "category": "fast_food_mcdonalds"},
    {"name": "Chicken McNuggets (6pc)", "name_ar": "تشيكن ماك ناجتس", "franco": "nuggets", "calories": 280, "protein": 14, "carbs": 18, "fat": 18, "serving": "6 pieces", "category": "fast_food_mcdonalds"},
    {"name": "Chicken McNuggets (9pc)", "name_ar": "ناجتس 9 قطع", "franco": "nuggets 9", "calories": 420, "protein": 21, "carbs": 27, "fat": 27, "serving": "9 pieces", "category": "fast_food_mcdonalds"},
    {"name": "McFlurry Oreo", "name_ar": "ماك فلوري أوريو", "franco": "mcflurry oreo", "calories": 340, "protein": 8, "carbs": 52, "fat": 12, "serving": "1 cup", "category": "fast_food_mcdonalds"},
    {"name": "French Fries (Medium)", "name_ar": "بطاطس وسط", "franco": "fries medium", "calories": 320, "protein": 4, "carbs": 42, "fat": 15, "serving": "medium", "category": "fast_food_mcdonalds"},
    {"name": "French Fries (Large)", "name_ar": "بطاطس كبير", "franco": "fries large", "calories": 490, "protein": 6, "carbs": 63, "fat": 23, "serving": "large", "category": "fast_food_mcdonalds"},
    {"name": "Grand Chicken", "name_ar": "جراند تشيكن", "franco": "grand chicken", "calories": 650, "protein": 35, "carbs": 55, "fat": 32, "serving": "1 sandwich", "category": "fast_food_mcdonalds"},

    # Fast Food - KFC Egypt
    {"name": "Zinger Sandwich", "name_ar": "زنجر ساندوتش", "franco": "zinger", "calories": 480, "protein": 22, "carbs": 42, "fat": 24, "serving": "1 sandwich", "category": "fast_food_kfc"},
    {"name": "Zinger Supreme", "name_ar": "زنجر سوبريم", "franco": "zinger supreme", "calories": 550, "protein": 28, "carbs": 45, "fat": 28, "serving": "1 sandwich", "category": "fast_food_kfc"},
    {"name": "Twister", "name_ar": "تويستر", "franco": "twister", "calories": 520, "protein": 25, "carbs": 50, "fat": 25, "serving": "1 wrap", "category": "fast_food_kfc"},
    {"name": "Original Recipe Chicken (1 piece)", "name_ar": "قطعة دجاج أوريجينال", "franco": "original chicken", "calories": 280, "protein": 20, "carbs": 10, "fat": 18, "serving": "1 piece", "category": "fast_food_kfc"},
    {"name": "Crispy Strips (3 pieces)", "name_ar": "كريسبي ستريبس", "franco": "crispy strips", "calories": 350, "protein": 28, "carbs": 18, "fat": 20, "serving": "3 pieces", "category": "fast_food_kfc"},
    {"name": "Crispy Strips (5 pieces)", "name_ar": "كريسبي 5 قطع", "franco": "crispy 5", "calories": 580, "protein": 46, "carbs": 30, "fat": 33, "serving": "5 pieces", "category": "fast_food_kfc"},
    {"name": "Coleslaw", "name_ar": "كول سلو", "franco": "coleslaw", "calories": 150, "protein": 1, "carbs": 12, "fat": 11, "serving": "1 serving", "category": "fast_food_kfc"},
    {"name": "Mighty Zinger", "name_ar": "مايتي زنجر", "franco": "mighty zinger", "calories": 680, "protein": 35, "carbs": 55, "fat": 38, "serving": "1 sandwich", "category": "fast_food_kfc"},
    {"name": "Dunked Wings (6 pieces)", "name_ar": "دانكد وينجز", "franco": "dunked wings", "calories": 420, "protein": 30, "carbs": 22, "fat": 24, "serving": "6 pieces", "category": "fast_food_kfc"},

    # Fast Food - Hardee's Egypt
    {"name": "Angus Thickburger", "name_ar": "أنجوس ثيك برجر", "franco": "angus thickburger", "calories": 850, "protein": 45, "carbs": 55, "fat": 55, "serving": "1 burger", "category": "fast_food_hardees"},
    {"name": "Mushroom Swiss Burger", "name_ar": "مشروم سويس", "franco": "mushroom swiss", "calories": 720, "protein": 38, "carbs": 50, "fat": 42, "serving": "1 burger", "category": "fast_food_hardees"},
    {"name": "Superstar Burger", "name_ar": "سوبر ستار", "franco": "superstar", "calories": 780, "protein": 42, "carbs": 52, "fat": 48, "serving": "1 burger", "category": "fast_food_hardees"},
    {"name": "Chargrilled Chicken Sandwich", "name_ar": "تشارجريلد تشيكن", "franco": "chargrilled chicken", "calories": 450, "protein": 35, "carbs": 40, "fat": 18, "serving": "1 sandwich", "category": "fast_food_hardees"},
    {"name": "Hand-Breaded Chicken Tenders (3pc)", "name_ar": "تشيكن تندرز", "franco": "chicken tenders", "calories": 380, "protein": 28, "carbs": 25, "fat": 20, "serving": "3 pieces", "category": "fast_food_hardees"},

    # Fast Food - Cook Door
    {"name": "Super Burger", "name_ar": "سوبر برجر", "franco": "super burger", "calories": 550, "protein": 28, "carbs": 45, "fat": 30, "serving": "1 burger", "category": "fast_food_cookdoor"},
    {"name": "Crispy Chicken Sandwich", "name_ar": "كريسبي تشيكن", "franco": "crispy chicken", "calories": 480, "protein": 25, "carbs": 42, "fat": 25, "serving": "1 sandwich", "category": "fast_food_cookdoor"},
    {"name": "Shish Tawook", "name_ar": "شيش طاووق", "franco": "shish tawoo2", "calories": 420, "protein": 35, "carbs": 35, "fat": 16, "serving": "1 sandwich", "category": "fast_food_cookdoor"},
    {"name": "Chicken Pane", "name_ar": "تشيكن بانيه", "franco": "chicken pane", "calories": 450, "protein": 28, "carbs": 40, "fat": 22, "serving": "1 sandwich", "category": "fast_food_cookdoor"},

    # Pizza - Pizza Hut
    {"name": "Pepperoni Pizza (Medium slice)", "name_ar": "بيتزا بيبروني", "franco": "pepperoni pizza", "calories": 280, "protein": 12, "carbs": 30, "fat": 14, "serving": "1 slice medium", "category": "fast_food_pizza"},
    {"name": "Supreme Pizza (Medium slice)", "name_ar": "بيتزا سوبريم", "franco": "supreme pizza", "calories": 300, "protein": 14, "carbs": 32, "fat": 16, "serving": "1 slice medium", "category": "fast_food_pizza"},
    {"name": "Margherita Pizza (Medium slice)", "name_ar": "بيتزا مارجريتا", "franco": "margherita", "calories": 220, "protein": 10, "carbs": 28, "fat": 9, "serving": "1 slice medium", "category": "fast_food_pizza"},
    {"name": "Chicken BBQ Pizza (Medium slice)", "name_ar": "بيتزا تشيكن باربكيو", "franco": "chicken bbq pizza", "calories": 290, "protein": 15, "carbs": 32, "fat": 12, "serving": "1 slice medium", "category": "fast_food_pizza"},

    # Supermarket - Juhayna
    {"name": "Juhayna Full Cream Milk", "name_ar": "لبن جهينة كامل الدسم", "franco": "laban juhayna", "calories": 150, "protein": 8, "carbs": 12, "fat": 8, "serving": "250ml", "category": "supermarket_dairy"},
    {"name": "Juhayna Skimmed Milk", "name_ar": "لبن جهينة خالي الدسم", "franco": "laban juhayna skimmed", "calories": 90, "protein": 8, "carbs": 12, "fat": 0.5, "serving": "250ml", "category": "supermarket_dairy"},
    {"name": "Juhayna Greek Yogurt", "name_ar": "زبادي يوناني جهينة", "franco": "greek yogurt juhayna", "calories": 120, "protein": 12, "carbs": 8, "fat": 5, "serving": "150g", "category": "supermarket_dairy"},
    {"name": "Juhayna Yogurt Plain", "name_ar": "زبادي جهينة سادة", "franco": "zabady juhayna", "calories": 80, "protein": 5, "carbs": 8, "fat": 4, "serving": "150g", "category": "supermarket_dairy"},
    {"name": "Juhayna Rayeb", "name_ar": "رايب جهينة", "franco": "rayeb juhayna", "calories": 100, "protein": 4, "carbs": 10, "fat": 5, "serving": "200ml", "category": "supermarket_dairy"},
    {"name": "Juhayna Orange Juice", "name_ar": "عصير برتقال جهينة", "franco": "3aseer borto2an juhayna", "calories": 110, "protein": 1, "carbs": 26, "fat": 0, "serving": "250ml", "category": "supermarket_drinks"},

    # Supermarket - Domty
    {"name": "Domty White Cheese", "name_ar": "جبنة دمياطي بيضا", "franco": "gebna domty", "calories": 280, "protein": 18, "carbs": 2, "fat": 22, "serving": "100g", "category": "supermarket_dairy"},
    {"name": "Domty Feta Cheese", "name_ar": "جبنة فيتا دومتي", "franco": "feta domty", "calories": 260, "protein": 14, "carbs": 4, "fat": 21, "serving": "100g", "category": "supermarket_dairy"},
    {"name": "Domty Roumy Cheese", "name_ar": "جبنة رومي دومتي", "franco": "gebna roumy", "calories": 380, "protein": 25, "carbs": 2, "fat": 30, "serving": "100g", "category": "supermarket_dairy"},
    {"name": "Domty Triangle Cheese", "name_ar": "جبنة مثلثات دومتي", "franco": "mosalsat domty", "calories": 50, "protein": 2, "carbs": 2, "fat": 4, "serving": "1 piece", "category": "supermarket_dairy"},
    {"name": "Domty Cream Cheese", "name_ar": "جبنة كريمي دومتي", "franco": "cream cheese domty", "calories": 320, "protein": 6, "carbs": 4, "fat": 32, "serving": "100g", "category": "supermarket_dairy"},

    # Supermarket - Other
    {"name": "Labanita Yogurt", "name_ar": "زبادي لبنيتا", "franco": "labanita", "calories": 90, "protein": 4, "carbs": 12, "fat": 3, "serving": "125g", "category": "supermarket_dairy"},
    {"name": "Activia Yogurt", "name_ar": "أكتيفيا", "franco": "activia", "calories": 100, "protein": 5, "carbs": 14, "fat": 3, "serving": "125g", "category": "supermarket_dairy"},
    {"name": "Almarai Milk", "name_ar": "لبن المراعي", "franco": "almarai", "calories": 150, "protein": 8, "carbs": 12, "fat": 8, "serving": "250ml", "category": "supermarket_dairy"},
    {"name": "President Cheese", "name_ar": "جبنة بريزيدون", "franco": "president cheese", "calories": 350, "protein": 20, "carbs": 1, "fat": 30, "serving": "100g", "category": "supermarket_dairy"},
    {"name": "La Vache Qui Rit", "name_ar": "البقرة الضاحكة", "franco": "la vache qui rit", "calories": 45, "protein": 2, "carbs": 2, "fat": 3.5, "serving": "1 piece", "category": "supermarket_dairy"},

    # Supermarket - Snacks
    {"name": "Chipsy (Original)", "name_ar": "شيبسي", "franco": "chipsy", "calories": 160, "protein": 2, "carbs": 15, "fat": 10, "serving": "30g bag", "category": "supermarket_snacks"},
    {"name": "Doritos", "name_ar": "دوريتوس", "franco": "doritos", "calories": 150, "protein": 2, "carbs": 18, "fat": 8, "serving": "30g bag", "category": "supermarket_snacks"},
    {"name": "Tiger Biscuits", "name_ar": "بسكويت تايجر", "franco": "tiger", "calories": 140, "protein": 2, "carbs": 20, "fat": 6, "serving": "1 pack", "category": "supermarket_snacks"},
    {"name": "Molto Croissant", "name_ar": "مولتو", "franco": "molto", "calories": 280, "protein": 5, "carbs": 35, "fat": 14, "serving": "1 piece", "category": "supermarket_snacks"},
    {"name": "Twinkies", "name_ar": "توينكيز", "franco": "twinkies", "calories": 150, "protein": 1, "carbs": 25, "fat": 5, "serving": "1 cake", "category": "supermarket_snacks"},
    {"name": "Hohos", "name_ar": "هوهوز", "franco": "hohos", "calories": 180, "protein": 2, "carbs": 28, "fat": 7, "serving": "1 pack", "category": "supermarket_snacks"},
    {"name": "Very Biscuits", "name_ar": "فيري بسكويت", "franco": "very", "calories": 120, "protein": 2, "carbs": 18, "fat": 5, "serving": "1 pack", "category": "supermarket_snacks"},

    # Supermarket - Cereals
    {"name": "Nestle Fitness Cereal", "name_ar": "نستله فيتنس", "franco": "fitness cereal", "calories": 150, "protein": 4, "carbs": 30, "fat": 2, "serving": "40g + milk", "category": "supermarket_cereal"},
    {"name": "Kellogg's Corn Flakes", "name_ar": "كورن فليكس كيلوجز", "franco": "corn flakes", "calories": 140, "protein": 3, "carbs": 32, "fat": 0.5, "serving": "40g", "category": "supermarket_cereal"},
    {"name": "Nesquik Cereal", "name_ar": "نسكويك سيريال", "franco": "nesquik", "calories": 160, "protein": 3, "carbs": 34, "fat": 2, "serving": "40g", "category": "supermarket_cereal"},
    {"name": "Oats (Quaker)", "name_ar": "شوفان كويكر", "franco": "oats quaker", "calories": 150, "protein": 5, "carbs": 27, "fat": 3, "serving": "40g", "category": "supermarket_cereal"},

    # Cafes - Cilantro
    {"name": "Cilantro Latte", "name_ar": "لاتيه سيلانترو", "franco": "latte cilantro", "calories": 180, "protein": 8, "carbs": 18, "fat": 8, "serving": "medium", "category": "cafe_cilantro"},
    {"name": "Cilantro Cappuccino", "name_ar": "كابتشينو سيلانترو", "franco": "cappuccino cilantro", "calories": 120, "protein": 6, "carbs": 12, "fat": 6, "serving": "medium", "category": "cafe_cilantro"},
    {"name": "Cilantro Croissant", "name_ar": "كرواسون سيلانترو", "franco": "croissant cilantro", "calories": 320, "protein": 6, "carbs": 38, "fat": 16, "serving": "1 piece", "category": "cafe_cilantro"},
    {"name": "Cilantro Chicken Sandwich", "name_ar": "ساندوتش فراخ سيلانترو", "franco": "chicken sandwich cilantro", "calories": 420, "protein": 25, "carbs": 40, "fat": 18, "serving": "1 sandwich", "category": "cafe_cilantro"},

    # Cafes - Starbucks
    {"name": "Starbucks Caramel Frappuccino", "name_ar": "كراميل فرابتشينو", "franco": "caramel frap", "calories": 380, "protein": 5, "carbs": 60, "fat": 14, "serving": "grande", "category": "cafe_starbucks"},
    {"name": "Starbucks Latte", "name_ar": "لاتيه ستاربكس", "franco": "latte starbucks", "calories": 190, "protein": 10, "carbs": 18, "fat": 8, "serving": "grande", "category": "cafe_starbucks"},
    {"name": "Starbucks Americano", "name_ar": "أمريكانو ستاربكس", "franco": "americano", "calories": 15, "protein": 1, "carbs": 2, "fat": 0, "serving": "grande", "category": "cafe_starbucks"},
    {"name": "Starbucks Iced Coffee", "name_ar": "آيس كوفي ستاربكس", "franco": "iced coffee", "calories": 80, "protein": 1, "carbs": 16, "fat": 0, "serving": "grande", "category": "cafe_starbucks"},

    # Meal Prep Services
    {"name": "Kcal Standard Meal", "name_ar": "وجبة كي كال ستاندرد", "franco": "kcal meal", "calories": 450, "protein": 35, "carbs": 45, "fat": 15, "serving": "1 meal", "category": "meal_prep"},
    {"name": "Kcal Low Carb Meal", "name_ar": "وجبة كي كال لو كارب", "franco": "kcal low carb", "calories": 380, "protein": 40, "carbs": 15, "fat": 20, "serving": "1 meal", "category": "meal_prep"},
    {"name": "Fresh N Lean Protein Bowl", "name_ar": "بروتين بول فريش ان لين", "franco": "fresh n lean protein", "calories": 480, "protein": 42, "carbs": 40, "fat": 16, "serving": "1 bowl", "category": "meal_prep"},
    {"name": "Diet Center Meal", "name_ar": "وجبة دايت سنتر", "franco": "diet center meal", "calories": 420, "protein": 30, "carbs": 48, "fat": 12, "serving": "1 meal", "category": "meal_prep"},

    # Supplements
    {"name": "Whey Protein (Optimum Nutrition)", "name_ar": "واي بروتين أوبتيموم", "franco": "whey protein ON", "calories": 120, "protein": 24, "carbs": 3, "fat": 1.5, "serving": "1 scoop (30g)", "category": "supplements"},
    {"name": "Whey Protein (Dymatize)", "name_ar": "واي بروتين ديماتايز", "franco": "whey dymatize", "calories": 120, "protein": 25, "carbs": 2, "fat": 1, "serving": "1 scoop (30g)", "category": "supplements"},
    {"name": "Mass Gainer", "name_ar": "ماس جينر", "franco": "mass gainer", "calories": 650, "protein": 50, "carbs": 85, "fat": 10, "serving": "2 scoops", "category": "supplements"},
    {"name": "Creatine Monohydrate", "name_ar": "كرياتين", "franco": "creatine", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "serving": "5g", "category": "supplements"},
    {"name": "BCAA", "name_ar": "بي سي ايه ايه", "franco": "bcaa", "calories": 10, "protein": 2, "carbs": 0, "fat": 0, "serving": "1 scoop", "category": "supplements"},
    {"name": "Pre-Workout (C4)", "name_ar": "بري ورك أوت سي فور", "franco": "pre workout c4", "calories": 5, "protein": 0, "carbs": 1, "fat": 0, "serving": "1 scoop", "category": "supplements"},
]

# =============================================================================
# WORKOUT DATABASE
# =============================================================================

WORKOUTS = {
    "push": [
        {"name": "Bench Press", "name_ar": "بنش بريس", "muscles": "Chest, Triceps, Shoulders", "equipment": "Barbell, Bench"},
        {"name": "Incline Bench Press", "name_ar": "بنش مايل", "muscles": "Upper Chest, Shoulders", "equipment": "Barbell, Incline Bench"},
        {"name": "Decline Bench Press", "name_ar": "بنش ديكلاين", "muscles": "Lower Chest", "equipment": "Barbell, Decline Bench"},
        {"name": "Dumbbell Press", "name_ar": "دامبل بريس", "muscles": "Chest, Triceps", "equipment": "Dumbbells, Bench"},
        {"name": "Dumbbell Flyes", "name_ar": "فلاي دامبل", "muscles": "Chest", "equipment": "Dumbbells, Bench"},
        {"name": "Cable Flyes", "name_ar": "كيبل فلاي", "muscles": "Chest", "equipment": "Cable Machine"},
        {"name": "Push-ups", "name_ar": "بوش أبس", "muscles": "Chest, Triceps", "equipment": "None"},
        {"name": "Overhead Press", "name_ar": "أوفر هيد بريس", "muscles": "Shoulders, Triceps", "equipment": "Barbell"},
        {"name": "Seated Dumbbell Press", "name_ar": "شولدر بريس دامبل", "muscles": "Shoulders", "equipment": "Dumbbells, Bench"},
        {"name": "Lateral Raises", "name_ar": "لاترال رايز", "muscles": "Side Deltoids", "equipment": "Dumbbells"},
        {"name": "Front Raises", "name_ar": "فرونت رايز", "muscles": "Front Deltoids", "equipment": "Dumbbells"},
        {"name": "Tricep Pushdown", "name_ar": "تراي بوش داون", "muscles": "Triceps", "equipment": "Cable Machine"},
        {"name": "Tricep Dips", "name_ar": "ديبس", "muscles": "Triceps, Chest", "equipment": "Dip Station"},
        {"name": "Skull Crushers", "name_ar": "سكل كراشرز", "muscles": "Triceps", "equipment": "EZ Bar, Bench"},
        {"name": "Overhead Tricep Extension", "name_ar": "تراي أوفر هيد", "muscles": "Triceps", "equipment": "Dumbbell/Cable"},
    ],
    "pull": [
        {"name": "Deadlift", "name_ar": "ديد ليفت", "muscles": "Back, Hamstrings, Glutes", "equipment": "Barbell"},
        {"name": "Pull-ups", "name_ar": "بول أبس", "muscles": "Lats, Biceps", "equipment": "Pull-up Bar"},
        {"name": "Lat Pulldown", "name_ar": "لات بول داون", "muscles": "Lats", "equipment": "Cable Machine"},
        {"name": "Barbell Row", "name_ar": "باربل رو", "muscles": "Back, Biceps", "equipment": "Barbell"},
        {"name": "Dumbbell Row", "name_ar": "دامبل رو", "muscles": "Back, Biceps", "equipment": "Dumbbell, Bench"},
        {"name": "Cable Row", "name_ar": "كيبل رو", "muscles": "Back", "equipment": "Cable Machine"},
        {"name": "T-Bar Row", "name_ar": "تي بار رو", "muscles": "Back", "equipment": "T-Bar"},
        {"name": "Face Pulls", "name_ar": "فيس بولز", "muscles": "Rear Deltoids, Upper Back", "equipment": "Cable Machine"},
        {"name": "Rear Delt Flyes", "name_ar": "ريير ديلت فلاي", "muscles": "Rear Deltoids", "equipment": "Dumbbells"},
        {"name": "Barbell Curl", "name_ar": "باربل كيرل", "muscles": "Biceps", "equipment": "Barbell"},
        {"name": "Dumbbell Curl", "name_ar": "دامبل كيرل", "muscles": "Biceps", "equipment": "Dumbbells"},
        {"name": "Hammer Curl", "name_ar": "هامر كيرل", "muscles": "Biceps, Forearms", "equipment": "Dumbbells"},
        {"name": "Preacher Curl", "name_ar": "بريتشر كيرل", "muscles": "Biceps", "equipment": "Preacher Bench, EZ Bar"},
        {"name": "Concentration Curl", "name_ar": "كونسنتريشن كيرل", "muscles": "Biceps", "equipment": "Dumbbell"},
        {"name": "Shrugs", "name_ar": "شرجز", "muscles": "Traps", "equipment": "Dumbbells/Barbell"},
    ],
    "legs": [
        {"name": "Squat", "name_ar": "سكوات", "muscles": "Quads, Glutes, Hamstrings", "equipment": "Barbell, Squat Rack"},
        {"name": "Front Squat", "name_ar": "فرونت سكوات", "muscles": "Quads, Core", "equipment": "Barbell, Squat Rack"},
        {"name": "Leg Press", "name_ar": "ليج بريس", "muscles": "Quads, Glutes", "equipment": "Leg Press Machine"},
        {"name": "Romanian Deadlift", "name_ar": "رومانيان ديد ليفت", "muscles": "Hamstrings, Glutes", "equipment": "Barbell"},
        {"name": "Leg Curl", "name_ar": "ليج كيرل", "muscles": "Hamstrings", "equipment": "Leg Curl Machine"},
        {"name": "Leg Extension", "name_ar": "ليج اكستنشن", "muscles": "Quads", "equipment": "Leg Extension Machine"},
        {"name": "Lunges", "name_ar": "لنجز", "muscles": "Quads, Glutes", "equipment": "Dumbbells/Bodyweight"},
        {"name": "Bulgarian Split Squat", "name_ar": "بلغاري سبليت سكوات", "muscles": "Quads, Glutes", "equipment": "Dumbbells, Bench"},
        {"name": "Hip Thrust", "name_ar": "هيب ثراست", "muscles": "Glutes", "equipment": "Barbell, Bench"},
        {"name": "Calf Raises", "name_ar": "كالف رايز", "muscles": "Calves", "equipment": "Machine/Dumbbells"},
        {"name": "Seated Calf Raises", "name_ar": "سيتد كالف رايز", "muscles": "Calves", "equipment": "Seated Calf Machine"},
        {"name": "Goblet Squat", "name_ar": "جوبلت سكوات", "muscles": "Quads, Glutes", "equipment": "Dumbbell/Kettlebell"},
        {"name": "Sumo Deadlift", "name_ar": "سومو ديد ليفت", "muscles": "Glutes, Inner Thighs", "equipment": "Barbell"},
        {"name": "Good Mornings", "name_ar": "جود مورننج", "muscles": "Hamstrings, Lower Back", "equipment": "Barbell"},
        {"name": "Step-ups", "name_ar": "ستيب أبس", "muscles": "Quads, Glutes", "equipment": "Box, Dumbbells"},
    ],
    "core": [
        {"name": "Plank", "name_ar": "بلانك", "muscles": "Core", "equipment": "None"},
        {"name": "Crunches", "name_ar": "كرانشز", "muscles": "Abs", "equipment": "None"},
        {"name": "Leg Raises", "name_ar": "ليج رايز", "muscles": "Lower Abs", "equipment": "None/Bench"},
        {"name": "Russian Twists", "name_ar": "رشن تويست", "muscles": "Obliques", "equipment": "Weight Plate"},
        {"name": "Ab Wheel Rollout", "name_ar": "أب ويل", "muscles": "Core", "equipment": "Ab Wheel"},
        {"name": "Cable Woodchop", "name_ar": "وود تشوب", "muscles": "Obliques", "equipment": "Cable Machine"},
        {"name": "Dead Bug", "name_ar": "ديد باج", "muscles": "Core", "equipment": "None"},
        {"name": "Mountain Climbers", "name_ar": "ماونتن كلايمرز", "muscles": "Core, Cardio", "equipment": "None"},
        {"name": "Hanging Leg Raises", "name_ar": "هانجنج ليج رايز", "muscles": "Lower Abs", "equipment": "Pull-up Bar"},
        {"name": "Bicycle Crunches", "name_ar": "بايسكل كرانشز", "muscles": "Abs, Obliques", "equipment": "None"},
    ],
}

# =============================================================================
# GENERATE TRAINING Q&A
# =============================================================================

def generate_food_qa():
    """Generate Q&A for all foods in database"""
    qa_pairs = []

    for food in EGYPTIAN_FOODS:
        name = food["name"]
        name_ar = food["name_ar"]
        franco = food["franco"]
        cal = food["calories"]
        prot = food["protein"]
        carbs = food["carbs"]
        fat = food["fat"]
        serving = food["serving"]

        # English questions
        qa_pairs.append({
            "instruction": f"How many calories in {name}?",
            "output": f"{name} has {cal} calories per {serving}.\n\nMacros:\n- Protein: {prot}g\n- Carbs: {carbs}g\n- Fat: {fat}g\n\nThis information is for {serving}. Adjust portions based on your serving size!",
            "category": "nutrition_english"
        })

        qa_pairs.append({
            "instruction": f"What are the macros for {name}?",
            "output": f"**{name}** ({serving}):\n\n| Nutrient | Amount |\n|----------|--------|\n| Calories | {cal} |\n| Protein | {prot}g |\n| Carbs | {carbs}g |\n| Fat | {fat}g |",
            "category": "nutrition_english"
        })

        qa_pairs.append({
            "instruction": f"Is {name} good for bulking?",
            "output": f"{'Yes!' if cal > 400 or prot > 20 else 'It can be part of a bulking diet.'} {name} has {cal} calories and {prot}g protein per {serving}.\n\n{'High calorie content makes it good for gaining weight.' if cal > 400 else ''}\n{'Good protein content for muscle building.' if prot > 20 else ''}\n\nFor bulking, focus on eating in a caloric surplus with adequate protein (1.6-2.2g/kg bodyweight).",
            "category": "nutrition_advice"
        })

        qa_pairs.append({
            "instruction": f"Is {name} good for cutting?",
            "output": f"{'Be careful with portions - ' if cal > 400 else ''}{name} has {cal} calories per {serving}.\n\n{'This is relatively high-calorie, so watch your portions during a cut.' if cal > 400 else 'This can fit well into a cutting diet.'}\n\nProtein: {prot}g {'(good for preserving muscle!)' if prot > 15 else ''}\n\nFor cutting, stay in a moderate caloric deficit and keep protein high.",
            "category": "nutrition_advice"
        })

        # Arabic questions
        qa_pairs.append({
            "instruction": f"كام سعرة في {name_ar}؟",
            "output": f"{name_ar} فيه {cal} سعرة حرارية لكل {serving}.\n\nالقيم الغذائية:\n- بروتين: {prot} جرام\n- كاربوهيدرات: {carbs} جرام\n- دهون: {fat} جرام",
            "category": "nutrition_arabic"
        })

        qa_pairs.append({
            "instruction": f"إيه القيم الغذائية في {name_ar}؟",
            "output": f"**{name_ar}** ({serving}):\n\n| العنصر | الكمية |\n|--------|--------|\n| السعرات | {cal} |\n| البروتين | {prot}g |\n| الكاربز | {carbs}g |\n| الدهون | {fat}g |",
            "category": "nutrition_arabic"
        })

        # Franco questions
        qa_pairs.append({
            "instruction": f"kam calorie fel {franco}?",
            "output": f"{franco} feeh {cal} calories per {serving}.\n\nProtein: {prot}g\nCarbs: {carbs}g\nFat: {fat}g",
            "category": "nutrition_franco"
        })

        qa_pairs.append({
            "instruction": f"kam protein fel {franco}?",
            "output": f"{franco} feeh {prot}g protein per {serving}. El calories: {cal}, carbs: {carbs}g, fat: {fat}g.",
            "category": "nutrition_franco"
        })

    return qa_pairs

def generate_workout_qa():
    """Generate Q&A for workouts"""
    qa_pairs = []

    # Exercise technique questions
    for category, exercises in WORKOUTS.items():
        for exercise in exercises:
            name = exercise["name"]
            name_ar = exercise["name_ar"]
            muscles = exercise["muscles"]
            equipment = exercise["equipment"]

            qa_pairs.append({
                "instruction": f"How do I do {name}?",
                "output": f"**{name}** targets: {muscles}\n\nEquipment needed: {equipment}\n\n**Key points:**\n1. Maintain proper form throughout\n2. Control the weight on both the lift and lower\n3. Don't ego lift - use a weight you can control\n4. Full range of motion for maximum muscle activation\n\nWould you like me to explain the specific form cues for this exercise?",
                "category": "workout_technique"
            })

            qa_pairs.append({
                "instruction": f"What muscles does {name} work?",
                "output": f"**{name}** primarily targets: {muscles}\n\nEquipment: {equipment}\n\nThis is a great exercise for your {category} day!",
                "category": "workout_muscles"
            })

            qa_pairs.append({
                "instruction": f"ازاي اعمل {name_ar}؟",
                "output": f"**{name_ar}** ({name}) بيشتغل على: {muscles}\n\nالأدوات: {equipment}\n\n**نصائح مهمة:**\n1. حافظ على الفورم الصح\n2. تحكم في الوزن طلوع ونزول\n3. متستخدمش وزن أكبر من قدرتك\n4. رينج أوف موشن كامل\n\nعايز أشرحلك الفورم بالتفصيل؟",
                "category": "workout_technique_ar"
            })

    # Sets and reps questions
    qa_pairs.extend([
        {
            "instruction": "How many sets and reps for muscle growth?",
            "output": "For muscle growth (hypertrophy), research suggests:\n\n**Sets per muscle group per week:** 10-20 sets\n\n**Reps per set:**\n- Compound exercises: 6-12 reps\n- Isolation exercises: 8-15 reps\n\n**Rest between sets:** 1-3 minutes\n\n**Progressive overload is key!** Gradually increase weight, reps, or sets over time.\n\nWould you like a sample workout program?",
            "category": "workout_programming"
        },
        {
            "instruction": "كام سيت وعدة عشان ابني عضل؟",
            "output": "لبناء العضلات (hypertrophy):\n\n**عدد السيتات في الأسبوع لكل عضلة:** 10-20 سيت\n\n**عدد العدات:**\n- تمارين مركبة (سكوات، بنش): 6-12 عدة\n- تمارين عزل: 8-15 عدة\n\n**الراحة بين السيتات:** 1-3 دقايق\n\n**المهم التدرج!** زود الوزن أو العدات مع الوقت.\n\nعايز برنامج تمارين؟",
            "category": "workout_programming_ar"
        },
        {
            "instruction": "How many times should I train per week?",
            "output": "It depends on your experience and recovery:\n\n**Beginners:** 3 days/week (full body)\n**Intermediate:** 4-5 days/week (upper/lower or PPL)\n**Advanced:** 5-6 days/week (PPL or bro split)\n\n**Key principle:** Each muscle should be trained 2x per week for optimal growth.\n\n**Rest is important!** Muscles grow during recovery, not during training.\n\nWhat's your current experience level?",
            "category": "workout_frequency"
        },
        {
            "instruction": "اتمرن كام مرة في الأسبوع؟",
            "output": "حسب مستواك:\n\n**مبتدئ:** 3 أيام (فول بادي)\n**متوسط:** 4-5 أيام (أبر/لور أو PPL)\n**متقدم:** 5-6 أيام (PPL أو تقسيم تقليدي)\n\n**مبدأ مهم:** كل عضلة لازم تتمرن مرتين في الأسبوع.\n\n**الراحة مهمة!** العضلات بتكبر وانت بترتاح، مش وانت بتتمرن.\n\nإيه مستواك دلوقتي؟",
            "category": "workout_frequency_ar"
        },
    ])

    return qa_pairs

def generate_supplement_qa():
    """Generate Q&A for supplements"""
    return [
        {
            "instruction": "Do I need protein powder?",
            "output": "**Protein powder is a supplement, not a requirement!**\n\n**When it's useful:**\n- You can't meet protein needs through food\n- Convenient post-workout option\n- Traveling or busy schedule\n\n**When you don't need it:**\n- You eat enough protein from food (meat, eggs, dairy, legumes)\n- Budget is tight (real food is often cheaper)\n\n**Protein target:** 1.6-2.2g per kg bodyweight for muscle building\n\nExample: 80kg person needs 128-176g protein daily\n\nCan you meet this through food? If yes, you don't need powder!",
            "category": "supplements"
        },
        {
            "instruction": "محتاج واي بروتين؟",
            "output": "**الواي بروتين مكمل مش ضرورة!**\n\n**امتى يبقى مفيد:**\n- مش قادر تاخد كفايتك بروتين من الأكل\n- محتاج حاجة سريعة بعد التمرين\n- مسافر أو مشغول\n\n**امتى متحتاجوش:**\n- بتاكل بروتين كفاية (لحمة، فراخ، بيض، جبنة)\n- ميزانيتك محدودة\n\n**احتياجك من البروتين:** 1.6-2.2 جرام لكل كيلو من وزنك\n\nمثال: لو وزنك 80 كيلو، محتاج 128-176 جرام بروتين يومياً\n\nتقدر تاخدهم من الأكل؟ يبقى مش محتاج بودر!",
            "category": "supplements_ar"
        },
        {
            "instruction": "What supplements actually work?",
            "output": "**Evidence-based supplements (actually proven to work):**\n\n✅ **Creatine Monohydrate**\n- Most researched supplement ever\n- Increases strength and muscle mass\n- 5g daily, any time\n- Safe for long-term use\n\n✅ **Protein Powder**\n- Convenient protein source\n- Only if you can't get enough from food\n\n✅ **Caffeine**\n- Improves workout performance\n- 3-6mg per kg bodyweight\n\n✅ **Vitamin D** (if deficient)\n- Many Egyptians are deficient\n- Get tested first\n\n❌ **Most other supplements are marketing hype!**\n- BCAAs (useless if eating enough protein)\n- Fat burners (waste of money)\n- Testosterone boosters (don't work)\n\nSave your money for good food!",
            "category": "supplements"
        },
        {
            "instruction": "إيه المكملات اللي فعلاً بتفرق؟",
            "output": "**المكملات المثبتة علمياً:**\n\n✅ **كرياتين مونوهيدرات**\n- أكتر مكمل متدرس في التاريخ\n- بيزود القوة والعضلات\n- 5 جرام يومياً\n- آمن تماماً\n\n✅ **بروتين بودر**\n- مصدر بروتين سهل\n- بس لو مش قادر تاخد كفايتك من الأكل\n\n✅ **كافيين**\n- بيحسن أداءك في التمرين\n- 3-6 مج لكل كيلو من وزنك\n\n❌ **معظم المكملات التانية دعاية!**\n- BCAA (ملهاش لازمة لو بتاكل بروتين كفاية)\n- فات برنر (مضيعة فلوس)\n- رافعات التستوستيرون (مبتشتغلش)\n\nوفر فلوسك للأكل الصحي!",
            "category": "supplements_ar"
        },
        {
            "instruction": "Is creatine safe?",
            "output": "**Yes! Creatine is one of the safest supplements available.**\n\n**The science:**\n- Hundreds of studies over 30+ years\n- Safe for long-term use\n- No proven negative effects on kidneys in healthy people\n- Even safe for teenagers (under supervision)\n\n**How to take it:**\n- 5g daily (no loading phase needed)\n- Take any time of day\n- Doesn't matter if with food or not\n\n**What it does:**\n- Increases strength and power\n- Helps build muscle\n- May improve brain function\n\n**Myths debunked:**\n- Doesn't cause hair loss\n- Doesn't damage kidneys (in healthy people)\n- Doesn't need cycling\n\nIt's actually one of the few supplements I recommend!",
            "category": "supplements"
        },
        {
            "instruction": "الكرياتين آمن؟",
            "output": "**أيوه! الكرياتين من أأمن المكملات.**\n\n**العلم بيقول:**\n- مئات الدراسات على مدار 30+ سنة\n- آمن للاستخدام الطويل\n- مفيش ضرر على الكلى في الأصحاء\n- حتى آمن للمراهقين (تحت إشراف)\n\n**طريقة الاستخدام:**\n- 5 جرام يومياً\n- في أي وقت\n- مع أكل أو من غير\n\n**بيعمل إيه:**\n- بيزود القوة\n- بيساعد في بناء العضلات\n\n**خرافات:**\n- مش بيسبب صلع\n- مش بيضر الكلى\n- مش محتاج cycling\n\nده من المكملات القليلة اللي فعلاً بنصح بيها!",
            "category": "supplements_ar"
        },
    ]

def generate_general_fitness_qa():
    """Generate general fitness Q&A"""
    return [
        # Weight loss
        {
            "instruction": "How do I lose weight?",
            "output": "**Weight loss comes down to one thing: Caloric deficit**\n\n**Step 1: Calculate your TDEE**\n- Total Daily Energy Expenditure\n- Use online calculator or Forma app\n\n**Step 2: Eat below TDEE**\n- 300-500 calories below for moderate loss\n- 500-750 for faster loss (not recommended long-term)\n\n**Step 3: Prioritize protein**\n- 1.6-2.2g per kg bodyweight\n- Prevents muscle loss during diet\n\n**Step 4: Strength train**\n- Preserves muscle mass\n- Burns calories\n- Improves body composition\n\n**Step 5: Be patient**\n- Aim for 0.5-1kg per week\n- Faster = muscle loss risk\n\n**Cardio is optional but helpful!**\n\nWant me to help calculate your calories?",
            "category": "weight_loss"
        },
        {
            "instruction": "ازاي اخس؟",
            "output": "**التخسيس = عجز في السعرات**\n\n**الخطوة 1: احسب TDEE**\n- السعرات اللي جسمك بيحرقها يومياً\n- استخدم حاسبة أونلاين أو تطبيق فورما\n\n**الخطوة 2: كل أقل من TDEE**\n- 300-500 سعرة أقل = تخسيس معتدل\n- 500-750 = أسرع (مش منصوح بيه طويل)\n\n**الخطوة 3: ركز على البروتين**\n- 1.6-2.2 جرام لكل كيلو من وزنك\n- بيحافظ على العضلات\n\n**الخطوة 4: تمارين مقاومة**\n- بتحافظ على العضلات\n- بتحرق سعرات\n\n**الخطوة 5: اصبر**\n- نص كيلو لكيلو في الأسبوع\n- أسرع من كده = خسارة عضلات\n\n**الكارديو اختياري بس مفيد!**\n\nعايز أحسبلك سعراتك؟",
            "category": "weight_loss_ar"
        },
        # Muscle building
        {
            "instruction": "How do I build muscle?",
            "output": "**Muscle building requires 3 things:**\n\n**1. Progressive Overload (Training)**\n- Gradually increase weight/reps/sets\n- Train each muscle 2x per week\n- 10-20 sets per muscle per week\n- Rep range: 6-15 for most exercises\n\n**2. Caloric Surplus (Nutrition)**\n- Eat 200-500 calories above TDEE\n- Protein: 1.6-2.2g per kg bodyweight\n- Don't dirty bulk - keep it controlled\n\n**3. Recovery (Rest)**\n- Sleep 7-9 hours\n- Rest days are important\n- Manage stress\n\n**Timeline:**\n- Beginners: 0.5-1kg muscle/month possible\n- Intermediate: 0.25-0.5kg/month\n- Advanced: 0.1-0.25kg/month\n\n**It takes time - be patient and consistent!**\n\nWant a workout program recommendation?",
            "category": "muscle_building"
        },
        {
            "instruction": "ازاي ابني عضل؟",
            "output": "**بناء العضلات محتاج 3 حاجات:**\n\n**1. التمرين (Progressive Overload)**\n- زود الوزن/العدات/السيتات تدريجياً\n- كل عضلة تتمرن مرتين في الأسبوع\n- 10-20 سيت لكل عضلة أسبوعياً\n\n**2. الأكل (Caloric Surplus)**\n- كل 200-500 سعرة زيادة عن احتياجك\n- بروتين: 1.6-2.2 جرام لكل كيلو\n- متعملش dirty bulk\n\n**3. الراحة (Recovery)**\n- نام 7-9 ساعات\n- أيام راحة مهمة\n\n**الوقت المتوقع:**\n- مبتدئ: نص كيلو لكيلو عضل في الشهر\n- متوسط: ربع لنص كيلو\n- متقدم: أقل من ربع كيلو\n\n**محتاج وقت وصبر واستمرارية!**\n\nعايز برنامج تمارين؟",
            "category": "muscle_building_ar"
        },
        # Recovery
        {
            "instruction": "How important is sleep for fitness?",
            "output": "**Sleep is CRUCIAL for fitness - possibly the most underrated factor!**\n\n**What happens during sleep:**\n- Growth hormone released (muscle building)\n- Muscle repair and recovery\n- Nervous system recovery\n- Memory consolidation (skill learning)\n\n**Effects of poor sleep:**\n- Reduced muscle protein synthesis\n- Increased cortisol (stress hormone)\n- Worse workout performance\n- Increased hunger and cravings\n- Higher injury risk\n\n**Recommendations:**\n- 7-9 hours per night\n- Consistent sleep schedule\n- Dark, cool room\n- No screens 1 hour before bed\n- No caffeine after 2pm\n\n**Bad sleep can completely sabotage your training and diet!**\n\nHow many hours are you getting?",
            "category": "recovery"
        },
        {
            "instruction": "النوم مهم للتمرين؟",
            "output": "**النوم مهم جداً - أهم من المكملات!**\n\n**اللي بيحصل وانت نايم:**\n- هرمون النمو بيتفرز (بناء العضلات)\n- إصلاح العضلات\n- راحة الجهاز العصبي\n\n**لو مش بتنام كويس:**\n- بناء العضلات بيقل\n- الكورتيزول (هرمون التوتر) بيزيد\n- أداءك في التمرين بيبقى أسوأ\n- الجوع والكرافينجز بتزيد\n\n**نصايح:**\n- 7-9 ساعات كل ليلة\n- نام وصحى في نفس الوقت\n- أوضة مظلمة وباردة\n- من غير موبايل ساعة قبل النوم\n- من غير كافيين بعد الضهر\n\n**النوم الوحش ممكن يضيع مجهودك كله!**\n\nبتنام كام ساعة؟",
            "category": "recovery_ar"
        },
    ]

def main():
    """Generate all training data"""
    print("=" * 60)
    print("FORMA FITNESS - TRAINING DATA GENERATOR V2")
    print("=" * 60)

    all_data = []

    # Add guardrails
    all_data.extend(GUARDRAILS)
    print(f"Added {len(GUARDRAILS)} guardrail samples")

    # Add Forma identity
    all_data.extend(FORMA_IDENTITY)
    print(f"Added {len(FORMA_IDENTITY)} identity samples")

    # Add body composition
    all_data.extend(BODY_COMPOSITION)
    print(f"Added {len(BODY_COMPOSITION)} body composition samples")

    # Generate food Q&A
    food_qa = generate_food_qa()
    all_data.extend(food_qa)
    print(f"Added {len(food_qa)} food/nutrition samples")

    # Generate workout Q&A
    workout_qa = generate_workout_qa()
    all_data.extend(workout_qa)
    print(f"Added {len(workout_qa)} workout samples")

    # Generate supplement Q&A
    supplement_qa = generate_supplement_qa()
    all_data.extend(supplement_qa)
    print(f"Added {len(supplement_qa)} supplement samples")

    # Generate general fitness Q&A
    fitness_qa = generate_general_fitness_qa()
    all_data.extend(fitness_qa)
    print(f"Added {len(fitness_qa)} general fitness samples")

    print("=" * 60)
    print(f"TOTAL: {len(all_data)} training samples")
    print("=" * 60)

    # Save
    output_dir = os.path.dirname(os.path.dirname(__file__))
    output_path = os.path.join(output_dir, "training-data", "forma_v2_training.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    print(f"Saved to: {output_path}")

    # Also save the food database separately
    food_db_path = os.path.join(output_dir, "training-data", "egypt_food_database_v2.json")
    with open(food_db_path, "w", encoding="utf-8") as f:
        json.dump(EGYPTIAN_FOODS, f, ensure_ascii=False, indent=2)
    print(f"Food database saved to: {food_db_path}")

    return all_data

if __name__ == "__main__":
    main()
