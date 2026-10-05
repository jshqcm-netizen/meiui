#!/usr/bin/env node
import { loadAllContent } from '../lib/content';

async function main(): Promise<void> {
  const entries = await loadAllContent();
  const counts = { draft: 0, review: 0, published: 0 };
  for (const entry of entries) counts[entry.status]++;
  console.log(`Content check passed: ${entries.length} files (${counts.published} published, ${counts.review} review, ${counts.draft} draft).`);
  console.log('Validated schema, safe Markdown, links, local media and filenames. Only published files reach public routes/search.');
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
