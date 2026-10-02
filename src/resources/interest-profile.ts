import type { FeedTier } from './feed-tier';

/**
 * 関心プロファイル。「何を読みたい記事とみなすか」の定義
 *
 * 並べ替えの軸は「読んで高揚する記事か」（作った・動かした・速くなった・発見した）。
 * トピックは並べ替えではなく棚（ナビゲーション）に使い、重みは沈めたいものだけ下げる。
 * 数値はすべて仮置き。出力を見て違和感があればここを直す
 */

export type TopicId = 'ai' | 'engineering' | 'frontend' | 'org' | 'security' | 'science' | 'business' | 'culture';

export interface TopicDefinition {
  id: TopicId;
  label: string;
  /** スコアに掛ける倍率。複数トピックに当たった場合は最大値を使う */
  weight: number;
  keywords: RegExp;
}

export interface SignalPattern {
  label: string;
  pattern: RegExp;
  /** 加点はプラス、減点はマイナス */
  points: number;
}

// 表示順も兼ねる
export const TOPICS: TopicDefinition[] = [
  {
    id: 'ai',
    label: 'AI・LLM',
    weight: 1,
    keywords:
      /\bAI\b|\bLLMs?\b|生成AI|機械学習|深層学習|ディープラーニング|ニューラル|エージェント|\b[Aa]gents?\b|\bRAG\b|\bMCP\b|プロンプト|\b[Pp]rompt|Claude|Anthropic|\bGPT|OpenAI|Gemini|Copilot|Codex|[Ee]mbedding|ファインチューニング|Fine-?tun|fine-?tun|推論|[Tt]ransformer|拡散モデル|\bVLM|音声認識|画像生成|PLaMo|Llama|Qwen|DeepSeek/,
  },
  {
    id: 'engineering',
    label: '設計・SRE・基盤',
    weight: 1,
    keywords:
      /設計|アーキテクチャ|[Aa]rchitecture|Kubernetes|\bk8s\b|\bGKE\b|\bEKS\b|\bAWS\b|\bGCP\b|Google Cloud|Azure|Terraform|\bSRE\b|オブザーバビリティ|[Oo]bservability|監視|アラート|障害|インシデント|パフォーマンス|高速化|性能|データベース|[Dd]atabase|Postgre|MySQL|SQLite|Redis|BigQuery|Snowflake|データ基盤|マイクロサービス|モノリス|リアーキテクチャ|リプレイス|(システム|基盤|DB|データベース|クラウド|インフラ|サーバー?)(の|を|へ)?移行|移行(プロジェクト|戦略)|マイグレーション|インフラ|ネットワーク|Linux|コンテナ|Docker|CI\/CD|GitHub Actions|\bRust\b|Go言語|Golang|コンパイラ|[Cc]ompiler|[Kk]ernel|分散/,
  },
  {
    id: 'frontend',
    label: 'フロントエンド・デザイン',
    weight: 1,
    keywords:
      /\bCSS|\bHTML|JavaScript|TypeScript|\bReact\b|Next\.js|\bVue\b|Svelte|フロントエンド|[Ff]rontend|\bUI\b|\bUX\b|デザイン|[Dd]esign|Figma|アクセシビリティ|\ba11y\b|アニメーション|フォント|ブラウザ|Web\s?API|\bSwift\b|Kotlin|Flutter|Jetpack Compose|SwiftUI/,
  },
  {
    id: 'org',
    label: '組織・マネジメント・QA',
    weight: 1,
    keywords:
      /マネジメント|マネージャー|\bEM\b|組織|チーム|1on1|育成|キャリア|評価制度|オンボーディング|スクラム|アジャイル|生産性|\bQA\b|品質|テスト(自動化|設計|計画|戦略|コード|駆動)|単体テスト|E2Eテスト|\bTDD\b|ドキュメント|意思決定|リーダーシップ/,
  },
  {
    id: 'security',
    label: 'セキュリティ',
    weight: 1,
    keywords:
      /セキュリティ|[Ss]ecurity|脆弱性|[Vv]ulnerab|\bCVE-|不正アクセス|情報流出|漏洩|漏えい|攻撃|マルウェア|ランサム|フィッシング|認証|認可|OAuth|ゼロトラスト|サプライチェーン/,
  },
  {
    id: 'science',
    label: 'サイエンス',
    weight: 1,
    keywords: /研究|論文|arXiv|発見|判明|宇宙|物理学|量子|生物|脳|細胞|化石|恐竜|天文|数学|[Pp]hysics|[Qq]uantum/,
  },
  {
    id: 'business',
    label: 'ビジネス・公共',
    weight: 0.8,
    keywords:
      /経営|戦略|市場|決算|売上|株価|投資|スタートアップ|起業|M&A|買収|資金調達|\bIPO\b|規制|政策|行政|自治体|デジタル庁/,
  },
  {
    id: 'culture',
    label: 'カルチャー',
    weight: 0.5,
    keywords: /映画|アニメ|漫画|マンガ|ドラマ|俳優|声優|監督|主演|劇場版|興行|シリーズ最新作|小説|音楽/,
  },
];

export const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

/**
 * はてブ・HN の反応をどれだけ効かせるか。log2(1 + 件数) に掛ける
 * 1 だとはてブ数百件の記事がパターン加点（最大3）を常に上回り、「人気」と同じ並びになる
 */
export const SOCIAL_WEIGHT = 0.6;

/** どのトピックにも当たらない記事の倍率 */
export const UNTAGGED_TOPIC_WEIGHT = 0.8;

/**
 * 読んで高揚する記事の手がかり。タイトルとカテゴリに対して判定する
 * 1記事あたりの加点は EXCITEMENT_MAX_POINTS で頭打ち
 */
export const EXCITEMENT_PATTERNS: SignalPattern[] = [
  {
    label: '作ってみた',
    pattern: /作ってみた|作った|作りました|つくった|自作|個人開発|ハッカソン|Show HN|I built|I made|We built/,
    points: 1.5,
  },
  {
    label: '動かしてみた',
    pattern: /試してみた|やってみた|動かしてみた|検証してみた|比べてみた|ベンチマーク|[Bb]enchmark|動かす|動かした/,
    points: 1,
  },
  {
    label: '仕組みを掘る',
    pattern:
      /仕組み|内部|裏側|解剖|深掘り|徹底解説|読み解|ソースコードを読|from scratch|ゼロから|internals|under the hood|deep dive|how .+ works/i,
    points: 1,
  },
  {
    label: '数字のインパクト',
    pattern:
      /\d+(\.\d+)?\s?(倍|[xX×](?![a-zA-Z]))|爆速|高速化|削減|半減|\b1\/\d+|\d+%(削減|改善|高速)|\d+行で|\d+(秒|分)で|\d+\s?GB|\d+B(?![a-zA-Z])/,
    points: 1.5,
  },
  {
    label: '新しく出た',
    pattern:
      /公開しました|リリースしました|\bOSS\b|オープンソース|新機能|[Ll]aunch|Released|released|[Ii]ntroducing|[Oo]pen[- ]?[Ss]ourc/,
    points: 1,
  },
  {
    label: '発見',
    pattern: /発見|判明|世界初|史上初|謎|[Bb]reakthrough|[Dd]iscover/,
    points: 1,
  },
  {
    label: '設計判断・移行',
    pattern: /設計判断|意思決定|トレードオフ|なぜ.+のか|引き直す|移行|リアーキテクチャ|リプレイス/,
    points: 0.8,
  },
];

export const EXCITEMENT_MAX_POINTS = 3;

/** 読む前から中身の予想がつく記事。告知・参加記・採用・定期配信 */
export const DULL_PATTERNS: SignalPattern[] = [
  {
    label: 'イベント告知・参加記',
    pattern:
      /参加レポート|参加してきました|参加しました|参加記|参加した話|登壇しました|登壇します|登壇レポート|開催しました|開催します|開催決定|開催レポート|\d+\/\d+開催|イベントレポート|勉強会|ミートアップ|Meetup|ウェビナー|セミナー|スポンサー|協賛|ブース出展/i,
    points: -2,
  },
  {
    // 「（インターンレポート）○○の開発」のように技術が主題のものは減点しない
    label: '採用・社内行事',
    pattern:
      /採用(情報|活動|広報|イベント|ピッチ|担当)|エンジニア採用|募集中|求人|入社エントリ|入社しました|退職エントリ|新卒(エンジニア)?研修|研修レポート|内定者|インターンに参加|インターン(体験|参加)記|メンバー紹介|社員紹介|福利厚生|オフィス紹介/,
    points: -1.5,
  },
  {
    // 不安で読まれる記事。セキュリティ棚には残るが今日の5本には上げない
    label: '事件・事故',
    pattern: /不正アクセス|情報流出|流出か|漏えい|漏洩|逮捕|詐欺|訴訟|炎上|障害で|休講/,
    points: -2,
  },
  {
    label: '定期配信・お知らせ',
    pattern:
      /お知らせ|ポッドキャスト|Podcast|週刊|月刊|今週の|Weekly|ニュースレター|アドベントカレンダー|Advent Calendar|#\d+\s*$/i,
    points: -1.5,
  },
];

/** ソースの信頼度。essential は必ず読みたい人、media は量が多く当たり外れがある */
export const TIER_WEIGHTS: Record<FeedTier, number> = {
  essential: 1.6,
  core: 1,
  research: 1.1,
  curated: 1,
  optional: 0.8,
  media: 0.7,
  signal: 0.8,
  hotentry: 0.9,
};

/** 鮮度の半減期（時間）。今日の5本用 */
export const FRESHNESS_HALF_LIFE_HOURS = 36;
