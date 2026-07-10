import { describe, expect, it } from 'vitest';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { FeedGenerator } from '../src/feed/feed-generator';

const createFeedItem = (overrides: Partial<EnrichedFeedItem> = {}): EnrichedFeedItem => ({
  title: 'A & B < C > D',
  link: 'https://example.com/articles/a-b',
  guid: 'article-a-b',
  isoDate: '2026-07-10T12:00:00.000Z',
  blogTitle: 'Engineering & Product',
  blogLink: 'https://example.com/blog',
  summary: 'Use A & B < C > D safely.',
  contentSnippet: 'Use A & B < C > D safely.',
  categories: ['R&D'],
  creator: 'Alice & Bob',
  sourceTier: 'essential',
  sourceLabel: 'Example & Co',
  sourceTags: [],
  contentFormat: 'default',
  ...overrides,
});

describe('FeedGenerator', () => {
  it('preserves raw text in JSON feed fields', () => {
    const feedGenerator = new FeedGenerator();

    const result = feedGenerator.generateFeeds([createFeedItem()], new Map(), new Map(), 200, 500);
    const jsonFeed = JSON.parse(result.feedDistributionSet.json);

    expect(jsonFeed.items[0].title).toBe('A & B < C > D | Engineering & Product');
    expect(jsonFeed.items[0].content_html).toBe('Use A & B < C > D safely.');
    expect(jsonFeed.items[0]._custom.originalTitle).toBe('A & B < C > D');
    expect(jsonFeed.items[0]._custom.blogTitle).toBe('Engineering & Product');
    expect(jsonFeed.items[0]._custom.sourceLabel).toBe('Example & Co');
  });

  it('preserves raw text inside Atom CDATA fields', () => {
    const feedGenerator = new FeedGenerator();

    const result = feedGenerator.generateFeeds([createFeedItem()], new Map(), new Map(), 200, 500);

    expect(result.feedDistributionSet.atom).toContain('<![CDATA[A & B < C > D | Engineering & Product]]>');
    expect(result.feedDistributionSet.atom).toContain('<![CDATA[Use A & B < C > D safely.]]>');
  });
});
