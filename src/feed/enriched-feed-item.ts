import type { FeedTier } from '../resources/feed-tier';
import type { TopicId } from '../resources/interest-profile';
import type { CustomRssParserItem } from './feed-crawler';

export type EnrichedFeedItem = CustomRssParserItem & {
  sourceTier: FeedTier;
  sourceLabel: string;
  sourceTags: string[];
  sourceTopics: TopicId[];
  contentFormat: 'default' | 'longread';
};

export const enrichFeedItem = (
  item: CustomRssParserItem,
  sourceTier: FeedTier,
  sourceLabel: string,
  sourceTags: string[] = [],
  contentFormat: 'default' | 'longread' = 'default',
  sourceTopics: TopicId[] = [],
): EnrichedFeedItem => ({
  ...item,
  sourceTier,
  sourceLabel,
  sourceTags,
  sourceTopics,
  contentFormat,
});
