import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
// Removed: import * as os from 'os'; // No longer needed for dynamic IP detection

const app = express();
const port = 3000; // You can choose any available port, e.g., 80, 8080, etc.

// Middleware to parse JSON request bodies
app.use(express.json());

// Path to your generated JSON data file
const dataFilePath = path.join(process.cwd(), 'all_fraisetlocal_records.json');

let recordsData: any[] = [];

// Function to load data from the JSON file
const loadRecordsData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        recordsData = JSON.parse(data);
        console.log(`Successfully loaded ${recordsData.length} records from ${dataFilePath}`);
    } catch (error: any) {
        console.error(`Error loading records data from ${dataFilePath}: ${error.message}`);
        console.error("Please ensure 'all_fraisetlocal_records.json' exists and contains valid JSON.");
        process.exit(1);
    }
};

// Load data when the server starts
loadRecordsData();

// Endpoint to retrieve a record by url_sur_la_plateforme_partenaire
app.get('/lookup', ((req: express.Request, res: express.Response) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
        return res.status(400).json({ error: "Missing 'url' query parameter. Example: /lookup?url=<your_url>" });
    }

    const decodedTargetUrl = decodeURIComponent(targetUrl);

    console.log(`Looking up records for URL: ${decodedTargetUrl}`);

    const matchingRecords = recordsData.filter(record =>
        record.url_sur_la_plateforme_partenaire === decodedTargetUrl
    );

    if (matchingRecords.length > 0) {
        console.log(`Found ${matchingRecords.length} matching record(s).`);
        res.json(matchingRecords);
    } else {
        console.log(`No record found for URL: ${decodedTargetUrl}`);
        res.status(404).json({ message: "No record found for the provided URL." });
    }
}) as any); // Type assertion for workaround

// Hardcoded local IP address as requested
const localIpAddress = '192.168.0.51'; // <--- HARDCODED IP ADDRESS

// Start the server, listening specifically on the provided local IP address
app.listen(port, localIpAddress, () => {
    console.log(`Server API listening on your local network IP: http://${localIpAddress}:${port}`);
    console.log(`You can also access it locally via: http://localhost:${port}`);
    console.log(`Lookup endpoint example: http://${localIpAddress}:${port}/lookup?url=YOUR_ENCODED_URL_HERE`);
    console.log("Make sure to URL-encode the 'url_sur_la_plateforme_partenaire' when sending it as a query parameter.");
}).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use on ${localIpAddress}. Please choose a different port or stop the process using that port.`);
    } else if (err.code === 'EADDRNOTAVAIL') {
        console.error(`Error: Address ${localIpAddress} is not available. Please check your network configuration, or ensure this machine is assigned that IP.`);
    }
    else {
        console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
});