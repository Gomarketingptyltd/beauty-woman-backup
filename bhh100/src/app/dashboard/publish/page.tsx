'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Coins, ChevronLeft, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function PublishPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [balance, setBalance] = useState(0)
  const [days, setDays] = useState(1)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prof }, { data: bal }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.rpc('get_user_credits', { p_user_id: user.id }),
      ])

      setProfile(prof as Profile)
      setBalance(Number(bal) || 0)
      setLoading(false)
    }
    load()
  }, [])

  const cost = days * 10
  const canPublish = balance >= cost && profile && profile.name

  async function handlePublish() {
    if (!canPublish) return
    setPublishing(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const now = new Date()
      const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

      // 1. 扣除积分
      const { error: creditErr } = await supabase.from('credits').insert({
        user_id: user.id,
        type: 'consume',
        amount: -cost,
        description: `发布广告 ${days} 天`,
      })
      if (creditErr) throw creditErr

      // 2. 创建广告
      const { error: adErr } = await supabase.from('ads').insert({
        profile_id: profile!.id,
        user_id: user.id,
        status: 'active',
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        days,
        amount_charged: cost,
      })
      if (adErr) throw adErr

      setBalance(prev => prev - cost)
      setMessage({ type: 'success', text: `广告发布成功！有效期 ${days} 天，到期时间 ${expiresAt.toLocaleDateString('zh-CN')}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '发布失败，请重试' })
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-spin">🌸</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard" style={{ color: '#64748b' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>发布广告</h1>
      </div>

      {/* 余额展示 */}
      <div
        className="rounded-xl p-4 mb-4 flex items-center justify-between"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <Coins size={20} style={{ color: '#fbbf24' }} />
          <span className="text-sm" style={{ color: '#94a3b8' }}>当前余额</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black" style={{ color: '#fbbf24' }}>{balance}</span>
          <span className="text-sm" style={{ color: '#64748b' }}>点</span>
        </div>
      </div>

      {/* 无档案提示 */}
      {!profile && (
        <div
          className="rounded-xl p-4 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>还没有创建档案</p>
            <Link href="/dashboard/profile" className="text-xs underline" style={{ color: '#fbbf24' }}>
              点击创建档案 →
            </Link>
          </div>
        </div>
      )}

      {/* 档案预览 */}
      {profile && (
        <div
          className="rounded-xl p-4 mb-4 flex items-center gap-3"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: '#334155' }}>
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: '#f1f5f9' }}>{profile.name}</span>
              {profile.is_verified && <span className="verified-badge">✓ 认证</span>}
            </div>
            <span className="text-xs" style={{ color: '#64748b' }}>{profile.area}</span>
          </div>
          <Link
            href="/dashboard/profile"
            className="ml-auto text-xs"
            style={{ color: '#64748b' }}
          >
            编辑
          </Link>
        </div>
      )}

      {/* 天数选择 */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <h2 className="text-sm font-bold mb-3" style={{ color: '#fbbf24' }}>投放天数</h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 3, 7, 14].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="py-3 rounded-lg text-center transition-all"
              style={{
                background: days === d ? 'rgba(251,191,36,0.15)' : '#0f172a',
                border: `2px solid ${days === d ? '#fbbf24' : '#334155'}`,
                color: days === d ? '#fbbf24' : '#64748b',
              }}
            >
              <div className="text-lg font-black">{d}</div>
              <div className="text-xs">天</div>
            </button>
          ))}
        </div>

        {/* 自定义天数 */}
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#64748b' }}>自定义天数：</span>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={e => setDays(Math.max(1, Math.min(30, Number(e.target.value))))}
            className="w-20 px-3 py-1.5 rounded text-sm text-center outline-none"
            style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
          />
          <span className="text-xs" style={{ color: '#64748b' }}>（最多30天）</span>
        </div>
      </div>

      {/* 费用明细 */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#0f172a', border: '1px solid #334155' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: '#94a3b8' }}>投放天数</span>
          <span className="text-sm" style={{ color: '#f1f5f9' }}>{days} 天</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: '#94a3b8' }}>单价</span>
          <span className="text-sm" style={{ color: '#f1f5f9' }}>10 点/天</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between items-center" style={{ borderColor: '#334155' }}>
          <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>需扣除</span>
          <span className="text-lg font-black" style={{ color: '#fbbf24' }}>{cost} 点</span>
        </div>
        {balance < cost && (
          <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: '#ef4444' }}>
            <AlertCircle size={12} />
            余额不足，需充值 {cost - balance} 点
            <Link href="/dashboard/recharge" className="underline font-semibold">去充值</Link>
          </div>
        )}
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{
            background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          {message.type === 'success' ? <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />}
          {message.text}
        </div>
      )}

      {/* 发布按钮 */}
      <button
        onClick={handlePublish}
        disabled={!canPublish || publishing}
        className="w-full py-3.5 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
      >
        <Zap size={16} />
        {publishing ? '发布中...' : `立即发布（扣除 ${cost} 点）`}
      </button>

      <p className="text-center text-xs mt-3" style={{ color: '#475569' }}>
        广告一经发布，点数不予退回。请确认资料无误后发布。
      </p>
    </div>
  )
}
