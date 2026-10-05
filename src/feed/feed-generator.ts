import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Feed, type FeedOptions } from 'feed';
import constants from '../common/constants.js';
import { TOPICS, TOPIC_BY_ID, type TopicId } from '../resources/interest-profile';
import { textToMd5Hash, textTruncate } from './common-util';
import type { EnrichedFeedItem } from './enriched-feed-item';
import type { FeedItemHatenaCountMap, OgObjectMap } from './feed-crawler';
import { type ItemScore, formatPickReason, scoreItem } from './item-scorer';
import { logger } from './logger';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface FeedDistributionSet {
  atom: string;
  rss: string;
  json: string;
}

export interface GenerateFeedOptions {
  id: string;
  link: string;
  title: string;
  description: string;
  feedLinks: {
    atom: string;
    rss: string;
    json: string;
  };
  titleMode?: 'default' | 'picks' | 'headlines' | 'hatenaIt';
  descriptionLength?: number;
  contentLength?: number;
  requireImage?: boolean;
  /** 説明文の先頭に選んだ理由を入れる。RSS リーダーでは _custom が見えないため */
  prependReason?: boolean;
  scoreBySourceAndLink?: Map<string, ItemScore>;
}

export interface FeedDistributions<T> {
  core: T;
  media: T;
  picks: T;
  discover: T;
  headlines: T;
  research: T;
  curated: T;
  hatenaIt: T;
  topics: Record<TopicId, T>;
}

export interface GenerateFeedBundleResult extends FeedDistributions<FeedDistributionSet> {
  /** @deprecated 後方互換 */
  aggregatedFeed: Feed;
  feedDistributionSet: FeedDistributionSet;
}

const escapeTextForXml = (text: string) => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const escapeAmpersand = (text: string) => {
  return text.replace(/&/g, '&amp;');
};

const getHostname = (link: string): string => {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    return host;
  } catch {
    return '';
  }
};

const formatItemTitle = (
  feedItem: EnrichedFeedItem,
  hatenaCountMap: FeedItemHatenaCountMap,
  titleMode: GenerateFeedOptions['titleMode'],
  itemScore?: ItemScore,
): string => {
  const baseTitle = feedItem.title ?? '';
  const host = getHostname(feedItem.link);

  if (titleMode === 'hatenaIt') {
    const hatenaCount = feedItem.hatenaBookmarkCountFromRss ?? hatenaCountMap.get(feedItem.link) ?? 0;
    return `[はてブ${hatenaCount}] ${baseTitle} (${host})`;
  }

  if (titleMode === 'headlines') {
    const time = dayjs(feedItem.isoDate).tz('Asia/Tokyo').format('HH:mm');
    if (feedItem.hnPoints !== undefined) {
      return `${time} ${baseTitle} (${host} · ↑${feedItem.hnPoints} · ${feedItem.hnComments ?? 0} comments)`;
    }
    return `${time} ${baseTitle} (${host})`;
  }

  if (titleMode === 'picks') {
    const topSignal = itemScore?.signals[0];
    const prefix = topSignal ? `[${topSignal}] ` : '';
    return `${prefix}${baseTitle} | ${feedItem.blogTitle}`;
  }

  return `${baseTitle} | ${feedItem.blogTitle}`;
};

const getItemDescription = (
  feedItem: EnrichedFeedItem,
  feedItemOgObjectMap: OgObjectMap,
  maxLength: number,
  reason?: string,
): string => {
  const snippet = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
  const ogDescription = feedItemOgObjectMap.get(feedItem.link)?.ogDescription?.replace(/(\n|\t+|\s+)/g, ' ') ?? '';
  const body = ogDescription || snippet;
  if (reason) {
    return textTruncate(`${reason}\n${body}`, maxLength);
  }
  return textTruncate(body, maxLength);
};

// 同じ URL が複数のソースに載ることがあり、ソースで tier が変わるので組で引く
const scoreKey = (feedItem: EnrichedFeedItem) => `${feedItem.sourceLabel}\n${feedItem.link}`;

const distributionFeedLinks = (basename: string) => ({
  atom: `${constants.feedsBaseUrl}${basename}.atom.xml`,
  rss: `${constants.feedsBaseUrl}${basename}.rss.xml`,
  json: `${constants.feedsBaseUrl}${basename}.json`,
});

export class FeedGenerator {
  public generateFeedBundle(
    feedItems: EnrichedFeedItem[],
    feedItemOgObjectMap: OgObjectMap,
    hatenaCountMap: FeedItemHatenaCountMap,
    distributions: FeedDistributions<EnrichedFeedItem[]>,
  ): GenerateFeedBundleResult {
    // 全フィードで同じ時刻を基準に採点し、_custom.score をフィード間で比較できるようにする
    const now = dayjs();
    const scoreBySourceAndLink = new Map<string, ItemScore>();
    for (const item of feedItems) {
      scoreBySourceAndLink.set(scoreKey(item), scoreItem(item, hatenaCountMap, { now }));
    }

    const build = (items: EnrichedFeedItem[], basename: string, options: Partial<GenerateFeedOptions>) =>
      this.buildDistribution(items, feedItemOgObjectMap, hatenaCountMap, {
        id: `${constants.siteUrlStem}/feeds/${basename}`,
        link: distributionFeedLinks(basename).atom,
        title: constants.feedTitle,
        description: constants.feedDescription,
        feedLinks: distributionFeedLinks(basename),
        titleMode: 'default',
        scoreBySourceAndLink,
        ...options,
      });

    const coreBuilt = build(distributions.core, 'core', {
      title: `${constants.feedTitle} (Core)`,
    });

    const topics = {} as Record<TopicId, FeedDistributionSet>;
    for (const topic of TOPICS) {
      topics[topic.id] = build(distributions.topics[topic.id] ?? [], `topic-${topic.id}`, {
        title: `${constants.feedTitle} (${topic.label})`,
        description: `${topic.label}の記事をスコア順に（直近${constants.topicWindowDays}日）`,
        titleMode: 'picks',
      }).distribution;
    }

    return {
      core: coreBuilt.distribution,
      media: build(distributions.media, 'media', {
        title: `${constants.feedTitle} (Media)`,
        description: '高頻度メディアソース（件数上限あり）',
      }).distribution,
      picks: build(distributions.picks, 'picks', {
        title: `${constants.feedTitle} (今日の${constants.picksMaxItems}本)`,
        description: '読んで高揚しそうな記事をスコア順に選んだもの',
        titleMode: 'picks',
        prependReason: true,
      }).distribution,
      discover: build(distributions.discover, 'discover', {
        title: `${constants.feedTitle} (Discover)`,
        description: `今週の人気（はてブ${constants.discoverMinHatenaCount}件以上・直近${constants.discoverWindowDays}日をスコア順）`,
        titleMode: 'picks',
      }).distribution,
      headlines: build(distributions.headlines, 'headlines', {
        title: `${constants.feedTitle} (Headlines)`,
        description: 'HN・ITmedia速報など',
        titleMode: 'headlines',
        descriptionLength: constants.maxHeadlinesDescriptionLength,
        requireImage: false,
      }).distribution,
      research: build(distributions.research, 'research', {
        title: `${constants.feedTitle} (Research)`,
        description: 'リサーチ・長文',
        descriptionLength: constants.maxResearchFeedDescriptionLength,
        contentLength: constants.maxResearchFeedContentLength,
        requireImage: false,
      }).distribution,
      curated: build(distributions.curated, 'curated', {
        title: `${constants.feedTitle} (Curated)`,
        description: 'キュレーション（今日のブクマ等）',
        titleMode: 'picks',
      }).distribution,
      hatenaIt: build(distributions.hatenaIt, 'hatena-it', {
        title: `${constants.feedTitle} (はてなIT人気)`,
        description: 'はてなブックマーク ITカテゴリ人気（厳選）',
        titleMode: 'hatenaIt',
        descriptionLength: constants.maxHeadlinesDescriptionLength,
        requireImage: false,
      }).distribution,
      topics,
      aggregatedFeed: coreBuilt.feed,
      feedDistributionSet: coreBuilt.distribution,
    };
  }

  /** @deprecated 単一フィード生成（テスト互換） */
  public generateFeeds(
    feedItems: EnrichedFeedItem[],
    feedItemOgObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    maxFeedDescriptionLength: number,
    maxFeedContentLength: number,
  ): { aggregatedFeed: Feed; feedDistributionSet: FeedDistributionSet } {
    const built = this.buildDistribution(feedItems, feedItemOgObjectMap, allFeedItemHatenaCountMap, {
      id: `${constants.siteUrlStem}/`,
      link: constants.siteUrlStem,
      title: constants.feedTitle,
      description: constants.feedDescription,
      feedLinks: constants.feedUrls,
      descriptionLength: maxFeedDescriptionLength,
      contentLength: maxFeedContentLength,
    });
    return {
      aggregatedFeed: built.feed,
      feedDistributionSet: built.distribution,
    };
  }

  private buildDistribution(
    feedItems: EnrichedFeedItem[],
    feedItemOgObjectMap: OgObjectMap,
    hatenaCountMap: FeedItemHatenaCountMap,
    options: GenerateFeedOptions,
  ): { distribution: FeedDistributionSet; feed: Feed } {
    const outputFeed = new Feed({
      title: options.title,
      description: options.description,
      language: constants.feedLanguage,
      id: options.id,
      link: options.link,
      feedLinks: options.feedLinks,
      image: `${constants.siteUrlStem}/images/icon.png`,
      favicon: `${constants.siteUrlStem}/images/favicon.ico`,
      copyright: constants.feedCopyright,
      generator: constants.feedGenerator,
      updated: new Date(),
    } as FeedOptions);

    const descriptionLength = options.descriptionLength ?? constants.maxFeedDescriptionLength;
    const contentLength = options.contentLength ?? constants.maxFeedContentLength;
    const titleMode = options.titleMode ?? 'default';
    const getItemScore = (feedItem: EnrichedFeedItem) =>
      options.scoreBySourceAndLink?.get(scoreKey(feedItem)) ?? scoreItem(feedItem, hatenaCountMap);

    for (const feedItem of feedItems) {
      logger.info('[create-feed-item]', options.title, feedItem.isoDate, feedItem.title);

      const feedItemId = feedItem.guid || feedItem.link;
      const ogObject = feedItemOgObjectMap.get(feedItem.link);
      const ogImage = ogObject?.customOgImage;

      if (ogImage?.alt) {
        ogImage.alt = escapeTextForXml(ogImage.alt);
      }

      if (!feedItem.isoDate) {
        continue;
      }

      const itemScore = getItemScore(feedItem);
      const pickReason = formatPickReason(itemScore);
      const descriptionReason = options.prependReason ? pickReason : undefined;
      const categories = [...(feedItem.categories || []), ...(feedItem.sourceTags || [])].map((category) => ({
        name: escapeTextForXml(category),
      }));

      outputFeed.addItem({
        id: feedItemId,
        guid: feedItemId,
        title: escapeTextForXml(formatItemTitle(feedItem, hatenaCountMap, titleMode, itemScore)),
        description: escapeTextForXml(
          getItemDescription(feedItem, feedItemOgObjectMap, descriptionLength, descriptionReason),
        ),
        content: escapeTextForXml(getItemDescription(feedItem, feedItemOgObjectMap, contentLength, descriptionReason)),
        link: feedItem.link,
        category: categories,
        author:
          feedItem.creator && typeof feedItem.creator === 'string'
            ? [{ name: escapeTextForXml(feedItem.creator) }]
            : undefined,
        image: ogImage?.url ? ogImage : undefined,
        published: new Date(feedItem.isoDate),
        date: new Date(feedItem.isoDate),
        extensions: [
          {
            name: '_custom',
            objects: {
              hatenaCount: hatenaCountMap.get(feedItem.link) || feedItem.hatenaBookmarkCountFromRss || 0,
              originalTitle: escapeTextForXml(feedItem.title ?? ''),
              blogTitle: escapeTextForXml(feedItem.blogTitle),
              blogLink: feedItem.blogLink,
              blogLinkMd5Hash: textToMd5Hash(feedItem.blogLink),
              favicon: ogObject?.favicon,
              pickReason: escapeTextForXml(pickReason),
              sourceTier: feedItem.sourceTier,
              sourceLabel: escapeTextForXml(feedItem.sourceLabel),
              host: getHostname(feedItem.link),
              score: itemScore.score,
              topics: itemScore.topics,
              topicLabels: itemScore.topics.map((id) => TOPIC_BY_ID.get(id)?.label ?? id),
              signals: itemScore.signals.map(escapeTextForXml),
              penalties: itemScore.penalties.map(escapeTextForXml),
            },
          },
        ],
      });
    }

    const distribution = {
      atom: escapeAmpersand(outputFeed.atom1()),
      rss: escapeAmpersand(outputFeed.rss2()),
      json: outputFeed.json1(),
    };

    return { distribution, feed: outputFeed };
  }
}
