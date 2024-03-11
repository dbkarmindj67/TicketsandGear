require('dotenv').config(); // Import and configure dotenv at the top
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Use CORS middleware to enable CORS Requests
app.use(cors());

// Default route for the API
app.get('/', (req, res) => {
  res.send('Welcome to the Ticketmaster and RSS Data Proxy Server!');
});

// Environment variables
const API_KEY = process.env.TICKETMASTER_API_KEY; // Use environment variable for Ticketmaster API key
const PORT = process.env.PORT || 3000; // Use environment variable for port, with a default of 3000

// Ticketmaster Events API
const ticketmasterApiUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
app.get('/events', async (req, res) => {
  try {
    const response = await axios.get(ticketmasterApiUrl, {
      params: {
        apikey: API_KEY,
        keyword: req.query.keyword,
        countryCode: req.query.countryCode,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching events from Ticketmaster');
  }
});

// RSS Data API - assuming you have a function fetchRSSData() that gets RSS data
app.get('/rss', async (req, res) => {
  try {
    // Here you would fetch your RSS data and convert it to a suitable format
    const rssData = await fetchRSSData(); // This function is hypothetical; replace with actual fetching logic
    res.json(rssData); // Respond with JSON data
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching RSS data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
