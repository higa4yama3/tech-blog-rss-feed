import { describe, expect, it } from 'vitest';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { selectCuratedItems } from '../src/feed/feed-item-processor';

const createItem = (overrides: Partial<EnrichedFeedItem>): EnrichedFeedItem => ({
  title: '記事',
  link: 'https://example.com/articles/sample/',
  isoDate: '2026-07-13T00:00:00.000Z',
  blogTitle: 'Example',
  blogLink: 'https://example.com/',
  sourceTier: 'curated',
  sourceLabel: 'iDID',
  sourceTags: [],
  contentFormat: 'default',
  ...overrides,
});

describe('selectCuratedItems', () => {
  it('iDIDの今日のブクマ記事だけを選ぶ', () => {
    const bookmarkItem = createItem({
      link: 'https://idid.team/articles/todays-bookmark/2026-07-13/',
    });
    const eventItem = createItem({
      link: 'https://idid.team/articles/events/sync-design-innovation-in-site-2026-001/',
    });
    const otherSourceItem = createItem({
      link: 'https://example.com/articles/todays-bookmark/2026-07-13/',
      sourceLabel: 'Example',
    });

    expect(selectCuratedItems([bookmarkItem, eventItem, otherSourceItem])).toEqual([bookmarkItem]);
  });

  it('今日のブクマ記事がない場合、通常のiDID記事へフォールバックしない', () => {
    const eventItem = createItem({
      link: 'https://idid.team/articles/events/sync-design-innovation-in-site-2026-001/',
    });
    const interviewItem = createItem({
      link: 'https://idid.team/articles/interview/designer-2026/',
    });

    expect(selectCuratedItems([eventItem, interviewItem])).toEqual([]);
  });
});
