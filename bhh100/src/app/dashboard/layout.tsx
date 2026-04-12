import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '个人中心 | 百花汇 bhh100.com',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
