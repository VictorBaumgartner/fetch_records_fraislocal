"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var node_fetch_1 = require("node-fetch"); // For Node.js versions without built-in fetch or for broader compatibility
function fetchAllRecordsAndSaveToFile() {
    return __awaiter(this, arguments, void 0, function (baseUrl, outputFilename) {
        var allRecords, offset, limit, totalRecordsFetched, url, response, data, records, error_1, uniqueRecords, seenRecords, _i, allRecords_1, record, recordStr, excludedFields, processedRecords, _a, uniqueRecords_1, record, filteredRecord, field, currentWorkingDirectory, filePath;
        if (baseUrl === void 0) { baseUrl = "https://www.fraisetlocal.fr/api/explore/v2.1/catalog/datasets/flux-toutes-plateformes/records"; }
        if (outputFilename === void 0) { outputFilename = "all_fraisetlocal_records.json"; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    allRecords = [];
                    offset = 0;
                    limit = 100;
                    totalRecordsFetched = 0;
                    console.log("Starting to fetch records from: ".concat(baseUrl));
                    _b.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 7];
                    url = "".concat(baseUrl, "?limit=").concat(limit, "&offset=").concat(offset);
                    console.log("Fetching records from: ".concat(url));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 3:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _b.sent();
                    records = data.results || [];
                    if (records.length === 0) {
                        console.log("No more records found. Stopping fetch process.");
                        return [3 /*break*/, 7];
                    }
                    allRecords.push.apply(allRecords, records);
                    totalRecordsFetched += records.length;
                    console.log("Fetched ".concat(records.length, " records. Total records fetched so far: ").concat(totalRecordsFetched));
                    if (records.length < limit) {
                        console.log("Reached the last page of records. Stopping fetch process.");
                        return [3 /*break*/, 7];
                    }
                    offset += limit;
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error("An error occurred during the request: ".concat(error_1.message));
                    return [3 /*break*/, 7];
                case 6: return [3 /*break*/, 1];
                case 7:
                    console.log("\nFinished fetching all records. Total records collected before deduplication: ".concat(allRecords.length));
                    uniqueRecords = [];
                    seenRecords = new Set();
                    for (_i = 0, allRecords_1 = allRecords; _i < allRecords_1.length; _i++) {
                        record = allRecords_1[_i];
                        recordStr = JSON.stringify(record, Object.keys(record).sort());
                        if (!seenRecords.has(recordStr)) {
                            seenRecords.add(recordStr);
                            uniqueRecords.push(record);
                        }
                    }
                    console.log("Total unique records after deduplication: ".concat(uniqueRecords.length));
                    excludedFields = new Set([
                        "reg_code",
                        "adress_app", // Not in previous examples, but included as requested
                        "url_du_logo" // Not in previous examples, but included as requested
                    ]);
                    processedRecords = [];
                    for (_a = 0, uniqueRecords_1 = uniqueRecords; _a < uniqueRecords_1.length; _a++) {
                        record = uniqueRecords_1[_a];
                        filteredRecord = {};
                        // Iterate over all keys present in the record
                        for (field in record) {
                            if (record.hasOwnProperty(field) && record[field] !== null && !excludedFields.has(field)) {
                                filteredRecord[field] = record[field];
                            }
                        }
                        if (Object.keys(filteredRecord).length > 0) { // Only add if the filtered record is not empty after filtering
                            processedRecords.push(filteredRecord);
                        }
                    }
                    console.log("Total processed records after specific field exclusion and null value removal: ".concat(processedRecords.length));
                    // --- Save records to file ---
                    try {
                        currentWorkingDirectory = process.cwd();
                        filePath = path.join(currentWorkingDirectory, outputFilename);
                        fs.writeFileSync(filePath, JSON.stringify(processedRecords, null, 2), { encoding: 'utf8' });
                        console.log("All unique, specifically-filtered, and null-cleaned records saved to ".concat(filePath));
                    }
                    catch (error) {
                        console.error("Error saving records to file: ".concat(error.message));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Execute the function
fetchAllRecordsAndSaveToFile();
