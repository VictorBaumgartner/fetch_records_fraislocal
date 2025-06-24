import requests
import json

def fetch_all_records(base_url="https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records"):
    """
    Fetches all records from the given Opendatasoft API URL by paginating with offset.

    Args:
        base_url (str): The base URL of the API endpoint.

    Returns:
        list: A list containing all fetched records.
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
                print("No more records found. Stopping process.")
                break

            all_records.extend(records)
            total_records_fetched += len(records)
            print(f"Fetched {len(records)} records. Total records so far: {total_records_fetched}")

            # Check if the number of records returned is less than the limit,
            # indicating it's the last page.
            if len(records) < limit:
                print("Reached the last page of records. Stopping process.")
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

    print(f"Finished fetching all records. Total records collected: {len(all_records)}")
    return all_records

# Example usage:
if __name__ == "__main__":
    records = fetch_all_records()
    # You can now process the 'records' list
    # For example, print the first few records or their count
    if records:
        print(f"\nFirst 5 records (if available):\n{json.dumps(records[:5], indent=2)}")
    else:
        print("No records were fetched.")

    # You could then perform your analysis on 'all_records' like checking field consistency
    # Example of checking fields of the first record (if any)
    if records:
        print("\nFields of the first record:")
        for key in records[0].keys():
            print(f"- {key}")