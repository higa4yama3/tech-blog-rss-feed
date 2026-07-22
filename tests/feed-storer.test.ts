import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FeedStorer } from '../src/feed/feed-storer';
import type { GenerateFeedBundleResult } from '../src/feed/feed-generator';

const emptyDistribution = {
  atom: '',
  rss: '',
  json: '',
};

describe('FeedStorer', () => {
  it('writes the backward-compatible distribution to the legacy feed.json path', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'feed-storer-'));
    const feedDir = path.join(tempDir, 'feeds');
    const blogFeedDir = path.join(tempDir, 'blog-feeds');
    const bundle: GenerateFeedBundleResult = {
      core: { atom: '<core-atom />', rss: '<core-rss />', json: '{"name":"core"}' },
      media: emptyDistribution,
      picks: emptyDistribution,
      discover: emptyDistribution,
      headlines: emptyDistribution,
      research: emptyDistribution,
      curated: emptyDistribution,
      hatenaIt: emptyDistribution,
      aggregatedFeed: {} as GenerateFeedBundleResult['aggregatedFeed'],
      feedDistributionSet: {
        atom: '<legacy-atom />',
        rss: '<legacy-rss />',
        json: '{"name":"legacy"}',
      },
    };

    try {
      const feedStorer = new FeedStorer();

      await feedStorer.storeFeeds(bundle, feedDir, [], new Map(), new Map(), blogFeedDir);

      await expect(fs.readFile(path.join(feedDir, 'feed.json'), 'utf-8')).resolves.toBe('{"name":"legacy"}');
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
});
