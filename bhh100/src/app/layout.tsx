import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '百花汇 bhh100.com - 悉尼华人伴游服务平台',
  description: '百花汇 bhh100.com，悉尼最大华人成人服务分类广告平台。City、Burwood、Hurstville、Chatswood等区域独立女生广告发布。',
  keywords: '悉尼伴游, 悉尼华人, bhh100, 百花汇, Sydney escort',
  metadataBase: new URL('https://bhh100.com'),
  openGraph: {
    siteName: '百花汇 bhh100.com',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main className="min-h-screen" style={{ background: '#0f172a' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
