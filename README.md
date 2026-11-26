# Pepper Signature Studio

A single-page tool for creating and handing out email signatures for hellopepper.com (Google Workspace).

- `index.html` is the whole app: plain HTML and JS, no build step.
- The team roster is saved in the admin's browser (localStorage). Use **Distribute & backup → Export team** to keep a JSON backup.
- Each person's **personal link** carries their details in the URL fragment (`#s=…`). The fragment never reaches the server, so nobody's data is stored on Vercel.
- Signatures use tables and inline styles only, so they render the same in Gmail, Outlook (new, classic and web), Apple Mail and iOS Mail.

## Logo and icons
Host the logo as a public **https PNG** (2× the display width). Gmail and Outlook strip SVGs, embedded images and Google Drive links. You can commit it to `public/` in this repo and use `https://<your-vercel-domain>/logo.png`.

## Deploy
Hosted on Vercel as a static site, with automatic deploys from `main`.
