import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { parseHnStats } from '../src/feed/feed-crawler';
import { capItemsPerSourceByScore, selectPicksItems, selectTopicItems } from '../src/feed/feed-item-processor';

const now = dayjs();

let linkCounter = 0;
const createItem = (overrides: Partial<EnrichedFeedItem> = {}): EnrichedFeedItem => ({
  title: `記事${linkCounter}`,
  link: `https://example.com/${linkCounter++}`,
  isoDate: now.subtract(1, 'hour').toISOString(),
  blogTitle: 'Example Blog',
  blogLink: 'https://example.com/',
  categories: [],
  sourceTier: 'core',
  sourceLabel: 'Example',
  sourceTags: [],
  sourceTopics: [],
  contentFormat: 'default',
  ...overrides,
});

describe('selectPicksItems', () => {
  it('同じソースからは1本だけ', () => {
    const picks = selectPicksItems(
      [createItem({ sourceLabel: 'A' }), createItem({ sourceLabel: 'A' }), createItem({ sourceLabel: 'B' })],
      new Map(),
      now,
    );
    expect(picks.map((item) => item.sourceLabel).sort()).toEqual(['A', 'B']);
  });

  it('はてな人気はドメイン単位で数え、tier の枠（2本）で止める', () => {
    const hotentry = (host: string, count: number) =>
      createItem({
        sourceTier: 'hotentry',
        sourceLabel: 'はてな IT人気',
        link: `https://${host}/${linkCounter++}`,
        hatenaBookmarkCountFromRss: count,
      });
    const picks = selectPicksItems(
      [hotentry('a.example', 500), hotentry('b.example', 400), hotentry('c.example', 300), createItem()],
      new Map(),
      now,
    );
    expect(picks.filter((item) => item.sourceTier === 'hotentry')).toHaveLength(2);
    expect(picks).toHaveLength(3);
  });

  it('同じ URL が複数のフィードにあっても1本にする', () => {
    const link = 'https://example.com/same';
    const picks = selectPicksItems(
      [
        createItem({ link, sourceLabel: 'A' }),
        createItem({ link, sourceLabel: 'はてな IT人気', sourceTier: 'hotentry' }),
      ],
      new Map(),
      now,
    );
    expect(picks).toHaveLength(1);
  });

  it('期間外の記事は選ばない', () => {
    const picks = selectPicksItems([createItem({ isoDate: now.subtract(10, 'day').toISOString() })], new Map(), now);
    expect(picks).toHaveLength(0);
  });

  it('スコア順に並べる', () => {
    const picks = selectPicksItems(
      [
        createItem({ sourceLabel: 'A', title: '社内ツールについて' }),
        createItem({ sourceLabel: 'B', title: 'ゼロからコンパイラを作った' }),
      ],
      new Map(),
      now,
    );
    expect(picks[0].sourceLabel).toBe('B');
  });
});

describe('capItemsPerSourceByScore', () => {
  it('新しい順ではなくスコア順で上限まで残す', () => {
    const popular = createItem({ sourceLabel: 'Media', isoDate: now.subtract(20, 'hour').toISOString() });
    const fresh = createItem({ sourceLabel: 'Media', isoDate: now.subtract(1, 'hour').toISOString() });
    const kept = capItemsPerSourceByScore(
      [popular, fresh],
      new Map([[popular.link, 200]]),
      new Map([['Media', 1]]),
      now,
    );
    expect(kept).toEqual([popular]);
  });

  it('上限のないソースはそのまま残す', () => {
    const items = [createItem({ sourceLabel: 'A' }), createItem({ sourceLabel: 'A' })];
    expect(capItemsPerSourceByScore(items, new Map(), new Map(), now)).toHaveLength(2);
  });
});

describe('selectTopicItems', () => {
  it('指定トピックの記事だけを返す', () => {
    const ai = createItem({ title: 'LLM の評価' });
    const infra = createItem({ title: 'Terraform の運用' });
    expect(selectTopicItems([ai, infra], new Map(), 'ai', now)).toEqual([ai]);
  });
});

describe('parseHnStats', () => {
  it('description から Points と Comments を取り出す', () => {
    const content =
      '<p>Comments URL: <a href="https://news.ycombinator.com/item?id=1">https://news.ycombinator.com/item?id=1</a></p>\n<p>Points: 183</p>\n<p># Comments: 42</p>';
    expect(parseHnStats(content)).toEqual({ hnPoints: 183, hnComments: 42 });
  });

  it('見つからなければ undefined', () => {
    expect(parseHnStats('')).toEqual({ hnPoints: undefined, hnComments: undefined });
  });
});
