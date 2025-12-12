import axios from 'axios'

const EVO_API_URL = process.env.EVOLUTION_API_URL
const EVO_API_KEY = process.env.EVOLUTION_API_KEY

const isConfigured = !!(EVO_API_URL && EVO_API_KEY)

if (!isConfigured) {
    console.warn('⚠️ Evolution API credentials not found in environment variables. WhatsApp features will be disabled.')
}

const api = isConfigured ? axios.create({
    baseURL: EVO_API_URL,
    headers: {
        'apikey': EVO_API_KEY,
        'Content-Type': 'application/json'
    }
}) : null

// Helper to check if Evolution API is configured
export const isEvolutionConfigured = () => isConfigured

export const evolution = {
    /**
     * Send a text message to a specific number
     * @param number Phone number with country code (e.g. 5511999999999)
     * @param text Message content
     */
    sendMessage: async (number: string, text: string, instanceName: string = 'default') => {
        if (!api) {
            throw new Error('Evolution API not configured. Please set EVOLUTION_API_URL and EVOLUTION_API_KEY.')
        }
        try {
            const response = await api.post(`/message/sendText/${instanceName}`, {
                number,
                options: {
                    delay: 1200,
                    presence: "composing",
                    linkPreview: false
                },
                textMessage: {
                    text
                }
            })
            return response.data
        } catch (error: any) {
            console.error('Error sending message:', error.response?.data || error.message)
            throw error
        }
    },

    /**
     * Send a media message (image, video, document)
     */
    sendMedia: async (number: string, mediaUrl: string, caption: string, mediaType: 'image' | 'video' | 'document', instanceName: string = 'default') => {
        if (!api) {
            throw new Error('Evolution API not configured. Please set EVOLUTION_API_URL and EVOLUTION_API_KEY.')
        }
        try {
            const response = await api.post(`/message/sendMedia/${instanceName}`, {
                number,
                options: {
                    delay: 1200,
                    presence: "composing"
                },
                mediaMessage: {
                    mediatype: mediaType,
                    caption: caption,
                    media: mediaUrl
                }
            })
            return response.data
        } catch (error: any) {
            console.error('Error sending media:', error.response?.data || error.message)
            throw error
        }
    },

    /**
     * Check connection status of an instance
     */
    checkConnection: async (instanceName: string = 'default') => {
        if (!api) {
            return { state: 'not_configured', error: 'Evolution API not configured' }
        }
        try {
            const response = await api.get(`/instance/connectionState/${instanceName}`)
            return response.data
        } catch (error) {
            return { state: 'disconnected', error }
        }
    }
}
