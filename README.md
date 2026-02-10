# <img src="src/site/images/icon-transparent.png" height=26> 企業テックブログRSS (Customized)

企業のテックブログの更新をまとめたRSSフィードを配信するサイトです。
このリポジトリは [yamadashy/tech-blog-rss-feed](https://github.com/yamadashy/tech-blog-rss-feed) をフォークし、**よりスタイリッシュなデザイン（Bento風）** と **カスタマイズしやすいフィードリスト** に変更したものです。

## 特徴
- **Bento風デザイン**: シンプルでモダンなカード型レイアウト
- **厳選されたリスト**: 主要なテックブログのみを例示、自分好みのリストを簡単に作成可能
- **自動更新**: GitHub Actionsで定期的にフィード更新
- **エラー監視**: 外部テスト失敗時にIssue自動作成

## サイトのカスタマイズ方法

### 1. フィードの追加・削除
`src/resources/feed-info-list.ts` を編集することで、表示したいブログを自由に管理できます。

```typescript
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ここに追加したいブログの [名前, RSS URL] を記述します
  ['Mercari', 'https://engineering.mercari.com/blog/feed.xml'],
  ['LINEヤフー', 'https://techblog.lycorp.co.jp/ja/feed/index.xml'],
  // ...
]);
```

※ 元の全リストは `src/resources/feed-info-list.original.ts` にバックアップとして保存されています。必要に応じて参照してください。

### 2. デザインの調整
`src/site/_includes/styles/main.css` を編集することで、サイトの配色やレイアウトを調整できます。

## 開発とデプロイ

### GitHub Actions ワークフロー

#### CI (`ci.yml`)
- トリガー: mainへのpush/PR
- 実行内容: Lint（Biome, TypeScript, secretlint, actionlint）、タイポチェック、テスト
- generateジョブは全チェック通過後に実行
- カバレッジレポートをアーティファクトとして保存

#### External Tests (`external-test.yml`)
- トリガー: mainへのpush、毎週土曜5:30 JST
- 実行内容: 外部APIへの実際のリクエストテスト
- 失敗時にIssue自動作成（要Issue機能有効化）

#### Generate feeds and site (`generate-feed.yml`)
- トリガー: mainへのpush、定期実行（平日1時間おき、休日2時間おき）
- 実行内容: フィード生成 → サイトビルド → GitHub Pagesデプロイ
- 失敗時にIssue自動作成

更新タイミング（JST）:
- 平日: 8-24時の1時間おき
- 休日: 8-24時の2時間おき

### 初回セットアップ

1. **リポジトリをフォーク**

2. **GitHub Pages有効化**
   - Settings → Pages → Source: `gh-pages` ブランチ
   - 初回アクション実行後に `gh-pages` ブランチが作成される

3. **Issue機能有効化**（オプション）
   - Settings → Features → Issues にチェック
   - 失敗時の自動通知に必要

### 開発環境とコマンド
環境
- Node.js >= 20

パッケージのインストール
```bash
$ npm install
```

フィード生成とサイト立ち上げ
```bash
$ # フィードを取得して作成
$ npm run feed-generate

$ # localhost:8080 で確認
$ npm run site-serve
```

コードのチェック
```bash
$ # eslint, tsc --noEmit
$ npm run lint

$ # テスト
$ npm run test
```

## ライセンス
MIT
