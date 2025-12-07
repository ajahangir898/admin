<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rLLRnE1S_N6jHy3zo2t2WrjU1we-qlUe

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Seed Firebase admin users

Use the Firebase Admin SDK script to ensure that every dashboard admin has a real Auth account (and is linked to its tenant document).

1. Provide Firebase Admin credentials via `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY` (or set `FIREBASE_ADMIN_CREDENTIAL=application` and rely on `GOOGLE_APPLICATION_CREDENTIALS`).
2. Edit `server/adminUsers.json` (auto-created from the sample on first run) with the admin emails, passwords, display names, and optional `tenantId` / `role`.
3. Execute `npm run seed:admins` to create/update the Auth users and sync `tenants` documents with their `adminAuthUid`.
