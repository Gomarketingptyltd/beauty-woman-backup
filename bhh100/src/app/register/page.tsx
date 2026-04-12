'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) { setError('两次密码不一致'); return }
    if (password.length < 8) { setError('密码至少需要8位'); return }
    if (!agreed) { setError('请阅读并同意使用条款'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message.includes('already registered') ? '该邮箱已注册' : error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0f172a' }}>
        <div className="w-full max-w-sm text-center p-6 rounded-2xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>注册成功！</h2>
          <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
            验证邮件已发送至 <strong style={{ color: '#fbbf24' }}>{email}</strong><br />
            请检查邮箱并点击验证链接完成注册。
          </p>
          <Link
            href="/login"
            className="block w-full py-3 rounded-lg font-bold text-center"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#0f172a' }}
          >
            前往登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#0f172a' }}>
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <h1 className="text-xl font-bold mb-6 text-center" style={{ color: '#f1f5f9' }}>
          注册账号
        </h1>

        <div
          className="mb-4 px-3 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(251,191,36,0.08)', color: '#94a3b8', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          严格执行 <strong style={{ color: '#fbbf24' }}>一人一号</strong>。注册后需完善档案并充值点数才能发布广告。
        </div>

        {error && (
          <div
            className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>邮箱地址</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-3 rounded-lg text-sm outline-none"
              style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>设置密码（至少8位）</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="至少8位"
                className="w-full px-3 py-3 rounded-lg text-sm outline-none pr-10"
                style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>确认密码</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-3 py-3 rounded-lg text-sm outline-none"
              style={{
                background: '#0f172a',
                color: '#f1f5f9',
                border: `1px solid ${confirm && confirm !== password ? '#ef4444' : '#334155'}`,
              }}
            />
          </div>

          {/* 年龄确认 */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 accent-yellow-400"
            />
            <span className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
              我已年满18岁，同意
              <Link href="/terms" className="mx-0.5" style={{ color: '#fbbf24' }}>使用条款</Link>
              和
              <Link href="/privacy" className="mx-0.5" style={{ color: '#fbbf24' }}>隐私政策</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#0f172a' }}
          >
            <UserPlus size={16} />
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm" style={{ color: '#64748b' }}>
          已有账号？
          <Link href="/login" className="font-semibold ml-1" style={{ color: '#fbbf24' }}>
            直接登录
          </Link>
        </div>
      </div>
    </div>
  )
}
