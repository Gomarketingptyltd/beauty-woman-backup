'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ChevronLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { RechargeRequest } from '@/types'

// 管理员收款二维码（替换为实际二维码图片URL）
const PAYMENT_QR_URL = '/qr-payment.png'

const AMOUNTS = [10, 20, 50, 100]

export default function RechargePage() {
  const [amount, setAmount] = useState(10)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [history, setHistory] = useState<RechargeRequest[]>([])
  const [balance, setBalance] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: reqs }, { data: bal }] = await Promise.all([
        supabase.from('recharge_requests').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(10),
        supabase.rpc('get_user_credits', { p_user_id: user.id }),
      ])

      setHistory((reqs as RechargeRequest[]) || [])
      setBalance(Number(bal) || 0)
      setLoading(false)
    }
    load()
  }, [])

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshotFile(file)
    const reader = new FileReader()
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!screenshotFile) {
      setMessage({ type: 'error', text: '请上传支付截图' })
      return
    }
    setSubmitting(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      // 上传截图
      const ext = screenshotFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('recharge')
        .upload(path, screenshotFile, { upsert: false })
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('recharge').getPublicUrl(path)

      // 提交充值申请
      const { error } = await supabase.from('recharge_requests').insert({
        user_id: user.id,
        amount,
        screenshot_url: publicUrl,
        status: 'pending',
      })
      if (error) throw error

      setMessage({ type: 'success', text: '充值申请已提交！管理员将在24小时内审核到账。' })
      setScreenshotFile(null)
      setScreenshotPreview(null)

      // 刷新历史
      const { data: reqs } = await supabase
        .from('recharge_requests').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(10)
      setHistory((reqs as RechargeRequest[]) || [])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '提交失败，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  const statusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: '审核中', color: '#fbbf24', icon: <Clock size={13} /> },
      approved: { label: '已到账', color: '#22c55e', icon: <CheckCircle size={13} /> },
      rejected: { label: '已拒绝', color: '#ef4444', icon: <AlertCircle size={13} /> },
    }
    return map[status] || map.pending
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
        <h1 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>充值点数</h1>
      </div>

      {/* 余额 */}
      <div
        className="rounded-xl p-4 mb-4 flex items-center justify-between"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
      >
        <span className="text-sm" style={{ color: '#94a3b8' }}>当前余额</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black" style={{ color: '#fbbf24' }}>{balance}</span>
          <span className="text-sm" style={{ color: '#64748b' }}>点（1点=$10广告费）</span>
        </div>
      </div>

      {/* 收款说明 */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <h2 className="text-sm font-bold mb-3" style={{ color: '#fbbf24' }}>充值流程</h2>
        <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>1</span>
            <span>选择充值金额（1点=$10）</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>2</span>
            <span>扫码转账到右侧收款码</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>3</span>
            <span>上传转账截图，等待审核到账（通常24小时内）</span>
          </div>
        </div>
      </div>

      {/* 金额 + 收款码 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 金额选择 */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <h2 className="text-sm font-bold mb-3" style={{ color: '#fbbf24' }}>选择金额</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className="py-2 rounded-lg text-center transition-all"
                style={{
                  background: amount === a ? 'rgba(251,191,36,0.15)' : '#0f172a',
                  border: `2px solid ${amount === a ? '#fbbf24' : '#334155'}`,
                  color: amount === a ? '#fbbf24' : '#64748b',
                }}
              >
                <div className="text-sm font-bold">{a}点</div>
                <div className="text-xs">${a * 10}</div>
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            max={1000}
            value={amount}
            onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded text-sm text-center outline-none"
            style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
            placeholder="自定义点数"
          />
          <p className="text-xs mt-2 text-center" style={{ color: '#64748b' }}>
            需支付 <strong style={{ color: '#fbbf24' }}>${amount * 10} AUD</strong>
          </p>
        </div>

        {/* 收款二维码 */}
        <div
          className="rounded-xl p-4 flex flex-col items-center"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <h2 className="text-sm font-bold mb-3 self-start" style={{ color: '#fbbf24' }}>扫码付款</h2>
          <div
            className="w-full aspect-square rounded-lg flex items-center justify-center mb-2"
            style={{ background: '#334155', maxWidth: 130 }}
          >
            {/* 替换为实际收款二维码 */}
            <div className="text-center p-2">
              <div className="text-3xl mb-1">💳</div>
              <p className="text-xs" style={{ color: '#64748b' }}>收款码</p>
              <p className="text-xs" style={{ color: '#475569' }}>管理员配置</p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: '#64748b' }}>
            微信/支付宝/PayID
          </p>
        </div>
      </div>

      {/* 截图上传 */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <h2 className="text-sm font-bold mb-3" style={{ color: '#fbbf24' }}>上传支付截图</h2>
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
          style={{ borderColor: screenshotPreview ? '#fbbf24' : '#334155' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {screenshotPreview ? (
            <div className="relative">
              <img src={screenshotPreview} alt="截图" className="max-h-48 mx-auto rounded" />
              <button
                onClick={e => { e.stopPropagation(); setScreenshotFile(null); setScreenshotPreview(null) }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <Upload size={28} className="mx-auto mb-2" style={{ color: '#334155' }} />
              <p className="text-sm" style={{ color: '#64748b' }}>点击上传支付截图</p>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>支持 JPG/PNG</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleScreenshot}
        />
      </div>

      {/* 消息 */}
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

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!screenshotFile || submitting}
        className="w-full py-3.5 rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
      >
        <Upload size={16} />
        {submitting ? '提交中...' : `提交充值申请（${amount}点）`}
      </button>

      {/* 充值历史 */}
      {history.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
          <div
            className="px-4 py-2.5 text-sm font-bold"
            style={{ background: '#1e293b', color: '#fbbf24', borderBottom: '1px solid #334155' }}
          >
            充值记录
          </div>
          <div style={{ background: '#0f172a' }}>
            {history.map((req, i) => {
              const info = statusInfo(req.status)
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < history.length - 1 ? '1px solid #1e293b' : 'none' }}
                >
                  <div className="flex items-center gap-1" style={{ color: info.color }}>
                    {info.icon}
                    <span className="text-xs">{info.label}</span>
                  </div>
                  <span className="text-sm flex-1" style={{ color: '#f1f5f9' }}>
                    {req.amount} 点
                  </span>
                  <span className="text-xs" style={{ color: '#475569' }}>
                    {new Date(req.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
