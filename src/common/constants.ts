const siteUrlStem = 'https://higa4yama3.github.io/tech-blog-rss-feed';
const siteUrl = `${siteUrlStem}/`;

export default {
  // サイト設定
  siteUrl: `${siteUrl}`,
  siteUrlStem: siteUrlStem,
  siteTitle: 'RSS',
  siteDescription: 'あっ、好きな記事をまとめたRSSフィードの配信',

  // フィード設定
  feedTitle: 'RSS',
  feedDescription: 'あっ、好きな記事をまとめたRSSフィード',
  feedLanguage: 'ja',
  feedCopyright: 'higa4yama3/tech-blog-rss-feed',
  feedGenerator: 'higa4yama3/tech-blog-rss-feed',
  feedUrls: {
    atom: `${siteUrl}feeds/atom.xml`,
    rss: `${siteUrl}feeds/rss.xml`,
    json: `${siteUrl}feeds/feed.json`,
  },

  // リンク
  author: 'higa4yama3',
  gitHubUserUrl: 'https://github.com/higa4yama3/',
  gitHubRepositoryUrl: 'https://github.com/higa4yama3/tech-blog-rss-feed/',
  xUserUrl: 'https://x.com/higa4yama3',

  // Google Analytics系
  googleSiteVerification: '',
  globalSiteTagKey: '',

  // フィードの取得などに使う UserAgent
  requestUserAgent: 'facebookexternalhit/1.1; higa4yama3/tech-blog-rss-feed',

  // サイトの追加方法のリンク
  howToAddSiteLink: '',

  // 処理の設定
  feedFetchConcurrency: 50, // フィードを取得する並列数
  feedOgFetchConcurrency: 20, // OG情報を取得する並列数
  aggregateFeedDurationInHours: 8 * 24, // まとめフィードの対象となる時間の範囲
  maxFeedDescriptionLength: 200, // フィードのdescriptionの最大文字数
  maxFeedContentLength: 500, // フィードのcontentの最大文字数
  processImageConcurrency: 50, // 画像の処理の並列数。画像取得と変換
  eleventyFetchConcurrency: 50, // Eleventyの画像取得の並列数
  fetchedFeedCacheDurationInHours: 1, // フィードのキャッシュの有効時間
  fetchedOgCacheDurationInHours: 24, // OG情報のキャッシュの有効時間
};
