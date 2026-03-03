import RssParser from 'rss-parser';
// フィード取得テスト
import { describe, expect, it } from 'vitest';
import { exponentialBackoff } from '../../src/feed/common-util';
import { FEED_INFO_LIST, type FeedInfo } from '../../src/resources/feed-info-list';

const REQUEST_TIMEOUT_MS = 30 * 1000;
const TEST_TIMEOUT_MS = 90 * 1000;
const FETCH_RETRIES = 3;

const rssParser = new RssParser({
  maxRedirects: 0,
  timeout: REQUEST_TIMEOUT_MS,
});

describe('フィードが取得可能', () => {
  FEED_INFO_LIST.map((feedInfo: FeedInfo) => {
    const testTitle = `${feedInfo.label} / ${feedInfo.url}`;
    it.concurrent(
      testTitle,
      async () => {
        const feed = await exponentialBackoff(
          async () => rssParser.parseURL(feedInfo.url),
          3000,
          FETCH_RETRIES,
        );
        expect(feed.items.length).toBeGreaterThanOrEqual(0);
      },
      TEST_TIMEOUT_MS,
    );
  });
});
