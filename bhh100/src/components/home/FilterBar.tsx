'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'

export interface FilterState {
  verifiedOnly: boolean
  onlineToday: boolean
  ageMin: number
  ageMax: number
}

interface FilterBarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  total: number
}

export default function FilterBar({ filters, onChange, total }: FilterBarProps) {
  const [open, setOpen] = useState(false)

  const activeCount = [
    filters.verifiedOnly,
    filters.onlineToday,
    filters.ageMin > 18 || filters.ageMax < 50,
  ].filter(Boolean).length

  function reset() {
    onChange({ verifiedOnly: false, onlineToday: false, ageMin: 18, ageMax: 50 })
  }

  return (
    <div className="relative">
      {/* 筛选栏 */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: '#1e293b', background: '#0f172a' }}
      >
        <span className="text-xs" style={{ color: '#64748b' }}>
          共 <span style={{ color: '#fbbf24', fontWeight: 700 }}>{total}</span> 位
        </span>

        <div className="flex gap-1.5 ml-auto">
          {/* 今日在线快速筛选 */}
          <button
            onClick={() => onChange({ ...filters, onlineToday: !filters.onlineToday })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: filters.onlineToday ? 'rgba(34,197,94,0.2)' : '#1e293b',
              color: filters.onlineToday ? '#22c55e' : '#94a3b8',
              border: `1px solid ${filters.onlineToday ? 'rgba(34,197,94,0.4)' : '#334155'}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: filters.onlineToday ? '#22c55e' : '#64748b' }} />
            今日在线
          </button>

          {/* 仅看认证 */}
          <button
            onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: filters.verifiedOnly ? 'rgba(251,191,36,0.2)' : '#1e293b',
              color: filters.verifiedOnly ? '#fbbf24' : '#94a3b8',
              border: `1px solid ${filters.verifiedOnly ? 'rgba(251,191,36,0.4)' : '#334155'}`,
            }}
          >
            ✓ 已认证
          </button>

          {/* 高级筛选 */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium relative"
            style={{
              background: open || activeCount > 0 ? 'rgba(251,191,36,0.15)' : '#1e293b',
              color: open || activeCount > 0 ? '#fbbf24' : '#94a3b8',
              border: `1px solid ${open || activeCount > 0 ? 'rgba(251,191,36,0.35)' : '#334155'}`,
            }}
          >
            <SlidersHorizontal size={11} />
            筛选
            {activeCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-center flex items-center justify-center"
                style={{ background: '#fbbf24', color: '#0f172a', fontSize: 8, fontWeight: 800 }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 高级筛选面板 */}
      {open && (
        <>
          <div
            className="absolute top-full right-3 w-64 rounded-lg shadow-2xl p-4 z-50"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>高级筛选</span>
              <button onClick={() => setOpen(false)}>
                <X size={15} style={{ color: '#64748b' }} />
              </button>
            </div>

            {/* 年龄范围 */}
            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: '#94a3b8' }}>
                年龄范围：{filters.ageMin} - {filters.ageMax} 岁
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={18} max={50}
                  value={filters.ageMin}
                  onChange={e => onChange({ ...filters, ageMin: Number(e.target.value) })}
                  className="flex-1 accent-yellow-400"
                />
                <input
                  type="range"
                  min={18} max={50}
                  value={filters.ageMax}
                  onChange={e => onChange({ ...filters, ageMax: Number(e.target.value) })}
                  className="flex-1 accent-yellow-400"
                />
              </div>
            </div>

            {/* 重置 */}
            <button
              onClick={reset}
              className="w-full py-1.5 text-xs rounded text-center"
              style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155' }}
            >
              重置筛选
            </button>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}
