import requests
import json
import os

def fetch_all_records_and_save_to_file(base_url="https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records", output_filename="all_fraisetlocal_records.json"):
    """
    Fetches all records from the given Opendatasoft API URL by paginating with offset,
    removes any duplicate records, and saves the unique records to a JSON file
    in the current working directory.

    Args:
        base_url (str): The base URL of the API endpoint.
        output_filename (str): The name of the JSON file to save the records to.
    """
    all_records = []
    offset = 0
    limit = 100  # The maximum number of records to retrieve per request
    total_records_fetched = 0

    print(f"Starting to fetch records from: {base_url}")

    while True:
        # Construct the URL with current offset and limit
        url = f"{base_url}?limit={limit}&offset={offset}"
        print(f"Fetching records from: {url}")

        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
            data = response.json()

            # Extract records from the 'results' key
            records = data.get('results', [])

            if not records:
                # No more records found, break the loop
                print("No more records found. Stopping fetch process.")
                break

            all_records.extend(records)
            total_records_fetched += len(records)
            print(f"Fetched {len(records)} records. Total records fetched so far: {total_records_fetched}")

            # Check if the number of records returned is less than the limit,
            # indicating it's the last page.
            if len(records) < limit:
                print("Reached the last page of records. Stopping fetch process.")
                break

            offset += limit

        except requests.exceptions.RequestException as e:
            print(f"An error occurred during the request: {e}")
            break
        except json.JSONDecodeError:
            print("Failed to decode JSON from response. Stopping process.")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break

    print(f"\nFinished fetching all records. Total records collected before deduplication: {len(all_records)}")

    # --- Deduplication Process ---
    unique_records = []
    seen_records = set()

    for record in all_records:
        # To make a dictionary hashable for set operations, convert it to a JSON string.
        # Ensure consistent key order for consistent hashing by sorting items.
        record_str = json.dumps(record, sort_keys=True)
        if record_str not in seen_records:
            seen_records.add(record_str)
            unique_records.append(record)

    print(f"Total unique records after deduplication: {len(unique_records)}")

    # --- Save records to file ---
    try:
        current_working_directory = os.getcwd()
        file_path = os.path.join(current_working_directory, output_filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(unique_records, f, indent=2, ensure_ascii=False)
        print(f"All unique records saved to {file_path}")
    except IOError as e:
        print(f"Error saving records to file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while saving file: {e}")

# Call the function to execute the process
fetch_all_records_and_save_to_file()