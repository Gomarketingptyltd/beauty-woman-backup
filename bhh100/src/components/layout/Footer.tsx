import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer
      className="mt-8 border-t py-6 px-4"
      style={{ background: '#0a1628', borderColor: '#1e293b' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />

          <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: '#64748b' }}>
            <Link href="/about" className="hover:text-slate-300 transition-colors">关于我们</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">使用条款</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">隐私政策</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">联系我们</Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t text-center text-xs" style={{ borderColor: '#1e293b', color: '#475569' }}>
          <p>© 2024 bhh100.com 百花汇 · 悉尼华人生活服务平台</p>
          <p className="mt-1">本站为广告出版商，不参与任何交易，不承担中介责任。所有广告内容由发布者自行负责。</p>
          <p className="mt-1">成人内容平台，仅限18岁以上用户访问。</p>
        </div>
      </div>
    </footer>
  )
}
