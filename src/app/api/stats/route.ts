import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const revalidate = 15; // Cache the response for 15 seconds to prevent rate-limiting and make it lightning fast!

// Initialize auth outside the request handler to reuse it across requests
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim()
  : undefined;

let sheetsClient: any = null;

if (clientEmail && privateKey) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
}

async function getSheetRowCount(sheetId: string, range: string) {
  try {
    if (!sheetsClient) {
      console.warn("Google Sheets credentials missing. Returning mock data.");
      return Math.floor(Math.random() * 20) + 5; 
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range, 
    });

    const rows = response.data.values;
    return rows ? rows.length - 1 : 0;
  } catch (error: any) {
    console.warn(`Could not fetch live stats for ${sheetId}. Using fallback 0. (Reason: ${error.message || 'Unknown error'})`);
    return 0; // Fallback
  }
}

const globalAny: any = global;

interface StatsData {
  pubg: number;
  ai: number;
}

async function fetchAllStats(pubgSheetId: string, aiSheetId: string, timeoutMs: number = 15000): Promise<StatsData> {
  const fetchPromise = Promise.all([
    getSheetRowCount(pubgSheetId, "'Form Responses 1'!A:A"),
    getSheetRowCount(aiSheetId, "'Form Responses 1'!A:A")
  ]);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Google Sheets fetch timed out')), timeoutMs)
  );

  const [pubgCount, aiCount] = await Promise.race([fetchPromise, timeoutPromise]) as [number, number];
  return { pubg: pubgCount, ai: aiCount };
}

export async function GET() {
  const pubgSheetId = process.env.SHEET_ID_PUBG || "mock_pubg_sheet";
  const aiSheetId = process.env.SHEET_ID_AI || "mock_ai_sheet";

  const now = Date.now();
  const cacheAge = now - (globalAny.lastStatsFetchTime || 0);

  // 1. If cache is fresh (< 15 seconds), return instantly
  if (globalAny.cachedStats && cacheAge < 15000) {
    return NextResponse.json(globalAny.cachedStats);
  }

  // Helper for background refresh (runs with default 15s timeout)
  const revalidateInBackground = () => {
    fetchAllStats(pubgSheetId, aiSheetId)
      .then(result => {
        globalAny.cachedStats = result;
        globalAny.lastStatsFetchTime = Date.now();
      })
      .catch(err => {
        console.warn("Background stats refresh failed:", err.message);
      });
  };

  // 2. If cache is stale, trigger background update and return stale cache instantly
  if (globalAny.cachedStats) {
    revalidateInBackground();
    return NextResponse.json(globalAny.cachedStats);
  }

  // 3. Cold boot: try to fetch with a strict timeout of 1.2s
  try {
    const data = await fetchAllStats(pubgSheetId, aiSheetId, 1200);
    globalAny.cachedStats = data;
    globalAny.lastStatsFetchTime = Date.now();
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("Cold boot stats fetch failed or timed out, serving fallback:", error.message);
    const fallbackStats = { pubg: 14, ai: 21 };
    
    // Still trigger background fetch to populate cache in the background
    revalidateInBackground();
    
    return NextResponse.json(fallbackStats);
  }
}
