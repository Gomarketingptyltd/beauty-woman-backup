export type AreaType = 'City' | 'Burwood' | 'Hurstville' | 'Chatswood' | '其它'
export type AdStatus = 'pending' | 'active' | 'expired' | 'rejected'
export type RechargeStatus = 'pending' | 'approved' | 'rejected'
export type CreditType = 'recharge' | 'consume' | 'refund' | 'bonus'

export const AREAS: AreaType[] = ['City', 'Burwood', 'Hurstville', 'Chatswood', '其它']

export interface Profile {
  id: string
  user_id: string
  name: string
  age: number | null
  height: number | null
  weight: number | null
  bust: string | null
  nationality: string
  area: AreaType
  bio: string | null
  avatar_url: string | null
  photos: string[]
  phone: string | null
  telegram: string | null
  wechat: string | null
  whatsapp: string | null
  price_per_day: number
  is_verified: boolean
  verification_photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // from active_profiles view
  starts_at?: string
  expires_at?: string
}

export interface Ad {
  id: string
  profile_id: string
  user_id: string
  status: AdStatus
  starts_at: string | null
  expires_at: string | null
  days: number
  amount_charged: number | null
  created_at: string
}

export interface Credit {
  id: string
  user_id: string
  type: CreditType
  amount: number
  description: string | null
  related_ad_id: string | null
  created_at: string
}

export interface RechargeRequest {
  id: string
  user_id: string
  amount: number
  screenshot_url: string
  status: RechargeStatus
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
}
