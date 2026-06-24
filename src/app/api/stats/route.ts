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

export async function GET() {
  const pubgSheetId = process.env.SHEET_ID_PUBG || "mock_pubg_sheet";
  const aiSheetId = process.env.SHEET_ID_AI || "mock_ai_sheet";

  const [pubgCount, aiCount] = await Promise.all([
    getSheetRowCount(pubgSheetId, "'Form Responses 1'!A:A"),
    getSheetRowCount(aiSheetId, "'Form Responses 1'!A:A")
  ]);

  return NextResponse.json({
    pubg: pubgCount,
    ai: aiCount
  });
}
