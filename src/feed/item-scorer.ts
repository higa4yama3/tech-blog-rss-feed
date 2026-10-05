import dayjs from 'dayjs';
import type { FeedTier } from '../resources/feed-tier';
import {
  DULL_PATTERNS,
  EXCITEMENT_MAX_POINTS,
  EXCITEMENT_PATTERNS,
  FRESHNESS_HALF_LIFE_HOURS,
  SOCIAL_WEIGHT,
  TIER_WEIGHTS,
  TOPICS,
  TOPIC_BY_ID,
  type TopicId,
  UNTAGGED_TOPIC_WEIGHT,
} from '../resources/interest-profile';
import type { EnrichedFeedItem } from './enriched-feed-item';
import type { FeedItemHatenaCountMap } from './feed-crawler';

export interface ItemScore {
  score: number;
  topics: TopicId[];
  /** 加点の根拠。カードや RSS の「選んだ理由」に出す */
  signals: string[];
  /** 減点の根拠。表示はしないがチューニング用に出力に残す */
  penalties: string[];
  socialCount: number;
}

export interface ScoreOptions {
  now?: dayjs.Dayjs;
  halfLifeHours?: number;
}

// これ未満のはてブ数は選んだ理由として表示しない
const MIN_DISPLAY_SOCIAL_COUNT = 3;
// タイトル・カテゴリでトピックが決まらないときに見る本文の長さ
const TOPIC_FALLBACK_SNIPPET_LENGTH = 200;
// ニュース系は本文に話題外の語が混ざるので、本文でのトピック判定をしない
const TITLE_ONLY_TIERS: FeedTier[] = ['media', 'signal', 'hotentry'];

export const getHatenaCount = (item: EnrichedFeedItem, hatenaCountMap: FeedItemHatenaCountMap): number =>
  Math.max(item.hatenaBookmarkCountFromRss ?? 0, hatenaCountMap.get(item.link) ?? 0);

export const classifyTopics = (item: EnrichedFeedItem): TopicId[] => {
  const matchTopics = (text: string) => TOPICS.filter((topic) => topic.keywords.test(text)).map((topic) => topic.id);

  const headline = [item.title ?? '', ...(item.categories ?? [])].join(' ');
  let topics = matchTopics(headline);

  // 既定トピックがあるソースとニュース系は本文を見ない（映画ニュースの本文から技術トピックを拾ってしまう）
  if (topics.length === 0 && (item.sourceTopics ?? []).length === 0 && !TITLE_ONLY_TIERS.includes(item.sourceTier)) {
    const snippet = (item.contentSnippet || item.summary || '').slice(0, TOPIC_FALLBACK_SNIPPET_LENGTH);
    topics = matchTopics(snippet);
  }

  const merged = new Set<TopicId>([...(item.sourceTopics ?? []), ...topics]);
  // 表示順をプロファイルの定義順にそろえる
  return TOPICS.map((topic) => topic.id).filter((id) => merged.has(id));
};

export const scoreItem = (
  item: EnrichedFeedItem,
  hatenaCountMap: FeedItemHatenaCountMap,
  options: ScoreOptions = {},
): ItemScore => {
  const now = options.now ?? dayjs();
  const halfLifeHours = options.halfLifeHours ?? FRESHNESS_HALF_LIFE_HOURS;
  const title = item.title ?? '';

  const signals: string[] = [];
  const penalties: string[] = [];

  if (item.sourceTier === 'essential') {
    signals.push(`必読 · ${item.sourceLabel}`);
  }

  const hatenaCount = getHatenaCount(item, hatenaCountMap);
  const hnPoints = item.hnPoints ?? 0;
  // HN のポイントははてブより桁が出やすいので半分で換算する
  const socialCount = Math.max(hatenaCount, hnPoints / 2);
  if (hatenaCount >= MIN_DISPLAY_SOCIAL_COUNT) {
    signals.push(`はてブ${hatenaCount}`);
  }
  if (hnPoints >= MIN_DISPLAY_SOCIAL_COUNT) {
    signals.push(`HN ${hnPoints}pt`);
  }

  let excitementPoints = 0;
  for (const { label, pattern, points } of EXCITEMENT_PATTERNS) {
    if (pattern.test(title)) {
      excitementPoints += points;
      signals.push(label);
    }
  }

  let dullPoints = 0;
  for (const { label, pattern, points } of DULL_PATTERNS) {
    if (pattern.test(title)) {
      dullPoints += points;
      penalties.push(label);
    }
  }

  const topics = classifyTopics(item);
  const topicWeight =
    topics.length > 0
      ? Math.max(...topics.map((id) => TOPIC_BY_ID.get(id)?.weight ?? UNTAGGED_TOPIC_WEIGHT))
      : UNTAGGED_TOPIC_WEIGHT;

  const base = Math.max(
    0.2,
    1 + SOCIAL_WEIGHT * Math.log2(1 + socialCount) + Math.min(EXCITEMENT_MAX_POINTS, excitementPoints) + dullPoints,
  );
  const ageHours = Math.max(0, now.diff(dayjs(item.isoDate), 'hour', true));
  const freshness = 0.5 ** (ageHours / halfLifeHours);
  const score = base * TIER_WEIGHTS[item.sourceTier] * topicWeight * freshness;

  return {
    score: Math.round(score * 1000) / 1000,
    topics,
    signals,
    penalties,
    socialCount,
  };
};

/** 選んだ理由の短い文字列。加点がなければトピック名で代用する */
export const formatPickReason = (itemScore: ItemScore): string => {
  if (itemScore.signals.length > 0) {
    return itemScore.signals.slice(0, 3).join(' · ');
  }
  return itemScore.topics.map((id) => TOPIC_BY_ID.get(id)?.label ?? id).join(' · ');
};
