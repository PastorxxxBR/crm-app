import Redis from 'ioredis'

// Singleton Event Bus
class EventBus {
    private static instance: EventBus
    private publisher: Redis
    private subscriber: Redis
    private handlers: Map<string, Function[]>

    private constructor() {
        this.publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
        this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
        this.handlers = new Map()

        this.setupSubscriber()
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus()
        }
        return EventBus.instance
    }

    private setupSubscriber() {
        this.subscriber.on('message', (channel, message) => {
            const callbacks = this.handlers.get(channel) || []
            callbacks.forEach(callback => {
                try {
                    callback(JSON.parse(message))
                } catch (e) {
                    console.error(`Error processing message on channel ${channel}:`, e)
                }
            })
        })
    }

    public async publish(channel: string, payload: any) {
        // console.log(`[EventBus] Publishing to ${channel}:`, payload) // Debug
        await this.publisher.publish(channel, JSON.stringify(payload))
    }

    public subscribe(channel: string, callback: (payload: any) => void) {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, [])
            this.subscriber.subscribe(channel)
        }
        this.handlers.get(channel)?.push(callback)
    }
}

export const eventBus = EventBus.getInstance()
