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
const express_1 = __importDefault(require("express")); // Keep the main express import simple
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const app = (0, express_1.default)();
const port = 3000;
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Path to your generated JSON data file
const dataFilePath = path.join(process.cwd(), 'all_fraisetlocal_records.json');
let recordsData = [];
// Function to load data from the JSON file
const loadRecordsData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        recordsData = JSON.parse(data);
        console.log(`Successfully loaded ${recordsData.length} records from ${dataFilePath}`);
    }
    catch (error) {
        console.error(`Error loading records data from ${dataFilePath}: ${error.message}`);
        console.error("Please ensure 'all_fraisetlocal_records.json' exists and contains valid JSON.");
        process.exit(1);
    }
};
// Load data when the server starts
loadRecordsData();
// Endpoint to retrieve a record by url_sur_la_plateforme_partenaire
// Explicitly using express.Request and express.Response here
app.get('/lookup', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: "Missing 'url' query parameter. Example: /lookup?url=<your_url>" });
    }
    const decodedTargetUrl = decodeURIComponent(targetUrl);
    console.log(`Looking up records for URL: ${decodedTargetUrl}`);
    const matchingRecords = recordsData.filter(record => record.url_sur_la_plateforme_partenaire === decodedTargetUrl);
    if (matchingRecords.length > 0) {
        console.log(`Found ${matchingRecords.length} matching record(s).`);
        res.json(matchingRecords);
    }
    else {
        console.log(`No record found for URL: ${decodedTargetUrl}`);
        res.status(404).json({ message: "No record found for the provided URL." });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
    console.log(`Lookup endpoint: http://localhost:${port}/lookup?url=YOUR_ENCODED_URL_HERE`);
    console.log("Make sure to URL-encode the 'url_sur_la_plateforme_partenaire' when sending it as a query parameter.");
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please choose a different port or stop the process using that port.`);
    }
    else {
        console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
});
