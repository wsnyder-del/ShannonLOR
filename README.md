# PLC — Fuhrman LOR Deploy Package

Letter of Representation for Florida clients under Shannon S. Fuhrman, Esq.

---

## Files

```
fuhrman-lor/
├── html/
│   └── lor_fuhrman.html     ← The form (Netlify deploy target)
├── gas/
│   └── Code.gs              ← Google Apps Script (Sheet logging + email)
├── netlify.toml             ← Build config (publish dir, redirects)
└── README.md
```

---

## Step 1 — Google Sheet + Apps Script

1. Create a new Google Sheet. Name it: **LOR Fuhrman Submissions**
2. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
3. Open **Extensions → Apps Script**
4. Paste contents of `gas/Code.gs`
5. Update the two constants at the top:
   ```js
   const SHEET_ID      = 'your-sheet-id-here';
   const SHANNON_EMAIL = 'shannon@fuhrmanlaw.com';  // confirm her address
   ```
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the Web App URL — you'll need it in Step 3.

---

## Step 2 — GitHub

1. Create a new GitHub repo: `plc-lor-fuhrman` (or add to existing plc repos)
2. Push all files in this package:
   ```bash
   git init
   git add .
   git commit -m "Initial deploy: Fuhrman LOR"
   git remote add origin https://github.com/wsnyder-del/plc-lor-fuhrman.git
   git push -u origin main
   ```

---

## Step 3 — Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
2. Connect to the `plc-lor-fuhrman` GitHub repo
3. Build settings (auto-detected from netlify.toml):
   - Publish directory: `html`
4. Deploy the site
5. Set a custom domain (e.g. `lor-fl.plc-us.com`) or use the Netlify subdomain

### Wire up the GAS webhook (for Sheet logging):
6. In Netlify: **Site Settings → Forms → Form notifications**
7. Add **Outgoing webhook** for form `lor-fuhrman`
8. Paste the GAS Web App URL from Step 1
9. Save

---

## Step 4 — Test

1. Open your Netlify URL
2. Fill out and submit the form
3. Confirm:
   - ✅ Success screen appears
   - ✅ Wayne receives email with client details (cc: Shannon)
   - ✅ Client receives confirmation email
   - ✅ Row appears in Google Sheet

---

## URL Pre-fill Parameters

Send clients a pre-filled link:

```
https://your-site.netlify.app/lor_fuhrman.html?client_name=Jane+Doe&client_email=jane%40email.com&client_phone=8005551234
```

Supported params: `client_name`, `client_email`, `client_phone`, `client_address`

---

## Shannon's Bar Numbers (confirmed)
- Florida Bar No. **0642797**
- New York State Bar No. **4013181**

---

## Attorney of Record Language

> Shannon S. Fuhrman, Esq. is your attorney of record. She is responsible for reviewing legal strategy, supervising document preparation, and representing you in any arbitration or court proceeding.
>
> Pioneer Legal Consulting, LLC prepares all pre-arbitration documents and correspondence on your behalf under Ms. Fuhrman's supervision. Pioneer is not a law firm and does not provide legal advice independently.
