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
 * フィード情報一覧。追加順
 * ラベルが被るとバリデーションエラーになるので別のラベルを設定してください
 */
// prettier-ignore
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  ['DeNA', 'https://engineering.dena.com/blog/index.xml'],
  ['サイバーエージェント', 'https://developers.cyberagent.co.jp/blog/feed/'],
  ['LINEヤフー', 'https://techblog.lycorp.co.jp/ja/feed/index.xml'],
  ['Zenn', 'https://zenn.dev/p/team_zenn/feed'],
  ['はてな', 'https://developer.hatenastaff.com/feed'],
  ['ドワンゴ', 'https://dwango.github.io/index.xml'],
  ['Simon Willison', 'https://simonwillison.net/atom/everything/'],
  ['bufferings', 'https://bufferings.hatenablog.com/feed'],
  ['きしだのはてな', 'https://nowokay.hatenablog.com/feed'],
  ['npaka', 'https://note.com/npaka/rss'],
  ['WWW WATCH', 'https://hyper-text.org/feed/blog.xml'],
  ['PublicKey', 'https://www.publickey1.jp/atom.xml'],
  ['ITmedia AI+', 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'],
  ['テクノエッジ', 'https://www.techno-edge.net/rss20/index.rdf'],
  ["O'Reilly Radar", 'https://www.oreilly.com/radar/feed/'],
  ['AI Shift', 'https://www.ai-shift.co.jp/techblog/feed'],
  ['一休.com', 'https://user-first.ikyu.co.jp/feed'],
  ['10X Product Blog', 'https://product.10x.co.jp/feed'],
  ['ACES', 'https://tech.acesinc.co.jp/feed'],
  ['Algomatic', 'https://tech.algomatic.jp/feed'],
  ['Dentsu Digital', 'https://note.com/dd_techblog/rss'],
  ['G-gen', 'https://blog.g-gen.co.jp/feed'],
  ['ELYZA', 'https://zenn.dev/p/elyza/feed'],
  ['ExWZD', 'https://zenn.dev/p/exwzd/feed'],
  ['松尾研究所', 'https://zenn.dev/p/mkj/feed'],
  ['Accenture Banking', 'https://bankingblog.accenture.com/feed'],
  ['BCG Japan', 'https://bcg-jp.com/feed/'],
]);
