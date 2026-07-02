import { describe, expect, it } from 'vitest';
import { filterByTiers, scoreDiscoverItems } from '../src/feed/feed-item-processor';
import type { EnrichedFeedItem } from '../src/feed/enriched-feed-item';
import { CORE_OUTPUT_TIERS } from '../src/resources/feed-tier';

const createFeedItem = (sourceTier: EnrichedFeedItem['sourceTier'], linkSuffix: string): EnrichedFeedItem => ({
  title: `${sourceTier} title`,
  link: `https://example.com/${linkSuffix}`,
  isoDate: new Date().toISOString(),
  blogTitle: `${sourceTier} blog`,
  blogLink: `https://example.com/${sourceTier}`,
  sourceTier,
  sourceLabel: `${sourceTier} source`,
  sourceTags: [],
  contentFormat: 'default',
});

describe('feed tiers', () => {
  it('Core feed excludes high-frequency media sources', () => {
    const items = [
      createFeedItem('essential', 'essential'),
      createFeedItem('core', 'core'),
      createFeedItem('optional', 'optional'),
      createFeedItem('media', 'media'),
    ];

    const coreItems = filterByTiers(items, CORE_OUTPUT_TIERS);

    expect(coreItems.map((item) => item.sourceTier)).toEqual(['essential', 'core', 'optional']);
  });

  it('Discover can still score media sources separately from Core', () => {
    const mediaItem = createFeedItem('media', 'media-discover');
    const hatenaCountMap = new Map([[mediaItem.link, 10]]);

    const discoverItems = scoreDiscoverItems([mediaItem], hatenaCountMap);

    expect(discoverItems).toHaveLength(1);
    expect(discoverItems[0].sourceTier).toBe('media');
  });
});
