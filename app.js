const hubspotRequest = require("./helper/hubspotReq");

// Get Emails params
const campaignName = "BP1 survey";
const startTimestamp = 1546300800000;
const endTimestamp = 1598949900000;

//Fetch all published marketing emails

async function getPublishedMarketingEmails() {
  const url = 'https://api.hubapi.com/marketing-emails/v1/emails';
  const response = await hubspotRequest(url);
  return response.objects.filter(email => email.isPublished === true);
}

// get specific emails 
async function getEmailsByCampaignNameAndDate(campaignName, startTimestamp, endTimestamp) {
  const emails = await getPublishedMarketingEmails();
  // Filter emails by campaign name and date range
  const filteredEmails = emails.filter(email =>
    email.campaignName === campaignName && email.publishDate >= startTimestamp && email.publishDate <= endTimestamp
  );
  const emailList = [];
  filteredEmails.forEach(email => { emailList.push(email.id); });
  const result = { campaignName, emails: emailList };
  return result;
}

// second - metrics

// Step 1: Get `mailingIncludeLists` for the marketing email
async function getMailingIncludeLists(emailId) {
  const url = `https://api.hubapi.com/marketing-emails/v1/emails/${emailId}`;
  const emailData = await hubspotRequest(url);
  return emailData?.mailingListsIncluded || [];
}

// Step 2: Get contacts of a list
async function getContactsInList(listId) {
  const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/contacts/all`;
  const contactsData = await hubspotRequest(url);
  return contactsData?.contacts || [];
}

// Step 3: Get email events (sent, delivered, open, click)
async function getEmailEvents(emailId, recipientEmail) {
  const url = `https://api.hubapi.com/email/public/v1/events`;
  const eventsData = await hubspotRequest(url, { emailId, recipient: recipientEmail });

  const metrics = { sent: 0, delivered: 0, open: 0, click: 0 };
  if (!eventsData?.events) return metrics;

  eventsData.events.forEach(event => {
    if (event.type === "SENT") metrics.sent++;
    else if (event.type === "DELIVERED") metrics.delivered++;
    else if (event.type === "OPEN") metrics.open++;
    else if (event.type === "CLICK") metrics.click++;
  });
  return metrics;
}

// Step 4: Process each list and calculate metrics
async function calculateListLevelMetrics(emailId) {
  const lists = await getMailingIncludeLists(emailId);
  if (lists.length === 0) {
    console.log("No lists found for this marketing email.");
    return;
  }

  const results = [];
  for (const listId of lists) {
    const contacts = await getContactsInList(listId);
    let aggregatedMetrics = { sent: 0, delivered: 0, open: 0, click: 0 };

    for (const contact of contacts) {
      const contactEmail = contact["identity-profiles"]?.[0]?.["identities"]?.[0]?.["value"];
      if (!contactEmail) continue;

      const contactMetrics = await getEmailEvents(emailId, contactEmail);
      console.log(contactMetrics)
      aggregatedMetrics.sent += contactMetrics.sent;
      aggregatedMetrics.delivered += contactMetrics.delivered;
      aggregatedMetrics.open += contactMetrics.open;
      aggregatedMetrics.click += contactMetrics.click;
    }

    results.push({
      emailId,
      listId,
      metrics: aggregatedMetrics
    });
  }

  console.log(JSON.stringify(results, null, 2));
}
async function main() {
  const data = await getEmailsByCampaignNameAndDate(campaignName, startTimestamp, endTimestamp);
  data.emails.forEach((email) => {
    calculateListLevelMetrics(email)
  });
}
main();