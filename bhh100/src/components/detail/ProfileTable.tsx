import type { Profile } from '@/types'

interface ProfileTableProps {
  profile: Profile
}

interface Row {
  label: string
  value: string | number | null | undefined
  unit?: string
}

export default function ProfileTable({ profile }: ProfileTableProps) {
  const rows: Row[] = [
    { label: '姓名', value: profile.name },
    { label: '年龄', value: profile.age, unit: '岁' },
    { label: '身高', value: profile.height, unit: 'cm' },
    { label: '体重', value: profile.weight, unit: 'kg' },
    { label: '胸围', value: profile.bust },
    { label: '国籍', value: profile.nationality },
    { label: '所在区域', value: profile.area },
    { label: '广告费用', value: `$${profile.price_per_day}`, unit: '/天' },
    {
      label: '认证状态',
      value: profile.is_verified ? '✓ 已实名认证' : '未认证',
    },
  ]

  return (
    <div className="mx-4 rounded-lg overflow-hidden" style={{ border: '1px solid #334155' }}>
      <div
        className="px-4 py-2.5 text-sm font-bold"
        style={{ background: '#1e293b', color: '#fbbf24', borderBottom: '1px solid #334155' }}
      >
        基本资料
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              style={{ background: i % 2 === 0 ? '#0f172a' : 'rgba(30,41,59,0.5)' }}
            >
              <td
                className="px-4 py-2 font-medium w-24 flex-shrink-0"
                style={{ color: '#64748b' }}
              >
                {row.label}
              </td>
              <td className="px-4 py-2" style={{ color: '#f1f5f9' }}>
                {row.value != null && row.value !== '' ? (
                  <span>
                    {row.value}
                    {row.unit && <span style={{ color: '#64748b' }}> {row.unit}</span>}
                  </span>
                ) : (
                  <span style={{ color: '#334155' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
