import { URL } from 'node:url';
import dayjs from 'dayjs';
import constants from '../common/constants';
import { CORE_OUTPUT_TIERS, type FeedTier } from '../resources/feed-tier';
import type { TopicId } from '../resources/interest-profile';
import type { EnrichedFeedItem } from './enriched-feed-item';
import type { FeedItemHatenaCountMap } from './feed-crawler';
import { type ItemScore, formatPickReason, getHatenaCount, scoreItem } from './item-scorer';

const normalizeTitleKey = (title: string): string => title.replace(/\s+/g, '').slice(0, 30);

const getHostname = (link: string): string => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

type ScoredItem = { item: EnrichedFeedItem; itemScore: ItemScore };

// はてな人気・HN は1つのフィードに別々のサイトの記事が並ぶので、記事のドメインを出どころとみなす
const AGGREGATOR_TIERS: FeedTier[] = ['hotentry', 'signal'];
const getOriginKey = (item: EnrichedFeedItem): string =>
  AGGREGATOR_TIERS.includes(item.sourceTier) ? `host:${getHostname(item.link)}` : item.sourceLabel;

const scoreItems = (
  items: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
  now: dayjs.Dayjs,
  halfLifeHours?: number,
): ScoredItem[] =>
  items
    .map((item) => ({ item, itemScore: scoreItem(item, hatenaCountMap, { now, halfLifeHours }) }))
    .sort((a, b) => b.itemScore.score - a.itemScore.score || b.item.isoDate.localeCompare(a.item.isoDate));

/**
 * 量の多いソースを、新しい順ではなくスコア順で上限まで残す
 */
export const capItemsPerSourceByScore = (
  items: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
  maxItemsBySource: Map<string, number>,
  now: dayjs.Dayjs = dayjs(),
): EnrichedFeedItem[] => {
  const countBySource = new Map<string, number>();
  const kept: EnrichedFeedItem[] = [];

  for (const { item } of scoreItems(items, hatenaCountMap, now)) {
    const maxItems = maxItemsBySource.get(item.sourceLabel);
    const count = countBySource.get(item.sourceLabel) ?? 0;
    if (maxItems !== undefined && count >= maxItems) {
      continue;
    }
    countBySource.set(item.sourceLabel, count + 1);
    kept.push(item);
  }

  return kept.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
};

export const filterByTiers = (items: EnrichedFeedItem[], tiers: FeedTier[]): EnrichedFeedItem[] =>
  items.filter((item) => tiers.includes(item.sourceTier));

export const filterCuratedIdidBookmarks = (items: EnrichedFeedItem[]): EnrichedFeedItem[] => {
  const segment = constants.ididBookmarkPathSegment;
  return items.filter(
    (item) => item.sourceLabel === 'iDID' && (item.link.includes(`/${segment}/`) || item.link.includes(`/${segment}`)),
  );
};

export const selectHatenaItItems = (items: EnrichedFeedItem[], now: dayjs.Dayjs = dayjs()): EnrichedFeedItem[] => {
  const windowStart = now.subtract(constants.hatenaItWindowHours, 'hour');
  const blocklist = new Set(constants.hatenaItDomainBlocklist);

  const filtered = items
    .filter((item) => item.sourceTier === 'hotentry')
    .filter((item) => dayjs(item.isoDate).isAfter(windowStart))
    .filter((item) => (item.hatenaBookmarkCountFromRss ?? 0) >= constants.hatenaItMinBookmarkCount)
    .filter((item) => {
      const host = getHostname(item.link);
      return !blocklist.has(host);
    })
    .sort(
      (a, b) =>
        (b.hatenaBookmarkCountFromRss ?? 0) - (a.hatenaBookmarkCountFromRss ?? 0) || b.isoDate.localeCompare(a.isoDate),
    );

  const domainCounts = new Map<string, number>();
  const limited: EnrichedFeedItem[] = [];

  for (const item of filtered) {
    const host = getHostname(item.link);
    const count = domainCounts.get(host) ?? 0;
    if (count >= constants.hatenaItMaxItemsPerDomain) {
      continue;
    }
    domainCounts.set(host, count + 1);
    limited.push(item);
    if (limited.length >= constants.hatenaItMaxItems) {
      break;
    }
  }

  return limited;
};

/**
 * 今週の人気。はてブが付いた記事を、半減期を長めにしたスコアで並べる
 */
export const scoreDiscoverItems = (
  items: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
  now: dayjs.Dayjs = dayjs(),
): EnrichedFeedItem[] => {
  const windowStart = now.subtract(constants.discoverWindowDays, 'day');
  const candidates = items
    .filter((item) => CORE_OUTPUT_TIERS.includes(item.sourceTier) || item.sourceTier === 'research')
    .filter((item) => dayjs(item.isoDate).isAfter(windowStart))
    .filter((item) => getHatenaCount(item, hatenaCountMap) >= constants.discoverMinHatenaCount);

  const countBySource = new Map<string, number>();
  const selected: EnrichedFeedItem[] = [];

  for (const { item } of scoreItems(candidates, hatenaCountMap, now, constants.discoverHalfLifeHours)) {
    const originKey = getOriginKey(item);
    const count = countBySource.get(originKey) ?? 0;
    if (count >= constants.discoverMaxItemsPerSource) {
      continue;
    }
    countBySource.set(originKey, count + 1);
    selected.push(item);
    if (selected.length >= constants.discoverMaxItems) {
      break;
    }
  }

  return selected;
};

/**
 * 今日の5本。pool には自分のソースに加え、はてな人気・HN を混ぜてよい
 * 1ソース（はてな人気・HN は1ドメイン）1本、tier ごとの枠、同じ記事の重複を除いた上でスコア順に取る
 */
export const selectPicksItems = (
  pool: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
  now: dayjs.Dayjs = dayjs(),
): EnrichedFeedItem[] => {
  const maxItems = constants.picksMaxItems;
  const windowStart = now.subtract(constants.picksWindowHours, 'hour');
  const tierLimits = constants.picksMaxItemsPerTier;

  const candidates = scoreItems(
    pool.filter((item) => dayjs(item.isoDate).isAfter(windowStart)),
    hatenaCountMap,
    now,
  );

  const picks: ScoredItem[] = [];
  const usedSources = new Set<string>();
  const usedLinks = new Set<string>();
  const usedTitleKeys = new Set<string>();
  const countByTier = new Map<FeedTier, number>();

  const tryAdd = (entry: ScoredItem) => {
    const { item } = entry;
    if (picks.length >= maxItems) {
      return;
    }
    const originKey = getOriginKey(item);
    const titleKey = normalizeTitleKey(item.title ?? '');
    const tierCount = countByTier.get(item.sourceTier) ?? 0;
    const tierLimit = tierLimits[item.sourceTier];
    if (
      usedSources.has(originKey) ||
      usedLinks.has(item.link) ||
      usedTitleKeys.has(titleKey) ||
      (tierLimit !== undefined && tierCount >= tierLimit)
    ) {
      return;
    }
    usedSources.add(originKey);
    usedLinks.add(item.link);
    usedTitleKeys.add(titleKey);
    countByTier.set(item.sourceTier, tierCount + 1);
    picks.push(entry);
  };

  const essentialEntries = candidates.filter(({ item }) => item.sourceTier === 'essential');
  for (const entry of essentialEntries.slice(0, constants.picksEssentialReservedSlots)) {
    tryAdd(entry);
  }

  for (const entry of candidates) {
    tryAdd(entry);
  }

  return picks.sort((a, b) => b.itemScore.score - a.itemScore.score).map(({ item }) => item);
};

/**
 * トピック棚。直近の記事をトピックで絞り、スコア順に並べる
 */
export const selectTopicItems = (
  pool: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
  topicId: TopicId,
  now: dayjs.Dayjs = dayjs(),
): EnrichedFeedItem[] => {
  const windowStart = now.subtract(constants.topicWindowDays, 'day');
  const usedLinks = new Set<string>();
  const selected: EnrichedFeedItem[] = [];

  for (const { item, itemScore } of scoreItems(
    pool.filter((item) => dayjs(item.isoDate).isAfter(windowStart)),
    hatenaCountMap,
    now,
  )) {
    if (!itemScore.topics.includes(topicId) || usedLinks.has(item.link)) {
      continue;
    }
    usedLinks.add(item.link);
    selected.push(item);
    if (selected.length >= constants.topicMaxItems) {
      break;
    }
  }

  return selected;
};

export const buildPickReason = (item: EnrichedFeedItem, hatenaCountMap: FeedItemHatenaCountMap): string =>
  formatPickReason(scoreItem(item, hatenaCountMap));
