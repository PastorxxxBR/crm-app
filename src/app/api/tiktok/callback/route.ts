import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * TikTok OAuth Callback
 * Recebe o código de autorização e gera o access token
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
            return NextResponse.redirect(
                new URL('/admin/tiktok?error=no_code', request.url)
            )
        }

        const appKey = process.env.TIKTOK_APP_KEY
        const appSecret = process.env.TIKTOK_APP_SECRET

        // Gerar access token
        const response = await axios.post(
            'https://auth.tiktok-shops.com/api/v2/token/get',
            {
                app_key: appKey,
                app_secret: appSecret,
                auth_code: code,
                grant_type: 'authorized_code'
            }
        )

        const { access_token, refresh_token, expires_in } = response.data.data

        // Redirecionar com sucesso
        const redirectUrl = new URL('/admin/tiktok', request.url)
        redirectUrl.searchParams.set('success', 'true')
        redirectUrl.searchParams.set('token', access_token)
        redirectUrl.searchParams.set('refresh', refresh_token)
        redirectUrl.searchParams.set('expires', expires_in.toString())

        return NextResponse.redirect(redirectUrl)

    } catch (error: any) {
        console.error('Erro no callback TikTok:', error)
        return NextResponse.redirect(
            new URL('/admin/tiktok?error=auth_failed', request.url)
        )
    }
}
