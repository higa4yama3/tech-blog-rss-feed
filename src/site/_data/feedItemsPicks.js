import { toSiteFeedItem } from '../../common/site-feed-item.js';

export default async () => {
  const feedDataModule = await import('../feeds/picks.json');
  return feedDataModule.default.items.map(toSiteFeedItem);
};
