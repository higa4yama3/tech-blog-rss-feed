import { describe, expect, it } from 'vitest';
import constants from '../src/common/constants';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { FeedGenerator } from '../src/feed/feed-generator';

const createFeedItem = (title: string, sourceTier: EnrichedFeedItem['sourceTier']): EnrichedFeedItem => ({
  title,
  link: `https://example.com/articles/${sourceTier}`,
  guid: `https://example.com/articles/${sourceTier}`,
  isoDate: '2026-07-22T00:00:00.000Z',
  blogTitle: `${sourceTier} Blog`,
  blogLink: `https://${sourceTier}.example.com/`,
  summary: `${title} summary`,
  sourceTier,
  sourceLabel: `${sourceTier} source`,
  sourceTags: [],
  contentFormat: 'default',
});

describe('FeedGenerator', () => {
  it('keeps every crawled item in the backward-compatible feed', () => {
    const feedGenerator = new FeedGenerator();
    const coreItem = createFeedItem('Core article', 'core');
    const researchItem = createFeedItem('Research article', 'research');
    const allItems = [coreItem, researchItem];

    const bundle = feedGenerator.generateFeedBundle(allItems, new Map(), new Map(), {
      core: [coreItem],
      media: [],
      picks: [],
      discover: [],
      headlines: [],
      research: [researchItem],
      curated: [],
      hatenaIt: [],
    });

    const legacyJson = JSON.parse(bundle.feedDistributionSet.json);
    const coreJson = JSON.parse(bundle.core.json);

    expect(legacyJson.feed_url).toBe(constants.feedUrls.json);
    expect(legacyJson.items.map((item: { title: string }) => item.title)).toEqual([
      'Core article | core Blog',
      'Research article | research Blog',
    ]);
    expect(coreJson.items.map((item: { title: string }) => item.title)).toEqual(['Core article | core Blog']);
  });
});
