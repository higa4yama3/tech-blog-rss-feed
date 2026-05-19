import type { FeedTier } from '../resources/feed-tier';
import type { CustomRssParserItem } from './feed-crawler';

export type EnrichedFeedItem = CustomRssParserItem & {
  sourceTier: FeedTier;
  sourceLabel: string;
  sourceTags: string[];
  contentFormat: 'default' | 'longread';
};

export const enrichFeedItem = (
  item: CustomRssParserItem,
  sourceTier: FeedTier,
  sourceLabel: string,
  sourceTags: string[] = [],
  contentFormat: 'default' | 'longread' = 'default',
): EnrichedFeedItem => ({
  ...item,
  sourceTier,
  sourceLabel,
  sourceTags,
  contentFormat,
});
