import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bhh-bg)] text-[var(--bhh-fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--bhh-border)] bg-[var(--bhh-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-[var(--bhh-gold)] sm:text-lg"
          >
            百花汇
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2.5 font-medium text-[var(--bhh-muted)] transition hover:bg-white/5 hover:text-[var(--bhh-fg)] min-h-11 flex items-center"
            >
              个人中心
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-3 pb-10 pt-3 sm:px-4 sm:pt-4">
        {children}
      </main>
      <footer className="border-t border-[var(--bhh-border)] py-4 text-center text-xs text-[var(--bhh-muted)]">
        百花汇仅提供信息发布，不参与交易、不抽成。请遵守当地法律法规。
      </footer>
    </div>
  );
}
