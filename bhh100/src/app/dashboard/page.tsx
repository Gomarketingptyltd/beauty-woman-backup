import { AD_CREDITS_PER_DAY } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let balance: number | null = null;
  let userEmail: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;

    if (user) {
      const { data: credits } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();
      balance = credits?.balance ?? 0;
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--bhh-border)] bg-[var(--bhh-surface)] p-4">
        <h1 className="text-lg font-semibold text-[var(--bhh-fg)]">资料与广告</h1>
        <p className="mt-1 text-sm text-[var(--bhh-muted)]">
          编辑资料、上传照片、设置区域与展示价；发布广告将扣除{" "}
          <span className="text-[var(--bhh-gold)]">{AD_CREDITS_PER_DAY} 点 / 天</span>
          （$10/24 小时）。
        </p>
        {!isSupabaseConfigured() && (
          <p className="mt-2 text-sm text-amber-200/90">
            请先配置 Supabase 环境变量并登录。
          </p>
        )}
        {isSupabaseConfigured() && !userEmail && (
          <p className="mt-2 text-sm text-[var(--bhh-muted)]">未登录：请在后续接入登录页。</p>
        )}
        {userEmail && (
          <p className="mt-2 text-sm text-[var(--bhh-muted)]">当前账号：{userEmail}</p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--bhh-border)] bg-[var(--bhh-surface)] p-4">
        <h2 className="text-base font-semibold text-[var(--bhh-gold)]">剩余点数</h2>
        <p className="mt-2 text-3xl font-bold tabular-nums">
          {balance === null ? "—" : balance}
        </p>
        <button
          type="button"
          className="mt-4 w-full min-h-12 rounded-lg bg-[var(--bhh-gold)] px-4 py-3 text-sm font-semibold text-zinc-900 disabled:opacity-50"
          disabled={!isSupabaseConfigured() || balance === null}
        >
          一键发布 24 小时（扣 {AD_CREDITS_PER_DAY} 点）
        </button>
        <p className="mt-2 text-xs text-[var(--bhh-muted)]">
          扣点与广告起止时间建议通过 Supabase RPC（security definer）实现，避免客户端篡改余额。
        </p>
      </section>

      <section className="rounded-xl border border-[var(--bhh-border)] bg-[var(--bhh-surface)] p-4">
        <h2 className="text-base font-semibold text-[var(--bhh-gold)]">充值申请</h2>
        <p className="mt-1 text-sm text-[var(--bhh-muted)]">
          展示您的收款二维码；用户上传支付截图后，由后台在 Supabase 控制台或管理端审核入账。
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--bhh-border)] text-sm text-[var(--bhh-muted)]">
            收款码占位
          </div>
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[var(--bhh-border)] text-sm text-[var(--bhh-muted)]">
            上传截图（接 Storage）
          </div>
        </div>
      </section>
    </div>
  );
}
