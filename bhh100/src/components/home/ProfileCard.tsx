import Link from 'next/link'
import Image from 'next/image'
import { Phone, MessageCircle } from 'lucide-react'
import type { Profile } from '@/types'

interface ProfileCardProps {
  profile: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const hasContact = profile.telegram || profile.wechat || profile.whatsapp || profile.phone

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="block relative group overflow-hidden rounded-lg transition-transform active:scale-95"
      style={{ background: '#1e293b', border: '1px solid #334155' }}
    >
      {/* 头像区域 */}
      <div className="relative w-full" style={{ paddingBottom: '133%' }}>
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}
          >
            🌸
          </div>
        )}

        {/* 渐变遮罩 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.2) 40%, transparent 60%)',
          }}
        />

        {/* 顶部标签 */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between">
          {profile.is_verified && (
            <span className="verified-badge">✓ 认证</span>
          )}
          {/* 今日在线 */}
          <div className="ml-auto flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5">
            <span className="online-dot" />
            <span className="text-white text-xs">在线</span>
          </div>
        </div>

        {/* 底部信息叠加在图片上 */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className="font-bold text-sm truncate"
              style={{ color: '#f1f5f9' }}
            >
              {profile.name}
            </span>
            <span
              className="text-xs font-bold flex-shrink-0"
              style={{ color: '#fbbf24' }}
            >
              ${profile.price_per_day}/天
            </span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="area-badge">{profile.area}</span>
            {profile.age && (
              <span className="text-xs" style={{ color: '#94a3b8' }}>{profile.age}岁</span>
            )}
            {profile.height && (
              <span className="text-xs" style={{ color: '#94a3b8' }}>{profile.height}cm</span>
            )}
          </div>
        </div>
      </div>

      {/* 联系方式快捷图标 */}
      <div
        className="flex items-center justify-around px-2 py-1.5 gap-1"
        style={{ borderTop: '1px solid #334155' }}
      >
        {profile.wechat && (
          <div className="flex items-center gap-0.5">
            <span className="text-xs" style={{ color: '#07C160' }}>微信</span>
          </div>
        )}
        {profile.telegram && (
          <div className="flex items-center gap-0.5">
            <span className="text-xs" style={{ color: '#2AABEE' }}>TG</span>
          </div>
        )}
        {profile.whatsapp && (
          <div className="flex items-center gap-0.5">
            <span className="text-xs" style={{ color: '#128C7E' }}>WA</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center gap-0.5">
            <Phone size={10} style={{ color: '#94a3b8' }} />
            <span className="text-xs" style={{ color: '#94a3b8' }}>电话</span>
          </div>
        )}
        {!hasContact && (
          <span className="text-xs" style={{ color: '#475569' }}>查看详情</span>
        )}
      </div>
    </Link>
  )
}
