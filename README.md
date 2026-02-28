##### RSS (Customized)

あっ、読みたい記事をまとめたRSSフィード。
このリポジトリは [yamadashy/tech-blog-rss-feed](https://github.com/yamadashy/tech-blog-rss-feed) をフォークし、**デザインBento風** に変更させていただいたものです。


##### サイトのカスタマイズ方法
##### 1. フィードの追加・削除
`src/resources/feed-info-list.ts` を編集することで、表示したいブログを自由に管理できます。

```typescript
export const FEED_INFO_LIST: FeedInfo[] = createFeedInfoList([
  // ここに追加したいブログの [名前, RSS URL] を記述します
  ['Mercari', 'https://engineering.mercari.com/blog/feed.xml'],
  // ...
]);
```

##### 初回セットアップ

1. **リポジトリをフォーク**

2. **GitHub Pages有効化**
   - Settings → Pages → Source: `gh-pages` ブランチ

##### ライセンス
MIT
