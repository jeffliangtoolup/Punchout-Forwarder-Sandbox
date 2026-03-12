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
  const { headers, deploymentUrl } = getHeadersAndUrl();
  headers['Content-Type'] = 'text/xml';

  try {
    const response = await axios.post(deploymentUrl, req.body, {
      headers,
      timeout: 25000
    });

    res.set('Content-Type', 'text/xml;charset=utf-8');
    res.status(200).send(response.data);

  } catch (error) {
    const status = (error.response && error.response.status) ? error.response.status : 500;
    const body = (error.response && error.response.data) ? error.response.data : String(error.message);

    // pass through HTML if that's what NetSuite returned
    res.status(status);
    res.set('Content-Type', 'text/html;charset=utf-8');
    res.send(body);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
