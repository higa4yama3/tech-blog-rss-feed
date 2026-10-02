import type { ContentFormat, FeedTier } from './feed-tier';
import type { TopicId } from './interest-profile';

type ValidUrl = `${'http' | 'https'}://${string}.${string}`;

export interface FeedInfo {
  label: string;
  url: ValidUrl;
  tier: FeedTier;
  tags?: string[];
  /** 集約時の件数上限。新しい順ではなくスコア順で残す */
  maxItemsInAggregate?: number;
  contentFormat?: ContentFormat;
  /** ソース全体の既定トピック。記事ごとのキーワード判定に足される */
  topics?: TopicId[];
}

type FeedInput = {
  label: string;
  url: ValidUrl;
  tier?: FeedTier;
  tags?: string[];
  maxItemsInAggregate?: number;
  contentFormat?: ContentFormat;
  topics?: TopicId[];
};

const defineFeed = ({
  label,
  url,
  tier = 'core',
  tags,
  maxItemsInAggregate,
  contentFormat,
  topics,
}: FeedInput): FeedInfo => ({
  label,
  url,
  tier,
  tags,
  maxItemsInAggregate,
  contentFormat,
  topics,
});

/**
 * フィード情報一覧。アルファベット順
 * ラベルが被るとバリデーションエラーになるので別のラベルを設定してください
 */
// prettier-ignore
export const FEED_INFO_LIST: FeedInfo[] = [
  defineFeed({ label: 'ABEJA', url: 'https://tech-blog.abeja.asia/feed' }),
  defineFeed({ label: 'AI Shift', url: 'https://zenn.dev/p/aishift/feed' }),
  defineFeed({ label: 'BASE', url: 'https://devblog.thebase.in/feed' }),
  defineFeed({ label: 'CAMPFIRE', url: 'https://note.com/campfire_dev/rss' }),
  defineFeed({ label: 'CyberAgent', url: 'https://developers.cyberagent.co.jp/blog/feed/' }),
  defineFeed({ label: 'DeNA', url: 'https://engineering.dena.com/blog/index.xml' }),
  defineFeed({ label: 'DMM', url: 'https://developersblog.dmm.com/feed' }),
  defineFeed({ label: 'freee', url: 'https://developers.freee.co.jp/feed' }),
  defineFeed({ label: 'Findy', url: 'https://tech.findy.co.jp/feed' }),
  defineFeed({ label: 'g-gen', url: 'https://blog.g-gen.co.jp/feed' }),
  defineFeed({
    label: 'GIGAZINE',
    url: 'https://gigazine.net/news/rss_2.0/',
    tier: 'media',
    maxItemsInAggregate: 3,
  }),
  defineFeed({ label: 'Google', url: 'https://developers-jp.googleblog.com/atom.xml' }),
  defineFeed({ label: 'Happy Elements', url: 'https://zenn.dev/p/happy_elements/feed', tier: 'optional' }),
  defineFeed({ label: 'Hacker News', url: 'https://hnrss.org/frontpage', tier: 'signal', tags: ['news'] }),
  defineFeed({ label: 'IIJ', url: 'https://eng-blog.iij.ad.jp/feed' }),
  defineFeed({
    label: 'iDID',
    url: 'https://idid.team/feed/',
    tier: 'curated',
    tags: ['design', 'curated'],
    topics: ['frontend'],
  }),
  defineFeed({
    label: 'ITmedia NEWS',
    url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',
    tier: 'signal',
    tags: ['news'],
    maxItemsInAggregate: 8,
  }),
  defineFeed({ label: 'LINEヤフー', url: 'https://techblog.lycorp.co.jp/ja/feed/index.xml' }),
  defineFeed({ label: 'LayerX', url: 'https://tech.layerx.co.jp/feed' }),
  defineFeed({ label: 'Mackerel', url: 'https://mackerel.io/ja/blog/feed' }),
  defineFeed({ label: 'NTT ドコモ', url: 'https://nttdocomo-developers.jp/feed' }),
  defineFeed({ label: 'NTTコミュニケーションズ', url: 'https://engineers.ntt.com/feed' }),
  defineFeed({ label: 'Qiita', url: 'https://zine.qiita.com/feed/', tier: 'media', maxItemsInAggregate: 5 }),
  defineFeed({ label: 'Sansan', url: 'https://buildersbox.corp-sansan.com/feed' }),
  defineFeed({ label: 'SEGA', url: 'https://techblog.sega.jp/feed' }),
  defineFeed({ label: 'SmartHR', url: 'https://tech.smarthr.jp/feed' }),
  defineFeed({ label: 'Speee', url: 'https://tech.speee.jp/feed' }),
  defineFeed({ label: 'TechRacho', url: 'https://techracho.bpsinc.jp/feed' }),
  defineFeed({ label: 'Ubie', url: 'https://zenn.dev/p/ubie_dev/feed', tier: 'optional' }),
  defineFeed({ label: 'ZOZO', url: 'https://techblog.zozo.com/feed' }),
  defineFeed({
    label: 'Anthropic News',
    url: 'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml',
    tier: 'research',
    tags: ['ai', 'research'],
    contentFormat: 'longread',
    topics: ['ai'],
  }),
  defineFeed({
    label: 'Anthropic Research',
    url: 'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_research.xml',
    tier: 'research',
    tags: ['ai', 'research'],
    contentFormat: 'longread',
    topics: ['ai'],
  }),
  defineFeed({
    label: 'はてな IT人気',
    url: 'https://b.hatena.ne.jp/hotentry/it.rss',
    tier: 'hotentry',
    tags: ['hatena'],
  }),
  defineFeed({ label: 'joisino', url: 'https://joisino.hatenablog.com/feed' }),
  defineFeed({ label: 'note', url: 'https://engineerteam.note.jp/m/m70da42dac8cf/rss' }),
  defineFeed({ label: 'pixiv', url: 'https://zenn.dev/p/pixiv/feed', tier: 'optional' }),
  defineFeed({
    label: 'PhotoshopVIP',
    url: 'https://photoshopvip.net/feed',
    tier: 'media',
    maxItemsInAggregate: 3,
    topics: ['frontend'],
  }),
  defineFeed({
    label: 'Webクリエイターボックス',
    url: 'https://www.webcreatorbox.com/feed/',
    tier: 'media',
    maxItemsInAggregate: 3,
    topics: ['frontend'],
  }),
  defineFeed({ label: 'アカツキ', url: 'https://hackerslab.aktsk.jp/feed' }),
  defineFeed({ label: 'カカクコム', url: 'https://kakaku-techblog.com/feed' }),
  defineFeed({ label: 'クックパッド', url: 'https://techlife.cookpad.com/feed' }),
  defineFeed({
    label: 'シネマトゥデイ',
    url: 'https://feeds.cinematoday.jp/cinematoday_update',
    tier: 'optional',
    // 週45件前後出るので、はてブと関心スコアの上位だけ残す
    maxItemsInAggregate: 8,
    topics: ['culture'],
  }),
  defineFeed({ label: 'コロプラ', url: 'https://blog.colopl.dev/feed' }),
  defineFeed({
    label: 'コリス',
    url: 'https://coliss.com/feed',
    tier: 'media',
    maxItemsInAggregate: 3,
    topics: ['frontend'],
  }),
  defineFeed({ label: 'さくら', url: 'https://knowledge.sakura.ad.jp/feed/' }),
  defineFeed({ label: 'ドワンゴ', url: 'https://dwango.github.io/index.xml' }),
  defineFeed({
    label: 'ナゾロジー',
    url: 'https://nazology.kusuguru.co.jp/feed/',
    tier: 'media',
    maxItemsInAggregate: 3,
    topics: ['science'],
  }),
  defineFeed({ label: 'フューチャー', url: 'https://future-architect.github.io/atom.xml' }),
  defineFeed({ label: '富士通研究所', url: 'https://blog.fltech.dev/feed' }),
  defineFeed({ label: '松尾研究所', url: 'https://zenn.dev/p/mkj/feed', tier: 'optional' }),
  defineFeed({ label: '松田軽太のブロぐる', url: 'https://www.matudakta.com/feed' }),
  defineFeed({
    label: '楽天コマース',
    url: 'https://commerce-engineer.rakuten.careers/feed/category/%E3%83%86%E3%83%83%E3%82%AF',
  }),
  defineFeed({
    label: '窓の杜',
    url: 'https://forest.watch.impress.co.jp/data/rss/1.0/wf/feed.rdf',
    tier: 'media',
    maxItemsInAggregate: 5,
  }),
  defineFeed({
    label: '日経ビジネス',
    url: 'https://business.nikkei.com/rss/sns/nb.rdf',
    tier: 'media',
    maxItemsInAggregate: 5,
    topics: ['business'],
  }),
  defineFeed({ label: '日本仮想化技術', url: 'https://tech.virtualtech.jp/feed' }),
  defineFeed({ label: 'ミツカリ', url: 'https://tech-blog.mitsucari.com/feed' }),
  defineFeed({ label: 'メドピア', url: 'https://tech.medpeer.co.jp/feed' }),
  defineFeed({ label: 'トレタ', url: 'https://tech.toreta.in/feed' }),
  defineFeed({ label: '弁護士ドットコム', url: 'https://creators.bengo4.com/feed' }),
  defineFeed({ label: 'ユニファ', url: 'https://tech.unifa-e.com/feed' }),
  defineFeed({ label: 'ラクス', url: 'https://tech-blog.rakus.co.jp/feed' }),
  defineFeed({ label: 'エムスリー', url: 'https://www.m3tech.blog/feed' }),
  defineFeed({ label: 'はてな', url: 'https://developer.hatenastaff.com/feed' }),
  defineFeed({
    label: '安宅和人（はてなブログ）',
    url: 'https://kaz-ataka.hatenablog.com/feed',
    tier: 'essential',
    tags: ['essay'],
    contentFormat: 'longread',
  }),
];

export const FEED_INFO_BY_LABEL = new Map(FEED_INFO_LIST.map((feedInfo) => [feedInfo.label, feedInfo]));
