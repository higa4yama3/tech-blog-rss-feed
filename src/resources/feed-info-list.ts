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
  // ['企業名・製品名など', 'RSS/AtomフィードのURL'],
  ['AI Shift', 'https://www.ai-shift.co.jp/techblog/feed'],
  ['DeNA(Zenn Publication)', 'https://zenn.dev/p/dena/feed'],
  ['Dentsu Digital', 'https://note.com/dd_techblog/rss'],
  ['ELYZA', 'https://elyza-inc.hatenablog.com/feed'],
  ['Generative Agents', 'https://blog.generative-agents.co.jp/feed'],
  ['g-gen', 'https://blog.g-gen.co.jp/feed'],
  ['ITmedia AI＋', 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'],
  ['Zenn（機械学習タグ）', 'https://zenn.dev/topics/%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92/feed'],
  ['Zenn（AIタグ）', 'https://zenn.dev/topics/ai/feed'],
  ['Zenn（生成AIタグ）', 'https://zenn.dev/topics/%E7%94%9F%E6%88%90ai/feed'],
  ['Zenn（DLタグ）', 'https://zenn.dev/topics/deeplearning/feed'],
  ['Zenn（LLMタグ）', 'https://zenn.dev/topics/llm/feed'],
  ['サイバーエージェント', 'https://developers.cyberagent.co.jp/blog/feed/'],
  ['フューチャー', 'https://future-architect.github.io/atom.xml'],
]);
