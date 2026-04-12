import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Send,
  MessageSquareText,
} from "lucide-react";
import { WatermarkedImage } from "@/components/media/WatermarkedImage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let displayName = slug;
  let area = "悉尼";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("display_name, area")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      displayName = data.display_name ?? displayName;
      area = data.area ?? area;
    }
  }

  const title = `${displayName} - ${area} 悉尼独立女生伴游 | 百花汇 bhh100.com`;
  return {
    title,
    description: `百花汇分类信息：${displayName}，${area}。平台仅展示联系方式，不参与交易。`,
    openGraph: { title },
  };
}

export default async function GirlDetailPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "demo") {
    return <DemoDetail slug={slug} />;
  }

  if (!isSupabaseConfigured()) {
    return <DemoDetail slug={slug} />;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, area, age, height_cm, weight_kg, bust, nationality, bio, wechat, telegram, whatsapp, phone, verification_status, avatar_url"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const profileId = profile.id as string;

  const [{ data: images }, { data: commentRows }] = await Promise.all([
    supabase
      .from("profile_images")
      .select("storage_path")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("comments")
      .select("id, author_display, body, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <article className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-[var(--bhh-border)] bg-zinc-900 sm:aspect-[16/9]">
        {profile.avatar_url ? (
          <WatermarkedImage
            src={profile.avatar_url}
            alt={profile.display_name}
            fill
            className="rounded-xl"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            暂无图片
          </div>
        )}
      </div>

      <div>
        <h1 className="text-xl font-semibold text-[var(--bhh-fg)] sm:text-2xl">
          {profile.display_name}
        </h1>
        <p className="text-sm text-[var(--bhh-muted)]">{profile.area}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ContactButton
          href={profile.wechat ? `weixin://` : undefined}
          label="微信"
          icon={<MessageCircle className="size-5" />}
          className="min-h-12 bg-[#07c160] text-white"
          fallback="#"
        />
        <ContactButton
          href={profile.telegram ? `https://t.me/${profile.telegram}` : undefined}
          label="Telegram"
          icon={<Send className="size-5" />}
          className="min-h-12 bg-[#229ED9] text-white"
          fallback="#"
        />
        <ContactButton
          href={
            profile.whatsapp
              ? `https://wa.me/${String(profile.whatsapp).replace(/\D/g, "")}`
              : undefined
          }
          label="WhatsApp"
          icon={<MessageSquareText className="size-5" />}
          className="min-h-12 bg-[#128C7E] text-white"
          fallback="#"
        />
        <ContactButton
          href={profile.phone ? `tel:${profile.phone}` : undefined}
          label="拨打电话"
          icon={<Phone className="size-5" />}
          className="min-h-12 bg-zinc-600 text-white"
          fallback="#"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-[var(--bhh-border)]">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-[var(--bhh-border)]">
            <DetailRow label="年龄" value={profile.age} />
            <DetailRow label="身高" value={profile.height_cm ? `${profile.height_cm} cm` : null} />
            <DetailRow label="体重" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
            <DetailRow label="胸围" value={profile.bust} />
            <DetailRow label="国籍" value={profile.nationality} />
            <DetailRow label="验证" value={profile.verification_status} />
          </tbody>
        </table>
        {profile.bio && (
          <p className="border-t border-[var(--bhh-border)] p-3 text-sm leading-relaxed text-[var(--bhh-muted)]">
            {profile.bio}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--bhh-border)] p-3">
        <h2 className="mb-2 text-sm font-semibold text-[var(--bhh-gold)]">评论</h2>
        {commentRows && commentRows.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {commentRows.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-[var(--bhh-border)] bg-black/20 px-3 py-2"
              >
                <div className="text-xs text-[var(--bhh-muted)]">
                  {c.author_display || "匿名"} ·{" "}
                  {c.created_at
                    ? new Date(c.created_at).toLocaleString("zh-CN")
                    : ""}
                </div>
                <p className="mt-1 text-[var(--bhh-fg)]">{c.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--bhh-muted)]">暂无评论。</p>
        )}
      </section>

      <Link
        href="/"
        className="inline-block min-h-11 rounded-lg border border-[var(--bhh-border)] px-4 py-3 text-sm"
      >
        ← 返回列表
      </Link>

      {images && images.length > 0 && (
        <p className="text-xs text-zinc-500">
          多图轮播：根据 storage 公网 URL 映射后接入轮播组件。
        </p>
      )}
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <tr>
      <th className="w-24 shrink-0 px-3 py-2 text-[var(--bhh-muted)]">{label}</th>
      <td className="px-3 py-2 text-[var(--bhh-fg)]">{String(value)}</td>
    </tr>
  );
}

function ContactButton({
  href,
  label,
  icon,
  className,
  fallback,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  fallback: string;
}) {
  const to = href && href !== "#" ? href : fallback;
  return (
    <a
      href={to}
      className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-medium ${className ?? ""}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}

function DemoDetail({ slug }: { slug: string }) {
  return (
    <article className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-[var(--bhh-border)] bg-zinc-900 sm:aspect-[16/9]">
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          轮播占位 · {slug}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white/25">bhh100.com</span>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-semibold">示例 · 小雅</h1>
        <p className="text-sm text-[var(--bhh-muted)]">City</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ContactButton
          label="微信"
          icon={<MessageCircle className="size-5" />}
          className="min-h-12 bg-[#07c160] text-white"
          fallback="#"
        />
        <ContactButton
          label="Telegram"
          icon={<Send className="size-5" />}
          className="min-h-12 bg-[#229ED9] text-white"
          fallback="#"
        />
        <ContactButton
          label="WhatsApp"
          icon={<MessageSquareText className="size-5" />}
          className="min-h-12 bg-[#128C7E] text-white"
          fallback="#"
        />
        <ContactButton
          label="拨打电话"
          icon={<Phone className="size-5" />}
          className="min-h-12 bg-zinc-600 text-white"
          fallback="#"
        />
      </div>
      <p className="text-sm text-[var(--bhh-muted)]">
        配置数据库后此处展示真实资料与评论。
      </p>
      <Link href="/" className="inline-block min-h-11 text-sm text-[var(--bhh-gold)]">
        ← 返回首页
      </Link>
    </article>
  );
}
