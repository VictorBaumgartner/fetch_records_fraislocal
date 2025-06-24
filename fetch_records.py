import requests
import json

def fetch_all_records(base_url="https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records"):
    """
    Fetches all records from the given Opendatasoft API URL by paginating with offset,
    and then removes any duplicate records.

    Args:
        base_url (str): The base URL of the API endpoint.

    Returns:
        list: A list containing all unique fetched records.
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
    return unique_records

# Example usage:
if __name__ == "__main__":
    records = fetch_all_records()
    
    if records:
        print(f"\nFirst 5 unique records (if available):\n{json.dumps(records[:5], indent=2)}")
        print(f"\nNumber of unique records: {len(records)}")
    else:
        print("No unique records were fetched.")

    # You can now perform your analysis on the 'records' list (which now contains only unique records)
    # For example, checking field consistency, etc.
    if records:
        print("\nFields of the first unique record:")
        for key in records[0].keys():
            print(f"- {key}")