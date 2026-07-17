import { URL } from 'node:url';
import dayjs from 'dayjs';
import constants from '../common/constants';
import { CORE_OUTPUT_TIERS, type FeedTier } from '../resources/feed-tier';
import type { EnrichedFeedItem } from './enriched-feed-item';
import type { FeedItemHatenaCountMap } from './feed-crawler';

const normalizeTitleKey = (title: string): string => title.replace(/\s+/g, '').slice(0, 30);

const getHostname = (link: string): string => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const applyPerSourceCaps = (
  items: EnrichedFeedItem[],
  feedMaxItems: Map<string, number>,
): EnrichedFeedItem[] => {
  const grouped = new Map<string, EnrichedFeedItem[]>();

  for (const item of items) {
    const group = grouped.get(item.sourceLabel) ?? [];
    group.push(item);
    grouped.set(item.sourceLabel, group);
  }

  const capped: EnrichedFeedItem[] = [];

  for (const [label, groupItems] of grouped) {
    const maxItems = feedMaxItems.get(label);
    const sorted = [...groupItems].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
    capped.push(...(maxItems !== undefined ? sorted.slice(0, maxItems) : sorted));
  }

  return capped.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
};

export const filterByTiers = (items: EnrichedFeedItem[], tiers: FeedTier[]): EnrichedFeedItem[] =>
  items.filter((item) => tiers.includes(item.sourceTier));

export const filterCuratedIdidBookmarks = (items: EnrichedFeedItem[]): EnrichedFeedItem[] => {
  const segment = constants.ididBookmarkPathSegment;
  return items.filter(
    (item) => item.sourceLabel === 'iDID' && (item.link.includes(`/${segment}/`) || item.link.includes(`/${segment}`)),
  );
};

export const selectHatenaItItems = (items: EnrichedFeedItem[]): EnrichedFeedItem[] => {
  const windowStart = dayjs().subtract(constants.hatenaItWindowHours, 'hour');
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

export const scoreDiscoverItems = (
  items: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
): EnrichedFeedItem[] => {
  const windowStart = dayjs().subtract(constants.discoverWindowDays, 'day');

  const scored = items
    .filter((item) => CORE_OUTPUT_TIERS.includes(item.sourceTier))
    .filter((item) => dayjs(item.isoDate).isAfter(windowStart))
    .map((item) => {
      const hatenaCount = hatenaCountMap.get(item.link) ?? 0;
      if (hatenaCount < constants.discoverMinHatenaCount) {
        return null;
      }
      const diffDays = dayjs().diff(item.isoDate, 'day');
      const recencyFactor = Math.max(
        0.05,
        ((constants.discoverWindowDays - diffDays) / constants.discoverWindowDays) ** 3,
      );
      const tierBonus = item.sourceTier === 'essential' || item.sourceTier === 'core' ? constants.discoverCoreBonus : 1;
      return { item, score: hatenaCount * recencyFactor * tierBonus };
    })
    .filter((entry): entry is { item: EnrichedFeedItem; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, constants.discoverMaxItems)
    .map((entry) => entry.item);

  return scored;
};

export const selectPicksItems = (
  items: EnrichedFeedItem[],
  hatenaCountMap: FeedItemHatenaCountMap,
): EnrichedFeedItem[] => {
  const isDaily = constants.picksMode === 'daily';
  const maxItems = isDaily ? constants.picksDailyMaxItems : constants.picksWeeklyMaxItems;
  const windowHours = isDaily ? constants.picksWindowHours : constants.picksWeeklyWindowHours;
  const windowStart = dayjs().subtract(windowHours, 'hour');

  const candidates = items.filter((item) => {
    if (!dayjs(item.isoDate).isAfter(windowStart)) {
      return false;
    }
    if (item.sourceTier === 'media' || item.sourceTier === 'hotentry' || item.sourceTier === 'signal') {
      return false;
    }
    return ['essential', 'core', 'optional', 'curated', 'research'].includes(item.sourceTier);
  });

  const essentialRecent = candidates
    .filter((item) => item.sourceTier === 'essential')
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  const picks: EnrichedFeedItem[] = [];
  const usedBlogs = new Set<string>();
  const usedTitleKeys = new Set<string>();

  const tryAdd = (item: EnrichedFeedItem): boolean => {
    if (picks.length >= maxItems) {
      return false;
    }
    if (usedBlogs.has(item.sourceLabel)) {
      return false;
    }
    const titleKey = normalizeTitleKey(item.title ?? '');
    if (usedTitleKeys.has(titleKey)) {
      return false;
    }
    usedBlogs.add(item.sourceLabel);
    usedTitleKeys.add(titleKey);
    picks.push(item);
    return true;
  };

  for (let i = 0; i < constants.picksEssentialReservedSlots && i < essentialRecent.length; i++) {
    tryAdd(essentialRecent[i]);
  }

  const scored = candidates
    .filter((item) => !picks.includes(item))
    .map((item) => {
      const hatenaCount = hatenaCountMap.get(item.link) ?? 0;
      const diffDays = dayjs().diff(item.isoDate, 'day');
      const recencyFactor = Math.max(0.05, ((3 - Math.min(diffDays, 3)) / 3) ** 2);
      let score = (hatenaCount + 1) * recencyFactor;
      if (item.sourceTier === 'core') {
        score *= constants.picksCoreBonus;
      }
      if (item.sourceTier === 'research') {
        score *= 1.3;
      }
      if (item.sourceTier === 'curated') {
        score *= 1.2;
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  for (const { item } of scored) {
    if (picks.length >= maxItems) {
      break;
    }
    tryAdd(item);
  }

  return picks.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
};

export const buildPickReason = (item: EnrichedFeedItem, hatenaCountMap: FeedItemHatenaCountMap): string => {
  if (item.sourceTier === 'essential') {
    return '必読 · 安宅和人';
  }
  const hatenaCount = item.hatenaBookmarkCountFromRss ?? hatenaCountMap.get(item.link) ?? 0;
  if (hatenaCount > 0) {
    return `はてブ${hatenaCount}件`;
  }
  if (item.sourceTier === 'core') {
    return 'お気に入りブログ';
  }
  if (item.sourceTier === 'curated') {
    return '今日のブクマ';
  }
  if (item.sourceTier === 'research') {
    return 'リサーチ';
  }
  if (item.sourceTier === 'hotentry') {
    return `はてなIT人気 · ブクマ${item.hatenaBookmarkCountFromRss ?? 0}`;
  }
  return 'ピックアップ';
};
