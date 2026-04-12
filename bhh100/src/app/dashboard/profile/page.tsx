'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Upload, X, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AREAS, type AreaType } from '@/types'
import type { Profile } from '@/types'
import Link from 'next/link'

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: '', age: undefined, height: undefined, weight: undefined,
    bust: '', nationality: '中国', area: 'City', bio: '',
    phone: '', telegram: '', wechat: '', whatsapp: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setAvatarPreview(data.avatar_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(field: keyof Profile, value: any) {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      let avatar_url = profile.avatar_url

      // 上传头像
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadErr) throw uploadErr

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = publicUrl
      }

      const payload = {
        user_id: user.id,
        name: profile.name,
        age: profile.age ? Number(profile.age) : null,
        height: profile.height ? Number(profile.height) : null,
        weight: profile.weight ? Number(profile.weight) : null,
        bust: profile.bust || null,
        nationality: profile.nationality || '中国',
        area: profile.area,
        bio: profile.bio || null,
        phone: profile.phone || null,
        telegram: profile.telegram || null,
        wechat: profile.wechat || null,
        whatsapp: profile.whatsapp || null,
        avatar_url,
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error
      setMessage({ type: 'success', text: '资料保存成功！' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-spin">🌸</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard" style={{ color: '#64748b' }}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>编辑档案</h1>
      </div>

      {message && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          style={{
            background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* 头像上传 */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center cursor-pointer relative flex-shrink-0"
          style={{ background: '#334155', border: '2px solid rgba(251,191,36,0.3)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🌸</span>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full">
            <Upload size={18} style={{ color: 'white' }} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#f1f5f9' }}>上传头像</p>
          <p className="text-xs mb-2" style={{ color: '#64748b' }}>点击头像更换，支持 JPG/PNG</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded"
            style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #334155' }}
          >
            选择图片
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* 基本信息 */}
      <Section title="基本资料">
        <div className="grid grid-cols-2 gap-3">
          <Field label="姓名 *">
            <Input
              value={profile.name || ''}
              onChange={v => handleChange('name', v)}
              placeholder="显示名字"
            />
          </Field>
          <Field label="年龄">
            <Input
              type="number"
              value={profile.age?.toString() || ''}
              onChange={v => handleChange('age', v)}
              placeholder="18-60"
            />
          </Field>
          <Field label="身高 (cm)">
            <Input
              type="number"
              value={profile.height?.toString() || ''}
              onChange={v => handleChange('height', v)}
              placeholder="140-200"
            />
          </Field>
          <Field label="体重 (kg)">
            <Input
              type="number"
              value={profile.weight?.toString() || ''}
              onChange={v => handleChange('weight', v)}
              placeholder="35-120"
            />
          </Field>
          <Field label="胸围">
            <Input
              value={profile.bust || ''}
              onChange={v => handleChange('bust', v)}
              placeholder="如 34C"
            />
          </Field>
          <Field label="国籍">
            <Input
              value={profile.nationality || ''}
              onChange={v => handleChange('nationality', v)}
              placeholder="中国"
            />
          </Field>
        </div>

        <Field label="所在区域 *" className="mt-3">
          <div className="flex gap-2 flex-wrap">
            {AREAS.map(area => (
              <button
                key={area}
                onClick={() => handleChange('area', area)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: profile.area === area ? 'rgba(251,191,36,0.2)' : '#0f172a',
                  color: profile.area === area ? '#fbbf24' : '#64748b',
                  border: `1px solid ${profile.area === area ? 'rgba(251,191,36,0.4)' : '#334155'}`,
                }}
              >
                {area}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* 联系方式 */}
      <Section title="联系方式">
        <div className="space-y-3">
          <Field label="微信号">
            <Input
              value={profile.wechat || ''}
              onChange={v => handleChange('wechat', v)}
              placeholder="微信ID（会显示在首页）"
            />
          </Field>
          <Field label="Telegram">
            <Input
              value={profile.telegram || ''}
              onChange={v => handleChange('telegram', v)}
              placeholder="@用户名 或 手机号"
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={profile.whatsapp || ''}
              onChange={v => handleChange('whatsapp', v)}
              placeholder="61400000000（含国家码）"
            />
          </Field>
          <Field label="电话">
            <Input
              value={profile.phone || ''}
              onChange={v => handleChange('phone', v)}
              placeholder="0400000000"
            />
          </Field>
        </div>
      </Section>

      {/* 个人简介 */}
      <Section title="个人简介">
        <textarea
          value={profile.bio || ''}
          onChange={e => handleChange('bio', e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="介绍自己，展示服务特色（最多500字）"
          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none"
          style={{
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #334155',
          }}
        />
        <p className="text-right text-xs mt-1" style={{ color: '#475569' }}>
          {(profile.bio || '').length}/500
        </p>
      </Section>

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        disabled={saving || !profile.name}
        className="w-full py-3 rounded-xl font-bold text-slate-900 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
      >
        <Save size={16} />
        {saving ? '保存中...' : '保存资料'}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
      <div
        className="px-4 py-2.5 text-sm font-bold"
        style={{ background: '#1e293b', color: '#fbbf24', borderBottom: '1px solid #334155' }}
      >
        {title}
      </div>
      <div className="p-4" style={{ background: '#0f172a' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs mb-1.5 font-medium" style={{ color: '#94a3b8' }}>{label}</label>
      {children}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text'
}: { value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
      style={{
        background: '#0f172a',
        color: '#f1f5f9',
        border: '1px solid #334155',
      }}
    />
  )
}
