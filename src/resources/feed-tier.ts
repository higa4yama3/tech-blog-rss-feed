export type FeedTier = 'essential' | 'core' | 'optional' | 'media' | 'signal' | 'research' | 'curated' | 'hotentry';

export type ContentFormat = 'default' | 'longread';

export const CORE_OUTPUT_TIERS: FeedTier[] = ['essential', 'core', 'optional', 'media'];

export const TIER_AGGREGATE_HOURS: Record<FeedTier, number> = {
  essential: 60 * 24,
  core: 5 * 24,
  optional: 5 * 24,
  media: 3 * 24,
  signal: 2 * 24,
  research: 30 * 24,
  curated: 7 * 24,
  hotentry: 2 * 24,
};
