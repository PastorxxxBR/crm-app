import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis client with error handling
export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 3) {
            console.warn('⚠️ Redis connection failed after 3 retries. Running without cache.')
            return null // Stop retrying
        }
        return Math.min(times * 100, 2000)
    },
    lazyConnect: true, // Don't connect immediately
})

// Handle Redis errors gracefully
redis.on('error', (err: Error & { code?: string }) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️ Redis server not available. Running without cache.')
    } else {
        console.error('Redis error:', err)
    }
})

redis.on('connect', () => {
    console.log('✅ Redis connected successfully')
})

// Helper to check if Redis is available
export const isRedisAvailable = async (): Promise<boolean> => {
    try {
        await redis.ping()
        return true
    } catch {
        return false
    }
}
