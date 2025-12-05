import { eventBus } from './bus'

export abstract class BaseAgent {
    protected name: string

    constructor(name: string) {
        this.name = name
        this.initialize()
    }

    protected initialize() {
        console.log(`[Agent: ${this.name}] Initialized`)
    }

    /**
     * Publish an event to the bus
     */
    protected async publishEvent(event: string, payload: any) {
        const channel = `agent:${this.name}:${event}`
        await eventBus.publish(channel, payload)
    }

    /**
     * Subscribe to an event from another agent
     */
    protected subscribeTo(targetAgent: string, event: string, handler: (payload: any) => void) {
        const channel = `agent:${targetAgent}:${event}`
        eventBus.subscribe(channel, handler)
        console.log(`[Agent: ${this.name}] Subscribed to ${channel}`)
    }

    // Common utility methods can go here
    protected log(message: string) {
        console.log(`[Agent: ${this.name}] ${message}`)
    }
}
