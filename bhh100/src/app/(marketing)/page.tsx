import Link from "next/link";
import { MapPin, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { SYDNEY_AREAS } from "@/lib/constants";
import { WatermarkedImage } from "@/components/media/WatermarkedImage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function HomePage() {
  type Row = {
    slug: string;
    display_name: string;
    area: string;
    listing_price_aud: number | null;
    verification_status: string;
    avatar_url: string | null;
    today_online: boolean;
  };

  let listings: Row[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "slug, display_name, area, listing_price_aud, verification_status, avatar_url, today_online"
      )
      .order("updated_at", { ascending: false })
      .limit(24);
    listings = (data as Row[] | null) ?? [];
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-[var(--bhh-border)] bg-[var(--bhh-surface)] p-3 sm:p-3.5">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--bhh-gold)]">
          <MapPin className="size-4 shrink-0" aria-hidden />
          区域筛选
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="min-h-10 rounded-md border border-[var(--bhh-border)] bg-[var(--bhh-bg)] px-3 py-2 text-sm text-[var(--bhh-fg)]"
          >
            全部
          </button>
          {SYDNEY_AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className="min-h-10 rounded-md border border-transparent bg-white/5 px-3 py-2 text-sm text-[var(--bhh-muted)] hover:border-[var(--bhh-border)] hover:text-[var(--bhh-fg)]"
            >
              {a}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--bhh-gold)]">
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          条件过滤
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-10 rounded-md border border-[var(--bhh-border)] px-3 py-2 text-sm"
          >
            年龄
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border border-[var(--bhh-border)] px-3 py-2 text-sm"
          >
            已验证
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md border border-[var(--bhh-accent)]/40 bg-[var(--bhh-accent)]/15 px-3 py-2 text-sm text-[var(--bhh-accent)]"
          >
            今日在线
          </button>
        </div>
      </section>

      {!isSupabaseConfigured() && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200/90">
          请在 <code className="rounded bg-black/30 px-1">.env.local</code>{" "}
          中配置 Supabase 环境变量后连接真实列表。
        </p>
      )}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {listings.length === 0 &&
          ["示例 · City", "示例 · Burwood", "示例 · Chatswood", "示例 · Zetland"].map(
            (label, i) => (
              <li key={label}>
                <Link
                  href="/girl/demo"
                  className="block overflow-hidden rounded-lg border border-[var(--bhh-border)] bg-[var(--bhh-surface)] transition hover:border-[var(--bhh-gold)]/50"
                >
                  <div className="relative aspect-[3/4] w-full bg-zinc-800">
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
                      头像
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white/30">
                        bhh100.com
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 p-2">
                    <div className="flex items-start justify-between gap-1">
                      <span className="truncate text-sm font-medium">{label}</span>
                      {i % 2 === 0 && (
                        <ShieldCheck
                          className="size-4 shrink-0 text-[var(--bhh-gold)]"
                          aria-label="已验证"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--bhh-muted)]">
                      <span className="truncate">$10 / 24h</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          )}

        {listings.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/girl/${p.slug}`}
              className="block overflow-hidden rounded-lg border border-[var(--bhh-border)] bg-[var(--bhh-surface)] transition hover:border-[var(--bhh-gold)]/50"
            >
              <div className="relative aspect-[3/4] w-full bg-zinc-800">
                {p.avatar_url ? (
                  <WatermarkedImage
                    src={p.avatar_url}
                    alt={p.display_name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
                      无头像
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white/30">
                        bhh100.com
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-1 p-2">
                <div className="flex items-start justify-between gap-1">
                  <span className="truncate text-sm font-medium">
                    {p.display_name}
                  </span>
                  {p.verification_status === "verified" && (
                    <ShieldCheck
                      className="size-4 shrink-0 text-[var(--bhh-gold)]"
                      aria-label="已验证"
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--bhh-muted)]">
                  <span className="rounded bg-white/5 px-1.5 py-0.5">{p.area}</span>
                  {p.today_online && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                      在线
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--bhh-muted)]">
                  ${Number(p.listing_price_aud ?? 10).toFixed(0)} / 24h
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
