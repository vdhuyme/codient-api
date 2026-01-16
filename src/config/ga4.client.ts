import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { config } from '@config/app';

const credentials = config.ga4.credentials;
if (!credentials) {
  throw new Error('Missing GA4 credentials');
}

export const ga4Client = new BetaAnalyticsDataClient({
  credentials: JSON.parse(credentials),
});
