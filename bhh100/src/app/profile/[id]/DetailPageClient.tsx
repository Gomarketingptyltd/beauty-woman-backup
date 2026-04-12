'use client'

import { ChevronLeft, Share2, Flag, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PhotoCarousel from '@/components/detail/PhotoCarousel'
import ContactButtons from '@/components/detail/ContactButtons'
import ProfileTable from '@/components/detail/ProfileTable'
import type { Profile } from '@/types'

interface Props {
  profile: Profile
  isMock?: boolean
}

export default function DetailPageClient({ profile, isMock }: Props) {
  const router = useRouter()

  const isActive = profile.expires_at
    ? new Date(profile.expires_at) > new Date()
    : true

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} - 百花汇`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard?.writeText(window.location.href)
        .then(() => alert('链接已复制'))
        .catch(() => {})
    }
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      {/* 演示提示 */}
      {isMock && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded text-xs"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          💡 演示模式：配置 Supabase 后显示真实数据
        </div>
      )}

      {/* 顶部操作栏 */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm"
          style={{ color: '#94a3b8' }}
        >
          <ChevronLeft size={18} />
          返回
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handleShare}>
            <Share2 size={18} style={{ color: '#64748b' }} />
          </button>
          <button>
            <Flag size={18} style={{ color: '#64748b' }} />
          </button>
        </div>
      </div>

      {/* 照片轮播 */}
      <PhotoCarousel
        photos={profile.photos?.length ? profile.photos : (profile.avatar_url ? [profile.avatar_url] : [])}
        name={profile.name}
      />

      {/* 名字 + 标签区 */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h1 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
            {profile.name}
          </h1>
          {profile.is_verified && (
            <span className="verified-badge flex items-center gap-1">
              <Shield size={10} />
              已认证
            </span>
          )}
          {isActive ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="online-dot" />
              今日在线
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1e293b', color: '#64748b' }}>
              已下线
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="area-badge">{profile.area}</span>
          {profile.age && <span className="text-sm" style={{ color: '#94a3b8' }}>{profile.age}岁</span>}
          {profile.height && <span className="text-sm" style={{ color: '#94a3b8' }}>{profile.height}cm</span>}
          {profile.weight && <span className="text-sm" style={{ color: '#94a3b8' }}>{profile.weight}kg</span>}
          {profile.bust && <span className="text-sm" style={{ color: '#94a3b8' }}>{profile.bust}</span>}
        </div>

        {/* 广告费用 */}
        <div
          className="mt-3 px-3 py-2 rounded-lg flex items-center justify-between"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <span className="text-sm" style={{ color: '#94a3b8' }}>广告费用</span>
          <span className="font-bold text-lg" style={{ color: '#fbbf24' }}>
            ${profile.price_per_day}<span className="text-sm font-normal">/天</span>
          </span>
        </div>
      </div>

      {/* 联系方式按钮组 */}
      <div
        className="mx-3 mb-3 rounded-lg overflow-hidden"
        style={{ border: '1px solid #334155', background: '#1e293b' }}
      >
        <div
          className="px-4 py-2.5 text-sm font-bold"
          style={{ color: '#fbbf24', borderBottom: '1px solid #334155' }}
        >
          联系方式
        </div>
        <ContactButtons profile={profile} />
      </div>

      {/* 个人简介 */}
      {profile.bio && (
        <div className="mx-3 mb-3 rounded-lg p-4" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <h2 className="text-sm font-bold mb-2" style={{ color: '#fbbf24' }}>个人简介</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#cbd5e1' }}>
            {profile.bio}
          </p>
        </div>
      )}

      {/* 详细资料表 */}
      <div className="mb-4">
        <ProfileTable profile={profile} />
      </div>

      {/* 免责声明 */}
      <div className="mx-3 mb-6 px-3 py-2 rounded text-xs" style={{ background: '#0a1628', color: '#334155' }}>
        本广告内容由发布者自行负责，百花汇仅为广告出版商，不参与任何交易安排。
      </div>
    </div>
  )
}
