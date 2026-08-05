## What does Influencer Brand Fit Evaluator do?

**Influencer Brand Fit Evaluator** scores any Instagram or TikTok creator against your own campaign requirements and returns a criterion-by-criterion verdict with written reasoning, summary counts, and an overall fit percentage. You write the criteria in plain English — location history, age range, follower floor, content tone, brand-safety rules — and get back a structured, machine-readable answer for each one.

It evaluates one creator per run. To score a roster, run it once per handle (or in parallel via the API).

## Why evaluate influencer brand fit?

- **Vet creators before you reach out**: Screen a shortlist against your brand guidelines in minutes instead of reading through profiles by hand.
- **Make the criteria explicit**: Location history, age range, audience size, engagement quality, and tone become named checks with a pass/partial/fail verdict, not a gut call.
- **Reduce campaign waste**: Catch misaligned creators before a contract, not after the first post.
- **Automate the workflow**: Pipe fit scores straight into your CRM, n8n workflow, or marketing dashboard through the Apify API.

## What data does Influencer Brand Fit Evaluator return?

| Field | Type | Description |
|-------|------|-------------|
| `brandFitId` | String | Unique ID for this brand fit analysis |
| `evaluationId` | String | ID of the underlying influencer evaluation — reusable in later runs |
| `influencerId` | String | Internal identifier for the evaluated creator |
| `handle` | String | Creator's social media handle |
| `platform` | String | `instagram` or `tiktok` |
| `brandName` | String | Brand the analysis was run for |
| `fitScore` | Number | Overall fit percentage, 0–100 |
| `summary` | Object | Criteria counts: `totalCriteria`, `metFully`, `metPartially`, `notMet`, `unknown` |
| `evaluation` | Array | One entry per criterion, each with `criterion`, `fitLevel`, and `reasoning` |
| `processingTimeSecs` | Number | How long the analysis took |
| `updatedAt` | String | ISO 8601 timestamp of the result |

## How to evaluate an influencer against your brand criteria

1. [Create a free Apify account](https://apify.com) if you don't have one.
2. Open **Influencer Brand Fit Evaluator** and click **Try for free**.
3. Enter your **Brand Name** and your **Brand Fit Criteria** — one requirement per line.
4. Enter an **Influencer Handle** (for example `natgeo`) and pick the **Platform**.
5. Click **Start**, then download the result from the **Dataset** tab as JSON, CSV, Excel, or HTML.

Already evaluated this creator? Paste the `evaluationId` from that earlier run instead of the handle — the evaluator reuses the existing profile analysis and skips straight to scoring your criteria.

## How much does it cost?

Pay-per-event pricing. You are charged for completed work, not for runtime, and a failed run charges nothing for the analysis.

Two things can be charged in a run:

- **Brand fit analysis** — charged once, when the analysis completes successfully.
- **Influencer evaluation** — charged only when you supply a handle with no `evaluationId`, so a full profile evaluation has to run first. Supply an `evaluationId` and this is skipped entirely.

Reusing an `evaluationId` across several sets of criteria is the cheapest way to test different campaign briefs against the same creator. Current per-event prices, including the discounts on paid Apify plans, are on the **Pricing** tab.

## Input

See the **Input** tab for the full schema. Key fields:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `brandName` | String | required | Your brand or company name (1–100 characters) |
| `criteria` | String | required | Your requirements, one per line (10–10,000 characters) |
| `influencerHandle` | String | optional | Handle such as `natgeo` or `@natgeo`. Required unless `evaluationId` is given |
| `platform` | String | `instagram` | `instagram` or `tiktok` |
| `evaluationId` | String | optional | Evaluation ID from an earlier run. Skips re-evaluating the creator |

### Example input

```json
{
  "brandName": "Nightly Traffic",
  "criteria": "Must have lived in Dallas for >3 years.\nIs younger than 35.\nHas more than 10K followers.",
  "influencerHandle": "natgeo",
  "platform": "instagram"
}
```

## Output

Results are saved to the **Dataset** tab and download as JSON, CSV, Excel, or HTML.

Each item includes:

- **Identity**: brandFitId, evaluationId, influencerId, handle, platform, brandName
- **Scoring**: fitScore, summary counts by fit level
- **Detail**: evaluation array with the verdict and reasoning for every criterion
- **Metadata**: processingTimeSecs, updatedAt

### Sample output

```json
{
  "brandFitId": "brand_fit_1785937214781563018",
  "evaluationId": "eval_1784682550964999395",
  "influencerId": "natgeo",
  "handle": "natgeo",
  "platform": "instagram",
  "brandName": "Nightly Traffic",
  "fitScore": 33.33,
  "summary": {
    "totalCriteria": 3,
    "metFully": 1,
    "metPartially": 0,
    "notMet": 2,
    "unknown": 0
  },
  "evaluation": [
    {
      "criterion": "Must have lived in Dallas for >3 years.",
      "fitLevel": "not_met",
      "reasoning": "National Geographic is a global media organization headquartered in Washington, D.C. since 1888, rather than an individual person. It has no history of being located in Dallas."
    },
    {
      "criterion": "Is younger than 35.",
      "fitLevel": "not_met",
      "reasoning": "National Geographic is a long-standing corporate brand and scientific institution founded in 1888, over 130 years old."
    },
    {
      "criterion": "Has more than 10K followers.",
      "fitLevel": "met_fully",
      "reasoning": "The National Geographic account significantly exceeds the requirement, currently reaching over 268 million followers worldwide."
    }
  ],
  "processingTimeSecs": 23.48,
  "updatedAt": "2026-08-05T13:40:38.426Z"
}
```

## Tips

- Put one requirement per line. A single criterion bundling three conditions gets one verdict and one score slot, which blurs the result.
- Make criteria checkable from public information. "Has more than 10K followers" scores cleanly; "would enjoy our product" comes back as `unknown`.
- Save the `evaluationId` from each run. Reusing it to test another set of criteria against the same creator is both faster and cheaper.
- `unknown` means the evidence wasn't there, not that the creator failed. It scores as zero, so several `unknown` verdicts drag the percentage down — read the reasoning before rejecting anyone.

## FAQ

### How is the fit score calculated?

Each criterion is worth a share of the total: `met_fully` counts as 1, `met_partially` as 0.5, and `not_met` and `unknown` as 0. The score is the sum of those points divided by `totalCriteria`, times 100. Three criteria scored one `met_fully` and two `not_met` gives 33.33%.

### Can I evaluate TikTok creators as well as Instagram?

Yes. Set `platform` to `instagram` or `tiktok`.

### Can I score several influencers at once?

Each run evaluates one creator. Start one run per handle — through the **API** tab or a scheduled task — and the results collect in separate datasets.

### What does `evaluationId` actually save me?

The creator's profile evaluation is the expensive half of the work. Once it exists, any number of different brand criteria can be scored against it without redoing it, so pass the ID back in for follow-up runs.

### Is this legal?

The evaluator only uses publicly available profile and content information. Check the platform's Terms of Service and make sure you have a legitimate purpose for the analysis.

## Support

- Bugs / feature requests → **Issues** tab
- Programmatic access → **API** tab

> **Disclaimer**: Our Actors are ethical and do not extract any private user data, such as email addresses, gender, or location. They only extract what the user has chosen to share publicly. We therefore believe that our Actors, when used for ethical purposes by Apify users, are safe. However, you should be aware that your results could contain personal data. Personal data is protected by the GDPR in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers.
