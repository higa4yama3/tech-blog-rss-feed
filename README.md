# <img src="src/site/images/icon-transparent.png" height=26> 企業テックブログRSS (Customized)

企業のテックブログの更新をまとめたRSSフィードを配信するサイトです。
このリポジトリは [yamadashy/tech-blog-rss-feed](https://github.com/yamadashy/tech-blog-rss-feed) をフォークし、**よりスタイリッシュなデザイン（Bento風）** と **カスタマイズしやすいフィードリスト** に変更したものです。

## 特徴
- **Bento風デザイン**: シンプルでモダンなカード型レイアウトを採用。
- **厳選されたリスト**: 初期状態では主要なテックブログのみを例示しており、自分好みのリストを簡単に作成できます。

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

### 仕組み
GitHub Actions で定期的に更新されており、サイトの生成は [Eleventy](https://www.11ty.dev/) を使用しています。

更新タイミング:
- 平日 8時-24時の1時間おき
- 休日 8時-24時の2時間おき

### GitHub Pages の設定
このリポジトリをフォークして使用する場合、初回のアクション実行後に `gh-pages` ブランチが作成されます。
リポジトリの **Settings > Pages** にて、Source を `gh-pages` ブランチに設定してください。

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
