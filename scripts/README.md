# FitApp Scripts

## Egyptian Store Scraper

Scrapes product data from Egyptian supermarkets and supplement stores.

### Setup

```bash
cd scripts
pip install -r requirements.txt

# For JS-rendered sites (Carrefour, Breadfast, etc.)
playwright install chromium
```

### Usage

```bash
# Scrape all Egyptian supplement stores
python egyptian_store_scraper.py --store supplements

# Scrape specific supermarket category
python egyptian_store_scraper.py --store carrefour --category dairy

# Custom search query
python egyptian_store_scraper.py --store carrefour --query "greek yogurt"

# Scrape everything (takes a while)
python egyptian_store_scraper.py --store all
```

### Output

- Results saved to `../data/scraped/`
- Each run creates timestamped JSON file
- Products merged into `master_products.json` (no duplicates)

### Supported Stores

**Supermarkets:**
- Carrefour Egypt
- Breadfast
- InstaShop

**Supplement Stores:**
- Max Muscle Egypt
- iMuscle Egypt
- Protein House Egypt

### Notes

- Selectors may need updating if websites change
- Debug HTML saved when products aren't found
- Rate limited to avoid blocking (2-4 sec between requests)
- Use `--store supplements` first as it's most reliable
