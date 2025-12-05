import axios from 'axios'

const EVO_API_URL = process.env.EVOLUTION_API_URL
const EVO_API_KEY = process.env.EVOLUTION_API_KEY

if (!EVO_API_URL || !EVO_API_KEY) {
    console.warn('Evolution API credentials not found in environment variables.')
}

const api = axios.create({
    baseURL: EVO_API_URL,
    headers: {
        'apikey': EVO_API_KEY,
        'Content-Type': 'application/json'
    }
})

export const evolution = {
    /**
     * Send a text message to a specific number
     * @param number Phone number with country code (e.g. 5511999999999)
     * @param text Message content
     */
    sendMessage: async (number: string, text: string, instanceName: string = 'default') => {
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
        try {
            const response = await api.get(`/instance/connectionState/${instanceName}`)
            return response.data
        } catch (error) {
            return { state: 'disconnected', error }
        }
    }
}
