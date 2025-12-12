/**
 * Utility para Retry de Requisições
 * Implementa retry logic com exponential backoff
 */

interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
    shouldRetry?: (error: any) => boolean
}

const defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error: any) => {
        // Retry em erros de rede ou 5xx
        return !error.response || error.response.status >= 500
    }
}

/**
 * Executa função com retry automático
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...defaultOptions, ...options }
    let lastError: any
    let delay = opts.initialDelay

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error

            // Não fazer retry se não deve
            if (!opts.shouldRetry(error)) {
                throw error
            }

            // Última tentativa
            if (attempt === opts.maxRetries) {
                break
            }

            // Aguardar antes de tentar novamente
            console.log(`Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`)
            await sleep(delay)

            // Exponential backoff
            delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay)
        }
    }

    throw lastError
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Circuit Breaker Pattern
 */
export class CircuitBreaker {
    private failures = 0
    private lastFailureTime = 0
    private state: 'closed' | 'open' | 'half-open' = 'closed'

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000 // 1 minuto
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'half-open'
            } else {
                throw new Error('Circuit breaker is OPEN')
            }
        }

        try {
            const result = await fn()
            this.onSuccess()
            return result
        } catch (error) {
            this.onFailure()
            throw error
        }
    }

    private onSuccess() {
        this.failures = 0
        this.state = 'closed'
    }

    private onFailure() {
        this.failures++
        this.lastFailureTime = Date.now()

        if (this.failures >= this.threshold) {
            this.state = 'open'
            console.error(`Circuit breaker opened after ${this.failures} failures`)
        }
    }

    getState() {
        return this.state
    }
}
