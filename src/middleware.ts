import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting simples em memória
const rateLimit = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const MAX_REQUESTS = 60 // 60 requisições por minuto

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return ip
}

function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const record = rateLimit.get(key)

    if (!record || now > record.resetTime) {
        rateLimit.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        })
        return true
    }

    if (record.count >= MAX_REQUESTS) {
        return false
    }

    record.count++
    return true
}

export function middleware(request: NextRequest) {
    // Rate limiting para APIs
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const key = getRateLimitKey(request)

        if (!checkRateLimit(key)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }
    }

    // Headers de segurança
    const response = NextResponse.next()

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    )

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
