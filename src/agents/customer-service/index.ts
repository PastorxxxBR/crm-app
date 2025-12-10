import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

interface IncomingMessage {
    from: string
    message: string
    timestamp?: Date
}

interface Ticket {
    id?: string
    customer_phone: string
    subject: string
    message: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    sentiment: 'positive' | 'neutral' | 'negative'
    ai_response?: string
    escalated: boolean
}

export class CustomerServiceAgent extends BaseAgent {
    constructor() {
        super('customer-service')
    }

    /**
     * Handle incoming customer message
     */
    public async handleIncomingMessage(msg: IncomingMessage): Promise<{ response: string, ticket?: Ticket }> {
        this.log(`Handling message from ${msg.from}`)

        try {
            // 1. Analyze message with AI
            const analysis = await this.analyzeMessage(msg.message)

            // 2. Check if it's a FAQ
            const faqResponse = await this.checkFAQ(msg.message)
            if (faqResponse) {
                this.log('FAQ match found, sending automatic response')
                await this.sendResponse(msg.from, faqResponse)
                return { response: faqResponse }
            }

            // 3. Generate AI response
            const aiResponse = await this.generateResponse(msg.message, analysis)

            // 4. Create ticket if needed
            let ticket: Ticket | undefined
            if (analysis.needs_human || analysis.priority === 'critical') {
                ticket = await this.createTicket({
                    customer_phone: msg.from,
                    subject: analysis.subject,
                    message: msg.message,
                    status: 'open',
                    priority: analysis.priority,
                    sentiment: analysis.sentiment,
                    ai_response: aiResponse,
                    escalated: analysis.needs_human
                })
                this.log(`Ticket created: ${ticket.id} (Priority: ${ticket.priority})`)

                if (analysis.needs_human) {
                    await this.publishEvent('ticket_escalated', ticket)
                }
            }

            // 5. Send response
            await this.sendResponse(msg.from, aiResponse)

            return { response: aiResponse, ticket }

        } catch (e: any) {
            this.log(`Error handling message: ${e.message}`)
            const fallbackResponse = 'Desculpe, estou com dificuldades técnicas. Um atendente entrará em contato em breve.'
            await this.sendResponse(msg.from, fallbackResponse)
            return { response: fallbackResponse }
        }
    }

    /**
     * Analyze message with Gemini AI
     */
    private async analyzeMessage(message: string): Promise<{
        subject: string
        priority: 'low' | 'medium' | 'high' | 'critical'
        sentiment: 'positive' | 'neutral' | 'negative'
        needs_human: boolean
        category: string
    }> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Analista de Atendimento ao Cliente para loja de roupas (varejo e atacado).
            Mensagem do cliente: "${message}"
            
            Tarefas:
            1. Identificar o assunto principal (max 50 chars)
            2. Classificar prioridade:
               - critical: reclamação grave, pedido perdido, problema de pagamento
               - high: dúvida sobre pedido em andamento, troca/devolução
               - medium: dúvida sobre produto, prazo de entrega
               - low: informação geral, elogio
            3. Analisar sentimento (positive, neutral, negative)
            4. Determinar se precisa atendimento humano (needs_human: true/false)
               - true se: reclamação, problema complexo, cliente irritado
               - false se: pergunta simples, rastreamento, informação
            5. Categorizar: pedido, produto, pagamento, entrega, troca, geral
            
            Retorna JSON: { "subject": string, "priority": string, "sentiment": string, "needs_human": boolean, "category": string }
            Sem markdown.
            `

            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const analysis = JSON.parse(text)

            this.log(`Analysis: ${analysis.subject} | Priority: ${analysis.priority} | Sentiment: ${analysis.sentiment}`)
            return analysis

        } catch (e: any) {
            this.log(`Error analyzing message: ${e.message}`)
            // Fallback: simple keyword analysis
            const lowerMsg = message.toLowerCase()
            const isUrgent = lowerMsg.includes('urgente') || lowerMsg.includes('problema') || lowerMsg.includes('reclamação')
            const isNegative = lowerMsg.includes('não') || lowerMsg.includes('ruim') || lowerMsg.includes('péssimo')

            return {
                subject: message.substring(0, 50),
                priority: isUrgent ? 'high' : 'medium',
                sentiment: isNegative ? 'negative' : 'neutral',
                needs_human: isUrgent,
                category: 'geral'
            }
        }
    }

    /**
     * Check if message matches FAQ
     */
    private async checkFAQ(message: string): Promise<string | null> {
        const lowerMsg = message.toLowerCase()

        // FAQ Database (can be moved to Supabase later)
        const faqs = [
            {
                keywords: ['horário', 'horario', 'funciona', 'aberto'],
                response: '🕐 Nosso horário de atendimento é de Segunda a Sexta, das 9h às 18h. Sábados das 9h às 13h.'
            },
            {
                keywords: ['prazo', 'entrega', 'demora', 'quanto tempo'],
                response: '📦 O prazo de entrega é de 3 a 7 dias úteis para todo o Brasil. Você receberá o código de rastreamento por email.'
            },
            {
                keywords: ['troca', 'devolução', 'devolver'],
                response: '🔄 Aceitamos trocas em até 7 dias após o recebimento. O produto deve estar sem uso, com etiqueta. Entre em contato para solicitar.'
            },
            {
                keywords: ['pagamento', 'pagar', 'formas de pagamento'],
                response: '💳 Aceitamos: Cartão de crédito, PIX, Boleto e Mercado Pago. Parcelamos em até 3x sem juros.'
            },
            {
                keywords: ['atacado', 'wholesale', 'grade fechada', 'quantidade'],
                response: '📊 ATACADO: Compras acima de 12 peças têm 25% de desconto! De 6 a 11 peças: 15% off. Consulte nosso catálogo atacado.'
            },
            {
                keywords: ['rastreamento', 'rastrear', 'código', 'onde está'],
                response: '🔍 Para rastrear seu pedido, acesse: https://rastreamento.correios.com.br e insira o código que enviamos por email.'
            }
        ]

        for (const faq of faqs) {
            if (faq.keywords.some(keyword => lowerMsg.includes(keyword))) {
                return faq.response
            }
        }

        return null
    }

    /**
     * Generate AI response
     */
    private async generateResponse(message: string, analysis: any): Promise<string> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Atendente Virtual de loja de roupas (varejo e atacado).
            Mensagem do cliente: "${message}"
            Categoria: ${analysis.category}
            Sentimento: ${analysis.sentiment}
            
            Gera uma resposta:
            - Empática e profissional
            - Máximo 200 caracteres (para WhatsApp)
            - Use emojis apropriados
            - Se for negativo, peça desculpas e ofereça solução
            - Se for sobre pedido, peça o número do pedido
            - Se for atacado, mencione descontos por volume
            
            Retorna apenas o texto da resposta, sem JSON ou markdown.
            `

            const result = await model.generateContent(prompt)
            const response = result.response.text().trim()

            return response

        } catch (e: any) {
            this.log(`Error generating response: ${e.message}`)
            return 'Obrigado pela mensagem! Um atendente responderá em breve. 😊'
        }
    }

    /**
     * Create support ticket
     */
    private async createTicket(ticket: Ticket): Promise<Ticket> {
        try {
            const { data, error } = await supabase
                .from('customer_tickets')
                .insert({
                    customer_phone: ticket.customer_phone,
                    subject: ticket.subject,
                    message: ticket.message,
                    status: ticket.status,
                    priority: ticket.priority,
                    sentiment: ticket.sentiment,
                    ai_response: ticket.ai_response,
                    escalated: ticket.escalated
                })
                .select()
                .single()

            if (error) throw error

            return { ...ticket, id: data.id }

        } catch (e: any) {
            this.log(`Error creating ticket: ${e.message}`)
            return ticket
        }
    }

    /**
     * Send response via WhatsApp (Integration Agent)
     */
    private async sendResponse(to: string, message: string): Promise<void> {
        try {
            const { agentService } = await import('../../services/agents')
            await agentService.integrations.sendMessage(to, message)
        } catch (e: any) {
            this.log(`Error sending response: ${e.message}`)
        }
    }

    /**
     * Get ticket by ID
     */
    public async getTicket(ticketId: string): Promise<Ticket | null> {
        try {
            const { data, error } = await supabase
                .from('customer_tickets')
                .select('*')
                .eq('id', ticketId)
                .single()

            if (error) throw error
            return data as Ticket

        } catch (e: any) {
            this.log(`Error fetching ticket: ${e.message}`)
            return null
        }
    }

    /**
     * Update ticket status
     */
    public async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<void> {
        try {
            const { error } = await supabase
                .from('customer_tickets')
                .update({ status, updated_at: new Date() })
                .eq('id', ticketId)

            if (error) throw error

            this.log(`Ticket ${ticketId} updated to ${status}`)
            await this.publishEvent('ticket_updated', { ticketId, status })

        } catch (e: any) {
            this.log(`Error updating ticket: ${e.message}`)
        }
    }

    /**
     * Get open tickets by priority
     */
    public async getOpenTickets(priority?: Ticket['priority']): Promise<Ticket[]> {
        try {
            let query = supabase
                .from('customer_tickets')
                .select('*')
                .in('status', ['open', 'in_progress'])
                .order('created_at', { ascending: false })

            if (priority) {
                query = query.eq('priority', priority)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Ticket[]

        } catch (e: any) {
            this.log(`Error fetching tickets: ${e.message}`)
            return []
        }
    }
}
