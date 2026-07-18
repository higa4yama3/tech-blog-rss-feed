import { describe, expect, it } from 'vitest';
import { FeedCrawler } from '../src/feed/feed-crawler';
import { FEED_INFO_LIST } from '../src/resources/feed-info-list';

// 設定のテスト
describe('FEED_INFO_LIST', () => {
  it('FEED_INFO_LIST の設定が正しい', () => {
    expect(() => {
      FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
    }).not.toThrow();
  });

  it('既存の ITmedia AI＋ フィードを維持する', () => {
    expect(FEED_INFO_LIST).toContainEqual(
      expect.objectContaining({
        label: 'ITmedia AI＋',
        url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml',
      }),
    );
  });
});
