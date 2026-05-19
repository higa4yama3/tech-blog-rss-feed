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

  // picks
  picksMode: 'daily' as 'daily' | 'weekly',
  picksDailyMaxItems: 3,
  picksWeeklyMaxItems: 10,
  picksWindowHours: 24,
  picksWeeklyWindowHours: 72,
  picksCoreBonus: 2,
  picksEssentialReservedSlots: 1,

  // discover
  discoverMinHatenaCount: 3,
  discoverWindowDays: 7,
  discoverMaxItems: 25,
  discoverCoreBonus: 1.5,

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
