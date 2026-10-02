import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import type { BlogFeed } from '../feed/feed-storer';
import { FEED_INFO_LIST } from '../resources/feed-info-list';

/**
 * ソースの健康診断。feed-generate の後に実行する
 *
 * - 取得失敗: feed-info-list にあるのに blog-feeds.json に出てこない
 * - 休眠: 最新記事が DORMANT_DAYS 日より前
 * - 氾濫: 直近7日の記事数が FLOOD_ITEMS_PER_WEEK を超え、件数上限もない
 */

const DORMANT_DAYS = 180;
const FLOOD_ITEMS_PER_WEEK = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const dirName = url.fileURLToPath(new URL('.', import.meta.url));
const BLOG_FEEDS_PATH = path.join(dirName, '../site/blog-feeds/blog-feeds.json');

(async () => {
  const raw = await fs.readFile(BLOG_FEEDS_PATH, 'utf-8');
  const blogFeeds = JSON.parse(raw) as BlogFeed[];
  const blogFeedByLabel = new Map(blogFeeds.map((blogFeed) => [blogFeed.label, blogFeed]));
  const now = Date.now();

  const rows = FEED_INFO_LIST.filter((feedInfo) => feedInfo.tier !== 'hotentry').map((feedInfo) => {
    const blogFeed = blogFeedByLabel.get(feedInfo.label);
    const dates = (blogFeed?.items ?? []).map((item) => new Date(item.isoDate).getTime()).filter(Number.isFinite);
    const latest = dates.length > 0 ? Math.max(...dates) : undefined;
    return {
      feedInfo,
      fetched: blogFeed !== undefined,
      daysSinceLatest: latest !== undefined ? Math.floor((now - latest) / DAY_MS) : undefined,
      itemsLastWeek: dates.filter((date) => now - date < 7 * DAY_MS).length,
    };
  });

  const failed = rows.filter((row) => !row.fetched);
  const dormant = rows
    .filter((row) => row.fetched && (row.daysSinceLatest === undefined || row.daysSinceLatest > DORMANT_DAYS))
    .sort((a, b) => (b.daysSinceLatest ?? Number.POSITIVE_INFINITY) - (a.daysSinceLatest ?? Number.POSITIVE_INFINITY));
  const flooding = rows
    .filter((row) => row.itemsLastWeek > FLOOD_ITEMS_PER_WEEK && row.feedInfo.maxItemsInAggregate === undefined)
    .sort((a, b) => b.itemsLastWeek - a.itemsLastWeek);

  console.log(`ソース ${rows.length}件（はてな人気エントリーを除く）`);

  console.log(`\n取得失敗 ${failed.length}件: URL 変更・移転・RSS 廃止を確認する`);
  for (const row of failed) {
    console.log(`  ${row.feedInfo.label}  ${row.feedInfo.url}`);
  }

  console.log(`\n休眠 ${dormant.length}件: 最新記事が${DORMANT_DAYS}日より前`);
  for (const row of dormant) {
    console.log(`  ${String(row.daysSinceLatest ?? '-').padStart(5)}日  ${row.feedInfo.label}`);
  }

  console.log(`\n氾濫 ${flooding.length}件: 週${FLOOD_ITEMS_PER_WEEK}件超で maxItemsInAggregate がない`);
  for (const row of flooding) {
    console.log(`  ${String(row.itemsLastWeek).padStart(5)}件  ${row.feedInfo.label}`);
  }

  console.log('\n直近7日の件数 上位10:');
  for (const row of [...rows].sort((a, b) => b.itemsLastWeek - a.itemsLastWeek).slice(0, 10)) {
    console.log(`  ${String(row.itemsLastWeek).padStart(5)}件  ${row.feedInfo.label}`);
  }
})();
