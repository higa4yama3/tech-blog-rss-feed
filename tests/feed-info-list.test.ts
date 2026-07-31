import { describe, expect, it } from 'vitest';
import { FeedCrawler } from '../src/feed/feed-crawler';
import { FEED_INFO_BY_LABEL, FEED_INFO_LIST } from '../src/resources/feed-info-list';

// 設定のテスト
describe('FEED_INFO_LIST', () => {
  it('FEED_INFO_LIST の設定が正しい', () => {
    expect(() => {
      FeedCrawler.validateFeedInfoList(FEED_INFO_LIST);
    }).not.toThrow();
  });

  it('移行済みソースのフィードURLが現在の配信元を指している', () => {
    expect(FEED_INFO_BY_LABEL.get('AI Shift')?.url).toBe('https://zenn.dev/p/aishift/feed');
    expect(FEED_INFO_BY_LABEL.get('Preferred Networks')?.url).toBe('https://tech.preferred.jp/ja/blog/feed');
    expect(FEED_INFO_BY_LABEL.get('エクサウィザーズ')?.url).toBe('https://zenn.dev/exawizards/feed');
  });
});
