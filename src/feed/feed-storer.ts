import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { to } from 'await-to-js';
import { textToMd5Hash, textTruncate } from './common-util';
import type { CustomRssParserFeed, FeedItemHatenaCountMap, OgObjectMap } from './feed-crawler';
import type { FeedDistributionSet, GenerateFeedBundleResult } from './feed-generator';
import { logger } from './logger';

export interface BlogFeed {
  title: string;
  link: string;
  linkMd5Hash: string;
  ogImageUrl: string;
  ogDescription: string;
  items: {
    title: string;
    link: string;
    summary: string;
    content_html: string;
    isoDate: string;
    hatenaCount: number;
    ogImageUrl: string;
  }[];
}

export class FeedStorer {
  public async storeFeeds(
    bundle: GenerateFeedBundleResult,
    storeArticleDirPath: string,
    feeds: CustomRssParserFeed[],
    ogObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    storeBlogDirPath: string,
  ): Promise<void> {
    const [errorStoreFeed] = await to(
      Promise.all([
        this.storeArticleFeeds(bundle, storeArticleDirPath),
        this.storeBlogFeeds(feeds, ogObjectMap, allFeedItemHatenaCountMap, storeBlogDirPath),
      ]),
    );
    if (errorStoreFeed) {
      throw new Error('ファイル出力に失敗しました', {
        cause: errorStoreFeed,
      });
    }
  }

  private async storeArticleFeeds(bundle: GenerateFeedBundleResult, storeDirPath: string): Promise<void> {
    await fs.mkdir(storeDirPath, { recursive: true });

    const writeNamedFeed = async (basename: string, distribution: FeedDistributionSet) => {
      await fs.writeFile(path.join(storeDirPath, `${basename}.atom.xml`), distribution.atom, 'utf-8');
      await fs.writeFile(path.join(storeDirPath, `${basename}.rss.xml`), distribution.rss, 'utf-8');
      await fs.writeFile(path.join(storeDirPath, `${basename}.json`), distribution.json, 'utf-8');
    };

    await fs.writeFile(path.join(storeDirPath, 'atom.xml'), bundle.feedDistributionSet.atom, 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'rss.xml'), bundle.feedDistributionSet.rss, 'utf-8');
    await fs.writeFile(path.join(storeDirPath, 'feed.json'), bundle.feedDistributionSet.json, 'utf-8');

    await writeNamedFeed('core', bundle.core);
    await writeNamedFeed('media', bundle.media);
    await writeNamedFeed('picks', bundle.picks);
    await writeNamedFeed('discover', bundle.discover);
    await writeNamedFeed('headlines', bundle.headlines);
    await writeNamedFeed('research', bundle.research);
    await writeNamedFeed('curated', bundle.curated);
    await writeNamedFeed('hatena-it', bundle.hatenaIt);

    logger.info('[store-feeds] finished');
  }

  private async storeBlogFeeds(
    feeds: CustomRssParserFeed[],
    ogObjectMap: OgObjectMap,
    allFeedItemHatenaCountMap: FeedItemHatenaCountMap,
    storeDirPath: string,
  ): Promise<void> {
    await fs.rm(storeDirPath, { recursive: true, force: true });
    await fs.mkdir(storeDirPath, { recursive: true });

    const blogFeeds: BlogFeed[] = [];

    for (const feed of feeds) {
      if (feed.sourceTier === 'hotentry') {
        continue;
      }

      const customFeed: BlogFeed = {
        title: feed.title,
        link: feed.link,
        linkMd5Hash: textToMd5Hash(feed.link),
        ogImageUrl: ogObjectMap.get(feed.link)?.customOgImage?.url || '',
        ogDescription: ogObjectMap.get(feed.link)?.ogDescription || '',
        items: [],
      };

      for (const feedItem of feed.items) {
        const feedItemContent = (feedItem.summary || feedItem.contentSnippet || '').replace(/(\n|\t+|\s+)/g, ' ');
        customFeed.items.push({
          title: feedItem.title || '',
          summary: textTruncate(feedItemContent, 200),
          content_html: textTruncate(feedItemContent, 1000),
          link: feedItem.link,
          isoDate: feedItem.isoDate,
          hatenaCount: allFeedItemHatenaCountMap.get(feedItem.link) || 0,
          ogImageUrl: ogObjectMap.get(feedItem.link)?.customOgImage?.url || '',
        });
      }

      blogFeeds.push(customFeed);
    }

    await fs.writeFile(path.join(storeDirPath, 'blog-feeds.json'), JSON.stringify(blogFeeds, null, 2), 'utf-8');

    logger.info('[store-blog-feeds] finished');
  }
}
