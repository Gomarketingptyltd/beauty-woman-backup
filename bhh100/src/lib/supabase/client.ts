import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client during build/dev without env vars
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ limit: async () => ({ data: null, error: null }) }), ascending: false }), order: () => ({ ascending: false }), gte: () => ({ lte: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }), limit: async () => ({ data: [], error: null }) }),
        insert: async () => ({ error: null }),
        upsert: async () => ({ error: null }),
        update: async () => ({ error: null }),
      }),
      rpc: async () => ({ data: 0, error: null }),
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any
  }
  return createBrowserClient(supabaseUrl, supabaseKey)
}
