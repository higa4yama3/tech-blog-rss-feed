import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Feed, type FeedOptions } from 'feed';
import constants from '../common/constants.js';
import { textToMd5Hash, textTruncate } from './common-util';
import type { EnrichedFeedItem } from './enriched-feed-item';
import type { FeedItemHatenaCountMap, OgObjectMap } from './feed-crawler';
import { buildPickReason } from './feed-item-processor';
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
  pickReasons?: Map<string, string>;
}

export interface GenerateFeedBundleResult {
  core: FeedDistributionSet;
  media: FeedDistributionSet;
  picks: FeedDistributionSet;
  discover: FeedDistributionSet;
  headlines: FeedDistributionSet;
  research: FeedDistributionSet;
  curated: FeedDistributionSet;
  hatenaIt: FeedDistributionSet;
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
  pickReasons?: Map<string, string>,
): string => {
  const baseTitle = feedItem.title ?? '';
  const hatenaCount = feedItem.hatenaBookmarkCountFromRss ?? hatenaCountMap.get(feedItem.link) ?? 0;

  if (titleMode === 'hatenaIt') {
    const host = getHostname(feedItem.link);
    return `[はてブ${hatenaCount}] ${baseTitle} (${host})`;
  }

  if (titleMode === 'headlines') {
    const time = dayjs(feedItem.isoDate).tz('Asia/Tokyo').format('HH:mm');
    if (feedItem.sourceLabel === 'Hacker News') {
      const pts = feedItem.hnPoints ?? 0;
      const comments = feedItem.hnComments ?? 0;
      const host = getHostname(feedItem.link);
      return `${time} ↑${pts} · ${comments} comments · ${host}`;
    }
    const host = getHostname(feedItem.link);
    return `${time} ${baseTitle} (${host})`;
  }

  if (titleMode === 'picks') {
    const reason = pickReasons?.get(feedItem.link);
    const prefix = feedItem.sourceTier === 'essential' ? '[必読] ' : reason ? `[${reason}] ` : '';
    return `${prefix}${baseTitle} | ${feedItem.blogTitle}`;
  }

  return `${baseTitle} | ${feedItem.blogTitle}`;
};

const getItemDescription = (
  feedItem: EnrichedFeedItem,
  feedItemOgObjectMap: OgObjectMap,
  maxLength: number,
  pickReasons?: Map<string, string>,
): string => {
  const snippet = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
  const ogDescription = feedItemOgObjectMap.get(feedItem.link)?.ogDescription?.replace(/(\n|\t+|\s+)/g, ' ') ?? '';
  const body = ogDescription || snippet;
  const reason = pickReasons?.get(feedItem.link);
  if (reason) {
    return textTruncate(`${reason}\n${body}`, maxLength);
  }
  return textTruncate(body, maxLength);
};

export class FeedGenerator {
  public generateFeedBundle(
    feedItems: EnrichedFeedItem[],
    feedItemOgObjectMap: OgObjectMap,
    hatenaCountMap: FeedItemHatenaCountMap,
    distributions: Record<
      keyof Omit<GenerateFeedBundleResult, 'aggregatedFeed' | 'feedDistributionSet'>,
      EnrichedFeedItem[]
    >,
  ): GenerateFeedBundleResult {
    const pickReasons = new Map<string, string>();
    for (const item of distributions.picks) {
      pickReasons.set(item.link, buildPickReason(item, hatenaCountMap));
    }
    for (const item of distributions.hatenaIt) {
      pickReasons.set(item.link, buildPickReason(item, hatenaCountMap));
    }

    const coreBuilt = this.buildDistribution(distributions.core, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/core`,
      link: constants.feedUrls.core,
      title: `${constants.feedTitle} (Core)`,
      description: constants.feedDescription,
      feedLinks: {
        atom: constants.feedUrls.core,
        rss: constants.feedUrls.core.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.core.replace('core.atom.xml', 'core.json'),
      },
      titleMode: 'default',
    });
    const core = coreBuilt.distribution;

    const mediaBuilt = this.buildDistribution(distributions.media, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/media`,
      link: constants.feedUrls.media,
      title: `${constants.feedTitle} (Media)`,
      description: '高頻度メディアソース（件数上限あり）',
      feedLinks: {
        atom: constants.feedUrls.media,
        rss: constants.feedUrls.media.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.media.replace('media.atom.xml', 'media.json'),
      },
      titleMode: 'default',
    });
    const media = mediaBuilt.distribution;

    const picksBuilt = this.buildDistribution(distributions.picks, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/picks`,
      link: constants.feedUrls.picks,
      title: `${constants.feedTitle} (Picks)`,
      description: '厳選ピックアップ',
      feedLinks: {
        atom: constants.feedUrls.picks,
        rss: constants.feedUrls.picks.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.picks.replace('picks.atom.xml', 'picks.json'),
      },
      titleMode: 'picks',
      pickReasons,
    });
    const picks = picksBuilt.distribution;

    const discoverBuilt = this.buildDistribution(distributions.discover, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/discover`,
      link: constants.feedUrls.discover,
      title: `${constants.feedTitle} (Discover)`,
      description: 'はてブと新しさで選んだ記事',
      feedLinks: {
        atom: constants.feedUrls.discover,
        rss: constants.feedUrls.discover.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.discover.replace('discover.atom.xml', 'discover.json'),
      },
      titleMode: 'picks',
      pickReasons,
    });
    const discover = discoverBuilt.distribution;

    const headlinesBuilt = this.buildDistribution(distributions.headlines, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/headlines`,
      link: constants.feedUrls.headlines,
      title: `${constants.feedTitle} (Headlines)`,
      description: 'HN・ITmedia速報など',
      feedLinks: {
        atom: constants.feedUrls.headlines,
        rss: constants.feedUrls.headlines.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.headlines.replace('headlines.atom.xml', 'headlines.json'),
      },
      titleMode: 'headlines',
      descriptionLength: constants.maxHeadlinesDescriptionLength,
      requireImage: false,
    });
    const headlines = headlinesBuilt.distribution;

    const researchBuilt = this.buildDistribution(distributions.research, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/research`,
      link: constants.feedUrls.research,
      title: `${constants.feedTitle} (Research)`,
      description: 'リサーチ・長文',
      feedLinks: {
        atom: constants.feedUrls.research,
        rss: constants.feedUrls.research.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.research.replace('research.atom.xml', 'research.json'),
      },
      titleMode: 'default',
      descriptionLength: constants.maxResearchFeedDescriptionLength,
      contentLength: constants.maxResearchFeedContentLength,
      requireImage: false,
    });
    const research = researchBuilt.distribution;

    const curatedBuilt = this.buildDistribution(distributions.curated, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/curated`,
      link: constants.feedUrls.curated,
      title: `${constants.feedTitle} (Curated)`,
      description: 'キュレーション（今日のブクマ等）',
      feedLinks: {
        atom: constants.feedUrls.curated,
        rss: constants.feedUrls.curated.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.curated.replace('curated.atom.xml', 'curated.json'),
      },
      titleMode: 'picks',
      pickReasons,
    });
    const curated = curatedBuilt.distribution;

    const hatenaItBuilt = this.buildDistribution(distributions.hatenaIt, feedItemOgObjectMap, hatenaCountMap, {
      id: `${constants.siteUrlStem}/feeds/hatena-it`,
      link: constants.feedUrls.hatenaIt,
      title: `${constants.feedTitle} (はてなIT人気)`,
      description: 'はてなブックマーク ITカテゴリ人気（厳選）',
      feedLinks: {
        atom: constants.feedUrls.hatenaIt,
        rss: constants.feedUrls.hatenaIt.replace('.atom.xml', '.rss.xml'),
        json: constants.feedUrls.hatenaIt.replace('hatena-it.atom.xml', 'hatena-it.json'),
      },
      titleMode: 'hatenaIt',
      descriptionLength: constants.maxHeadlinesDescriptionLength,
      requireImage: false,
      pickReasons,
    });
    const hatenaIt = hatenaItBuilt.distribution;

    return {
      core,
      media,
      picks,
      discover,
      headlines,
      research,
      curated,
      hatenaIt,
      aggregatedFeed: coreBuilt.feed,
      feedDistributionSet: core,
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

      const categories = [...(feedItem.categories || []), ...(feedItem.sourceTags || [])].map((category) => ({
        name: escapeTextForXml(category),
      }));

      outputFeed.addItem({
        id: feedItemId,
        guid: feedItemId,
        title: escapeTextForXml(formatItemTitle(feedItem, hatenaCountMap, titleMode, options.pickReasons)),
        description: escapeTextForXml(
          getItemDescription(feedItem, feedItemOgObjectMap, descriptionLength, options.pickReasons),
        ),
        content: escapeTextForXml(
          getItemDescription(feedItem, feedItemOgObjectMap, contentLength, options.pickReasons),
        ),
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
              pickReason: escapeTextForXml(
                options.pickReasons?.get(feedItem.link) ?? buildPickReason(feedItem, hatenaCountMap),
              ),
              sourceTier: feedItem.sourceTier,
              sourceLabel: escapeTextForXml(feedItem.sourceLabel),
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
