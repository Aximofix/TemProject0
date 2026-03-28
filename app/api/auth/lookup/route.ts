import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint looks up a user's email by their username or full_name using the database
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

    // Search for user by username or full_name in the profiles table (case-insensitive)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .or(`username.ilike.${identifier},full_name.ilike.${identifier}`)
      .limit(1)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ email: profile.email })
  } catch (error) {
    console.error('Error in lookup API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
