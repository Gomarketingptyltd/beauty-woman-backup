import type { Package, PackageKey } from "@/types";

export const PACKAGES: Record<PackageKey, Package> = {
  QUICK_BLISS: {
    key: "QUICK_BLISS",
    nameEn: "THE QUICK BLISS",
    nameCn: "精致快乐",
    requiresBooking: false,
    description: "快速舒压，精致享受",
    durations: [
      { minutes: 30, price: 200 },
      { minutes: 45, price: 270 },
      { minutes: 60, price: 320 },
    ],
  },
  STEAM_SANCTUARY: {
    key: "STEAM_SANCTUARY",
    nameEn: "STEAM SANCTUARY",
    nameCn: "极境湿蒸",
    requiresBooking: false,
    description: "天然蒸汽，洗涤身心",
    durations: [
      { minutes: 60, price: 428 },
      { minutes: 90, price: 628 },
    ],
  },
  SILK_ROAD_AQUA: {
    key: "SILK_ROAD_AQUA",
    nameEn: "SILK ROAD AQUA",
    nameCn: "丝路·水床经典",
    requiresBooking: false,
    description: "水床漂浮，丝绸触感",
    durations: [
      { minutes: 60, price: 458 },
      { minutes: 90, price: 638 },
    ],
  },
  DEEP_SPA_RITUAL: {
    key: "DEEP_SPA_RITUAL",
    nameEn: "DEEP SPA RITUAL",
    nameCn: "浮生浴缸",
    requiresBooking: true,
    description: "私人浴缸，深度疗愈（需预约）",
    durations: [
      { minutes: 60, price: 488 },
      { minutes: 90, price: 688 },
    ],
  },
  BLACK_GOLD_SOVEREIGN: {
    key: "BLACK_GOLD_SOVEREIGN",
    nameEn: "BLACK-GOLD SOVEREIGN",
    nameCn: "黑金·全能王",
    requiresBooking: false,
    description: "至尊享受，全能服务",
    durations: [
      { minutes: 60, price: 558 },
      { minutes: 90, price: 788 },
    ],
  },
};

export const PACKAGE_LIST = Object.values(PACKAGES);

export function getPackage(key: PackageKey): Package {
  return PACKAGES[key];
}

export function getPackagePrice(key: PackageKey, minutes: number): number | null {
  const pkg = PACKAGES[key];
  const duration = pkg.durations.find((d) => d.minutes === minutes);
  return duration?.price ?? null;
}

export function getPriceInCents(key: PackageKey, minutes: number): number | null {
  const price = getPackagePrice(key, minutes);
  return price !== null ? Math.round(price * 100) : null;
}
