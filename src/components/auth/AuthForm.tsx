'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase'

export default function AuthForm() {
    const supabase = createClientComponentClient({
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY
    })

    return (
        <Auth
            supabaseClient={supabase}
            view="magic_link"
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            showLinks={false}
            providers={[]}
            redirectTo="http://localhost:3000/auth/callback"
        />
    )
}
