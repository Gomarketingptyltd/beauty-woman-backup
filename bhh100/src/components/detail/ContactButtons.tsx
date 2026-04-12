import { Phone, MessageCircle } from 'lucide-react'
import type { Profile } from '@/types'

interface ContactButtonsProps {
  profile: Profile
}

// Telegram SVG icon
function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.198 13.8l-2.946-.925c-.64-.203-.654-.64.136-.953l11.498-4.432c.533-.194 1.003.13.676 1.758z" />
    </svg>
  )
}

// WeChat SVG icon
function WeChatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.303-.87-.474-1.79-.474-2.74 0-3.71 3.573-6.704 7.98-6.704.3 0 .597.016.888.048C15.992 4.67 12.614 2.188 8.691 2.188zm-2.46 3.47a1.052 1.052 0 1 1 0 2.104 1.052 1.052 0 0 1 0-2.104zm4.92 0a1.052 1.052 0 1 1 0 2.104 1.052 1.052 0 0 1 0-2.104zm4.888 2.647c-3.81 0-6.895 2.702-6.895 6.028 0 3.326 3.085 6.028 6.895 6.028a8.1 8.1 0 0 0 2.396-.36.74.74 0 0 1 .609.082l1.58.924a.278.278 0 0 0 .142.046c.14 0 .253-.112.253-.253a.306.306 0 0 0-.04-.182l-.33-1.258a.504.504 0 0 1 .182-.566C22.017 17.388 23 15.804 23 14.033c0-3.326-3.085-6.028-6.96-6.028v-.7zm-2.167 3.24a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.334 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
    </svg>
  )
}

// WhatsApp SVG icon
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export default function ContactButtons({ profile }: ContactButtonsProps) {
  function handleWechat() {
    if (profile.wechat) {
      navigator.clipboard?.writeText(profile.wechat)
        .then(() => alert(`微信号已复制：${profile.wechat}`))
        .catch(() => alert(`微信号：${profile.wechat}`))
    }
  }

  function handleTelegram() {
    if (profile.telegram) {
      const username = profile.telegram.startsWith('@') ? profile.telegram.slice(1) : profile.telegram
      window.open(`https://t.me/${username}`, '_blank')
    }
  }

  function handleWhatsApp() {
    if (profile.whatsapp) {
      const number = profile.whatsapp.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${number}`, '_blank')
    }
  }

  function handlePhone() {
    if (profile.phone) {
      window.location.href = `tel:${profile.phone}`
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 p-4">
      {profile.wechat && (
        <button
          onClick={handleWechat}
          className="contact-btn text-white"
          style={{ background: '#07C160' }}
        >
          <WeChatIcon size={20} />
          <span>微信联系</span>
        </button>
      )}

      {profile.telegram && (
        <button
          onClick={handleTelegram}
          className="contact-btn text-white"
          style={{ background: '#2AABEE' }}
        >
          <TelegramIcon size={20} />
          <span>Telegram</span>
        </button>
      )}

      {profile.whatsapp && (
        <button
          onClick={handleWhatsApp}
          className="contact-btn text-white"
          style={{ background: '#128C7E' }}
        >
          <WhatsAppIcon size={20} />
          <span>WhatsApp</span>
        </button>
      )}

      {profile.phone && (
        <button
          onClick={handlePhone}
          className="contact-btn text-white"
          style={{ background: '#475569' }}
        >
          <Phone size={20} />
          <span>拨打电话</span>
        </button>
      )}

      {!profile.wechat && !profile.telegram && !profile.whatsapp && !profile.phone && (
        <div
          className="col-span-2 text-center py-4 text-sm"
          style={{ color: '#64748b' }}
        >
          暂无联系方式
        </div>
      )}
    </div>
  )
}
