# Pepper Signature Studio

A single-page tool for creating and handing out email signatures for hellopepper.com (Google Workspace).

- `index.html` is the whole app: plain HTML and JS, no build step.
- The team roster is saved in the admin's browser (localStorage). Use **Distribute & backup → Export team** to keep a JSON backup.
- Each person's **personal link** carries their details in the URL fragment (`#s=…`). The fragment never reaches the server, so nobody's data is stored on Vercel.
- Signatures use tables and inline styles only, so they render the same in Gmail, Outlook (new, classic and web), Apple Mail and iOS Mail.

## Logo and icons
The hello pepper logo ships in `assets/logo.png` (on a white background so it stays readable in dark-mode inboxes; the transparent original is `assets/logo-transparent.png`). The app points signatures at it automatically once deployed. A custom logo must be a public **https PNG**: Gmail and Outlook strip SVGs, embedded images and Google Drive links.

## Deploy
Hosted on Vercel as a static site, with automatic deploys from `main`.
