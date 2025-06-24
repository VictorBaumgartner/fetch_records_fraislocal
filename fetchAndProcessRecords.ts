import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // For Node.js versions without built-in fetch or for broader compatibility

async function fetchAllRecordsAndSaveToFile(
    baseUrl: string = "https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records",
    outputFilename: string = "all_fraisetlocal_records.json"
): Promise<void> {
    let allRecords: any[] = [];
    let offset: number = 0;
    const limit: number = 100; // The maximum number of records to retrieve per request
    let totalRecordsFetched: number = 0;

    console.log(`Starting to fetch records from: ${baseUrl}`);

    while (true) {
        // Construct the URL with current offset and limit
        const url: string = `${baseUrl}?limit=${limit}&offset=${offset}`;
        console.log(`Fetching records from: ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: any = await response.json();

            const records: any[] = data.results || [];

            if (records.length === 0) {
                console.log("No more records found. Stopping fetch process.");
                break;
            }

            allRecords.push(...records);
            totalRecordsFetched += records.length;
            console.log(`Fetched ${records.length} records. Total records fetched so far: ${totalRecordsFetched}`);

            if (records.length < limit) {
                console.log("Reached the last page of records. Stopping fetch process.");
                break;
            }

            offset += limit;

        } catch (error: any) {
            console.error(`An error occurred during the request: ${error.message}`);
            break;
        }
    }

    console.log(`\nFinished fetching all records. Total records collected before deduplication: ${allRecords.length}`);

    // --- Deduplication Process ---
    const uniqueRecords: any[] = [];
    const seenRecords = new Set<string>();

    for (const record of allRecords) {
        // To make a dictionary hashable for Set operations, convert it to a JSON string.
        // Ensure consistent key order for consistent hashing by sorting keys.
        const recordStr = JSON.stringify(record, Object.keys(record).sort());
        if (!seenRecords.has(recordStr)) {
            seenRecords.add(recordStr);
            uniqueRecords.push(record);
        }
    }

    console.log(`Total unique records after deduplication: ${uniqueRecords.length}`);

    // --- Remove null values from all fields for each record ---
    const processedRecords: any[] = [];
    for (const record of uniqueRecords) {
        const filteredRecord: { [key: string]: any } = {};
        // Iterate over all keys present in the record
        for (const field in record) {
            if (record.hasOwnProperty(field) && record[field] !== null) {
                filteredRecord[field] = record[field];
            }
        }
        if (Object.keys(filteredRecord).length > 0) { // Only add if the filtered record is not empty after null removal
            processedRecords.push(filteredRecord);
        }
    }
    
    console.log(`Total processed records after null value removal: ${processedRecords.length}`);

    // --- Save records to file ---
    try {
        const currentWorkingDirectory = process.cwd();
        const filePath = path.join(currentWorkingDirectory, outputFilename);
        
        fs.writeFileSync(filePath, JSON.stringify(processedRecords, null, 2), { encoding: 'utf8' });
        console.log(`All unique and null-cleaned records saved to ${filePath}`);
    } catch (error: any) {
        console.error(`Error saving records to file: ${error.message}`);
    }
}

// Execute the function
fetchAllRecordsAndSaveToFile();