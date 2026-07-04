import axios from 'axios';
import ogs from 'open-graph-scraper';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeedCrawler } from '../src/feed/feed-crawler';
import type { FeedInfo } from '../src/resources/feed-info-list';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('open-graph-scraper', () => ({
  default: vi.fn(),
}));

const mockedAxios = vi.mocked(axios);
const mockedOgs = vi.mocked(ogs);

const createHackerNewsFeed = (pubDate: string) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:hn="https://hnrss.github.io/">
  <channel>
    <title>Hacker News: Front Page</title>
    <link>https://news.ycombinator.com/</link>
    <description>Hacker News RSS</description>
    <item>
      <title>HN item title</title>
      <link>https://example.com/story</link>
      <guid isPermaLink="false">https://news.ycombinator.com/item?id=123</guid>
      <pubDate>${pubDate}</pubDate>
      <comments>https://news.ycombinator.com/item?id=123</comments>
      <hn:points>148</hn:points>
      <hn:comments>67</hn:comments>
    </item>
  </channel>
</rss>`;

describe('FeedCrawler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('Hacker News の名前空間付きメタデータを取得する', async () => {
    const feedInfo: FeedInfo = {
      label: 'Hacker News',
      url: `https://hnrss.org/frontpage?unit=${crypto.randomUUID()}`,
      tier: 'signal',
      tags: ['news'],
    };
    const feedXml = createHackerNewsFeed(new Date().toUTCString());
    const fetchMock = vi.fn(async () => new Response(feedXml, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    mockedAxios.get.mockResolvedValue({ data: {} });
    mockedOgs.mockResolvedValue({ result: {} });

    const result = await new FeedCrawler().crawlFeeds([feedInfo], 1, 1);

    expect(result.feedItems).toHaveLength(1);
    expect(result.feedItems[0].hnPoints).toBe(148);
    expect(result.feedItems[0].hnComments).toBe(67);
  });
});
