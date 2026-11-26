# Pepper Signature Studio

A single-page tool for creating and handing out email signatures for hellopepper.com (Google Workspace).

- `index.html` is the whole app: plain HTML and JS, no build step.
- The team roster is saved in the admin's browser (localStorage). Use **Distribute & backup → Export team** to keep a JSON backup.
- Each person's **personal link** carries their details in the URL fragment (`#s=…`). The fragment never reaches the server, so nobody's data is stored on Vercel.
- Signatures use tables and inline styles only, so they render the same in Gmail, Outlook (new, classic and web), Apple Mail and iOS Mail.

## Logo and icons
The hello pepper logo ships in `assets/logo.png` (400×69, transparent; `assets/logo-transparent.png` is the same file). Each signature sits in a white card with generous padding, so the logo and text stay on white in dark-mode inboxes. The app points signatures at the hosted logo automatically once deployed. A custom logo must be a public **https PNG**: Gmail and Outlook strip SVGs, embedded images and Google Drive links.

## Deploy
Hosted on Vercel (team `hello-pepper`, project `email-signature-creator`) at https://email-signature-creator-weld.vercel.app. Every push to `main` deploys to production automatically; other branches get preview URLs.
