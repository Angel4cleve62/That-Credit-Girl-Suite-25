import { Router } from 'express';
import { requireFeature } from '../middleware/auth.js';
import axios from 'axios';
import { logEvent } from '../services/events.js';
import { randomUUID } from 'crypto';

export const cusipRouter = Router();

cusipRouter.post('/lookup', requireFeature('CUSIP'), async (req, res) => {
  const { tickers = [], descriptions = [] } = req.body as {
    tickers?: string[];
    descriptions?: string[];
  };

  const results: Array<{ query: string; cusip?: string; isin?: string; source: string }> = [];
  const apiKey = process.env.OPENFIGI_API_KEY;

  for (const q of [...tickers, ...descriptions]) {
    try {
      if (apiKey) {
        const resp = await axios.post(
          'https://api.openfigi.com/v3/mapping',
          [
            {
              idType: 'TICKER',
              idValue: q,
            },
          ],
          { headers: { 'X-OPENFIGI-APIKEY': apiKey } }
        );
        const data = resp.data?.[0]?.data?.[0];
        if (data) {
          results.push({ query: q, cusip: data.cusip, isin: data.isin, source: 'OpenFIGI' });
          continue;
        }
      }
    } catch (e) {
      // ignore and fallback
    }
    results.push({ query: q, source: 'Fallback' });
  }

  await logEvent({ id: randomUUID(), type: 'cusip.lookup', metadata: { count: results.length } });
  res.json({ results, hints: buildSearchHints([...tickers, ...descriptions]) });
});

function buildSearchHints(queries: string[]) {
  const hints = queries.map((q) => ({
    query: q,
    google: `site:sec.gov 424B5 prospectus ${q}`,
    edgar: `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(q)}&category=custom&forms=424B5%2CABS` ,
    finra: `https://finra-markets.morningstar.com/BondCenter/Default.jsp`,
  }));
  return hints;
}