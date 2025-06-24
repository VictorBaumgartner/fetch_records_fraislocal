"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch")); // For Node.js versions without built-in fetch or for broader compatibility
async function fetchAllRecordsAndSaveToFile(baseUrl = "https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records", outputFilename = "all_fraisetlocal_records.json") {
    let allRecords = [];
    let offset = 0;
    const limit = 100; // The maximum number of records to retrieve per request
    let totalRecordsFetched = 0;
    console.log(`Starting to fetch records from: ${baseUrl}`);
    while (true) {
        // Construct the URL with current offset and limit
        const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
        console.log(`Fetching records from: ${url}`);
        try {
            const response = await (0, node_fetch_1.default)(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const records = data.results || [];
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
        }
        catch (error) {
            console.error(`An error occurred during the request: ${error.message}`);
            break;
        }
    }
    console.log(`\nFinished fetching all records. Total records collected before deduplication: ${allRecords.length}`);
    // --- Deduplication Process ---
    const uniqueRecords = [];
    const seenRecords = new Set();
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
    // --- Define fields to explicitly exclude ---
    const excludedFields = new Set([
        "reg_code",
        "adress_app", // Not in previous examples, but included as requested
        "url_du_logo" // Not in previous examples, but included as requested
    ]);
    // --- Filter fields and remove null values for each record ---
    const processedRecords = [];
    for (const record of uniqueRecords) {
        const filteredRecord = {};
        // Iterate over all keys present in the record
        for (const field in record) {
            if (record.hasOwnProperty(field) && record[field] !== null && !excludedFields.has(field)) {
                filteredRecord[field] = record[field];
            }
        }
        if (Object.keys(filteredRecord).length > 0) { // Only add if the filtered record is not empty after filtering
            processedRecords.push(filteredRecord);
        }
    }
    console.log(`Total processed records after specific field exclusion and null value removal: ${processedRecords.length}`);
    // --- Save records to file ---
    try {
        const currentWorkingDirectory = process.cwd();
        const filePath = path.join(currentWorkingDirectory, outputFilename);
        fs.writeFileSync(filePath, JSON.stringify(processedRecords, null, 2), { encoding: 'utf8' });
        console.log(`All unique, specifically-filtered, and null-cleaned records saved to ${filePath}`);
    }
    catch (error) {
        console.error(`Error saving records to file: ${error.message}`);
    }
}
// Execute the function
fetchAllRecordsAndSaveToFile();
