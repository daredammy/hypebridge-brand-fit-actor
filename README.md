## What does HypeBridge Influencer Brand Fit Analysis do?

**HypeBridge Influencer Brand Fit Analysis** automatically assesses whether any Instagram or TikTok influencer matches your campaign requirements. Instead of manually reviewing profiles, analyzing posts, and guessing demographic alignment, this tool provides instant criterion-by-criterion fit assessments, detailed reasoning, summary counts, and an overall percentage fit score.

Whether you are vetting creators for a regional launch, auditing brand safety, or matching influencers to specific demographic criteria, HypeBridge provides instant, objective brand fit intelligence.

## Why analyze influencer brand fit?

- **Streamline Creator Selection**: Instantly vet dozens of creators against custom brand requirements before reaching out.
- **Data-Driven Campaign Matching**: Evaluate specific criteria such as location history, age range, audience concentration, engagement quality, and tone.
- **Reduce Campaign Waste**: Avoid signing influencers who don't align with your core target market or brand values.
- **Automate Marketing Workflows**: Integrate brand fit scoring into your CRM, n8n workflows, or internal marketing dashboards via the Apify API.

## What data can HypeBridge Influencer Brand Fit Analysis extract?

| Field | Type | Description |
|-------|------|-------------|
| `brandFitId` | String | Unique evaluation ID for this brand fit analysis |
| `evaluationId` | String | Underlying evaluation record ID |
| `handle` | String | Influencer social media handle |
| `platform` | String | Social platform (`instagram` or `tiktok`) |
| `brandName` | String | Name of the brand conducting the fit analysis |
| `fitScore` | Number | Calculated overall fit percentage (0 to 100%) |
| `summary` | Object | Counts of criteria status (`metFully`, `metPartially`, `notMet`, `unknown`) |
| `evaluation` | Array | Detailed assessment per criterion with `fitLevel` and `reasoning` |
| `processingTimeSecs` | Number | Execution time in seconds |

## How to evaluate influencer brand fit

1. [Create a free Apify account](https://apify.com) if you don't have one.
2. Open **HypeBridge Influencer Brand Fit Analysis** and click **Try for free**.
3. Enter your **Brand Name** and your custom **Brand Fit Criteria**.
4. Enter an **Influencer Handle** (e.g. `natgeo`) OR an existing **Evaluation ID**.
5. Click **Start** and download your structured evaluation results from the **Dataset** tab (JSON, CSV, Excel).

## How much will it cost?

Pay-per-result pricing — charged per completed brand fit analysis, not per compute unit.

| Plan | Price per evaluation | Approx. evaluations |
|------|----------------------|----------------------|
| Free Trial | $1.50 / event | ~3 free evaluations |
| Starter ($49/mo) | $1.50 / event | ~32 evaluations included |
| Scale ($499/mo) | $1.50 / event | ~332 evaluations included |

## Input

See the **Input** tab for full schema. Key fields:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `brandName` | String | required | Name of your brand or company (1–100 chars). |
| `criteria` | String | required | Custom list of requirements or questions (10–10,000 chars). |
| `influencerHandle` | String | optional | Social handle (e.g. `natgeo`). Required if `evaluationId` is omitted. |
| `platform` | String | `instagram` | Social platform (`instagram` or `tiktok`). |
| `evaluationId` | String | optional | Existing evaluation ID to skip handle re-evaluation. |

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

Results are saved to the **Dataset** tab. Download as JSON, CSV, Excel, or HTML.

Each output item includes:
- **Brand Info**: brandName, handle, platform, brandFitId, evaluationId
- **Scoring**: fitScore percentage (0–100), summary breakdown
- **Detailed Criteria Assessments**: array of individual criteria evaluations with reasoning

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

- Format your criteria clearly as distinct bullet points or separate lines for optimal AI evaluation accuracy.
- If you already evaluated an influencer previously, pass their `evaluationId` directly to save time.

## FAQ

### How does HypeBridge score the brand fit percentage?

The fit score is calculated directly from the criteria breakdown:
$$\text{Fit Score} = \frac{\text{metFully} + (0.5 \times \text{metPartially})}{\text{totalCriteria}} \times 100$$
Each criterion is evaluated as `met_fully` (1.0), `met_partially` (0.5), `not_met` (0), or `unknown` (0).

### Can I evaluate both Instagram and TikTok influencers?

Yes! Simply set the `platform` parameter to `instagram` or `tiktok`.

## Support

- Bugs / feature requests → **Issues** tab
- Programmatic integration → **API** tab

> **Disclaimer**: Our Actors are ethical and do not extract any private user data, such as password hashes or private messages. They only analyze publicly available social media profile and audience information. You should ensure your use of social data complies with applicable privacy laws such as GDPR and CCPA.
