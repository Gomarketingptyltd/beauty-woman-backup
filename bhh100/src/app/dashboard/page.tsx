'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, FileText, Coins, Plus, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Ad, Credit } from '@/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: adsData }, { data: bal }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('ads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.rpc('get_user_credits', { p_user_id: user.id }),
      ])

      setProfile(prof as Profile)
      setAds((adsData as Ad[]) || [])
      setCreditBalance(Number(bal) || 0)
      setLoading(false)
    }
    load()
  }, [])

  const adStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle size={14} style={{ color: '#22c55e' }} />
    if (status === 'expired') return <XCircle size={14} style={{ color: '#ef4444' }} />
    if (status === 'pending') return <AlertCircle size={14} style={{ color: '#fbbf24' }} />
    return <XCircle size={14} style={{ color: '#64748b' }} />
  }

  const adStatusText = (status: string) => {
    const map: Record<string, string> = {
      active: '投放中', expired: '已过期', pending: '审核中', rejected: '已拒绝'
    }
    return map[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🌸</div>
          <p style={{ color: '#64748b' }}>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>个人中心</h1>
        <Link
          href="/dashboard/publish"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-slate-900"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
        >
          <Plus size={13} />
          发布广告
        </Link>
      </div>

      {/* 积分卡片 */}
      <div
        className="rounded-xl p-4 mb-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>当前点数余额</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black" style={{ color: '#fbbf24' }}>{creditBalance}</span>
            <span className="text-sm" style={{ color: '#64748b' }}>点</span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>1点 = 发布1天广告（$10）</p>
        </div>
        <Link
          href="/dashboard/recharge"
          className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <Coins size={22} style={{ color: '#fbbf24' }} />
          <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>充值</span>
        </Link>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { href: '/dashboard/profile', icon: <User size={22} />, label: '编辑资料', color: '#818cf8' },
          { href: '/dashboard/publish', icon: <Plus size={22} />, label: '发布广告', color: '#fbbf24' },
          { href: '/dashboard/recharge', icon: <Coins size={22} />, label: '充值点数', color: '#22c55e' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 py-4 rounded-xl transition-colors"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <span style={{ color: item.color }}>{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 档案状态 */}
      {!profile ? (
        <div
          className="rounded-xl p-4 mb-3"
          style={{ background: '#1e293b', border: '1px dashed #334155' }}
        >
          <div className="text-center">
            <User size={32} className="mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm mb-3" style={{ color: '#64748b' }}>还没有创建档案</p>
            <Link
              href="/dashboard/profile"
              className="inline-block px-4 py-2 rounded text-sm font-bold text-slate-900"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
            >
              立即创建档案
            </Link>
          </div>
        </div>
      ) : (
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-3 rounded-xl mb-3"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: '#334155' }}
          >
            {profile.avatar_url ? '📷' : '🌸'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: '#f1f5f9' }}>{profile.name}</span>
              {profile.is_verified && <span className="verified-badge">✓</span>}
            </div>
            <span className="text-xs" style={{ color: '#64748b' }}>{profile.area} · {profile.age}岁</span>
          </div>
          <ChevronRight size={16} style={{ color: '#334155' }} />
        </Link>
      )}

      {/* 广告历史 */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}
        >
          <div className="flex items-center gap-2">
            <FileText size={15} style={{ color: '#fbbf24' }} />
            <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>广告记录</span>
          </div>
          <Link href="/dashboard/publish" className="text-xs" style={{ color: '#64748b' }}>
            发布新广告 →
          </Link>
        </div>

        {ads.length === 0 ? (
          <div className="py-8 text-center" style={{ background: '#0f172a' }}>
            <Clock size={28} className="mx-auto mb-2" style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>暂无广告记录</p>
          </div>
        ) : (
          <div style={{ background: '#0f172a' }}>
            {ads.map((ad, i) => (
              <div
                key={ad.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < ads.length - 1 ? '1px solid #1e293b' : 'none' }}
              >
                <div className="flex items-center gap-1.5 flex-1">
                  {adStatusIcon(ad.status)}
                  <span className="text-sm" style={{ color: '#94a3b8' }}>
                    {adStatusText(ad.status)}
                  </span>
                </div>
                <div className="text-xs text-right" style={{ color: '#64748b' }}>
                  <div>{ad.days}天</div>
                  <div>{new Date(ad.created_at).toLocaleDateString('zh-CN')}</div>
                </div>
                {ad.expires_at && (
                  <div className="text-xs" style={{ color: '#475569' }}>
                    到期：{new Date(ad.expires_at).toLocaleDateString('zh-CN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
