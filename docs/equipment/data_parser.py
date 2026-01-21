import re
import json
import os

def parse_markdown_table(file_path):
    """
    Parses markdown tables from a file and converts them to a list of dictionaries.
    Assumes standard markdown table format:
    | Header 1 | Header 2 |
    | --- | --- |
    | Val 1 | Val 2 |
    """
    data = []
    current_category = "General"
    headers = []
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        
        # Detect Category Headers (## Header)
        if line.startswith('## '):
            current_category = line.replace('## ', '').strip()
            # Reset headers when category changes, as tables might differ
            headers = []
            continue
            
        # Detect Table Headers
        if line.startswith('|') and '---' not in line and not headers:
            # Clean headers: remove bold, whitespace
            headers = [h.strip().replace('*', '') for h in line.split('|') if h.strip()]
            continue
            
        # Detect Separator line
        if line.startswith('|') and '---' in line:
            continue
            
        # Detect Data Rows
        if line.startswith('|') and headers:
            # Split by pipe, but keep empty strings to maintain column alignment if data is missing
            # We slice [1:-1] to remove the empty strings from the leading and trailing pipes
            raw_values = line.split('|')[1:-1]
            values = [v.strip().replace('*', '') for v in raw_values]
            
            # Ensure row matches header length (basic validation)
            if len(values) == len(headers):
                entry = {headers[i]: values[i] for i in range(len(headers))}
                entry['Category'] = current_category
                data.append(entry)
            else:
                # Fallback for messy tables: try to map what we have
                if len(values) > 0:
                    entry = {'Category': current_category}
                    for i, val in enumerate(values):
                        if i < len(headers):
                            entry[headers[i]] = val
                    data.append(entry)
        
        # Reset headers if we hit an empty line (end of table)
        if line == "":
            headers = []

    return data

def main():
    # Use absolute path relative to this script file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define input files
    files_to_parse = [
        os.path.join(base_dir, 'egyptian-market-products-specific.md'),
        # Add other files here
    ]
    
    all_products = []
    
    for file_path in files_to_parse:
        print(f"Parsing {file_path}...")
        products = parse_markdown_table(file_path)
        all_products.extend(products)
        
    # Output to JSON
    # Save to a 'data' folder at the same level as 'docs' or inside 'docs'
    output_dir = os.path.join(base_dir, '..', 'data')
    output_path = os.path.join(output_dir, 'products_db.json')
    
    os.makedirs(output_dir, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully exported {len(all_products)} items to {output_path}")

if __name__ == "__main__":
    main()