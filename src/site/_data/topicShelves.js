import constants from '../../common/constants.js';
import { toSiteFeedItem } from '../../common/site-feed-item.js';
import { TOPICS } from '../../resources/interest-profile.js';

/**
 * トピック棚。items はトピックページ用の全件、shelfItems はトップ用
 * トップでは同じ記事を2回見せないよう、今日の5本と前の棚に出た記事を除く
 */
export default async () => {
  const picksModule = await import('../feeds/picks.json');
  const shownUrls = new Set(picksModule.default.items.map((item) => item.url));

  const shelves = [];
  for (const topic of TOPICS) {
    const feedDataModule = await import(`../feeds/topic-${topic.id}.json`);
    const items = feedDataModule.default.items.map(toSiteFeedItem);
    if (items.length === 0) {
      continue;
    }
    const shelfItems = items.filter((item) => !shownUrls.has(item.url)).slice(0, constants.topicShelfItems);
    for (const item of shelfItems) {
      shownUrls.add(item.url);
    }
    shelves.push({
      id: topic.id,
      label: topic.label,
      items,
      shelfItems,
      feedUrl: `${constants.feedsBaseUrl}topic-${topic.id}.atom.xml`,
    });
  }

  return shelves;
};
