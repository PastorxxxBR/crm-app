import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

interface EmailCampaign {
    id?: string
    name: string
    subject: string
    body: string
    segment: 'all' | 'new_customers' | 'vip' | 'inactive' | 'abandoned_cart'
    status: 'draft' | 'scheduled' | 'sending' | 'sent'
    sent_count?: number
    open_rate?: number
    click_rate?: number
    scheduled_at?: Date
    sent_at?: Date
}

interface EmailTemplate {
    type: 'welcome' | 'abandoned_cart' | 'reactivation' | 'promotion' | 'newsletter'
    subject: string
    body: string
}

export class EmailMarketingAgent extends BaseAgent {
    constructor() {
        super('email-marketing')
    }

    /**
     * Create email campaign
     */
    public async createCampaign(campaign: EmailCampaign): Promise<EmailCampaign> {
        try {
            const { data, error } = await supabase
                .from('email_campaigns')
                .insert({
                    name: campaign.name,
                    subject: campaign.subject,
                    body: campaign.body,
                    segment: campaign.segment,
                    status: campaign.status,
                    scheduled_at: campaign.scheduled_at
                })
                .select()
                .single()

            if (error) throw error

            this.log(`Campaign created: ${campaign.name}`)
            await this.publishEvent('campaign_created', { id: data.id, name: campaign.name })

            return data as EmailCampaign

        } catch (e: any) {
            this.log(`Error creating campaign: ${e.message}`)
            throw e
        }
    }

    /**
     * Generate email content with AI
     */
    public async generateEmailContent(params: {
        type: EmailTemplate['type']
        customerName?: string
        productName?: string
        discountPercent?: number
        customContext?: string
    }): Promise<{ subject: string; body: string }> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Copywriter especializado em Email Marketing para loja de roupas (varejo e atacado).
            
            Tipo de Email: ${params.type}
            Nome do Cliente: ${params.customerName || '[Nome]'}
            ${params.productName ? `Produto: ${params.productName}` : ''}
            ${params.discountPercent ? `Desconto: ${params.discountPercent}%` : ''}
            ${params.customContext ? `Contexto: ${params.customContext}` : ''}
            
            Cria um email profissional e persuasivo:
            
            Regras:
            - Subject line: máximo 50 caracteres, impactante, sem spam words
            - Body: HTML simples, máximo 300 palavras
            - Tom: amigável mas profissional
            - CTA claro (Call to Action)
            - Personalizado com nome do cliente
            - Se for atacado (B2B): focar em margem e volume
            - Se for varejo (B2C): focar em estilo e tendências
            
            Tipos de email:
            - welcome: Boas-vindas calorosas, apresentar marca, cupom de 10%
            - abandoned_cart: Lembrar produtos, senso de urgência, desconto 5%
            - reactivation: Cliente inativo há 60 dias, novidades, oferta especial
            - promotion: Promoção sazonal, produtos em destaque
            - newsletter: Tendências de moda, dicas de estilo, novos produtos
            
            Retorna JSON: { "subject": "string", "body": "string (HTML)" }
            Sem markdown.
            `

            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const content = JSON.parse(text)

            this.log(`Email content generated for ${params.type}`)
            return content

        } catch (e: any) {
            this.log(`Error generating email content: ${e.message}`)
            // Fallback templates
            return this.getFallbackTemplate(params.type)
        }
    }

    /**
     * Fallback email templates
     */
    private getFallbackTemplate(type: EmailTemplate['type']): { subject: string; body: string } {
        const templates = {
            welcome: {
                subject: '🎉 Bem-vindo(a)! Ganhe 10% OFF na primeira compra',
                body: `
                    <h2>Olá, [Nome]!</h2>
                    <p>Seja muito bem-vindo(a) à nossa loja! 🎊</p>
                    <p>Para começar com o pé direito, preparamos um presente especial:</p>
                    <h3>10% OFF na sua primeira compra!</h3>
                    <p>Use o cupom: <strong>BEMVINDO10</strong></p>
                    <a href="#" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver Produtos</a>
                    <p>Até breve! ❤️</p>
                `
            },
            abandoned_cart: {
                subject: '🛒 Você esqueceu algo no carrinho!',
                body: `
                    <h2>Oi, [Nome]!</h2>
                    <p>Notamos que você deixou alguns produtos incríveis no carrinho.</p>
                    <p>Não perca essa oportunidade! Finalize sua compra agora e ganhe <strong>5% OFF</strong>.</p>
                    <p>Use o cupom: <strong>CARRINHO5</strong></p>
                    <a href="#" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Finalizar Compra</a>
                    <p>Oferta válida por 24 horas! ⏰</p>
                `
            },
            reactivation: {
                subject: '💔 Sentimos sua falta! Volta pra gente?',
                body: `
                    <h2>Olá, [Nome]!</h2>
                    <p>Faz tempo que você não aparece por aqui... Sentimos sua falta! 😢</p>
                    <p>Temos muitas novidades esperando por você:</p>
                    <ul>
                        <li>✨ Nova coleção de verão</li>
                        <li>🔥 Promoções exclusivas</li>
                        <li>📦 Frete grátis acima de R$ 150</li>
                    </ul>
                    <p>E mais: <strong>15% OFF</strong> especial para você voltar!</p>
                    <p>Cupom: <strong>VOLTEI15</strong></p>
                    <a href="#" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver Novidades</a>
                `
            },
            promotion: {
                subject: '🔥 PROMOÇÃO IMPERDÍVEL - Até 50% OFF!',
                body: `
                    <h2>MEGA PROMOÇÃO!</h2>
                    <p>Descontos de até <strong>50% OFF</strong> em peças selecionadas!</p>
                    <p>🎯 Aproveite enquanto durarem os estoques</p>
                    <p>📦 Frete GRÁTIS acima de R$ 150</p>
                    <p>💳 Parcele em até 3x sem juros</p>
                    <a href="#" style="background:#ff0000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">APROVEITAR AGORA</a>
                    <p><small>Promoção válida até [data]</small></p>
                `
            },
            newsletter: {
                subject: '👗 Tendências de Moda + Novidades da Semana',
                body: `
                    <h2>Newsletter Semanal</h2>
                    <h3>🌟 Tendências da Semana</h3>
                    <p>Descubra os looks que estão bombando nas redes sociais!</p>
                    <h3>🆕 Novos Produtos</h3>
                    <p>Confira os lançamentos que acabaram de chegar.</p>
                    <h3>💡 Dica de Estilo</h3>
                    <p>Como combinar peças básicas para criar looks incríveis.</p>
                    <a href="#" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver Mais</a>
                `
            }
        }

        return templates[type]
    }

    /**
     * Send campaign to segment
     */
    public async sendCampaign(campaignId: string): Promise<{ sent: number; failed: number }> {
        try {
            // Get campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('email_campaigns')
                .select('*')
                .eq('id', campaignId)
                .single()

            if (campaignError || !campaign) throw new Error('Campaign not found')

            // Get recipients based on segment
            const recipients = await this.getRecipientsBySegment(campaign.segment)

            this.log(`Sending campaign "${campaign.name}" to ${recipients.length} recipients`)

            let sent = 0
            let failed = 0

            // Send emails (using Resend - free tier: 100 emails/day)
            for (const recipient of recipients) {
                try {
                    await this.sendEmail({
                        to: recipient.email,
                        subject: campaign.subject,
                        body: campaign.body.replace('[Nome]', recipient.name || 'Cliente')
                    })
                    sent++
                } catch (e) {
                    failed++
                    this.log(`Failed to send to ${recipient.email}`)
                }
            }

            // Update campaign status
            await supabase
                .from('email_campaigns')
                .update({
                    status: 'sent',
                    sent_count: sent,
                    sent_at: new Date()
                })
                .eq('id', campaignId)

            this.log(`Campaign sent: ${sent} success, ${failed} failed`)
            await this.publishEvent('campaign_sent', { campaignId, sent, failed })

            return { sent, failed }

        } catch (e: any) {
            this.log(`Error sending campaign: ${e.message}`)
            throw e
        }
    }

    /**
     * Get recipients by segment
     */
    private async getRecipientsBySegment(segment: EmailCampaign['segment']): Promise<Array<{ email: string; name?: string }>> {
        try {
            let query = supabase.from('profiles').select('email, name')

            switch (segment) {
                case 'new_customers':
                    // Customers created in last 7 days
                    const sevenDaysAgo = new Date()
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                    query = query.gte('created_at', sevenDaysAgo.toISOString())
                    break

                case 'vip':
                    // Customers with total_spent > 1000
                    query = query.gte('total_spent', 1000)
                    break

                case 'inactive':
                    // Customers with last_purchase_date > 60 days ago
                    const sixtyDaysAgo = new Date()
                    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
                    query = query.lt('last_purchase_date', sixtyDaysAgo.toISOString())
                    break

                case 'abandoned_cart':
                    // TODO: Implement when cart table is ready
                    return []

                case 'all':
                default:
                    // All customers
                    break
            }

            const { data, error } = await query

            if (error) throw error
            return data || []

        } catch (e: any) {
            this.log(`Error getting recipients: ${e.message}`)
            return []
        }
    }

    /**
     * Send email using Resend (free alternative to SendGrid)
     */
    private async sendEmail(params: { to: string; subject: string; body: string }): Promise<void> {
        try {
            // Using Resend API (free tier: 100 emails/day, 3000/month)
            // Alternative: Nodemailer with Gmail SMTP (free, unlimited)

            // For now, just log (implement Resend integration later)
            this.log(`[EMAIL] To: ${params.to} | Subject: ${params.subject}`)

            // TODO: Uncomment when Resend is configured
            /*
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'noreply@suaoja.com',
                    to: params.to,
                    subject: params.subject,
                    html: params.body
                })
            })

            if (!response.ok) throw new Error('Failed to send email')
            */

        } catch (e: any) {
            this.log(`Error sending email: ${e.message}`)
            throw e
        }
    }

    /**
     * Send abandoned cart recovery email
     */
    public async sendAbandonedCartEmail(customerEmail: string, cartItems: any[]): Promise<void> {
        try {
            const content = await this.generateEmailContent({
                type: 'abandoned_cart',
                customContext: `Produtos no carrinho: ${cartItems.map(i => i.name).join(', ')}`
            })

            await this.sendEmail({
                to: customerEmail,
                subject: content.subject,
                body: content.body
            })

            this.log(`Abandoned cart email sent to ${customerEmail}`)

        } catch (e: any) {
            this.log(`Error sending abandoned cart email: ${e.message}`)
        }
    }

    /**
     * A/B test subject lines
     */
    public async abTestSubjects(subjects: string[]): Promise<{ winner: string; openRate: number }> {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai")
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

            const prompt = `
            Atua como Especialista em Email Marketing.
            
            Analisa estes subject lines e prevê qual terá maior taxa de abertura:
            ${subjects.map((s, i) => `${i + 1}. "${s}"`).join('\n')}
            
            Considera:
            - Comprimento ideal (30-50 chars)
            - Uso de emojis
            - Senso de urgência
            - Personalização
            - Evitar spam words
            
            Retorna JSON: { "winner_index": number, "predicted_open_rate": number (0-1), "reasoning": "string" }
            Sem markdown.
            `

            const result = await model.generateContent(prompt)
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
            const analysis = JSON.parse(text)

            return {
                winner: subjects[analysis.winner_index],
                openRate: analysis.predicted_open_rate
            }

        } catch (e: any) {
            this.log(`Error in A/B test: ${e.message}`)
            return { winner: subjects[0], openRate: 0.25 }
        }
    }
}
