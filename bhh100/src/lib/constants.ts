/** 悉尼核心区域（首页筛选器数据源，可扩展） */
export const SYDNEY_AREAS = [
  "City",
  "Burwood",
  "Hurstville",
  "Chatswood",
  "Zetland",
  "其它",
] as const;

export type SydneyArea = (typeof SYDNEY_AREAS)[number];

/** 固定平台规则：$10 / 24 小时 = 1 点 */
export const AD_CREDITS_PER_DAY = 1;
export const LISTING_PRICE_AUD_DEFAULT = 10;
