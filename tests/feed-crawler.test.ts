import { describe, expect, it, vi } from 'vitest';
import { FeedCrawler, type CustomRssParserFeed } from '../src/feed/feed-crawler';
import type { FeedInfo } from '../src/resources/feed-info-list';

type FeedCrawlerInternals = {
  aggregateFeeds: (feeds: CustomRssParserFeed[], feedInfoList: FeedInfo[]) => unknown[];
};

const buildFeedInfo = (label: string, tier: FeedInfo['tier']): FeedInfo => ({
  label,
  url: `https://${label.toLowerCase()}.example.com/feed.xml`,
  tier,
});

const buildFeed = (label: string, isoDate: string): CustomRssParserFeed =>
  ({
    title: `${label} feed`,
    link: `https://${label.toLowerCase()}.example.com`,
    sourceLabel: label,
    sourceTier: 'core',
    items: [
      {
        title: `${label} item`,
        link: `https://${label.toLowerCase()}.example.com/item`,
        isoDate,
        blogTitle: `${label} feed`,
        blogLink: `https://${label.toLowerCase()}.example.com`,
      },
    ],
  }) as CustomRssParserFeed;

describe('FeedCrawler', () => {
  it('既定購読面のフィードは従来と同じ8日間の記事を集約対象に残す', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T12:00:00.000Z'));

    try {
      const crawler = new FeedCrawler() as unknown as FeedCrawlerInternals;
      const sevenDaysAgo = '2026-07-07T12:00:00.000Z';
      const feeds = [buildFeed('Core', sevenDaysAgo), buildFeed('Media', sevenDaysAgo)];
      const feedInfoList = [buildFeedInfo('Core', 'core'), buildFeedInfo('Media', 'media')];

      const items = crawler.aggregateFeeds(feeds, feedInfoList);

      expect(items).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
