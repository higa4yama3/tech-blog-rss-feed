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

##### 2. 記事の選び方を変える
並べ替えの基準は `src/resources/interest-profile.ts` にまとめています。

- 加点（`EXCITEMENT_PATTERNS`）: 作った・動かした・仕組みを掘る・数字のインパクト・発見など、読んで高揚しそうな記事
- 減点（`DULL_PATTERNS`）: 告知・参加記・採用・定期配信・事件など、読む前から中身の予想がつく記事
- トピック（`TOPICS`）: トップの棚とトピック別フィード（`feeds/topic-<id>.atom.xml`）の分類。`weight` で沈めたい分野を下げる
- `SOCIAL_WEIGHT` / `TIER_WEIGHTS` / `FRESHNESS_HALF_LIFE_HOURS`: はてブ・ソースの信頼度・鮮度の効き具合

各記事の点数と根拠は JSON フィードの `_custom.score` / `signals` / `penalties` に出るので、違和感のある並びはそこから原因を辿れます。

##### 3. ソースの健康診断
`npm run feed-generate` の後に `npm run audit-sources` を実行すると、取得失敗・半年以上更新のないソース・件数上限なしで週20件を超えるソースを一覧します。

##### 初回セットアップ

1. **リポジトリをフォーク**

2. **GitHub Pages有効化**
   - Settings → Pages → Source: `gh-pages` ブランチ

##### ライセンス
MIT
