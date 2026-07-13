import * as path from 'node:path';
import * as url from 'node:url';
import dayjs from 'dayjs';
import constants from '../common/constants';
import { FeedCrawler } from '../feed/feed-crawler';
import { FeedGenerator } from '../feed/feed-generator';
import {
  filterByTiers,
  scoreDiscoverItems,
  selectCuratedItems,
  selectHatenaItItems,
  selectPicksItems,
} from '../feed/feed-item-processor';
import { FeedStorer } from '../feed/feed-storer';
import { FeedValidator } from '../feed/feed-validator';
import { logger } from '../feed/logger';
import { CORE_OUTPUT_TIERS } from '../resources/feed-tier';
import { FEED_INFO_LIST } from '../resources/feed-info-list';

const dirName = url.fileURLToPath(new URL('.', import.meta.url));

const STORE_FEEDS_DIR_PATH = path.join(dirName, '../site/feeds');
const STORE_BLOG_FEEDS_DIR_PATH = path.join(dirName, '../site/blog-feeds');

const feedCrawler = new FeedCrawler();
const feedGenerator = new FeedGenerator();
const feedValidator = new FeedValidator();
const feedStorer = new FeedStorer();

(async () => {
  const crawlFeedsResult = await feedCrawler.crawlFeeds(
    FEED_INFO_LIST,
    constants.feedFetchConcurrency,
    constants.feedOgFetchConcurrency,
  );

  const allItems = crawlFeedsResult.feedItems;
  const hatenaCountMap = crawlFeedsResult.feedItemHatenaCountMap;

  const coreItems = filterByTiers(allItems, CORE_OUTPUT_TIERS);
  const mediaItems = filterByTiers(allItems, ['media']);
  const researchItems = filterByTiers(allItems, ['research']);
  const signalItems = filterByTiers(allItems, ['signal'])
    .filter((item) => dayjs(item.isoDate).isAfter(dayjs().subtract(constants.headlinesWindowHours, 'hour')))
    .slice(0, constants.headlinesMaxItems);

  const curatedItems = selectCuratedItems(allItems);

  const hatenaItItems = selectHatenaItItems(allItems);
  const picksItems = selectPicksItems(allItems, hatenaCountMap);
  const discoverItems = scoreDiscoverItems(allItems, hatenaCountMap);

  const ogObjectMap = new Map([...crawlFeedsResult.feedItemOgObjectMap, ...crawlFeedsResult.feedBlogOgObjectMap]);

  const bundle = feedGenerator.generateFeedBundle(allItems, ogObjectMap, hatenaCountMap, {
    core: coreItems,
    media: mediaItems,
    picks: picksItems,
    discover: discoverItems,
    headlines: signalItems,
    research: researchItems,
    curated: curatedItems,
    hatenaIt: hatenaItItems,
  });

  try {
    await feedStorer.storeFeeds(
      bundle,
      STORE_FEEDS_DIR_PATH,
      crawlFeedsResult.feeds,
      ogObjectMap,
      hatenaCountMap,
      STORE_BLOG_FEEDS_DIR_PATH,
    );
  } catch (e) {
    const error = new Error('Failed to store feeds', { cause: e });
    console.error(error);
    throw error;
  }

  try {
    logger.info('フィードのバリデーション開始');

    await feedValidator.assertFeed(bundle.aggregatedFeed);
    await feedValidator.assertXmlFeed('atom', bundle.core.atom);
    await feedValidator.assertXmlFeed('rss', bundle.core.rss);
    await feedValidator.assertXmlFeed('picks', bundle.picks.atom);
    await feedValidator.assertXmlFeed('headlines', bundle.headlines.atom);
    await feedValidator.assertXmlFeed('hatena-it', bundle.hatenaIt.atom);

    logger.info('フィードのバリデーション完了');
  } catch (e) {
    const error = new Error('Failed to validate feed', { cause: e });
    console.error(error);
    throw error;
  }
})();
