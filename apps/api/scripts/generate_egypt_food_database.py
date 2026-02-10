"""
Generate comprehensive Egypt food & calorie database
Includes: Egyptian, fast food, restaurants, supermarkets, meal preps
"""

import json
import os

# ============================================
# TRADITIONAL EGYPTIAN FOODS
# ============================================
egyptian_foods = [
    # Breakfast
    {"name_en": "Foul Medames", "name_ar": "فول مدمس", "franco": "foul", "calories": 180, "protein": 10, "carbs": 28, "fat": 3, "serving": "200g bowl", "category": "egyptian_breakfast"},
    {"name_en": "Foul with Tahini", "name_ar": "فول بالطحينة", "franco": "foul bel ta7ina", "calories": 280, "protein": 12, "carbs": 30, "fat": 14, "serving": "200g bowl", "category": "egyptian_breakfast"},
    {"name_en": "Foul with Eggs", "name_ar": "فول بالبيض", "franco": "foul bel beid", "calories": 320, "protein": 18, "carbs": 28, "fat": 16, "serving": "250g plate", "category": "egyptian_breakfast"},
    {"name_en": "Ta'meya (Falafel)", "name_ar": "طعمية", "franco": "ta3meya", "calories": 60, "protein": 3, "carbs": 5, "fat": 3, "serving": "1 piece", "category": "egyptian_breakfast"},
    {"name_en": "Falafel Sandwich", "name_ar": "ساندوتش طعمية", "franco": "sandwich ta3meya", "calories": 380, "protein": 12, "carbs": 45, "fat": 18, "serving": "1 sandwich", "category": "egyptian_breakfast"},
    {"name_en": "Eggs with Basterma", "name_ar": "بيض بالبسطرمة", "franco": "beid bel basterma", "calories": 350, "protein": 22, "carbs": 2, "fat": 28, "serving": "2 eggs + 50g basterma", "category": "egyptian_breakfast"},
    {"name_en": "Shakshuka", "name_ar": "شكشوكة", "franco": "shakshuka", "calories": 280, "protein": 14, "carbs": 15, "fat": 18, "serving": "1 portion", "category": "egyptian_breakfast"},
    {"name_en": "Feteer Meshaltet", "name_ar": "فطير مشلتت", "franco": "feteer", "calories": 450, "protein": 8, "carbs": 55, "fat": 22, "serving": "1 slice", "category": "egyptian_breakfast"},
    {"name_en": "Feteer with Honey", "name_ar": "فطير بالعسل", "franco": "feteer bel 3asal", "calories": 520, "protein": 8, "carbs": 70, "fat": 24, "serving": "1 slice", "category": "egyptian_breakfast"},
    {"name_en": "Baladi Bread", "name_ar": "عيش بلدي", "franco": "3eish baladi", "calories": 150, "protein": 5, "carbs": 30, "fat": 1, "serving": "1 loaf", "category": "bread"},
    {"name_en": "Shami Bread", "name_ar": "عيش شامي", "franco": "3eish shami", "calories": 180, "protein": 6, "carbs": 35, "fat": 2, "serving": "1 loaf", "category": "bread"},
    {"name_en": "Fino Bread", "name_ar": "عيش فينو", "franco": "3eish fino", "calories": 200, "protein": 6, "carbs": 38, "fat": 3, "serving": "1 roll", "category": "bread"},

    # Lunch/Dinner Mains
    {"name_en": "Koshary", "name_ar": "كشري", "franco": "koshary", "calories": 380, "protein": 12, "carbs": 72, "fat": 6, "serving": "medium bowl", "category": "egyptian_main"},
    {"name_en": "Koshary Large", "name_ar": "كشري كبير", "franco": "koshary kebeer", "calories": 550, "protein": 18, "carbs": 105, "fat": 9, "serving": "large bowl", "category": "egyptian_main"},
    {"name_en": "Molokheya with Chicken", "name_ar": "ملوخية بالفراخ", "franco": "molokheya bel ferakh", "calories": 320, "protein": 28, "carbs": 18, "fat": 16, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Molokheya with Rabbit", "name_ar": "ملوخية بالأرانب", "franco": "molokheya bel araneb", "calories": 280, "protein": 32, "carbs": 15, "fat": 12, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Mahshi Wara2 3enab", "name_ar": "محشي ورق عنب", "franco": "ma7shi wara2 3enab", "calories": 45, "protein": 1, "carbs": 8, "fat": 1, "serving": "1 piece", "category": "egyptian_main"},
    {"name_en": "Mahshi Koronb", "name_ar": "محشي كرنب", "franco": "ma7shi koronb", "calories": 55, "protein": 2, "carbs": 10, "fat": 1, "serving": "1 piece", "category": "egyptian_main"},
    {"name_en": "Mahshi Felfel", "name_ar": "محشي فلفل", "franco": "ma7shi felfel", "calories": 120, "protein": 4, "carbs": 22, "fat": 2, "serving": "1 pepper", "category": "egyptian_main"},
    {"name_en": "Mahshi Betingan", "name_ar": "محشي باذنجان", "franco": "ma7shi betingan", "calories": 150, "protein": 5, "carbs": 25, "fat": 4, "serving": "1 eggplant", "category": "egyptian_main"},
    {"name_en": "Fattah", "name_ar": "فتة", "franco": "fatta", "calories": 650, "protein": 35, "carbs": 55, "fat": 32, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Fatta with Meat", "name_ar": "فتة باللحمة", "franco": "fatta bel la7ma", "calories": 720, "protein": 40, "carbs": 55, "fat": 38, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Moussaka", "name_ar": "مسقعة", "franco": "msa23a", "calories": 280, "protein": 8, "carbs": 25, "fat": 18, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Bamia with Meat", "name_ar": "بامية باللحمة", "franco": "bamya bel la7ma", "calories": 320, "protein": 22, "carbs": 18, "fat": 20, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Fasolia", "name_ar": "فاصوليا", "franco": "fasolia", "calories": 280, "protein": 18, "carbs": 30, "fat": 12, "serving": "1 plate", "category": "egyptian_main"},
    {"name_en": "Bissara", "name_ar": "بصارة", "franco": "besara", "calories": 180, "protein": 10, "carbs": 25, "fat": 5, "serving": "1 bowl", "category": "egyptian_main"},
    {"name_en": "Mombar", "name_ar": "ممبار", "franco": "mombar", "calories": 180, "protein": 8, "carbs": 22, "fat": 7, "serving": "3 pieces", "category": "egyptian_main"},
    {"name_en": "Kawarea", "name_ar": "كوارع", "franco": "kawar3", "calories": 350, "protein": 30, "carbs": 5, "fat": 24, "serving": "1 portion", "category": "egyptian_main"},
    {"name_en": "Hawawshi", "name_ar": "حواوشي", "franco": "7awashy", "calories": 480, "protein": 25, "carbs": 40, "fat": 26, "serving": "1 sandwich", "category": "egyptian_main"},
    {"name_en": "Kofta", "name_ar": "كفتة", "franco": "kofta", "calories": 280, "protein": 22, "carbs": 5, "fat": 20, "serving": "4 pieces", "category": "egyptian_grilled"},
    {"name_en": "Kebab", "name_ar": "كباب", "franco": "kebab", "calories": 320, "protein": 28, "carbs": 2, "fat": 22, "serving": "4 pieces", "category": "egyptian_grilled"},
    {"name_en": "Grilled Chicken", "name_ar": "فراخ مشوية", "franco": "ferakh mashweya", "calories": 250, "protein": 35, "carbs": 0, "fat": 12, "serving": "quarter chicken", "category": "egyptian_grilled"},
    {"name_en": "Grilled Pigeon", "name_ar": "حمام مشوي", "franco": "7amam mashwy", "calories": 280, "protein": 30, "carbs": 0, "fat": 18, "serving": "1 pigeon", "category": "egyptian_grilled"},
    {"name_en": "Stuffed Pigeon", "name_ar": "حمام محشي", "franco": "7amam ma7shy", "calories": 380, "protein": 28, "carbs": 25, "fat": 20, "serving": "1 pigeon", "category": "egyptian_main"},
    {"name_en": "Shawerma Chicken", "name_ar": "شاورما فراخ", "franco": "shawerma ferakh", "calories": 450, "protein": 28, "carbs": 42, "fat": 20, "serving": "1 sandwich", "category": "egyptian_street"},
    {"name_en": "Shawerma Meat", "name_ar": "شاورما لحمة", "franco": "shawerma la7ma", "calories": 520, "protein": 30, "carbs": 42, "fat": 28, "serving": "1 sandwich", "category": "egyptian_street"},
    {"name_en": "Liver Alexandria", "name_ar": "كبدة اسكندراني", "franco": "kebda eskandarany", "calories": 380, "protein": 25, "carbs": 35, "fat": 18, "serving": "1 sandwich", "category": "egyptian_street"},
    {"name_en": "Sogo2", "name_ar": "سجق", "franco": "sogo2", "calories": 320, "protein": 18, "carbs": 8, "fat": 26, "serving": "4 pieces", "category": "egyptian_grilled"},

    # Rice & Sides
    {"name_en": "Egyptian Rice", "name_ar": "أرز مصري", "franco": "roz masry", "calories": 200, "protein": 4, "carbs": 44, "fat": 1, "serving": "1 cup cooked", "category": "sides"},
    {"name_en": "Rice with Vermicelli", "name_ar": "أرز بالشعرية", "franco": "roz bel sha3reya", "calories": 250, "protein": 5, "carbs": 50, "fat": 4, "serving": "1 cup", "category": "sides"},
    {"name_en": "Fried Rice with Liver", "name_ar": "أرز بالكبد", "franco": "roz bel kebda", "calories": 380, "protein": 18, "carbs": 48, "fat": 14, "serving": "1 plate", "category": "sides"},
    {"name_en": "Macarona Bechamel", "name_ar": "مكرونة بشاميل", "franco": "makarona bashamel", "calories": 450, "protein": 18, "carbs": 45, "fat": 24, "serving": "1 piece", "category": "egyptian_main"},
    {"name_en": "Egyptian Pasta", "name_ar": "مكرونة مصري", "franco": "makarona masry", "calories": 350, "protein": 12, "carbs": 55, "fat": 10, "serving": "1 plate", "category": "sides"},

    # Soups
    {"name_en": "Lentil Soup", "name_ar": "شوربة عدس", "franco": "shorbet 3ads", "calories": 180, "protein": 12, "carbs": 28, "fat": 3, "serving": "1 bowl", "category": "soup"},
    {"name_en": "Chicken Soup", "name_ar": "شوربة فراخ", "franco": "shorbet ferakh", "calories": 120, "protein": 10, "carbs": 8, "fat": 5, "serving": "1 bowl", "category": "soup"},
    {"name_en": "Orzo Soup", "name_ar": "شوربة لسان عصفور", "franco": "shorbet lesan 3asfour", "calories": 150, "protein": 6, "carbs": 25, "fat": 3, "serving": "1 bowl", "category": "soup"},

    # Salads
    {"name_en": "Tahini Salad", "name_ar": "سلطة طحينة", "franco": "salata ta7ina", "calories": 180, "protein": 5, "carbs": 8, "fat": 15, "serving": "100g", "category": "salad"},
    {"name_en": "Baba Ghanoush", "name_ar": "بابا غنوج", "franco": "baba ghanoug", "calories": 120, "protein": 3, "carbs": 10, "fat": 8, "serving": "100g", "category": "salad"},
    {"name_en": "Baladi Salad", "name_ar": "سلطة بلدي", "franco": "salata balady", "calories": 80, "protein": 2, "carbs": 12, "fat": 3, "serving": "1 bowl", "category": "salad"},
    {"name_en": "Pickles (Torshi)", "name_ar": "طرشي", "franco": "torshi", "calories": 20, "protein": 1, "carbs": 4, "fat": 0, "serving": "50g", "category": "sides"},

    # Desserts
    {"name_en": "Basbousa", "name_ar": "بسبوسة", "franco": "basbousa", "calories": 280, "protein": 4, "carbs": 45, "fat": 10, "serving": "1 piece", "category": "dessert"},
    {"name_en": "Konafa", "name_ar": "كنافة", "franco": "konafa", "calories": 350, "protein": 6, "carbs": 50, "fat": 15, "serving": "1 piece", "category": "dessert"},
    {"name_en": "Konafa with Cream", "name_ar": "كنافة بالقشطة", "franco": "konafa bel eshta", "calories": 420, "protein": 8, "carbs": 55, "fat": 20, "serving": "1 piece", "category": "dessert"},
    {"name_en": "Om Ali", "name_ar": "أم علي", "franco": "om 3ali", "calories": 450, "protein": 10, "carbs": 55, "fat": 22, "serving": "1 bowl", "category": "dessert"},
    {"name_en": "Roz Bel Laban", "name_ar": "أرز باللبن", "franco": "roz bel laban", "calories": 280, "protein": 8, "carbs": 45, "fat": 8, "serving": "1 bowl", "category": "dessert"},
    {"name_en": "Mehalabeya", "name_ar": "مهلبية", "franco": "me7alabeya", "calories": 220, "protein": 6, "carbs": 35, "fat": 7, "serving": "1 bowl", "category": "dessert"},
    {"name_en": "Balah El Sham", "name_ar": "بلح الشام", "franco": "bala7 el sham", "calories": 120, "protein": 2, "carbs": 18, "fat": 5, "serving": "3 pieces", "category": "dessert"},
    {"name_en": "Zalabia", "name_ar": "زلابية", "franco": "zalabya", "calories": 180, "protein": 3, "carbs": 28, "fat": 7, "serving": "5 pieces", "category": "dessert"},
    {"name_en": "Atayef", "name_ar": "قطايف", "franco": "atayef", "calories": 150, "protein": 4, "carbs": 22, "fat": 6, "serving": "2 pieces", "category": "dessert"},
    {"name_en": "Halawa Tahinia", "name_ar": "حلاوة طحينية", "franco": "7alawa", "calories": 180, "protein": 5, "carbs": 20, "fat": 10, "serving": "40g", "category": "dessert"},

    # Drinks
    {"name_en": "Karkade (Hibiscus)", "name_ar": "كركديه", "franco": "karkade", "calories": 40, "protein": 0, "carbs": 10, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Sahlab", "name_ar": "سحلب", "franco": "sa7lab", "calories": 180, "protein": 6, "carbs": 30, "fat": 5, "serving": "1 cup", "category": "drinks"},
    {"name_en": "Qamar El Din", "name_ar": "قمر الدين", "franco": "2amar el deen", "calories": 120, "protein": 1, "carbs": 30, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Tamarind", "name_ar": "تمر هندي", "franco": "tamr hendy", "calories": 100, "protein": 1, "carbs": 25, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Sugarcane Juice", "name_ar": "عصير قصب", "franco": "3aseer 2asab", "calories": 180, "protein": 0, "carbs": 45, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Fresh Orange Juice", "name_ar": "عصير برتقال", "franco": "3aseer borto2an", "calories": 110, "protein": 2, "carbs": 26, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Mango Juice", "name_ar": "عصير مانجو", "franco": "3aseer manga", "calories": 150, "protein": 1, "carbs": 38, "fat": 0, "serving": "1 glass", "category": "drinks"},
    {"name_en": "Lemon with Mint", "name_ar": "ليمون بالنعناع", "franco": "lamoon bel na3na3", "calories": 60, "protein": 0, "carbs": 15, "fat": 0, "serving": "1 glass", "category": "drinks"},
]

# ============================================
# FAST FOOD CHAINS IN EGYPT
# ============================================
fast_food = [
    # McDonald's Egypt
    {"name_en": "McDonald's Big Mac", "name_ar": "بيج ماك", "franco": "big mac", "calories": 550, "protein": 25, "carbs": 45, "fat": 30, "serving": "1 burger", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's McChicken", "name_ar": "ماك تشيكن", "franco": "mac chicken", "calories": 400, "protein": 15, "carbs": 40, "fat": 22, "serving": "1 sandwich", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's Quarter Pounder", "name_ar": "كوارتر باوندر", "franco": "quarter pounder", "calories": 520, "protein": 30, "carbs": 40, "fat": 28, "serving": "1 burger", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's McArabia Chicken", "name_ar": "ماك ارابيا فراخ", "franco": "mac arabia ferakh", "calories": 550, "protein": 28, "carbs": 48, "fat": 28, "serving": "1 sandwich", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's McArabia Kofta", "name_ar": "ماك ارابيا كفتة", "franco": "mac arabia kofta", "calories": 620, "protein": 26, "carbs": 50, "fat": 35, "serving": "1 sandwich", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's Chicken Nuggets 6pc", "name_ar": "تشيكن ناجتس", "franco": "chicken nuggets", "calories": 280, "protein": 14, "carbs": 18, "fat": 18, "serving": "6 pieces", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's Medium Fries", "name_ar": "بطاطس وسط", "franco": "fries medium", "calories": 340, "protein": 4, "carbs": 44, "fat": 16, "serving": "medium", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's Large Fries", "name_ar": "بطاطس كبير", "franco": "fries kebeer", "calories": 490, "protein": 6, "carbs": 63, "fat": 23, "serving": "large", "category": "mcdonalds", "brand": "McDonald's"},
    {"name_en": "McDonald's McFlurry Oreo", "name_ar": "ماك فلوري اوريو", "franco": "mcflurry oreo", "calories": 340, "protein": 8, "carbs": 52, "fat": 12, "serving": "1 cup", "category": "mcdonalds", "brand": "McDonald's"},

    # KFC Egypt
    {"name_en": "KFC Original 2 Pieces", "name_ar": "قطعتين اوريجينال", "franco": "2 pieces original", "calories": 480, "protein": 36, "carbs": 16, "fat": 30, "serving": "2 pieces", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Zinger", "name_ar": "زنجر", "franco": "zinger", "calories": 520, "protein": 28, "carbs": 42, "fat": 28, "serving": "1 sandwich", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Twister", "name_ar": "تويستر", "franco": "twister", "calories": 480, "protein": 22, "carbs": 45, "fat": 24, "serving": "1 wrap", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Mighty Zinger", "name_ar": "مايتي زنجر", "franco": "mighty zinger", "calories": 680, "protein": 35, "carbs": 50, "fat": 38, "serving": "1 sandwich", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Strips 5pc", "name_ar": "ستربس", "franco": "strips", "calories": 420, "protein": 32, "carbs": 22, "fat": 24, "serving": "5 pieces", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Coleslaw", "name_ar": "كول سلو", "franco": "coleslaw", "calories": 150, "protein": 1, "carbs": 12, "fat": 11, "serving": "regular", "category": "kfc", "brand": "KFC"},
    {"name_en": "KFC Bucket 8 Pieces", "name_ar": "باكت ٨ قطع", "franco": "bucket 8", "calories": 1920, "protein": 144, "carbs": 64, "fat": 120, "serving": "8 pieces", "category": "kfc", "brand": "KFC"},

    # Hardee's Egypt
    {"name_en": "Hardee's Angus Thickburger", "name_ar": "انجوس ثيك برجر", "franco": "angus thickburger", "calories": 780, "protein": 42, "carbs": 52, "fat": 48, "serving": "1 burger", "category": "hardees", "brand": "Hardee's"},
    {"name_en": "Hardee's Mushroom Swiss", "name_ar": "مشروم سويس", "franco": "mushroom swiss", "calories": 720, "protein": 38, "carbs": 48, "fat": 45, "serving": "1 burger", "category": "hardees", "brand": "Hardee's"},
    {"name_en": "Hardee's Spicy Chicken", "name_ar": "سبايسي تشيكن", "franco": "spicy chicken", "calories": 480, "protein": 25, "carbs": 45, "fat": 24, "serving": "1 sandwich", "category": "hardees", "brand": "Hardee's"},
    {"name_en": "Hardee's Hand Breaded Tenders", "name_ar": "هاند بريدد تندرز", "franco": "tenders", "calories": 380, "protein": 28, "carbs": 22, "fat": 22, "serving": "5 pieces", "category": "hardees", "brand": "Hardee's"},

    # Cook Door Egypt
    {"name_en": "Cook Door Chicken Burger", "name_ar": "تشيكن برجر كوك دور", "franco": "cook door chicken", "calories": 420, "protein": 22, "carbs": 40, "fat": 20, "serving": "1 burger", "category": "cookdoor", "brand": "Cook Door"},
    {"name_en": "Cook Door Beef Burger", "name_ar": "بيف برجر كوك دور", "franco": "cook door beef", "calories": 480, "protein": 26, "carbs": 38, "fat": 26, "serving": "1 burger", "category": "cookdoor", "brand": "Cook Door"},
    {"name_en": "Cook Door Chicken Pane", "name_ar": "تشيكن بانيه كوك دور", "franco": "cook door pane", "calories": 380, "protein": 24, "carbs": 35, "fat": 18, "serving": "1 sandwich", "category": "cookdoor", "brand": "Cook Door"},
    {"name_en": "Cook Door Chicken Shawerma", "name_ar": "شاورما فراخ كوك دور", "franco": "cook door shawerma", "calories": 450, "protein": 26, "carbs": 42, "fat": 22, "serving": "1 sandwich", "category": "cookdoor", "brand": "Cook Door"},

    # Pizza Hut Egypt
    {"name_en": "Pizza Hut Pepperoni Medium", "name_ar": "بيتزا بيبروني وسط", "franco": "pizza pepperoni medium", "calories": 280, "protein": 12, "carbs": 32, "fat": 12, "serving": "1 slice", "category": "pizzahut", "brand": "Pizza Hut"},
    {"name_en": "Pizza Hut Supreme Medium", "name_ar": "بيتزا سوبريم وسط", "franco": "pizza supreme", "calories": 300, "protein": 14, "carbs": 34, "fat": 14, "serving": "1 slice", "category": "pizzahut", "brand": "Pizza Hut"},
    {"name_en": "Pizza Hut Cheese Lovers Medium", "name_ar": "بيتزا تشيز لوفرز", "franco": "cheese lovers", "calories": 320, "protein": 15, "carbs": 32, "fat": 16, "serving": "1 slice", "category": "pizzahut", "brand": "Pizza Hut"},
    {"name_en": "Pizza Hut Chicken BBQ Medium", "name_ar": "بيتزا تشيكن باربيكيو", "franco": "chicken bbq pizza", "calories": 290, "protein": 14, "carbs": 33, "fat": 12, "serving": "1 slice", "category": "pizzahut", "brand": "Pizza Hut"},

    # Subway Egypt
    {"name_en": "Subway Chicken Teriyaki 6 inch", "name_ar": "صب واي تشيكن ترياكي", "franco": "subway teriyaki", "calories": 370, "protein": 26, "carbs": 46, "fat": 8, "serving": "6 inch", "category": "subway", "brand": "Subway"},
    {"name_en": "Subway Turkey 6 inch", "name_ar": "صب واي تيركي", "franco": "subway turkey", "calories": 280, "protein": 18, "carbs": 42, "fat": 4, "serving": "6 inch", "category": "subway", "brand": "Subway"},
    {"name_en": "Subway BMT 6 inch", "name_ar": "صب واي بي ام تي", "franco": "subway bmt", "calories": 400, "protein": 22, "carbs": 44, "fat": 16, "serving": "6 inch", "category": "subway", "brand": "Subway"},
    {"name_en": "Subway Tuna 6 inch", "name_ar": "صب واي تونة", "franco": "subway tuna", "calories": 480, "protein": 20, "carbs": 44, "fat": 26, "serving": "6 inch", "category": "subway", "brand": "Subway"},
]

# ============================================
# HEALTHY MEAL PREP SERVICES IN EGYPT
# ============================================
meal_prep = [
    # Generic healthy meal examples (typical from FitBox, Daily Meals, etc.)
    {"name_en": "Grilled Chicken Breast with Rice", "name_ar": "صدور فراخ مشوية مع أرز", "franco": "grilled chicken breast meal", "calories": 420, "protein": 42, "carbs": 40, "fat": 8, "serving": "1 meal", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Salmon with Vegetables", "name_ar": "سلمون مع خضار", "franco": "salmon meal", "calories": 480, "protein": 38, "carbs": 25, "fat": 24, "serving": "1 meal", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Beef Steak with Sweet Potato", "name_ar": "ستيك لحمة مع بطاطا", "franco": "steak meal", "calories": 520, "protein": 45, "carbs": 35, "fat": 22, "serving": "1 meal", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Chicken Shawerma Bowl", "name_ar": "بول شاورما فراخ", "franco": "shawerma bowl", "calories": 450, "protein": 38, "carbs": 42, "fat": 14, "serving": "1 bowl", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Protein Pancakes", "name_ar": "بان كيك بروتين", "franco": "protein pancakes", "calories": 350, "protein": 28, "carbs": 38, "fat": 10, "serving": "3 pancakes", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Overnight Oats", "name_ar": "اوفرنايت اوتس", "franco": "overnight oats", "calories": 320, "protein": 15, "carbs": 48, "fat": 8, "serving": "1 jar", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Egg White Omelette", "name_ar": "اومليت بياض البيض", "franco": "egg white omelette", "calories": 180, "protein": 25, "carbs": 5, "fat": 6, "serving": "1 omelette", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Grilled Kofta with Salad", "name_ar": "كفتة مشوية مع سلطة", "franco": "kofta salad", "calories": 380, "protein": 32, "carbs": 15, "fat": 22, "serving": "1 meal", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Tuna Salad Bowl", "name_ar": "بول سلطة تونة", "franco": "tuna salad bowl", "calories": 320, "protein": 30, "carbs": 18, "fat": 15, "serving": "1 bowl", "category": "meal_prep", "brand": "Healthy Meal"},
    {"name_en": "Quinoa Chicken Bowl", "name_ar": "بول كينوا مع فراخ", "franco": "quinoa bowl", "calories": 450, "protein": 35, "carbs": 45, "fat": 12, "serving": "1 bowl", "category": "meal_prep", "brand": "Healthy Meal"},
]

# ============================================
# SUPERMARKET PRODUCTS IN EGYPT
# ============================================
supermarket = [
    # Dairy
    {"name_en": "Juhayna Full Cream Milk", "name_ar": "لبن جهينة كامل الدسم", "franco": "laban juhayna", "calories": 150, "protein": 8, "carbs": 12, "fat": 8, "serving": "250ml", "category": "dairy", "brand": "Juhayna"},
    {"name_en": "Juhayna Skimmed Milk", "name_ar": "لبن جهينة خالي الدسم", "franco": "laban juhayna skimmed", "calories": 80, "protein": 8, "carbs": 12, "fat": 0, "serving": "250ml", "category": "dairy", "brand": "Juhayna"},
    {"name_en": "Activia Yogurt Plain", "name_ar": "اكتيفيا زبادي", "franco": "activia", "calories": 120, "protein": 6, "carbs": 15, "fat": 4, "serving": "150g", "category": "dairy", "brand": "Danone"},
    {"name_en": "Labanita Yogurt", "name_ar": "لبنيتا", "franco": "labanita", "calories": 100, "protein": 5, "carbs": 12, "fat": 4, "serving": "150g", "category": "dairy", "brand": "Juhayna"},
    {"name_en": "Domty White Cheese", "name_ar": "جبنة دومتي بيضاء", "franco": "gebna domty", "calories": 280, "protein": 18, "carbs": 2, "fat": 22, "serving": "100g", "category": "dairy", "brand": "Domty"},
    {"name_en": "Domty Feta Cheese", "name_ar": "جبنة فيتا دومتي", "franco": "feta domty", "calories": 260, "protein": 14, "carbs": 4, "fat": 21, "serving": "100g", "category": "dairy", "brand": "Domty"},
    {"name_en": "President Cheese Triangle", "name_ar": "جبنة بريزيدون مثلثات", "franco": "president cheese", "calories": 50, "protein": 2, "carbs": 1, "fat": 4, "serving": "1 triangle", "category": "dairy", "brand": "President"},
    {"name_en": "Kiri Cheese", "name_ar": "جبنة كيري", "franco": "kiri", "calories": 55, "protein": 2, "carbs": 1, "fat": 5, "serving": "1 piece", "category": "dairy", "brand": "Kiri"},
    {"name_en": "Labneh", "name_ar": "لبنة", "franco": "labneh", "calories": 180, "protein": 8, "carbs": 4, "fat": 15, "serving": "100g", "category": "dairy", "brand": "Generic"},

    # Protein Sources
    {"name_en": "Canned Tuna in Water", "name_ar": "تونة في ماء", "franco": "tuna", "calories": 100, "protein": 22, "carbs": 0, "fat": 1, "serving": "100g", "category": "protein", "brand": "Generic"},
    {"name_en": "Canned Tuna in Oil", "name_ar": "تونة في زيت", "franco": "tuna bel zeit", "calories": 200, "protein": 22, "carbs": 0, "fat": 12, "serving": "100g", "category": "protein", "brand": "Generic"},
    {"name_en": "Chicken Breast Raw", "name_ar": "صدور فراخ", "franco": "sodor ferakh", "calories": 165, "protein": 31, "carbs": 0, "fat": 4, "serving": "100g raw", "category": "protein", "brand": "Generic"},
    {"name_en": "Ground Beef", "name_ar": "لحمة مفرومة", "franco": "la7ma mafroma", "calories": 250, "protein": 26, "carbs": 0, "fat": 17, "serving": "100g", "category": "protein", "brand": "Generic"},
    {"name_en": "Eggs Large", "name_ar": "بيض", "franco": "beid", "calories": 70, "protein": 6, "carbs": 1, "fat": 5, "serving": "1 egg", "category": "protein", "brand": "Generic"},
    {"name_en": "Egg Whites", "name_ar": "بياض البيض", "franco": "bayad el beid", "calories": 17, "protein": 4, "carbs": 0, "fat": 0, "serving": "1 egg white", "category": "protein", "brand": "Generic"},

    # Snacks
    {"name_en": "Chipsy Cheese", "name_ar": "شيبسي جبنة", "franco": "chipsy gebna", "calories": 160, "protein": 2, "carbs": 15, "fat": 10, "serving": "30g bag", "category": "snacks", "brand": "Chipsy"},
    {"name_en": "Tiger Biscuits", "name_ar": "بسكويت تايجر", "franco": "tiger biscuit", "calories": 120, "protein": 2, "carbs": 18, "fat": 5, "serving": "4 biscuits", "category": "snacks", "brand": "Tiger"},
    {"name_en": "Molto Croissant", "name_ar": "مولتو كرواسون", "franco": "molto", "calories": 180, "protein": 3, "carbs": 22, "fat": 9, "serving": "1 croissant", "category": "snacks", "brand": "Molto"},
    {"name_en": "Corona Chocolate", "name_ar": "شوكولاتة كورونا", "franco": "corona chocolate", "calories": 280, "protein": 4, "carbs": 32, "fat": 16, "serving": "50g bar", "category": "snacks", "brand": "Corona"},
    {"name_en": "Galaxy Chocolate", "name_ar": "شوكولاتة جالاكسي", "franco": "galaxy", "calories": 270, "protein": 4, "carbs": 30, "fat": 15, "serving": "50g bar", "category": "snacks", "brand": "Galaxy"},

    # Breakfast Cereals
    {"name_en": "Nestle Fitness", "name_ar": "نستله فيتنس", "franco": "fitness cereal", "calories": 150, "protein": 4, "carbs": 30, "fat": 2, "serving": "40g", "category": "breakfast", "brand": "Nestle"},
    {"name_en": "Corn Flakes", "name_ar": "كورن فليكس", "franco": "corn flakes", "calories": 140, "protein": 3, "carbs": 32, "fat": 0, "serving": "40g", "category": "breakfast", "brand": "Generic"},
    {"name_en": "Oats Quaker", "name_ar": "شوفان كويكر", "franco": "oats", "calories": 150, "protein": 5, "carbs": 27, "fat": 3, "serving": "40g dry", "category": "breakfast", "brand": "Quaker"},

    # Beverages
    {"name_en": "Pepsi Can", "name_ar": "بيبسي", "franco": "pepsi", "calories": 150, "protein": 0, "carbs": 39, "fat": 0, "serving": "330ml can", "category": "beverages", "brand": "Pepsi"},
    {"name_en": "Coca Cola Can", "name_ar": "كوكاكولا", "franco": "coca cola", "calories": 140, "protein": 0, "carbs": 35, "fat": 0, "serving": "330ml can", "category": "beverages", "brand": "Coca Cola"},
    {"name_en": "Pepsi Diet", "name_ar": "بيبسي دايت", "franco": "pepsi diet", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "serving": "330ml can", "category": "beverages", "brand": "Pepsi"},
    {"name_en": "Nescafe 3in1", "name_ar": "نسكافيه", "franco": "nescafe", "calories": 80, "protein": 1, "carbs": 14, "fat": 2, "serving": "1 sachet", "category": "beverages", "brand": "Nescafe"},
    {"name_en": "Red Bull", "name_ar": "ريد بول", "franco": "red bull", "calories": 110, "protein": 0, "carbs": 27, "fat": 0, "serving": "250ml can", "category": "beverages", "brand": "Red Bull"},
]

# ============================================
# CAFES IN EGYPT
# ============================================
cafes = [
    # Cilantro
    {"name_en": "Cilantro Latte", "name_ar": "لاتيه سيلانترو", "franco": "cilantro latte", "calories": 180, "protein": 6, "carbs": 18, "fat": 9, "serving": "regular", "category": "coffee", "brand": "Cilantro"},
    {"name_en": "Cilantro Cappuccino", "name_ar": "كابتشينو سيلانترو", "franco": "cilantro cappuccino", "calories": 150, "protein": 6, "carbs": 14, "fat": 8, "serving": "regular", "category": "coffee", "brand": "Cilantro"},
    {"name_en": "Cilantro Chocolate Croissant", "name_ar": "كرواسون شوكولاتة", "franco": "chocolate croissant", "calories": 320, "protein": 5, "carbs": 38, "fat": 17, "serving": "1 piece", "category": "bakery", "brand": "Cilantro"},
    {"name_en": "Cilantro Chicken Panini", "name_ar": "باني تشيكن", "franco": "chicken panini", "calories": 420, "protein": 24, "carbs": 45, "fat": 18, "serving": "1 sandwich", "category": "food", "brand": "Cilantro"},

    # Costa Coffee
    {"name_en": "Costa Latte", "name_ar": "كوستا لاتيه", "franco": "costa latte", "calories": 200, "protein": 8, "carbs": 20, "fat": 10, "serving": "medium", "category": "coffee", "brand": "Costa"},
    {"name_en": "Costa Mocha", "name_ar": "كوستا موكا", "franco": "costa mocha", "calories": 280, "protein": 8, "carbs": 35, "fat": 12, "serving": "medium", "category": "coffee", "brand": "Costa"},
    {"name_en": "Costa Iced Coffee", "name_ar": "كوستا ايس كوفي", "franco": "iced coffee", "calories": 150, "protein": 4, "carbs": 22, "fat": 5, "serving": "medium", "category": "coffee", "brand": "Costa"},

    # Starbucks Egypt
    {"name_en": "Starbucks Caramel Frappuccino", "name_ar": "ستاربكس كراميل فرابتشينو", "franco": "starbucks frappuccino", "calories": 380, "protein": 5, "carbs": 58, "fat": 14, "serving": "grande", "category": "coffee", "brand": "Starbucks"},
    {"name_en": "Starbucks Americano", "name_ar": "ستاربكس امريكانو", "franco": "starbucks americano", "calories": 15, "protein": 1, "carbs": 2, "fat": 0, "serving": "grande", "category": "coffee", "brand": "Starbucks"},
    {"name_en": "Starbucks Vanilla Latte", "name_ar": "ستاربكس فانيلا لاتيه", "franco": "vanilla latte", "calories": 250, "protein": 8, "carbs": 35, "fat": 8, "serving": "grande", "category": "coffee", "brand": "Starbucks"},
]

# ============================================
# SUPPLEMENTS IN EGYPT
# ============================================
supplements = [
    {"name_en": "Whey Protein Scoop", "name_ar": "واي بروتين", "franco": "whey protein", "calories": 120, "protein": 24, "carbs": 3, "fat": 1, "serving": "1 scoop (30g)", "category": "supplements", "brand": "Generic"},
    {"name_en": "Mass Gainer Scoop", "name_ar": "ماس جينر", "franco": "mass gainer", "calories": 650, "protein": 30, "carbs": 120, "fat": 5, "serving": "1 serving", "category": "supplements", "brand": "Generic"},
    {"name_en": "Creatine", "name_ar": "كرياتين", "franco": "creatine", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "serving": "5g", "category": "supplements", "brand": "Generic"},
    {"name_en": "BCAA", "name_ar": "بي سي ايه ايه", "franco": "bcaa", "calories": 10, "protein": 3, "carbs": 0, "fat": 0, "serving": "1 scoop", "category": "supplements", "brand": "Generic"},
    {"name_en": "Pre-Workout", "name_ar": "بري ورك اوت", "franco": "pre workout", "calories": 15, "protein": 0, "carbs": 3, "fat": 0, "serving": "1 scoop", "category": "supplements", "brand": "Generic"},
    {"name_en": "Protein Bar", "name_ar": "بروتين بار", "franco": "protein bar", "calories": 200, "protein": 20, "carbs": 22, "fat": 8, "serving": "1 bar", "category": "supplements", "brand": "Generic"},
]

# ============================================
# COMBINE ALL DATA
# ============================================
all_foods = egyptian_foods + fast_food + meal_prep + supermarket + cafes + supplements

print(f"Total foods: {len(all_foods)}")
print(f"  Egyptian: {len(egyptian_foods)}")
print(f"  Fast Food: {len(fast_food)}")
print(f"  Meal Prep: {len(meal_prep)}")
print(f"  Supermarket: {len(supermarket)}")
print(f"  Cafes: {len(cafes)}")
print(f"  Supplements: {len(supplements)}")

# ============================================
# GENERATE TRAINING Q&A FROM FOOD DATA
# ============================================
training_data = []

for food in all_foods:
    name_en = food['name_en']
    name_ar = food.get('name_ar', '')
    franco = food.get('franco', '')
    calories = food['calories']
    protein = food['protein']
    carbs = food['carbs']
    fat = food['fat']
    serving = food['serving']
    brand = food.get('brand', '')

    # English Q&A
    training_data.append({
        "instruction": f"How many calories in {name_en}?",
        "output": f"{name_en} has {calories} calories per {serving}. It contains {protein}g protein, {carbs}g carbs, and {fat}g fat.",
        "category": "calorie_lookup"
    })

    training_data.append({
        "instruction": f"What are the macros for {name_en}?",
        "output": f"{name_en} ({serving}):\n- Calories: {calories}\n- Protein: {protein}g\n- Carbs: {carbs}g\n- Fat: {fat}g",
        "category": "macro_lookup"
    })

    # Arabic Q&A
    if name_ar:
        training_data.append({
            "instruction": f"كام سعرة في {name_ar}؟",
            "output": f"{name_ar} فيه {calories} سعرة حرارية لكل {serving}. البروتين {protein} جرام، الكاربز {carbs} جرام، والدهون {fat} جرام.",
            "category": "calorie_lookup_ar"
        })

    # Franco Arabic Q&A
    if franco:
        training_data.append({
            "instruction": f"kam calorie fel {franco}?",
            "output": f"{franco} has {calories} calories per {serving}. Protein: {protein}g, Carbs: {carbs}g, Fat: {fat}g.",
            "category": "calorie_lookup_franco"
        })

    # Fitness context Q&A
    if protein >= 20:
        training_data.append({
            "instruction": f"Is {name_en} good for muscle building?",
            "output": f"Yes! {name_en} is a good protein source with {protein}g protein per {serving}. That's great for muscle building. Total calories: {calories}.",
            "category": "fitness_advice"
        })

    if calories < 200 and protein > 10:
        training_data.append({
            "instruction": f"Is {name_en} good for cutting?",
            "output": f"Yes! {name_en} is great for cutting - only {calories} calories with {protein}g protein per {serving}. High protein, low calorie ratio is perfect for fat loss.",
            "category": "fitness_advice"
        })

    if calories > 500:
        training_data.append({
            "instruction": f"Is {name_en} good for bulking?",
            "output": f"Yes! {name_en} has {calories} calories per {serving}, which is good for bulking. It provides {protein}g protein, {carbs}g carbs, and {fat}g fat.",
            "category": "fitness_advice"
        })

# Add comparison Q&A
training_data.append({
    "instruction": "What's healthier, McDonald's or KFC?",
    "output": "Both are fast food, but here's a comparison:\n\n- KFC Original (2 pieces): 480 cal, 36g protein\n- McDonald's Big Mac: 550 cal, 25g protein\n\nKFC has more protein and less calories per serving. However, grilling at home is always healthier than either!",
    "category": "comparison"
})

training_data.append({
    "instruction": "What Egyptian food is highest in protein?",
    "output": "Top high-protein Egyptian foods:\n\n1. Grilled Chicken (ferakh mashweya): 35g protein per quarter\n2. Kebab: 28g protein per serving\n3. Fattah with Meat: 40g protein per plate\n4. Kofta: 22g protein per 4 pieces\n5. Grilled Liver (kebda): 25g protein per sandwich\n\nFor building muscle, pair these with rice or bread for complete nutrition!",
    "category": "egyptian_nutrition"
})

training_data.append({
    "instruction": "اكل ايه عشان اخس من الاكل المصري؟",
    "output": "أحسن اكل مصري للدايت:\n\n1. فول بدون زيت: 180 سعرة، 10 جرام بروتين\n2. فراخ مشوية: 250 سعرة، 35 جرام بروتين\n3. سلطة بلدي: 80 سعرة\n4. شوربة عدس: 180 سعرة، 12 جرام بروتين\n5. كفتة مشوية: 280 سعرة، 22 جرام بروتين\n\nابعد عن الفطير والكشري الكتير والحاجات المقلية!",
    "category": "egyptian_nutrition_ar"
})

training_data.append({
    "instruction": "Best pre-workout meal from Egyptian food?",
    "output": "Great Egyptian pre-workout options (eat 1-2 hours before training):\n\n1. Foul with Baladi Bread: 330 cal, complex carbs + protein\n2. Rice with Grilled Chicken: 450 cal, perfect carb/protein ratio\n3. Lentil Soup with Bread: 330 cal, easy to digest\n4. Foul with Eggs: 320 cal, sustained energy\n\nAvoid: Heavy fattah, fried foods, or large portions of koshary right before training.",
    "category": "egyptian_nutrition"
})

print(f"\nGenerated {len(training_data)} training Q&A pairs")

# ============================================
# SAVE FILES
# ============================================
base_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(base_dir, "training-data")

# Save food database
food_db_path = os.path.join(data_dir, "egypt_food_database.json")
with open(food_db_path, "w", encoding="utf-8") as f:
    json.dump(all_foods, f, ensure_ascii=False, indent=2)
print(f"Saved food database to: {food_db_path}")

# Save training data
training_path = os.path.join(data_dir, "egypt_nutrition_training.json")
with open(training_path, "w", encoding="utf-8") as f:
    json.dump(training_data, f, ensure_ascii=False, indent=2)
print(f"Saved training data to: {training_path}")

print("\n✅ Done! Now merge this with your existing training data.")
