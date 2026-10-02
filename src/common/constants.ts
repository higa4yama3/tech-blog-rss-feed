const siteUrlStem = 'https://higa4yama3.github.io/tech-blog-rss-feed';
const siteUrl = `${siteUrlStem}/`;
const feedsBase = `${siteUrl}feeds/`;

export default {
  // サイト設定
  siteUrl: `${siteUrl}`,
  siteUrlStem: siteUrlStem,
  siteTitle: 'RSS',
  siteDescription: 'あっ、好きな記事をまとめたRSSフィードの配信',

  // フィード設定（後方互換: core = atom/rss/json）
  feedTitle: 'RSS',
  feedDescription: 'あっ、好きな記事をまとめたRSSフィード',
  feedLanguage: 'ja',
  feedCopyright: 'higa4yama3/tech-blog-rss-feed',
  feedGenerator: 'higa4yama3/tech-blog-rss-feed',
  feedUrls: {
    atom: `${feedsBase}atom.xml`,
    rss: `${feedsBase}rss.xml`,
    json: `${feedsBase}feed.json`,
    core: `${feedsBase}core.atom.xml`,
    media: `${feedsBase}media.atom.xml`,
    picks: `${feedsBase}picks.atom.xml`,
    discover: `${feedsBase}discover.atom.xml`,
    headlines: `${feedsBase}headlines.atom.xml`,
    research: `${feedsBase}research.atom.xml`,
    curated: `${feedsBase}curated.atom.xml`,
    hatenaIt: `${feedsBase}hatena-it.atom.xml`,
  },
  // トピック別フィードは `${feedsBaseUrl}topic-<id>.atom.xml`
  feedsBaseUrl: feedsBase,

  // リンク
  author: 'higa4yama3',
  gitHubUserUrl: 'https://github.com/higa4yama3/',
  gitHubRepositoryUrl: 'https://github.com/higa4yama3/tech-blog-rss-feed/',
  xUserUrl: 'https://x.com/higa4yama3',

  // Google Analytics系
  googleSiteVerification: '',
  globalSiteTagKey: '',

  // サイトの追加方法のリンク
  howToAddSiteLink: '',

  // フィードの取得などに使う UserAgent
  requestUserAgent: 'facebookexternalhit/1.1; higa4yama3/tech-blog-rss-feed',

  // 処理の設定
  feedFetchConcurrency: 50,
  feedOgFetchConcurrency: 20,
  aggregateFeedDurationInHours: 5 * 24,
  maxFeedDescriptionLength: 200,
  maxFeedContentLength: 500,
  maxResearchFeedDescriptionLength: 500,
  maxResearchFeedContentLength: 1500,
  maxHeadlinesDescriptionLength: 80,
  processImageConcurrency: 50,
  eleventyFetchConcurrency: 50,
  fetchedFeedCacheDurationInHours: 1,
  fetchedOgCacheDurationInHours: 24,

  // picks（今日の5本）。スコアの定義は src/resources/interest-profile.ts
  picksMaxItems: 5,
  picksWindowHours: 48,
  picksEssentialReservedSlots: 1,
  // 外から来る記事が自分のソースを押し出さないよう、tier ごとに枠を絞る
  picksMaxItemsPerTier: { hotentry: 2, signal: 1, media: 1, optional: 1 } as Partial<Record<string, number>>,

  // discover（今週の人気）
  discoverMinHatenaCount: 3,
  discoverWindowDays: 7,
  discoverMaxItems: 25,
  discoverMaxItemsPerSource: 3,
  discoverHalfLifeHours: 96,

  // トピック棚
  topicWindowDays: 7,
  topicMaxItems: 30,
  topicShelfItems: 3,

  // hatena IT 人気
  hatenaItMinBookmarkCount: 50,
  hatenaItWindowHours: 48,
  hatenaItMaxItems: 15,
  hatenaItMaxItemsPerDomain: 2,
  hatenaItDomainBlocklist: ['togetter.com', 'www.tokyo-sports.co.jp'],

  // curated (iDID)
  curatedMaxItemsPerDay: 3,
  ididBookmarkPathSegment: 'todays-bookmark',

  // headlines
  headlinesMaxItems: 30,
  headlinesWindowHours: 48,
};
