'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#0f172a' }}>
      {/* Logo */}
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      {/* 登录卡片 */}
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#1e293b', border: '1px solid #334155' }}
      >
        <h1 className="text-xl font-bold mb-6 text-center" style={{ color: '#f1f5f9' }}>
          登录账号
        </h1>

        {error && (
          <div
            className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              邮箱地址
            </label>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
              密码
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full px-3 py-3 rounded-lg text-sm outline-none pr-10"
                style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#64748b' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#0f172a' }}
          >
            <LogIn size={16} />
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm" style={{ color: '#64748b' }}>
          还没有账号？
          <Link href="/register" className="font-semibold ml-1" style={{ color: '#fbbf24' }}>
            立即注册
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-center max-w-xs" style={{ color: '#334155' }}>
        本平台仅限18岁以上成年人使用。登录即表示您同意我们的使用条款。
      </p>
    </div>
  )
}
