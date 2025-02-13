require("dotenv").config();
const axios = require('axios');
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

// Helper function for API requests
 module.exports =   async function hubspotRequest(url, params = {}) {
  try {
      const response = await axios.get(url, {
          headers: {
              Authorization: `Bearer ${HUBSPOT_API_KEY}`,
              "Content-Type": "application/json"
          },
          params
      });
      return response.data;
  } catch (error) {
      console.error(`Hubspot Error fetching ${url}:`, error.response?.data || error.message);
      return null;
  }
}