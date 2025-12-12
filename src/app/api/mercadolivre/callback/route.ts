import { NextRequest, NextResponse } from 'next/server'
import { mlTokenManager } from '@/lib/mlTokenManager'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json(
                { error: 'Código de autorização não fornecido' },
                { status: 400 }
            )
        }

        // Obter token inicial
        const success = await mlTokenManager.getAuthorizationCode(code)

        if (success) {
            // Redirecionar para página de sucesso
            return NextResponse.redirect(new URL('/admin/mercado-livre?auth=success', request.url))
        } else {
            return NextResponse.redirect(new URL('/admin/mercado-livre?auth=error', request.url))
        }
    } catch (error: any) {
        console.error('Erro no callback:', error)
        return NextResponse.redirect(new URL('/admin/mercado-livre?auth=error', request.url))
    }
}
