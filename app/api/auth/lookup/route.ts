import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint looks up a user's email by their username using the database
export async function POST(request: Request) {
  try {
    const { identifier } = await request.json()

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier required' }, { status: 400 })
    }

    // If it looks like an email, return it directly
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier })
    }

    const supabase = await createClient()

    // Search for user by username in the profiles table (case-insensitive)
    console.log('[v0] Looking up user with identifier:', identifier)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', identifier)
      .limit(1)
      .maybeSingle()

    console.log('[v0] Lookup result:', { profile, error })

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ email: profile.email })
  } catch (error) {
    console.error('Error in lookup API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
