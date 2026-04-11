# YBIAL Agents

This package contains the AI agent layer for Your Business in a Link. It is a separate Node.js + TypeScript deployment unit from the main Next.js app.

## Agents

- `Onboarding Coach`: sends setup nudges and milestone emails.
- `Support Agent`: powers the owner dashboard chat widget and flags sensitive issues.
- `Churn Prevention Agent`: runs nightly, scores account health, and sends targeted re-engagement emails.
- `Business Advisor`: sends weekly data-driven insight emails.
- `Booking Chat Agent`: answers short pre-booking questions on the public booking page.

## Environment Variables

- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `APP_URL`
- `APP_NAME`
- `GOOGLE_CLOUD_PROJECT`
- `WEBHOOK_SECRET`
- `ESCALATION_EMAIL`

## Local Development

1. `cd ybial-agents`
2. `npm install`
3. Copy `.env.example` to `.env` and fill the secrets
4. `npm run build`
5. `npm test`

To run an individual agent locally, import it from `src/index.ts` and pass a mock context through `ts-node` or a small local script.

## Deploying Cloud Functions

- `npm run deploy:support`
- `npm run deploy:onboarding`
- `npm run deploy:churn`
- `npm run deploy:advisor`
- `npm run deploy:booking-chat`
- `npm run deploy:all`

## Google Cloud Scheduler

- `ybial-churn-nightly`: `0 2 * * *`
- `ybial-advisor-weekly`: `0 20 * * 0`
- `ybial-onboarding-no-service-check`: `0 * * * *`
- `ybial-onboarding-no-stripe-check`: `30 * * * *`

Each job should POST to the relevant function and include `WEBHOOK_SECRET` in the request body or auth header.

## Supabase Webhooks

Register the onboarding webhook against:

- new user signup
- first business row
- first service row
- first availability row
- Stripe onboarding completion
- first booking row

Point them to your deployed onboarding webhook URL and include the shared secret.

## Cost Estimates

- 100 businesses: low hundreds of support/chat calls and roughly tens of dollars per month if prompts stay cached and churn skips healthy accounts.
- 500 businesses: low hundreds per month depending on support volume and weekly advisor usage.
- 1000 businesses: keep batch processing for advisor emails and prompt caching enabled to stay efficient.

## Troubleshooting

- Missing Anthropic key: agent calls will fail. Check `ANTHROPIC_API_KEY`.
- Supabase auth failures: confirm the service role key, not the anon key, is configured.
- Duplicate emails: idempotency keys are set in the Resend helper. Check function retries and logs.
- Scheduler unauthorized: make sure the posted secret matches `WEBHOOK_SECRET`.
- Booking chat throttled: after 20 messages per session, the endpoint intentionally stops responding with AI output.
