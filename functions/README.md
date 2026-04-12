# Functions Deployment

These handlers are the repo-owned source of truth for the merged `ybial` backend.

## Required environment variables

Set these in Google Cloud Functions:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APP_URL`
- `REVIEW_TOKEN_SECRET`

Set these for `booking-lifecycle`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## Deploy commands

From this folder:

```bash
npm install
npm run deploy:booking-lifecycle
npm run deploy:reminder-dispatcher
npm run deploy:order-lifecycle
```
