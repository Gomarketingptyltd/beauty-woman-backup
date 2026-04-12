import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bhh-bg)] text-[var(--bhh-fg)]">
      <header className="border-b border-[var(--bhh-border)] bg-[var(--bhh-surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <Link href="/dashboard" className="text-base font-semibold text-[var(--bhh-gold)]">
            个人中心
          </Link>
          <Link
            href="/"
            className="min-h-11 rounded-lg px-3 py-2.5 text-sm text-[var(--bhh-muted)] hover:text-[var(--bhh-fg)]"
          >
            返回首页
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-3 py-4 sm:px-4">{children}</main>
    </div>
  );
}
