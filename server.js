const express = require('express');
const axios = require('axios');

const app = express();

// Middleware to log request headers (for debugging)
app.use((req, res, next) => {
    console.log('Request headers:', req.headers);
    next();
});

// Middleware to parse text bodies when the Content-Type contains "xml"
app.use(express.text({
    type: (req) => req.headers['content-type'] && req.headers['content-type'].includes('xml'),
    limit: '50mb'  // Adjust the limit as needed
}));

// GET endpoint for testing purposes
app.get('/', (req, res) => {
    console.log('Received GET request');
    res.send('Home Page');
});

// Function to get headers and the Suitelet URL
function getHeadersAndUrl() {
    const headers = {
        'Accept': 'application/xml', // expecting XML back
        'User-Agent': 'Mozilla/5.0'
    };

    const deploymentUrl = 'https://855722-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1279&deploy=1&compid=855722_SB2&ns-at=AAEJ7tMQDD9Kd3DnWb6Kdqr9uBaUtGDAcv_ESIC9MtNz6aI7H40';

    return { headers, deploymentUrl };
}

// POST endpoint to forward the XML data to the external Suitelet
app.post('/', async (req, res) => {
    console.log('Received POST request with body:', req.body);

    const { headers, deploymentUrl } = getHeadersAndUrl();

    // Set header to send raw XML
    headers['Content-Type'] = 'text/xml';

    try {
        // Forward the raw XML data to the Suitelet endpoint using Axios
        const response = await axios.post(deploymentUrl, req.body, { headers });
        console.log('Forwarded request status code:', response.status);

        // Set the response header to indicate that the returned data is XML
        res.set('Content-Type', 'text/xml;charset=utf-8');
        res.send(response.data);
    } catch (error) {
        console.error('Error during POST request:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
