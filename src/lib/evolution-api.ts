// Evolution API - WhatsApp Integration
// Biblioteca para enviar mensagens automáticas via Evolution API

interface EvolutionConfig {
    apiUrl: string;
    apiKey: string;
    instance: string;
}

interface SendMessageParams {
    number: string;
    message: string;
    mediaUrl?: string;
}

interface SendMessageResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export class EvolutionAPI {
    private config: EvolutionConfig;

    constructor(config: EvolutionConfig) {
        this.config = config;
    }

    /**
     * Envia mensagem de texto
     */
    async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
        try {
            const url = `${this.config.apiUrl}/message/sendText/${this.config.instance}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey,
                },
                body: JSON.stringify({
                    number: params.number,
                    text: params.message,
                }),
            });

            if (!response.ok) {
                throw new Error(`Evolution API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                messageId: data.key?.id,
            };
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Envia mensagem com mídia (imagem, vídeo, documento)
     */
    async sendMediaMessage(params: SendMessageParams): Promise<SendMessageResponse> {
        try {
            const url = `${this.config.apiUrl}/message/sendMedia/${this.config.instance}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey,
                },
                body: JSON.stringify({
                    number: params.number,
                    mediaUrl: params.mediaUrl,
                    caption: params.message,
                }),
            });

            if (!response.ok) {
                throw new Error(`Evolution API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                messageId: data.key?.id,
            };
        } catch (error: any) {
            console.error('Error sending WhatsApp media:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Verifica se número está no WhatsApp
     */
    async checkNumber(number: string): Promise<boolean> {
        try {
            const url = `${this.config.apiUrl}/chat/checkNumber/${this.config.instance}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey,
                },
                body: JSON.stringify({ number }),
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.exists === true;
        } catch (error) {
            console.error('Error checking WhatsApp number:', error);
            return false;
        }
    }

    /**
     * Envia mensagem de boas-vindas para novo lead
     */
    async sendWelcomeMessage(number: string, name: string, source: string): Promise<SendMessageResponse> {
        const messages = {
            facebook: `Olá ${name}! 👋\n\nVi que você interagiu com a gente no Facebook! Como posso ajudar?`,
            instagram: `Oi ${name}! 😊\n\nAdorei seu interesse no Instagram! Quer saber mais sobre nossos produtos?`,
            youtube: `Olá ${name}! 🎥\n\nObrigado por assistir nosso vídeo! Tem alguma dúvida sobre os produtos?`,
            default: `Olá ${name}! 👋\n\nSeja bem-vindo(a)! Como posso ajudar você hoje?`,
        };

        const message = messages[source as keyof typeof messages] || messages.default;

        return this.sendMessage({ number, message });
    }

    /**
     * Envia catálogo de produtos
     */
    async sendCatalog(number: string, catalogUrl?: string): Promise<SendMessageResponse> {
        const message = catalogUrl
            ? `Aqui está nosso catálogo completo! 📱\n\n${catalogUrl}\n\nQual produto te interessou?`
            : `Temos diversos produtos incríveis! 🛍️\n\nQuer que eu te mostre alguns?`;

        return this.sendMessage({ number, message });
    }

    /**
     * Envia follow-up automático
     */
    async sendFollowUp(number: string, name: string, daysSinceContact: number): Promise<SendMessageResponse> {
        const messages = {
            1: `Oi ${name}! 😊\n\nSó passando para saber se ficou com alguma dúvida sobre nossos produtos?`,
            3: `Olá ${name}! 👋\n\nVi que você demonstrou interesse. Posso te ajudar com algo?`,
            7: `${name}, tudo bem? 🌟\n\nTenho uma oferta especial que pode te interessar!`,
        };

        const message = messages[daysSinceContact as keyof typeof messages] || messages[7];

        return this.sendMessage({ number, message });
    }
}

// Instância global da Evolution API
let evolutionAPI: EvolutionAPI | null = null;

export function getEvolutionAPI(): EvolutionAPI {
    if (!evolutionAPI) {
        evolutionAPI = new EvolutionAPI({
            apiUrl: process.env.EVOLUTION_API_URL || '',
            apiKey: process.env.EVOLUTION_API_KEY || '',
            instance: process.env.EVOLUTION_INSTANCE || '',
        });
    }
    return evolutionAPI;
}

// Helper para formatar número de telefone
export function formatPhoneNumber(phone: string): string {
    // Remove tudo que não é número
    let cleaned = phone.replace(/\D/g, '');

    // Se não tem código do país, adiciona 55 (Brasil)
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }

    // Adiciona @s.whatsapp.net
    return cleaned + '@s.whatsapp.net';
}
