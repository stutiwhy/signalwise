// src\modules\yc\sync.ts
import { fetchJobsPage } from "./algolia";
import { importJobHit } from "./importer";

export async function syncYC() {
  for (let page = 0; page < 10; page++) {
    console.log(`page ${page}`);

    const jobs = await fetchJobsPage(page);

    for (const job of jobs) {
      await importJobHit(job);
    }

    console.log(`imported ${jobs.length} jobs`);
  }

  console.log("YC sync complete");
}