"""
FitApp Egyptian Store Scraper
=============================
Scrapes product data from Egyptian supermarkets and supplement stores.

Usage:
    python egyptian_store_scraper.py --store carrefour --category dairy
    python egyptian_store_scraper.py --store all --category protein
    python egyptian_store_scraper.py --store supplements

Requirements:
    pip install requests beautifulsoup4 playwright
    playwright install chromium
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import os
import argparse
from datetime import datetime
from typing import List, Dict, Optional
import re

# ============================================================================
# CONFIGURATION
# ============================================================================

# Egyptian local brands for detection
EGYPTIAN_BRANDS = [
    # Dairy
    "juhayna", "lamar", "domty", "obour land", "dina farms", "greenland",
    "almarai", "beyti", "el-watania", "el watania", "ragab", "el rabie",
    # Snacks/Food
    "chipsy", "molto", "tiger", "corona", "bisco", "halwani", "afia",
    "giza seeds", "temmy's", "abu auf", "imtenan", "sekem",
    # Supplements (Egyptian distributors)
    "max muscle egypt", "iherb egypt", "protein house", "igym",
]

# Store configurations
STORES = {
    "carrefour": {
        "name": "Carrefour Egypt",
        "base_url": "https://www.carrefouregypt.com",
        "search_url": "https://www.carrefouregypt.com/mafegy/en/v4/search?keyword={query}",
        "api_url": "https://www.carrefouregypt.com/api/v1/search?keyword={query}&currentPage={page}",
        "uses_js": True,  # React site - needs browser or API
        "categories": {
            "dairy": ["yogurt", "milk", "cheese", "labneh"],
            "protein": ["chicken", "beef", "fish", "eggs", "tuna"],
            "grains": ["bread", "rice", "oats", "pasta"],
            "snacks": ["protein bar", "nuts", "seeds"],
        }
    },
    "breadfast": {
        "name": "Breadfast",
        "base_url": "https://www.breadfast.com",
        "search_url": "https://www.breadfast.com/en/search?q={query}",
        "uses_js": True,
        "categories": {
            "dairy": ["dairy", "yogurt", "milk"],
            "protein": ["meat", "chicken", "fish"],
            "produce": ["vegetables", "fruits"],
        }
    },
    "instashop": {
        "name": "InstaShop",
        "base_url": "https://www.instashop.com",
        "search_url": "https://www.instashop.com/en/egypt/cairo/search?q={query}",
        "uses_js": True,
        "categories": {
            "dairy": ["dairy"],
            "protein": ["meat", "poultry"],
            "grocery": ["grocery"],
        }
    },
    "supplements": {
        "name": "Egyptian Supplement Stores",
        "stores": [
            {
                "name": "Max Muscle Egypt",
                "url": "https://maxmuscle-eg.com",
                "search": "https://maxmuscle-eg.com/catalogsearch/result/?q={query}"
            },
            {
                "name": "iMuscle",
                "url": "https://imuscle-eg.com",
                "search": "https://imuscle-eg.com/catalogsearch/result/?q={query}"
            },
            {
                "name": "Protein House Egypt",
                "url": "https://proteinhouse.com.eg",
                "search": "https://proteinhouse.com.eg/search?q={query}"
            }
        ],
        "uses_js": False,  # Most are Magento/standard e-commerce
        "categories": {
            "whey": ["whey protein", "isolate", "concentrate"],
            "pre_workout": ["pre workout", "pre-workout", "c4"],
            "creatine": ["creatine", "monohydrate"],
            "vitamins": ["vitamin", "multivitamin", "omega"],
            "mass_gainer": ["mass gainer", "serious mass"],
        }
    }
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# ============================================================================
# SCRAPER CLASS
# ============================================================================

class EgyptianStoreScraper:
    def __init__(self, output_dir: str = None):
        self.output_dir = output_dir or os.path.join(
            os.path.dirname(__file__), '..', 'data', 'scraped'
        )
        os.makedirs(self.output_dir, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.all_products = []

    def is_egyptian_brand(self, product_name: str, brand: str = "") -> bool:
        """Check if product is from an Egyptian brand."""
        text = f"{product_name} {brand}".lower()
        return any(brand in text for brand in EGYPTIAN_BRANDS)

    def extract_price(self, price_text: str) -> float:
        """Extract numeric price from text like 'EGP 125.00' or '125 ج.م'"""
        if not price_text:
            return 0.0
        # Remove currency symbols and whitespace
        cleaned = re.sub(r'[^\d.,]', '', price_text)
        # Handle comma as decimal separator
        cleaned = cleaned.replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    def extract_weight(self, text: str) -> Optional[str]:
        """Extract weight/size from product name."""
        patterns = [
            r'(\d+)\s*(kg|g|gm|gram|ml|l|liter|oz|lb)',
            r'(\d+)\s*(كجم|جم|مل|لتر)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return f"{match.group(1)}{match.group(2)}"
        return None

    def scrape_with_requests(self, url: str) -> Optional[BeautifulSoup]:
        """Simple scrape using requests (for non-JS sites)."""
        try:
            # Random delay to avoid rate limiting
            time.sleep(random.uniform(1, 3))
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"  ❌ Request failed: {e}")
            return None

    def scrape_with_playwright(self, url: str) -> Optional[BeautifulSoup]:
        """Scrape JS-rendered sites using Playwright."""
        try:
            from playwright.sync_api import sync_playwright

            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.set_extra_http_headers(HEADERS)

                print(f"  🌐 Loading page with browser...")
                page.goto(url, wait_until='networkidle', timeout=60000)

                # Wait for products to load
                time.sleep(3)

                # Scroll to load lazy content
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)

                html = page.content()
                browser.close()

                return BeautifulSoup(html, 'html.parser')
        except ImportError:
            print("  ⚠️ Playwright not installed. Run: pip install playwright && playwright install")
            return None
        except Exception as e:
            print(f"  ❌ Browser scrape failed: {e}")
            return None

    def parse_generic_product(self, card, store_name: str, category: str) -> Optional[Dict]:
        """Parse product from generic e-commerce card structure."""
        try:
            # Try multiple common selectors
            title_selectors = [
                'h2', 'h3', '.product-name', '.product-title',
                '[data-testid="product-title"]', '.title', 'a.name'
            ]
            price_selectors = [
                '.price', '.product-price', '[data-testid="price"]',
                '.special-price', '.regular-price', 'span[class*="price"]'
            ]
            image_selectors = [
                'img', '.product-image img', '[data-testid="product-image"]'
            ]

            # Extract title
            title = None
            for sel in title_selectors:
                elem = card.select_one(sel)
                if elem and elem.get_text(strip=True):
                    title = elem.get_text(strip=True)
                    break

            if not title:
                return None

            # Extract price
            price = 0.0
            for sel in price_selectors:
                elem = card.select_one(sel)
                if elem:
                    price = self.extract_price(elem.get_text())
                    if price > 0:
                        break

            # Extract image
            image_url = ""
            for sel in image_selectors:
                elem = card.select_one(sel)
                if elem:
                    image_url = elem.get('src') or elem.get('data-src') or ""
                    if image_url:
                        break

            # Build product object
            return {
                "product_name": title,
                "product_name_ar": "",  # Would need Arabic page
                "brand": title.split()[0] if title else "",
                "category": category,
                "subcategory": "",
                "price_egp": price,
                "weight_size": self.extract_weight(title),
                "is_local_brand": self.is_egyptian_brand(title),
                "image_url": image_url,
                "store": store_name,
                "scraped_at": datetime.now().isoformat(),
            }

        except Exception as e:
            print(f"  ⚠️ Parse error: {e}")
            return None

    def scrape_supplement_store(self, store_config: Dict, query: str) -> List[Dict]:
        """Scrape a supplement store."""
        products = []
        url = store_config["search"].format(query=query.replace(" ", "+"))
        store_name = store_config["name"]

        print(f"  🔍 Searching {store_name} for '{query}'...")

        soup = self.scrape_with_requests(url)
        if not soup:
            return products

        # Common e-commerce selectors for Magento/WooCommerce
        card_selectors = [
            '.product-item', '.product-card', '.product',
            '[data-product]', '.item', 'li.product'
        ]

        cards = []
        for sel in card_selectors:
            cards = soup.select(sel)
            if cards:
                break

        print(f"  📦 Found {len(cards)} products")

        for card in cards[:20]:  # Limit per search
            product = self.parse_generic_product(card, store_name, "supplements")
            if product and product["product_name"]:
                products.append(product)

        return products

    def scrape_supermarket(self, store_key: str, category: str, queries: List[str]) -> List[Dict]:
        """Scrape a supermarket for specific category."""
        products = []
        store = STORES.get(store_key)
        if not store:
            print(f"❌ Unknown store: {store_key}")
            return products

        print(f"\n🏪 Scraping {store['name']} - {category}")

        for query in queries:
            url = store["search_url"].format(query=query.replace(" ", "+"))
            print(f"  🔍 Searching for '{query}'...")

            # Choose scraping method
            if store.get("uses_js"):
                soup = self.scrape_with_playwright(url)
            else:
                soup = self.scrape_with_requests(url)

            if not soup:
                continue

            # Try to find product cards
            card_selectors = [
                '[data-testid*="product"]', '.product-card', '.product-item',
                '[class*="ProductCard"]', '[class*="product"]', '.item'
            ]

            cards = []
            for sel in card_selectors:
                cards = soup.select(sel)
                if len(cards) > 0:
                    break

            if not cards:
                print(f"  ⚠️ No products found (selectors may need updating)")
                # Debug: save HTML for inspection
                debug_file = os.path.join(self.output_dir, f"debug_{store_key}_{query}.html")
                with open(debug_file, 'w', encoding='utf-8') as f:
                    f.write(str(soup)[:50000])
                print(f"  📝 Saved debug HTML to {debug_file}")
                continue

            print(f"  📦 Found {len(cards)} products")

            for card in cards[:30]:  # Limit per query
                product = self.parse_generic_product(card, store['name'], category)
                if product and product["product_name"]:
                    products.append(product)

            # Rate limiting
            time.sleep(random.uniform(2, 4))

        return products

    def scrape_all_supplements(self) -> List[Dict]:
        """Scrape all Egyptian supplement stores."""
        products = []
        store = STORES["supplements"]

        print("\n💪 Scraping Egyptian Supplement Stores")
        print("=" * 50)

        for shop in store["stores"]:
            for category, queries in store["categories"].items():
                for query in queries:
                    shop_products = self.scrape_supplement_store(shop, query)
                    for p in shop_products:
                        p["subcategory"] = category
                    products.extend(shop_products)

        return products

    def save_results(self, products: List[Dict], filename: str = None):
        """Save scraped products to JSON."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"products_{timestamp}.json"

        filepath = os.path.join(self.output_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({
                "scraped_at": datetime.now().isoformat(),
                "total_products": len(products),
                "products": products
            }, f, ensure_ascii=False, indent=2)

        print(f"\n✅ Saved {len(products)} products to {filepath}")
        return filepath

    def merge_with_existing(self, new_products: List[Dict], existing_file: str = "master_products.json"):
        """Merge new products with existing database, avoiding duplicates."""
        filepath = os.path.join(self.output_dir, existing_file)

        existing = {"products": []}
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                existing = json.load(f)

        # Create set of existing product signatures
        existing_sigs = set()
        for p in existing.get("products", []):
            sig = f"{p.get('product_name', '')}|{p.get('store', '')}".lower()
            existing_sigs.add(sig)

        # Add new unique products
        added = 0
        for product in new_products:
            sig = f"{product.get('product_name', '')}|{product.get('store', '')}".lower()
            if sig not in existing_sigs:
                existing["products"].append(product)
                existing_sigs.add(sig)
                added += 1

        existing["last_updated"] = datetime.now().isoformat()
        existing["total_products"] = len(existing["products"])

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)

        print(f"📊 Added {added} new products. Total: {existing['total_products']}")
        return filepath


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Scrape Egyptian store products')
    parser.add_argument('--store', default='supplements',
                        choices=['carrefour', 'breadfast', 'instashop', 'supplements', 'all'],
                        help='Store to scrape')
    parser.add_argument('--category', default='all',
                        help='Category to scrape (dairy, protein, grains, etc.)')
    parser.add_argument('--query', default=None,
                        help='Custom search query')
    parser.add_argument('--output', default=None,
                        help='Output filename')

    args = parser.parse_args()

    scraper = EgyptianStoreScraper()
    products = []

    print("=" * 60)
    print("🇪🇬 FitApp Egyptian Store Scraper")
    print("=" * 60)

    if args.store == 'supplements' or args.store == 'all':
        products.extend(scraper.scrape_all_supplements())

    if args.store in ['carrefour', 'breadfast', 'instashop', 'all']:
        stores_to_scrape = [args.store] if args.store != 'all' else ['carrefour', 'breadfast', 'instashop']

        for store_key in stores_to_scrape:
            store = STORES.get(store_key)
            if not store:
                continue

            if args.query:
                # Custom query
                products.extend(scraper.scrape_supermarket(
                    store_key, args.category, [args.query]
                ))
            elif args.category != 'all' and args.category in store.get('categories', {}):
                # Specific category
                products.extend(scraper.scrape_supermarket(
                    store_key, args.category, store['categories'][args.category]
                ))
            else:
                # All categories
                for cat, queries in store.get('categories', {}).items():
                    products.extend(scraper.scrape_supermarket(store_key, cat, queries))

    if products:
        # Save timestamped file
        scraper.save_results(products, args.output)
        # Merge with master database
        scraper.merge_with_existing(products)
    else:
        print("\n⚠️ No products scraped. Check selectors or try different queries.")

if __name__ == "__main__":
    main()
