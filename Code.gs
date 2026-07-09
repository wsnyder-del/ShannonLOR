/**
 * Pioneer Legal Consulting — LOR Fuhrman Submission Handler
 * Google Apps Script (deployed as Web App: Execute as Me, Anyone can access)
 *
 * Setup:
 *  1. Create a new Google Sheet named "LOR Fuhrman Submissions"
 *  2. Paste this script into Apps Script (Extensions > Apps Script)
 *  3. Set SHEET_ID and WAYNE_EMAIL constants below
 *  4. Deploy > New Deployment > Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web App URL into your Netlify environment variable:
 *     GAS_WEBHOOK_URL = https://script.google.com/macros/s/YOUR_ID/exec
 *  6. In Netlify: Settings > Forms > Notifications > Outgoing webhook
 *     pointing to that URL for form "lor-fuhrman"
 */

// ── CONFIGURE THESE ────────────────────────────────────────────────
const SHEET_ID      = '1IBaqxxn39b91XKdHUfA6W9Zwtw4YEmD9BJodUsXvyf4';
const WAYNE_EMAIL   = 'wsnyder@plc-us.com';
const SHANNON_EMAIL = 'shannon@ssfuhrmanlaw.com';
const SHEET_TAB     = 'Submissions';
// ──────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    let payload = {};

    // Handle both JSON (direct webhook) and form-encoded (Netlify outgoing webhook)
    if (e.postData && e.postData.type === 'application/json') {
      const raw = JSON.parse(e.postData.contents);
      // Netlify outgoing webhook wraps data in payload.data
      payload = raw.data || raw;
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const now         = new Date();
    const clientName  = payload.client_name    || '';
    const clientEmail = payload.client_email   || '';
    const clientPhone = payload.client_phone   || '';
    const clientAddr  = payload.client_address || '';
    const signature   = payload.signature      || '';
    const signedDate  = payload.signed_date    || '';
    const i1          = payload.initial_1      || '';
    const i2          = payload.initial_2      || '';
    const i3          = payload.initial_3      || '';
    const i4          = payload.initial_4      || '';
    const sourceUrl   = payload.source_url     || '';

    // ── LOG TO SHEET ──────────────────────────────────────────────
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let sheet   = ss.getSheetByName(SHEET_TAB);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TAB);
      sheet.appendRow([
        'Timestamp', 'Client Name', 'Email', 'Phone', 'Address',
        'Signature', 'Signed Date', 'Initial 1', 'Initial 2',
        'Initial 3', 'Initial 4', 'Source URL'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1B2A4A').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      now, clientName, clientEmail, clientPhone, clientAddr,
      signature, signedDate, i1, i2, i3, i4, sourceUrl
    ]);

    // ── EMAIL WAYNE ───────────────────────────────────────────────
    const wayneSubject = `✅ LOR Signed — ${clientName} (Fuhrman/FL)`;
    const wayneBody = `
A new client has signed the Fuhrman Letter of Representation.

CLIENT DETAILS
──────────────────────────────
Name:      ${clientName}
Email:     ${clientEmail}
Phone:     ${clientPhone}
Address:   ${clientAddr}

SIGNATURE
──────────────────────────────
Signed As: ${signature}
Date:      ${signedDate}

INITIALS
──────────────────────────────
Section 1 (Who Is Working):   ${i1}
Section 2 (What Happens Next): ${i2}
Section 3 (Fees):              ${i3}
Section 4 (Responsibilities):  ${i4}

Submitted: ${now.toLocaleString('en-US', { timeZone: 'America/Detroit' })} ET
Source:    ${sourceUrl}

──────────────────────────────
Pioneer Legal Consulting, LLC
`.trim();

    GmailApp.sendEmail(WAYNE_EMAIL, wayneSubject, wayneBody, {
      cc: SHANNON_EMAIL,
      replyTo: clientEmail || WAYNE_EMAIL
    });

    // ── CONFIRMATION EMAIL TO CLIENT ──────────────────────────────
    if (clientEmail) {
      const clientSubject = 'Your Letter of Representation — Pioneer Legal Consulting, LLC';
      const clientBody = `
Dear ${clientName},

Thank you for signing your Letter of Representation with Pioneer Legal Consulting, LLC.

This email confirms that your signed agreement has been received. Attorney Shannon S. Fuhrman, Esq. is now your attorney of record for your solar-related legal claims.

WHAT HAPPENS NEXT
─────────────────────────────────────────────────
Our team will begin preparing your demand/rescission notice. You do not need to take any additional action at this time.

If you receive any communications from your solar lender, installer, or a collection agency, please forward them to us immediately:

  Email: legal@pioneerlegalconsulting.com
  Phone: (313) 635-3709

IMPORTANT REMINDER
─────────────────────────────────────────────────
• Do NOT contact the lender or installer directly.
• Continue making scheduled loan payments unless advised otherwise in writing.
• Preserve all documents related to your solar installation and financing.

We will be in touch with updates as your case progresses.

Sincerely,

Pioneer Legal Consulting, LLC
Consumer Advocacy · Solar Fraud Division
445 133rd Ave, Wayland, MI 49348
(313) 635-3709 | legal@pioneerlegalconsulting.com

Attorney of Record: Shannon S. Fuhrman, Esq.
Florida Bar No. 0642797 | New York State Bar No. 4013181
`.trim();

      GmailApp.sendEmail(clientEmail, clientSubject, clientBody, {
        from: 'legal@pioneerlegalconsulting.com',
        name: 'Pioneer Legal Consulting, LLC'
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET handler (health check) ─────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'LOR Fuhrman webhook active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
