/**
 * Sistema de Cache Avançado
 * Melhora performance com cache inteligente
 */

interface CacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
}

export class CacheManager {
    private cache: Map<string, CacheEntry<any>>
    private defaultTTL: number

    constructor(defaultTTL: number = 1000 * 60 * 30) { // 30 minutos
        this.cache = new Map()
        this.defaultTTL = defaultTTL
    }

    /**
     * Adicionar ao cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        const now = Date.now()
        const expiresAt = now + (ttl || this.defaultTTL)

        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt
        })
    }

    /**
     * Buscar do cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            return null
        }

        // Verificar expiração
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    /**
     * Buscar ou executar
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        // Tentar buscar do cache
        const cached = this.get<T>(key)
        if (cached !== null) {
            return cached
        }

        // Executar fetcher
        const data = await fetcher()

        // Salvar no cache
        this.set(key, data, ttl)

        return data
    }

    /**
     * Invalidar cache
     */
    invalidate(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Invalidar por padrão
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern)

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Limpar cache expirado
     */
    cleanup(): void {
        const now = Date.now()

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Limpar todo o cache
     */
    clear(): void {
        this.cache.clear()
    }

    /**
     * Estatísticas do cache
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        }
    }
}

// Singleton global
const globalCache = new CacheManager()

// Limpar cache expirado a cada 5 minutos
if (typeof window !== 'undefined') {
    setInterval(() => {
        globalCache.cleanup()
    }, 5 * 60 * 1000)
}

export default globalCache
