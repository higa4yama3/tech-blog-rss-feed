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

export default async () => {
  const feedDataModule = await import('../feeds/picks.json');
  const feedData = feedDataModule.default;

  const feedItems = feedData.items.map((feedItem) => {
    const custom = feedItem._custom ?? {};
    return {
      ...feedItem,
      diffDateForHuman: dayjs().to(feedItem.date_published),
      pubDateForHuman: dayjs(feedItem.date_published).tz().format('YYYY-MM-DD HH:mm:ss'),
      pickReason: custom.pickReason ?? '',
    };
  });

  return feedItems;
};
