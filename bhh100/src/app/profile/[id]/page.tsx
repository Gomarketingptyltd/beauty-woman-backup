import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DetailPageClient from './DetailPageClient'
import type { Profile } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('active_profiles')
    .select('name, area, bio, avatar_url')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: '百花汇 - 未找到' }
  }

  const title = `${data.name} - ${data.area} 悉尼独立女生伴游 | 百花汇 bhh100.com`
  const description = data.bio
    ? `${data.bio.slice(0, 120)}... | 百花汇 bhh100.com`
    : `${data.name}，位于悉尼${data.area}区域，独立经营，诚信服务。详情请访问百花汇 bhh100.com`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.avatar_url ? [{ url: data.avatar_url }] : [],
    },
  }
}

export default async function ProfileDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('active_profiles')
    .select('*')
    .eq('id', id)
    .single()

  // Fallback for development (mock profile)
  const mockProfile: Profile = {
    id,
    user_id: 'mock',
    name: '小雨',
    age: 22,
    height: 165,
    weight: 50,
    bust: '34C',
    nationality: '中国',
    area: 'City',
    bio: '温柔甜美，服务专业，欢迎联系。本人独立经营，不接受催促，请尊重彼此。悉尼本地，随时可约。',
    avatar_url: null,
    photos: [],
    phone: '0400123456',
    telegram: '@demo_user',
    wechat: 'demo_wechat',
    whatsapp: '61400123456',
    price_per_day: 10,
    is_verified: true,
    verification_photo_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  }

  const profile = (data as Profile) ?? (error ? mockProfile : null)
  if (!profile) notFound()

  return <DetailPageClient profile={profile} isMock={!data} />
}
