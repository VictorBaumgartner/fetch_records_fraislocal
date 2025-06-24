import json
import os

def remove_duplicates_from_json(input_filepath, output_filepath):
    """
    Reads a JSON file containing a list of objects, removes duplicate objects,
    and writes the unique objects to a new JSON file.

    Duplicates are identified by stringifying the record after sorting its keys
    to ensure consistent representation.

    Args:
        input_filepath (str): The path to the input JSON file.
        output_filepath (str): The path to the output JSON file for unique records.
    """
    if not os.path.exists(input_filepath):
        print(f"Error: Input file not found at '{input_filepath}'")
        print("Please ensure the JSON file is in the same directory as this script, or provide the full path.")
        return

    try:
        with open(input_filepath, 'r', encoding='utf-8') as f:
            records = json.load(f)
            if not isinstance(records, list):
                print(f"Error: JSON content in '{input_filepath}' is not a list of records. The script expects a JSON array.")
                return

    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from '{input_filepath}'. Please ensure it's valid JSON. Error: {e}")
        return
    except Exception as e:
        print(f"An unexpected error occurred while reading '{input_filepath}': {e}")
        return

    unique_records = []
    seen_records = set()
    total_original_records = len(records)

    for record in records:
        # Create a stable string representation for deduplication
        # Sort keys to ensure the string is consistent regardless of original dictionary order
        record_str = json.dumps(record, sort_keys=True)
        if record_str not in seen_records:
            seen_records.add(record_str)
            unique_records.append(record)

    total_unique_records = len(unique_records)
    duplicates_removed = total_original_records - total_unique_records

    try:
        with open(output_filepath, 'w', encoding='utf-8') as f:
            json.dump(unique_records, f, indent=2, ensure_ascii=False)
        print(f"Successfully processed '{input_filepath}'.")
        print(f"Original records: {total_original_records}")
        print(f"Unique records: {total_unique_records}")
        print(f"Duplicates removed: {duplicates_removed}")
        print(f"Unique records saved to '{output_filepath}'")
    except Exception as e:
        print(f"Error saving unique records to '{output_filepath}': {e}")

# --- How to use this script ---
# 1. Save this code: Copy the entire block above and save it into a file named, for example, 'deduplicate_json.py'.
# 2. Place the script: Make sure 'deduplicate_json.py' is in the SAME directory as your 'all_fraisetlocal_records.json' file.
# 3. Run from terminal: Open your terminal or command prompt, navigate to that directory, and run:
#    python deduplicate_json.py

# Input and output filenames (you can change these if your file names are different)
input_json_file = 'all_fraisetlocal_records.json'
output_json_file = 'unique_fraisetlocal_records.json'

remove_duplicates_from_json(input_json_file, output_json_file)