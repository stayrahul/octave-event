import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, formData } = body;

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    let sheetId = "";
    if (eventType === 'pubg') {
      sheetId = process.env.SHEET_ID_PUBG || "mock_pubg_sheet";
    } else if (eventType === 'ai') {
      sheetId = process.env.SHEET_ID_AI || "mock_ai_sheet";
    } else {
      return NextResponse.json({ success: false, error: "Invalid event type" }, { status: 400 });
    }

    if (!clientEmail || !privateKey || sheetId.startsWith("mock")) {
      console.warn("Mocking successful registration due to missing credentials.");
      return NextResponse.json({ success: true, message: "Mock registration successful" });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [Object.values(formData)];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ success: true, message: "Registration successful" });

  } catch (error) {
    console.error("Error submitting registration:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
