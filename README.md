# HypeBridge Influencer Brand Fit Analysis Actor

An AI-powered Apify actor that evaluates social media influencers against custom brand criteria using Gemini Pro with search grounding and code execution tools.

## Features

- **Custom Criteria Analysis**: Evaluate any Instagram or TikTok influencer against detailed brand guidelines (e.g. location, age, tone, engagement, content style).
- **Dual Input Modes**:
  - **Handle Mode**: Provide an `influencerHandle` (e.g. `natgeo`) + `brandName` + `criteria`. The actor automatically runs the influencer evaluation and performs the brand fit analysis.
  - **Direct Evaluation ID Mode**: Provide an existing `evaluationId` + `brandName` + `criteria` for instant brand fit analysis without re-evaluating the influencer.
- **Client-Side Pre-Flight Validation**: Validates all inputs and performs a pre-flight Firestore check on existing evaluation IDs to avoid wasting AI tokens on invalid or in-progress evaluations.
- **Structured Criterion-by-Criterion Results**: Returns detailed assessments (`met_fully`, `met_partially`, `not_met`, `unknown`), reasoning, summary statistics, and an overall percentage fit score.

---

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | string | **Yes** | Name of the brand or company (1–100 characters). |
| `criteria` | string | **Yes** | Detailed requirements/questions to evaluate against (10–10,000 characters). |
| `influencerHandle` | string | Optional* | Social media handle (e.g. `natgeo` or `@natgeo`). *Required if `evaluationId` is omitted. |
| `platform` | string | Optional | `instagram` (default) or `tiktok`. |
| `evaluationId` | string | Optional* | Existing evaluation ID from a previous run. *Required if `influencerHandle` is omitted. |

### Sample Input JSON

```json
{
  "brandName": "Nightly Traffic",
  "criteria": "Must have lived in Dallas for >3 years.\nWent to High School or College in target city.\nIs younger than 35.\nHas more than 10K followers.\nHas an engaging voice and authentic content style.",
  "influencerHandle": "natgeo",
  "platform": "instagram"
}
```

---

## Output Dataset Schema

Each item in the dataset contains:

```json
{
  "brandFitId": "brand_fit_1755622542227434030",
  "evaluationId": "eval_1755622542227434030",
  "influencerId": "inf_natgeo_instagram",
  "handle": "natgeo",
  "platform": "instagram",
  "brandName": "Nightly Traffic",
  "evaluation": [
    {
      "criterion": "Must have lived in Dallas for >3 years.",
      "fitLevel": "met_fully",
      "reasoning": "Influencer bio and tagged locations confirm continuous residence in Dallas since 2019."
    },
    {
      "criterion": "Is younger than 35.",
      "fitLevel": "met_partially",
      "reasoning": "Graduated college in 2018, estimated age is between 28 and 32."
    }
  ],
  "summary": {
    "totalCriteria": 5,
    "metFully": 3,
    "metPartially": 1,
    "notMet": 1,
    "unknown": 0
  },
  "fitScore": 70.0,
  "processingTimeSecs": 42.15,
  "updatedAt": "2026-08-05T08:12:00.000Z"
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HYPEBRIDGE_BACKEND_URL` | Base URL of HypeBridge Go backend service |
| `HYPEBRIDGE_APIFY_AUTH_KEY` | Secret key for HTTP header `X-Hypebridge-Service-Key` |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT` | Base64-encoded service account JSON |
| `TELEMETRY_ACTOR_NAME` | Set to `hypebridge-brand-fit` |
| `TELEMETRY_SERVICE_ACCOUNT` | Service account for telemetry collection |
