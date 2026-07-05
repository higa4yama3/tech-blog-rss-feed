import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchHatenaCountMap } from '../src/feed/common-util';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { FeedCrawler, type FeedItemHatenaCountMap } from '../src/feed/feed-crawler';

vi.mock('../src/feed/common-util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/feed/common-util')>();
  return {
    ...actual,
    fetchHatenaCountMap: vi.fn(),
  };
});

const createFeedItem = (link: string): EnrichedFeedItem =>
  ({
    link,
    isoDate: new Date().toISOString(),
    title: link,
    blogTitle: 'test blog',
    blogLink: 'https://example.com/',
    sourceTier: 'core',
    sourceLabel: 'test',
    sourceTags: [],
    contentFormat: 'default',
  }) as EnrichedFeedItem;

type TestableFeedCrawler = {
  fetchHatenaCountMap(feedItems: EnrichedFeedItem[]): Promise<FeedItemHatenaCountMap>;
};

describe('FeedCrawler', () => {
  beforeEach(() => {
    vi.mocked(fetchHatenaCountMap).mockReset();
  });

  it('はてな件数APIの一部失敗で生成処理全体を落とさない', async () => {
    const firstBatchLinks = Array.from({ length: 50 }, (_, index) => `https://example.com/${index}`);
    const secondBatchLink = 'https://example.com/survives';
    const feedItems = [...firstBatchLinks, secondBatchLink].map(createFeedItem);

    vi.mocked(fetchHatenaCountMap)
      .mockRejectedValueOnce(new Error('hatena API unavailable'))
      .mockResolvedValueOnce({ [secondBatchLink]: 3 });

    const crawler = new FeedCrawler() as unknown as TestableFeedCrawler;
    const hatenaCountMap = await crawler.fetchHatenaCountMap(feedItems);

    expect(hatenaCountMap).toEqual(new Map([[secondBatchLink, 3]]));
  });
});
