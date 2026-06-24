// src\modules\yc\algolia.ts
import "dotenv/config"

const ALGOLIA_URL = process.env.ALGOLIA_URL!;

const APP_ID = process.env.ALGOLIA_APP_ID!;
const API_KEY = process.env.ALGOLIA_API_KEY!;

export async function fetchJobsPage(page: number) {
  const response = await fetch(ALGOLIA_URL, {
    method: "POST",
    headers: {
      "x-algolia-application-id": APP_ID,
      "x-algolia-api-key": API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          indexName:
            "WaaSPublicCompanyJob_created_at_desc_production",
          params: new URLSearchParams({
            query: "",
            page: String(page),
            hitsPerPage: "100",
          }).toString(),
        },
      ],
    }),
  });

  const json = await response.json();

  return json.results[0].hits;
}