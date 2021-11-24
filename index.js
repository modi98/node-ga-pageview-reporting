'use strict';

const dayjs = require('dayjs');
const express = require('express');
const {google} = require('googleapis');

const app = express();
const port = 3000;
const analyticsreporting = google.analyticsreporting('v4');

app.get('/', async function(req, res) {
  res.send(await getAnalyticsData());
})

app.listen(port, () => {
  console.log(`Analytics reporting app listening at http://localhost:${port}`)
})

async function getAnalyticsData() {
  // Obtain user credentials to use for the request
  const auth = new google.auth.GoogleAuth({
    keyFile: './keys.json', // Get this JSON from GCP, create a Service Account and a private key
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'], // Service Account needs read permission on Analytics
  });
  google.options({auth});

  const now = dayjs();
  const viewId = '00000000' // Get this from Analytics view

  return await analyticsreporting.reports.batchGet({
    requestBody: {
      reportRequests: [
        {
          viewId,
          dateRanges: [
            {
              startDate: now.subtract('14', 'day').format('YYYY-MM-DD'),
              endDate: now.format('YYYY-MM-DD'),
            },
          ],
          dimensions: [
            {
              name: 'ga:pagePath',
            }
          ],
          metrics: [
            {
              expression: 'ga:pageviews',
            },
          ],
          orderBys: [
            {
              fieldName: "ga:pageviews",
              sortOrder: "DESCENDING"
            }
          ]
        },
      ],
    },
  });
}