import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

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

// Start the server, listening on all network interfaces ('0.0.0.0')
app.listen(port, '0.0.0.0', () => {
    // Determine the local IP address for display
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIpAddress = 'localhost';

    for (const iface in networkInterfaces) {
        for (const alias of networkInterfaces[iface]!) {
            if (alias.family === 'IPv4' && !alias.internal) {
                localIpAddress = alias.address;
                break;
            }
        }
        if (localIpAddress !== 'localhost') break;
    }

    console.log(`Server API listening on all interfaces (0.0.0.0) at port ${port}`);
    console.log(`You can access it locally via: http://localhost:${port}`);
    console.log(`If configured for external access, others might use: http://${localIpAddress}:${port}`);
    console.log(`Lookup endpoint example: http://${localIpAddress}:${port}/lookup?url=YOUR_ENCODED_URL_HERE`);
    console.log("Make sure to URL-encode the 'url_sur_la_plateforme_partenaire' when sending it as a query parameter.");
}).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please choose a different port or stop the process using that port.`);
    } else {
        console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
});