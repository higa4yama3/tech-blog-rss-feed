import { describe, expect, it } from 'vitest';
import constants from '../src/common/constants';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { FeedGenerator } from '../src/feed/feed-generator';

const feedItem: EnrichedFeedItem = {
  title: 'Test article',
  link: 'https://example.com/articles/test',
  guid: 'https://example.com/articles/test',
  isoDate: '2026-07-07T00:00:00.000Z',
  blogTitle: 'Example Blog',
  blogLink: 'https://example.com/',
  summary: 'A test article summary.',
  sourceTier: 'core',
  sourceLabel: 'Example',
  sourceTags: [],
  contentFormat: 'default',
};

const generateBundle = () => {
  const feedGenerator = new FeedGenerator();
  const coreItems = [feedItem];

  return feedGenerator.generateFeedBundle(coreItems, new Map(), new Map(), {
    core: coreItems,
    media: [],
    picks: [],
    discover: [],
    headlines: [],
    research: [],
    curated: [],
    hatenaIt: [],
  });
};

describe('FeedGenerator', () => {
  it('keeps legacy feed metadata on the backward-compatible distribution', () => {
    const bundle = generateBundle();

    expect(bundle.feedDistributionSet.atom).toContain(constants.feedUrls.atom);
    expect(bundle.feedDistributionSet.rss).toContain(constants.feedUrls.rss);
    expect(bundle.feedDistributionSet.json).toContain(constants.feedUrls.json);
  });

  it('uses core feed metadata only on the named core distribution', () => {
    const bundle = generateBundle();

    expect(bundle.core.atom).toContain(constants.feedUrls.core);
    expect(bundle.core.rss).toContain(constants.feedUrls.core.replace('.atom.xml', '.rss.xml'));
    expect(bundle.core.json).toContain(constants.feedUrls.core.replace('core.atom.xml', 'core.json'));
  });
});
