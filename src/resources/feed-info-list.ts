type ValidUrl = `${'http' | 'https'}://${string}.${string}`;

type FeedInfoTuple = [label: string, url: ValidUrl];

export interface FeedInfo {
  label: string;
  url: ValidUrl;
}

const createFeedInfoList = (feedInfoTuples: FeedInfoTuple[]) => {
  const feedInfoList: FeedInfo[] = [];

  for (const [label, url] of feedInfoTuples) {
    feedInfoList.push({
      label,
      url,
    });
  }

  return feedInfoList;
};

/**
 * フィード情報一覧。アルファベット順
 * ラベルが被るとバリデーションエラーになるので別のラベルを設定してください
 */
// prettier-ignore
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  ['ABEJA', 'https://tech-blog.abeja.asia/feed'],
  ['AI Shift', 'https://www.ai-shift.co.jp/techblog/feed'],
  ['BASE', 'https://devblog.thebase.in/feed'],
  ['CAMPFIRE', 'https://note.com/campfire_dev/rss'],
  ['CyberAgent', 'https://developers.cyberagent.co.jp/blog/feed/'],
  ['DeNA', 'https://engineering.dena.com/blog/index.xml'],
  ['DeNA(Zenn Publication)', 'https://zenn.dev/p/dena/feed'],
  ['DMM', 'https://developersblog.dmm.com/feed'],
  ['ELYZA', 'https://elyza-inc.hatenablog.com/feed'],
  ['freee', 'https://developers.freee.co.jp/feed'],
  ['Findy', 'https://tech.findy.co.jp/feed'],
  ['g-gen', 'https://blog.g-gen.co.jp/feed'],
  ['GIGAZINE', 'https://gigazine.net/news/rss_2.0/'],
  ['Google', 'https://developers-jp.googleblog.com/atom.xml'],
  ['Happy Elements', 'https://zenn.dev/p/happy_elements/feed'],
  ['HENNGE', 'https://blog.smtps.jp/feed'],
  ['IIJ', 'https://eng-blog.iij.ad.jp/feed'],
  ['ITmedia AI＋', 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'],
  ['LINEヤフー', 'https://techblog.lycorp.co.jp/ja/feed/index.xml'],
  ['LayerX', 'https://tech.layerx.co.jp/feed'],
  ['Mackerel', 'https://mackerel.io/ja/blog/feed'],
  ['NTT ドコモ', 'https://nttdocomo-developers.jp/feed'],
  ['NTTコミュニケーションズ', 'https://engineers.ntt.com/feed'],
  ['Preferred Networks', 'https://tech.preferred.jp/ja/blog/llm-plamo/feed'],
  ['Progate', 'https://tech.prog-8.com/feed'],
  ['Qiita', 'https://zine.qiita.com/feed/'],
  ['Sansan', 'https://buildersbox.corp-sansan.com/feed'],
  ['SEGA', 'https://techblog.sega.jp/feed'],
  ['SmartHR', 'https://tech.smarthr.jp/feed'],
  ['SmartNews', 'https://developer.smartnews.com/blog/feed'],
  ['Speee', 'https://tech.speee.jp/feed'],
  ['TechRacho', 'https://techracho.bpsinc.jp/feed'],
  ['Tier IV', 'https://medium.com/feed/tier-iv-tech-blog/tagged/tech-blog'],
  ['Ubie', 'https://zenn.dev/p/ubie_dev/feed'],
  ['ZOZO', 'https://techblog.zozo.com/feed'],
  ['joisino', 'https://joisino.hatenablog.com/feed'],
  ['note', 'https://engineerteam.note.jp/m/m70da42dac8cf/rss'],
  ['paiza', 'https://paiza.hatenablog.com/feed'],
  ['pixiv', 'https://zenn.dev/p/pixiv/feed'],
  ['PhotoshopVIP', 'https://photoshopvip.net/feed'],
  ['Webクリエイターボックス', 'https://www.webcreatorbox.com/feed/'],
  ['アカツキ', 'https://hackerslab.aktsk.jp/feed'],
  ['カカクコム', 'https://kakaku-techblog.com/feed'],
  ['クックパッド', 'https://techlife.cookpad.com/feed'],
  ['シネマトゥデイ', 'https://feeds.cinematoday.jp/cinematoday_update'],
  ['コロプラ', 'https://blog.colopl.dev/feed'],
  ['コリス', 'https://coliss.com/feed'],
  ['さくら', 'https://knowledge.sakura.ad.jp/feed/'],
  ['ドワンゴ', 'https://dwango.github.io/index.xml'],
  ['ナゾロジー', 'https://nazology.kusuguru.co.jp/feed/'],
  ['フューチャー', 'https://future-architect.github.io/atom.xml'],
  ['富士通研究所', 'https://blog.fltech.dev/feed'],
  ['松尾研究所', 'https://zenn.dev/p/mkj/feed'],
  ['松田軽太のブロぐる', 'https://www.matudakta.com/feed'],
  ['楽天コマース', 'https://commerce-engineer.rakuten.careers/feed/category/%E3%83%86%E3%83%83%E3%82%AF'],
  ['窓の杜', 'https://forest.watch.impress.co.jp/data/rss/1.0/wf/feed.rdf'],
  ['日経ビジネス', 'https://business.nikkei.com/rss/sns/nb.rdf'],
  ['日本仮想化技術', 'https://tech.virtualtech.jp/feed'],
  ['ミツカリ', 'https://tech-blog.mitsucari.com/feed'],
  ['メドピア', 'https://tech.medpeer.co.jp/feed'],
  ['トレタ', 'https://tech.toreta.in/feed'],
  ['弁護士ドットコム', 'https://creators.bengo4.com/feed'],
  ['ユニファ', 'https://tech.unifa-e.com/feed'],
  ['ラクス', 'https://tech-blog.rakus.co.jp/feed'],
  ['エクサウィザーズ', 'https://techblog.exawizards.com/feed'],
  ['エムスリー', 'https://www.m3tech.blog/feed'],
  ['はてな', 'https://developer.hatenastaff.com/feed'],
  ['安宅和人（はてなブログ）', 'https://kaz-ataka.hatenablog.com/feed'],
]);
