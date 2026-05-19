import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import type { FeedTier } from '../resources/feed-tier';

const dirName = url.fileURLToPath(new URL('.', import.meta.url));
const BLOG_FEEDS_PATH = path.join(dirName, '../site/blog-feeds/blog-feeds.json');

interface BlogFeedSummary {
  title: string;
  tier?: FeedTier;
  itemCount: number;
}

(async () => {
  const raw = await fs.readFile(BLOG_FEEDS_PATH, 'utf-8');
  const blogFeeds = JSON.parse(raw) as { title: string; items: { isoDate: string }[] }[];

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const counts: BlogFeedSummary[] = blogFeeds.map((blog) => ({
    title: blog.title,
    itemCount: blog.items.filter((item) => new Date(item.isoDate).getTime() >= weekAgo).length,
  }));

  counts.sort((a, b) => b.itemCount - a.itemCount);

  console.log('ソース別件数（直近7日）トップ20:');
  for (const entry of counts.slice(0, 20)) {
    console.log(`${entry.itemCount.toString().padStart(4)}  ${entry.title}`);
  }
})();
