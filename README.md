# whatsapp_manager

This project provides a simple Node.js script that uses
[`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js) to
manage WhatsApp groups.

## Setup

1. Install dependencies (set `PUPPETEER_SKIP_DOWNLOAD=1` to skip the
   Chromium download if running in an environment without internet
   access):

```bash
PUPPETEER_SKIP_DOWNLOAD=1 npm install
```

2. Run the script:

```bash
node app.js
```

A QR code will be displayed in the terminal. Scan it with the WhatsApp
account you want to manage. The script will list all groups where that
account is an admin and save them to `groups.csv`.

You will then be prompted to enter up to three phone numbers separated by
commas. Any groups whose name or description contains one of the
following keywords (case-insensitive) will have those numbers added and
promoted to admin:

```
GS, Outskill, growthschool, buildschool, webinar, workshop, mentorship,
membership, AI, chatgpt
```

## Output

- `groups.csv` – A CSV file containing the name and ID of every group the
  logged-in account is an admin of.

## Notes

This script relies on the session being stored using
`whatsapp-web.js`'s `LocalAuth` strategy. Subsequent runs will reuse the
saved authentication data so you won't need to scan the QR code every
run.
