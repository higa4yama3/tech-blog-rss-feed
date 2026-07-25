import { describe, expect, it } from 'vitest';
import { FeedGenerator } from '../src/feed/feed-generator';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';

const createItem = (overrides: Partial<EnrichedFeedItem> = {}): EnrichedFeedItem => ({
  title: 'TypeScript 5.9 Released',
  link: 'https://example.com/typescript-5-9',
  guid: 'https://example.com/typescript-5-9',
  isoDate: '2026-07-25T10:00:00.000Z',
  pubDate: '2026-07-25T10:00:00.000Z',
  blogTitle: 'Hacker News',
  blogLink: 'https://news.ycombinator.com/',
  sourceTier: 'signal',
  sourceLabel: 'Hacker News',
  sourceTags: ['news'],
  contentFormat: 'default',
  hnPoints: 123,
  hnComments: 45,
  ...overrides,
});

describe('FeedGenerator', () => {
  it('Headlines の Hacker News タイトルに元記事タイトルを含める', () => {
    const generator = new FeedGenerator();
    const hackerNewsItem = createItem();

    const bundle = generator.generateFeedBundle([hackerNewsItem], new Map(), new Map(), {
      core: [],
      media: [],
      picks: [],
      discover: [],
      headlines: [hackerNewsItem],
      research: [],
      curated: [],
      hatenaIt: [],
    });

    const headlinesFeed = JSON.parse(bundle.headlines.json) as { items: Array<{ title: string }> };

    expect(headlinesFeed.items[0].title).toContain('TypeScript 5.9 Released');
  });
});
