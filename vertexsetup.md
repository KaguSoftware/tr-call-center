# Vertex AI Setup

## 1. Create the GCP project

- Go to https://console.cloud.google.com/projectcreate
- Name it something like `kagu-turk-call` (the project ID auto-generates, e.g. `kagu-turk-call-xxxxx` — note it down, that's your `GOOGLE_CLOUD_PROJECT`)
- Pick your billing account when prompted (or link one after via **Billing → Link a billing account**)

## 2. Enable the Vertex AI API

- In the new project, go to https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
- Click **Enable**

## 3. Create a service account

For server-side auth, which is what `lib/ai.ts` uses.

- Go to **IAM & Admin → Service Accounts → Create Service Account**
- Name: e.g. `vertex-ai-runner`
- Grant it role: **Agent Platform User** (`roles/aiplatform.user`) — least privilege needed to call the API
  - *(Formerly called "Vertex AI User" — Google renamed Vertex AI to the Gemini Enterprise Agent Platform at Cloud Next 2026. Same role ID, new display name.)*
- Skip the optional "grant users access" step
- Click into the new service account → **Keys** tab → **Add Key → Create new key → JSON** → downloads a `.json` file

## 4. Wire the credentials into the app

Two ways, matching what `lib/ai.ts` already supports:

- **Local dev**: set `GOOGLE_APPLICATION_CREDENTIALS=./path-to-key.json` in `.env.local` (keep the file out of git — check `.gitignore`)
- **Vercel/production**: paste the entire JSON file contents as one env var `GOOGLE_CREDENTIALS_JSON` in Vercel's project settings (Environment Variables)

## 5. Set the project/location env vars

```
GOOGLE_CLOUD_PROJECT=kagu-turk-call-xxxxx   # the actual project ID from step 1
GOOGLE_CLOUD_LOCATION=us-central1
```

## 6. Budget safety net

- **Billing → Budgets & alerts** → create a budget scoped to this project, set alert thresholds (e.g. 50% / 90% / 100%)
- Optionally **IAM & Admin → Quotas**, filter to `aiplatform.googleapis.com`, cap requests/day if you want a hard ceiling
