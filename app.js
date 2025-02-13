const axios = require('axios');
require("dotenv").config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

// Get Emails params
const campaignName = "BP1 survey";
const startTimestamp = 1546300800000; 
const endTimestamp = 1598949900000; 
 

 //Fetch all published marketing emails
async function getPublishedMarketingEmails() {
  try {
      const response = await axios.get('https://api.hubapi.com/marketing-emails/v1/emails', {
          headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}` }
      });
      return response.data.objects.filter(email => email.isPublished === true);
  } catch (error) {
      console.error("Error fetching emails:", error.response?.data || error.message);
      return [];
  }
}

// get specific emails 
async function getEmailsByCampaignNameAndDate(campaignName, startTimestamp, endTimestamp) {
  const emails = await getPublishedMarketingEmails();
  // Filter emails by campaign name and date range
  const filteredEmails = emails.filter(email =>
      email.campaignName === campaignName &&  email.publishDate >= startTimestamp && email.publishDate <=  endTimestamp
  );
  const emailList=[];
  filteredEmails.forEach(email => {
    emailList.push(email.name);
  });
  // Log the result as JSON
  const result = { campaignName, emails:emailList };
  console.log(JSON.stringify(result, null, 2));
}

getEmailsByCampaignNameAndDate(campaignName, startTimestamp, endTimestamp);
