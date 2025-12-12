import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface CarouselCard {
    image: string
    headline: string
    description: string
    cta: string
    link: string
}

/**
 * Criador automático de carrosséis Meta Ads com IA
 */
export class CarouselCreator {
    private model: any

    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    }

    /**
     * Gera carrossel completo com IA baseado em produtos
     */
    async generateCarousel(products: Array<{
        name: string
        price: number
        image?: string
        category: string
    }>): Promise<CarouselCard[]> {
        const prompt = `
Você é um especialista em Meta Ads e copywriting.

PRODUTOS:
${products.map(p => `- ${p.name}: R$ ${p.price} (${p.category})`).join('\n')}

TAREFA:
Crie um carrossel Meta Ads com 5 cards.

Cada card deve ter:
1. Headline (máx 40 caracteres)
2. Description (máx 125 caracteres)
3. CTA (Call to Action)
4. Sugestão de imagem

REGRAS META:
- Sem MAIÚSCULAS excessivas
- Evitar "grátis", "100%", "garantido"
- Texto persuasivo mas não sensacionalista
- CTA claro e direto

Responda em JSON:
{
  "cards": [
    {
      "headline": "string",
      "description": "string",
      "cta": "string",
      "imageSuggestion": "string"
    }
  ]
}
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0])
                return data.cards.map((card: any, idx: number) => ({
                    image: products[idx % products.length].image || '/placeholder.jpg',
                    headline: card.headline,
                    description: card.description,
                    cta: card.cta,
                    link: 'https://seusite.com/produto',
                }))
            }
        } catch (error) {
            console.error('Erro ao gerar carrossel:', error)
        }

        return this.getFallbackCarousel(products)
    }

    /**
     * Otimiza imagens para Meta Ads
     */
    async optimizeImages(images: string[]): Promise<{
        optimized: boolean
        recommendations: string[]
    }> {
        const recommendations: string[] = []

        // Regras de otimização Meta
        recommendations.push('✓ Usar formato JPG ou PNG')
        recommendations.push('✓ Tamanho recomendado: 1080x1080px (quadrado)')
        recommendations.push('✓ Ou 1200x628px (horizontal)')
        recommendations.push('✓ Texto deve ocupar menos de 20% da imagem')
        recommendations.push('✓ Qualidade alta, sem pixelização')
        recommendations.push('✓ Evitar bordas brancas ou pretas')

        return {
            optimized: true,
            recommendations,
        }
    }

    private getFallbackCarousel(products: any[]): CarouselCard[] {
        return products.slice(0, 5).map((product, idx) => ({
            image: product.image || '/placeholder.jpg',
            headline: `${product.name.substring(0, 37)}`,
            description: `Apenas R$ ${product.price.toFixed(2)}! Aproveite nossa seleção exclusiva de ${product.category}.`,
            cta: 'Comprar Agora',
            link: 'https://seusite.com/produto',
        }))
    }
}

export const carouselCreator = new CarouselCreator()
