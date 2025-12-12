import fs from 'fs'
import path from 'path'

interface TokenData {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    scope: string
    user_id: number
    created_at: number
}

/**
 * Mercado Livre Token Manager
 * 
 * Gerencia automaticamente a renovação de tokens do Mercado Livre
 * - Detecta quando o token está expirando
 * - Renova automaticamente
 * - Salva no .env.local
 * - Funciona em background
 */
export class MLTokenManager {
    private clientId = process.env.MERCADOLIVRE_CLIENT_ID || '8915788255273924'
    private clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET || 'oA2rpmIX1gSjLjhoTKgM4dBlpmvA9cIY'
    private refreshToken = process.env.MERCADOLIVRE_REFRESH_TOKEN || ''
    private accessToken = process.env.MERCADOLIVRE_ACCESS_TOKEN || ''
    private tokenExpiresAt = 0
    private renewalInterval: NodeJS.Timeout | null = null

    constructor() {
        this.loadTokenData()
        this.startAutoRenewal()
    }

    /**
     * Carrega dados do token salvos
     */
    private loadTokenData() {
        try {
            const tokenFile = path.join(process.cwd(), '.ml-token.json')

            if (fs.existsSync(tokenFile)) {
                const data: TokenData = JSON.parse(fs.readFileSync(tokenFile, 'utf8'))
                this.tokenExpiresAt = data.created_at + (data.expires_in * 1000)
                this.refreshToken = data.refresh_token
                this.accessToken = data.access_token

                console.log('📦 Token do ML carregado do cache')
            }
        } catch (error) {
            console.error('Erro ao carregar token:', error)
        }
    }

    /**
     * Salva dados do token
     */
    private saveTokenData(data: TokenData) {
        try {
            const tokenFile = path.join(process.cwd(), '.ml-token.json')
            fs.writeFileSync(tokenFile, JSON.stringify(data, null, 2))

            // Atualizar .env.local
            this.updateEnvFile(data.access_token, data.refresh_token)

            console.log('💾 Token do ML salvo com sucesso')
        } catch (error) {
            console.error('Erro ao salvar token:', error)
        }
    }

    /**
     * Atualiza .env.local com novo token
     */
    private updateEnvFile(accessToken: string, refreshToken: string) {
        try {
            const envPath = path.join(process.cwd(), '.env.local')
            let envContent = fs.readFileSync(envPath, 'utf8')

            // Atualizar ACCESS_TOKEN
            const accessTokenRegex = /MERCADOLIVRE_ACCESS_TOKEN=.*/
            if (accessTokenRegex.test(envContent)) {
                envContent = envContent.replace(accessTokenRegex, `MERCADOLIVRE_ACCESS_TOKEN=${accessToken}`)
            } else {
                envContent += `\nMERCADOLIVRE_ACCESS_TOKEN=${accessToken}\n`
            }

            // Atualizar REFRESH_TOKEN
            const refreshTokenRegex = /MERCADOLIVRE_REFRESH_TOKEN=.*/
            if (refreshTokenRegex.test(envContent)) {
                envContent = envContent.replace(refreshTokenRegex, `MERCADOLIVRE_REFRESH_TOKEN=${refreshToken}`)
            } else {
                envContent += `MERCADOLIVRE_REFRESH_TOKEN=${refreshToken}\n`
            }

            fs.writeFileSync(envPath, envContent)

            // Atualizar variáveis de ambiente em runtime
            process.env.MERCADOLIVRE_ACCESS_TOKEN = accessToken
            process.env.MERCADOLIVRE_REFRESH_TOKEN = refreshToken

            console.log('✅ .env.local atualizado com novo token')
        } catch (error) {
            console.error('Erro ao atualizar .env.local:', error)
        }
    }

    /**
     * Verifica se o token está expirando (menos de 30 minutos)
     */
    isTokenExpiring(): boolean {
        const now = Date.now()
        const thirtyMinutes = 30 * 60 * 1000

        return (this.tokenExpiresAt - now) < thirtyMinutes
    }

    /**
     * Renova o token usando refresh token
     */
    async renewToken(): Promise<boolean> {
        console.log('🔄 Renovando token do Mercado Livre...')

        try {
            const response = await fetch('https://api.mercadolibre.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: this.refreshToken
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Erro ao renovar token:', error)
                return false
            }

            const data = await response.json()

            const tokenData: TokenData = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type,
                scope: data.scope,
                user_id: data.user_id,
                created_at: Date.now()
            }

            this.accessToken = data.access_token
            this.refreshToken = data.refresh_token
            this.tokenExpiresAt = Date.now() + (data.expires_in * 1000)

            this.saveTokenData(tokenData)

            console.log('✅ Token renovado com sucesso!')
            console.log(`⏰ Próxima renovação em: ${Math.floor(data.expires_in / 60)} minutos`)

            return true
        } catch (error) {
            console.error('Erro ao renovar token:', error)
            return false
        }
    }

    /**
     * Obtém código de autorização (primeira vez)
     */
    async getAuthorizationCode(code: string): Promise<boolean> {
        console.log('🔐 Obtendo token inicial...')

        try {
            const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI || 'http://localhost:3000/api/mercadolivre/callback'

            const response = await fetch('https://api.mercadolibre.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: code,
                    redirect_uri: redirectUri
                })
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Erro ao obter token:', error)
                return false
            }

            const data = await response.json()

            const tokenData: TokenData = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type,
                scope: data.scope,
                user_id: data.user_id,
                created_at: Date.now()
            }

            this.accessToken = data.access_token
            this.refreshToken = data.refresh_token
            this.tokenExpiresAt = Date.now() + (data.expires_in * 1000)

            this.saveTokenData(tokenData)

            console.log('✅ Token inicial obtido com sucesso!')
            return true
        } catch (error) {
            console.error('Erro ao obter token inicial:', error)
            return false
        }
    }

    /**
     * Inicia renovação automática em background
     */
    startAutoRenewal() {
        console.log('🤖 Iniciando renovação automática de token do ML...')

        // Verificar a cada 5 minutos
        this.renewalInterval = setInterval(async () => {
            if (this.isTokenExpiring()) {
                console.log('⚠️ Token expirando, renovando...')
                await this.renewToken()
            }
        }, 5 * 60 * 1000) // 5 minutos

        // Verificar imediatamente se precisa renovar
        if (this.isTokenExpiring()) {
            this.renewToken()
        }

        console.log('✅ Renovação automática ativada (verifica a cada 5 minutos)')
    }

    /**
     * Para a renovação automática
     */
    stopAutoRenewal() {
        if (this.renewalInterval) {
            clearInterval(this.renewalInterval)
            this.renewalInterval = null
            console.log('🛑 Renovação automática desativada')
        }
    }

    /**
     * Obtém o token atual (sempre válido)
     */
    async getValidToken(): Promise<string> {
        if (this.isTokenExpiring()) {
            await this.renewToken()
        }
        return this.accessToken || process.env.MERCADOLIVRE_ACCESS_TOKEN || ''
    }

    /**
     * Obtém status do token
     */
    getTokenStatus(): {
        hasToken: boolean
        expiresAt: Date | null
        expiresIn: string
        needsRenewal: boolean
    } {
        const now = Date.now()
        const expiresIn = this.tokenExpiresAt - now

        return {
            hasToken: !!this.accessToken,
            expiresAt: this.tokenExpiresAt > 0 ? new Date(this.tokenExpiresAt) : null,
            expiresIn: expiresIn > 0
                ? `${Math.floor(expiresIn / 1000 / 60)} minutos`
                : 'Expirado',
            needsRenewal: this.isTokenExpiring()
        }
    }

    /**
     * Gera URL de autorização (primeira vez)
     */
    getAuthorizationUrl(): string {
        const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI || 'http://localhost:3000/api/mercadolivre/callback'

        return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`
    }
}

// Exportar instância singleton
export const mlTokenManager = new MLTokenManager()

// Cleanup ao encerrar
if (typeof process !== 'undefined') {
    process.on('SIGINT', () => {
        mlTokenManager.stopAutoRenewal()
        process.exit(0)
    })

    process.on('SIGTERM', () => {
        mlTokenManager.stopAutoRenewal()
        process.exit(0)
    })
}
