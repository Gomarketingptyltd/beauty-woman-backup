'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { User, LogIn, LogOut, Settings, Menu, X, Coins } from 'lucide-react'
import Logo from './Logo'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [credits, setCredits] = useState<number>(0)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: SupabaseUser | null } }) => {
      setUser(data.user)
      if (data.user) fetchCredits(data.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: SupabaseUser } | null) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchCredits(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchCredits(userId: string) {
    const { data } = await supabase
      .rpc('get_user_credits', { p_user_id: userId })
    if (data !== null) setCredits(Number(data))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/60" style={{ background: '#0f172a' }}>
      <div className="max-w-6xl mx-auto px-3 h-12 flex items-center justify-between">
        {/* Logo */}
        <Logo size="sm" />

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* 积分显示 */}
              <Link
                href="/dashboard/recharge"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
              >
                <Coins size={12} />
                <span>{credits} 点</span>
              </Link>

              {/* 发布广告 */}
              <Link
                href="/dashboard/publish"
                className="hidden sm:flex items-center gap-1 px-3 py-1 rounded text-xs font-bold text-slate-900"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
              >
                发布广告
              </Link>

              {/* 用户菜单 */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: '#1e293b', border: '1px solid #334155' }}
              >
                <User size={15} style={{ color: '#94a3b8' }} />
              </button>

              {/* 下拉菜单 */}
              {menuOpen && (
                <div
                  className="absolute top-12 right-3 w-40 rounded-lg shadow-2xl py-1 z-50"
                  style={{ background: '#1e293b', border: '1px solid #334155' }}
                >
                  <div className="px-3 py-2 border-b border-slate-700">
                    <div className="flex items-center gap-1.5" style={{ color: '#fbbf24' }}>
                      <Coins size={13} />
                      <span className="text-xs font-bold">余额 {credits} 点</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
                    style={{ color: '#f1f5f9' }}
                  >
                    <Settings size={14} />
                    个人中心
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
                    style={{ color: '#f1f5f9' }}
                  >
                    <User size={14} />
                    编辑资料
                  </Link>
                  <Link
                    href="/dashboard/recharge"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
                    style={{ color: '#fbbf24' }}
                  >
                    <Coins size={14} />
                    充值点数
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-700 transition-colors border-t border-slate-700"
                    style={{ color: '#ef4444' }}
                  >
                    <LogOut size={14} />
                    退出登录
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ border: '1px solid #334155' }}
              >
                <LogIn size={13} />
                登录
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold text-slate-900"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
              >
                发布广告
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  )
}
