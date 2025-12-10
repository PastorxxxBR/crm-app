// src/components/auth/AuthForm.tsx
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
            appearance={{
                theme: ThemeSupa,
                variables: {
                    default: {
                        colors: {
                            brand: '#ec4899',
                            brandAccent: '#db2777',
                        }
                    }
                }
            }}
            localization={{
                variables: {
                    sign_in: {
                        email_label: 'Endereço de email',
                        password_label: 'Sua senha',
                        email_input_placeholder: 'Seu email',
                        password_input_placeholder: 'Sua senha',
                        button_label: 'Entrar',
                        loading_button_label: 'Entrando...',
                        social_provider_text: 'Entrar com {{provider}}',
                        link_text: 'Já tem uma conta? Entre',
                    },
                    sign_up: {
                        email_label: 'Endereço de email',
                        password_label: 'Criar senha',
                        email_input_placeholder: 'Seu email',
                        password_input_placeholder: 'Sua senha',
                        button_label: 'Cadastrar',
                        loading_button_label: 'Cadastrando...',
                        social_provider_text: 'Cadastrar com {{provider}}',
                        link_text: 'Não tem uma conta? Cadastre-se',
                    },
                },
            }}
            theme="dark"
            providers={[]}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined}
            view="sign_in"
            showLinks={true}
        />
    )
}
