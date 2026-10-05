import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { classifyTopics, formatPickReason, scoreItem } from '../src/feed/item-scorer';
import { FRESHNESS_HALF_LIFE_HOURS } from '../src/resources/interest-profile';

const now = dayjs('2026-10-02T12:00:00Z');

const createItem = (overrides: Partial<EnrichedFeedItem> = {}): EnrichedFeedItem => ({
  title: '記事',
  link: `https://example.com/${Math.random()}`,
  isoDate: now.toISOString(),
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

describe('classifyTopics', () => {
  it('タイトルのキーワードでトピックを決める', () => {
    expect(classifyTopics(createItem({ title: 'Kubernetesの「境界」と「粒度」を引き直す' }))).toEqual(['engineering']);
    expect(classifyTopics(createItem({ title: '生成AIでレビューを自動化する' }))).toEqual(['ai']);
  });

  it('略語が英単語の一部に当たらない', () => {
    expect(classifyTopics(createItem({ title: 'Rails の email 送信を見直す' }))).not.toContain('ai');
    expect(classifyTopics(createItem({ title: 'Linux カーネルの話' }))).not.toContain('frontend');
  });

  it('一般ニュースの言い回しを技術トピックと取り違えない', () => {
    expect(classifyTopics(createItem({ title: '「Androidのマイナンバーカード」提供へ　物理カードなしでも' }))).toEqual(
      [],
    );
    expect(classifyTopics(createItem({ title: '最新の車21台をテストした結果' }))).not.toContain('org');
  });

  it('ソースの既定トピックを足し、その場合は本文を見ない', () => {
    const item = createItem({
      title: 'トム・クルーズ来日',
      sourceTopics: ['culture'],
      contentSnippet: 'Kubernetes の設計について',
    });
    expect(classifyTopics(item)).toEqual(['culture']);
  });

  it('ニュース系はタイトルだけで判定する', () => {
    const item = createItem({ sourceTier: 'signal', title: '自動運転バスを運行', contentSnippet: 'Kubernetes の設計' });
    expect(classifyTopics(item)).toEqual([]);
  });

  it('タイトルで決まらないときは本文の冒頭を見る', () => {
    expect(classifyTopics(createItem({ title: '今週やったこと', contentSnippet: 'LLM の評価基盤を作った' }))).toEqual([
      'ai',
    ]);
  });
});

describe('scoreItem', () => {
  it('作った・数字のある記事は、同条件の素の記事より上', () => {
    const plain = scoreItem(createItem({ title: '社内ツールについて' }), new Map(), { now });
    const exciting = scoreItem(createItem({ title: '12GB VRAMで125Bモデルを動かすツールを作った' }), new Map(), {
      now,
    });
    expect(exciting.score).toBeGreaterThan(plain.score);
    expect(exciting.signals).toEqual(expect.arrayContaining(['作ってみた', '数字のインパクト']));
  });

  it('参加記・採用・事件は減点され、理由が penalties に残る', () => {
    const report = scoreItem(createItem({ title: 'iOSDC Japan 2026参加レポート' }), new Map(), { now });
    const plain = scoreItem(createItem({ title: 'iOSDC Japan 2026' }), new Map(), { now });
    expect(report.score).toBeLessThan(plain.score);
    expect(report.penalties).toEqual(['イベント告知・参加記']);

    const incident = scoreItem(createItem({ title: '不正アクセスで顧客情報流出か' }), new Map(), { now });
    expect(incident.penalties).toContain('事件・事故');
  });

  it('技術が主題のインターンレポートは採用扱いしない', () => {
    const result = scoreItem(
      createItem({ title: 'Kafkaアラートの初動調査を支援するAI Alert Watcherの開発（インターンレポート）' }),
      new Map(),
      { now },
    );
    expect(result.penalties).toEqual([]);
  });

  it('はてブ数は効くが、数百件でも作った系の加点を桁違いに上回らない', () => {
    const popular = createItem({ title: 'ニュース' });
    const popularScore = scoreItem(popular, new Map([[popular.link, 300]]), { now });
    const built = scoreItem(createItem({ title: '自作キーボードを作った。描画が10倍速くなった' }), new Map(), { now });
    expect(popularScore.signals).toEqual(['はてブ300']);
    expect(popularScore.score / built.score).toBeLessThan(2);
  });

  it('半減期でスコアが半分になる', () => {
    const fresh = scoreItem(createItem({ isoDate: now.toISOString() }), new Map(), { now });
    const old = scoreItem(
      createItem({ isoDate: now.subtract(FRESHNESS_HALF_LIFE_HOURS, 'hour').toISOString() }),
      new Map(),
      { now },
    );
    expect(old.score).toBeCloseTo(fresh.score / 2, 2);
  });

  it('カルチャーは同条件の技術記事より下', () => {
    const tech = scoreItem(createItem({ title: 'AIの話' }), new Map(), { now });
    const culture = scoreItem(createItem({ title: '映画の話' }), new Map(), { now });
    expect(culture.score).toBeLessThan(tech.score);
  });

  it('HN のポイントを理由に出す', () => {
    const result = scoreItem(
      createItem({ sourceTier: 'signal', title: 'Show HN: a tiny database', hnPoints: 183 }),
      new Map(),
      {
        now,
      },
    );
    expect(formatPickReason(result)).toBe('HN 183pt · 作ってみた');
  });

  it('加点がないときはトピック名を理由に使う', () => {
    const result = scoreItem(createItem({ title: 'Terraform の運用' }), new Map(), { now });
    expect(formatPickReason(result)).toBe('設計・SRE・基盤');
  });
});
