## RSS (Customized)

あっ、読みたい記事をまとめたRSSフィード。
このリポジトリは [yamadashy/tech-blog-rss-feed](https://github.com/yamadashy/tech-blog-rss-feed) をフォークし、**デザイン（Bento風）** に変更させていただいたものです。


### サイトのカスタマイズ方法
#### 1. フィードの追加・削除
`src/resources/feed-info-list.ts` を編集することで、表示したいブログを自由に管理できます。

```typescript
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ここに追加したいブログの [名前, RSS URL] を記述します
  ['Mercari', 'https://engineering.mercari.com/blog/feed.xml'],
  ['LINEヤフー', 'https://techblog.lycorp.co.jp/ja/feed/index.xml'],
  // ...
]);
```

##### 初回セットアップ

1. **リポジトリをフォーク**

2. **GitHub Pages有効化**
   - Settings → Pages → Source: `gh-pages` ブランチ
   - 初回アクション実行後に `gh-pages` ブランチが作成される

3. **Issue機能有効化**（オプション）
   - Settings → Features → Issues にチェック
   - 失敗時の自動通知に必要

#### 開発環境とコマンド
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
