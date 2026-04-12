'use client'

import { useState, useEffect, useCallback } from 'react'
import AreaFilter from '@/components/home/AreaFilter'
import FilterBar, { FilterState } from '@/components/home/FilterBar'
import ProfileCard from '@/components/home/ProfileCard'
import { createClient } from '@/lib/supabase/client'
import type { Profile, AreaType } from '@/types'
import { AREAS } from '@/types'

const DEFAULT_FILTERS: FilterState = {
  verifiedOnly: false,
  onlineToday: false,
  ageMin: 18,
  ageMax: 50,
}

// Mock data for UI development before Supabase is connected
const MOCK_PROFILES: Profile[] = Array.from({ length: 18 }, (_, i) => ({
  id: `mock-${i}`,
  user_id: `user-${i}`,
  name: ['小雨', '小美', '小燕', '小红', '小玲', '小芳', '小娟', '小丽', '小敏', '小华'][i % 10],
  age: 20 + (i % 12),
  height: 158 + (i % 15),
  weight: 48 + (i % 10),
  bust: ['34B', '34C', '36C', '36D', '34D'][i % 5],
  nationality: '中国',
  area: AREAS[i % AREAS.length],
  bio: '温柔甜美，服务专业，欢迎联系',
  avatar_url: null,
  photos: [],
  phone: '0400' + String(100000 + i),
  telegram: '@user' + i,
  wechat: 'wx_user' + i,
  whatsapp: '614' + String(10000000 + i),
  price_per_day: 10,
  is_verified: i % 3 === 0,
  verification_photo_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  starts_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 86400000).toISOString(),
}))

export default function HomePage() {
  const [area, setArea] = useState<AreaType | 'all'>('all')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [useMock, setUseMock] = useState(false)

  const supabase = createClient()

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('active_profiles')
        .select('*')

      if (area !== 'all') {
        query = query.eq('area', area)
      }
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true)
      }
      if (filters.ageMin > 18) {
        query = query.gte('age', filters.ageMin)
      }
      if (filters.ageMax < 50) {
        query = query.lte('age', filters.ageMax)
      }

      query = query.order('starts_at', { ascending: false }).limit(60)

      const { data, error } = await query
      if (error || !data) {
        setUseMock(true)
        setProfiles(filterMock(area, filters))
      } else {
        setUseMock(false)
        setProfiles(data as Profile[])
      }
    } catch {
      setUseMock(true)
      setProfiles(filterMock(area, filters))
    } finally {
      setLoading(false)
    }
  }, [area, filters])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  function filterMock(a: AreaType | 'all', f: FilterState) {
    return MOCK_PROFILES.filter(p => {
      if (a !== 'all' && p.area !== a) return false
      if (f.verifiedOnly && !p.is_verified) return false
      if (p.age && (p.age < f.ageMin || p.age > f.ageMax)) return false
      return true
    })
  }

  // Count per area
  const counts: Partial<Record<AreaType | 'all', number>> = { all: profiles.length }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      {/* 区域筛选 Tabs */}
      <AreaFilter selected={area} onChange={setArea} counts={counts} />

      {/* 条件筛选栏 */}
      <FilterBar filters={filters} onChange={setFilters} total={profiles.length} />

      {/* Mock 提示 */}
      {useMock && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded text-xs"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          💡 演示模式：请配置 Supabase 环境变量后连接真实数据库
        </div>
      )}

      {/* 卡片列表 */}
      <div className="max-w-6xl mx-auto px-3 py-3">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden animate-pulse"
                style={{ background: '#1e293b' }}
              >
                <div style={{ paddingBottom: '133%', background: '#334155' }} />
                <div className="p-2">
                  <div className="h-3 rounded mb-1" style={{ background: '#334155', width: '60%' }} />
                  <div className="h-2 rounded" style={{ background: '#334155', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌸</div>
            <p style={{ color: '#64748b' }}>该区域暂无广告</p>
            <button
              onClick={() => { setArea('all'); setFilters(DEFAULT_FILTERS) }}
              className="mt-4 px-4 py-2 rounded text-sm"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >
              查看全部
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
