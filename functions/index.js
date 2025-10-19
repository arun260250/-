/* functions/index.js */
const functions = require("firebase-functions");
const { google } = require("googleapis");

// Path to your service account key
const SERVICE_ACCOUNT_KEY_FILE = "./service-account-key.json"; 
// Your Google Sheet ID
const SHEET_ID = "AKfycbwwUPnRMhk-X1sylUYm8VX7N_EfGT1l8O2WYx4Rf2RIzjMRys5q0QrhGquQTv6CfhZRQg"; // <--- ใส่ Sheet ID ของคุณ

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Triggered when a new user signs up.
 * Appends user data to the specified Google Sheet.
 */
exports.addUserToSheet = functions.region("asia-southeast1") // (Optional: deploy closer to you)
  .auth.user().onCreate(async (user) => {
    const userId = user.uid;
    const email = user.email;
    const displayName = user.displayName || "N/A";
    const timestamp = new Date().toISOString();

    console.log(`New user created: ${userId}, Email: ${email}`);

    try {
      const rowData = [userId, email, displayName, timestamp];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Sheet1!A1", // Or your sheet name e.g., "FitnessUsers!A1"
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowData],
        },
      });

      console.log("Appended to Google Sheet:", response.data);
      return 0;
    } catch (error) {
      console.error("Error appending to Google Sheet:", error.message);
      // Don't throw error, just log it. We don't want to fail user creation.
      return 1;
    }
  });
