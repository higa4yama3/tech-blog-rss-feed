import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

export interface JsonFeedItem {
  url: string;
  date_published: string;
  content_html?: string;
  _custom?: {
    pickReason?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * JSON Feed の item をカード表示用に整える
 * 今日の5本は RSS リーダー向けに説明文の先頭へ選んだ理由を入れているので、カードでは外す
 */
export const toSiteFeedItem = (feedItem: JsonFeedItem) => {
  const pickReason = feedItem._custom?.pickReason ?? '';
  let contentHtml = feedItem.content_html ?? '';
  if (pickReason && contentHtml.startsWith(`${pickReason}\n`)) {
    contentHtml = contentHtml.slice(pickReason.length + 1);
  }

  return {
    ...feedItem,
    content_html: contentHtml,
    pickReason,
    diffDateForHuman: dayjs().to(feedItem.date_published),
    pubDateForHuman: dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss'),
  };
};
