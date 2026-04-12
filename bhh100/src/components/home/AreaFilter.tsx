'use client'

import { AREAS, type AreaType } from '@/types'

interface AreaFilterProps {
  selected: AreaType | 'all'
  onChange: (area: AreaType | 'all') => void
  counts?: Partial<Record<AreaType | 'all', number>>
}

export default function AreaFilter({ selected, onChange, counts }: AreaFilterProps) {
  const tabs = [{ key: 'all' as const, label: '全部' }, ...AREAS.map(a => ({ key: a, label: a }))]

  return (
    <div
      className="sticky top-12 z-40 border-b"
      style={{ background: '#0f172a', borderColor: '#1e293b' }}
    >
      <div className="max-w-6xl mx-auto px-3">
        <div className="flex overflow-x-auto gap-0 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => {
            const isActive = selected === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="flex-shrink-0 flex items-center gap-1 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap"
                style={{
                  borderBottomColor: isActive ? '#fbbf24' : 'transparent',
                  color: isActive ? '#fbbf24' : '#94a3b8',
                  background: 'transparent',
                }}
              >
                {tab.label}
                {counts && counts[tab.key] !== undefined && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: isActive ? 'rgba(251,191,36,0.2)' : '#1e293b',
                      color: isActive ? '#fbbf24' : '#64748b',
                    }}
                  >
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
