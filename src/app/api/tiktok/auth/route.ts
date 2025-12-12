import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Gerar Access Token do TikTok
 * 
 * Endpoint para gerar token OAuth do TikTok Shop
 */
export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Código de autorização não fornecido' },
                { status: 400 }
            )
        }

        const appKey = process.env.TIKTOK_APP_KEY
        const appSecret = process.env.TIKTOK_APP_SECRET

        if (!appKey || !appSecret) {
            return NextResponse.json(
                { success: false, error: 'Credenciais TikTok não configuradas' },
                { status: 500 }
            )
        }

        // Gerar token
        const response = await axios.post(
            'https://auth.tiktok-shops.com/api/v2/token/get',
            {
                app_key: appKey,
                app_secret: appSecret,
                auth_code: code,
                grant_type: 'authorized_code'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        const { access_token, refresh_token, expires_in } = response.data.data

        return NextResponse.json({
            success: true,
            access_token,
            refresh_token,
            expires_in,
            message: 'Token gerado com sucesso! Adicione no .env.local'
        })

    } catch (error: any) {
        console.error('Erro ao gerar token:', error.response?.data || error.message)

        return NextResponse.json(
            {
                success: false,
                error: error.response?.data?.message || error.message
            },
            { status: 500 }
        )
    }
}

/**
 * Obter URL de autorização
 */
export async function GET(request: NextRequest) {
    const appKey = process.env.TIKTOK_APP_KEY
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'https://crm.tocadaoncaroupa.com/api/tiktok/callback'

    if (!appKey) {
        return NextResponse.json(
            { success: false, error: 'App Key não configurado' },
            { status: 500 }
        )
    }

    const authUrl = `https://services.tiktokshop.com/open/authorize?app_key=${appKey}&state=random_state&redirect_uri=${encodeURIComponent(redirectUri)}`

    return NextResponse.json({
        success: true,
        authUrl,
        instructions: [
            '1. Abra a URL de autorização',
            '2. Faça login no TikTok Shop',
            '3. Autorize o aplicativo',
            '4. Copie o código da URL de retorno',
            '5. Use o código para gerar o token'
        ]
    })
}
