/**
 * Gerador de SEO - Meta Tags e Schema.org
 * Otimiza produtos para Google
 */

import { z } from 'zod'

export const SEODataSchema = z.object({
    title: z.string().min(10).max(60),
    description: z.string().min(50).max(160),
    keywords: z.array(z.string()).min(3).max(10),
    image: z.string().url(),
    price: z.number().positive(),
    brand: z.string().default('Toca da Onça'),
    availability: z.enum(['InStock', 'OutOfStock', 'PreOrder']).default('InStock'),
    condition: z.enum(['NewCondition', 'UsedCondition']).default('NewCondition'),
})

export type SEOData = z.infer<typeof SEODataSchema>

/**
 * Gerar meta tags HTML
 */
export function generateMetaTags(data: SEOData): string {
    return `
<!-- Meta Tags Básicas -->
<title>${data.title} | Toca da Onça Modas</title>
<meta name="description" content="${data.description}">
<meta name="keywords" content="${data.keywords.join(', ')}">

<!-- Open Graph (Facebook) -->
<meta property="og:title" content="${data.title}">
<meta property="og:description" content="${data.description}">
<meta property="og:image" content="${data.image}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Toca da Onça Modas">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${data.title}">
<meta name="twitter:description" content="${data.description}">
<meta name="twitter:image" content="${data.image}">

<!-- WhatsApp -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
`.trim()
}

/**
 * Gerar Schema.org JSON-LD
 */
export function generateSchemaOrg(data: SEOData): string {
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.title,
        "image": data.image,
        "description": data.description,
        "brand": {
            "@type": "Brand",
            "name": data.brand
        },
        "offers": {
            "@type": "Offer",
            "url": typeof window !== 'undefined' ? window.location.href : '',
            "priceCurrency": "BRL",
            "price": data.price.toFixed(2),
            "availability": `https://schema.org/${data.availability}`,
            "itemCondition": `https://schema.org/${data.condition}`
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "234"
        }
    }

    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
}

/**
 * Gerar título otimizado para SEO
 */
export function generateSEOTitle(productName: string, price: number, category?: string): string {
    const priceStr = `R$ ${price.toFixed(2)}`

    if (category) {
        return `${productName} ${category} - ${priceStr} | Frete Grátis`
    }

    return `${productName} - ${priceStr} | Toca da Onça Modas`
}

/**
 * Gerar descrição otimizada para SEO
 */
export function generateSEODescription(
    productName: string,
    features: string[],
    discount?: number
): string {
    let description = `${productName} com qualidade garantida. `

    if (features.length > 0) {
        description += features.slice(0, 3).join(', ') + '. '
    }

    if (discount && discount > 0) {
        description += `${discount}% OFF por tempo limitado! `
    }

    description += 'Frete GRÁTIS para todo Brasil. Atacado e varejo. Compre agora!'

    // Limitar a 160 caracteres
    if (description.length > 160) {
        description = description.substring(0, 157) + '...'
    }

    return description
}

/**
 * Gerar keywords otimizadas
 */
export function generateSEOKeywords(
    productName: string,
    category: string,
    tags: string[] = []
): string[] {
    const keywords = [
        productName.toLowerCase(),
        category.toLowerCase(),
        'moda',
        'roupas',
        'são sebastião',
        'atacado',
        'varejo',
        ...tags.map(t => t.toLowerCase())
    ]

    // Remover duplicatas e limitar a 10
    return [...new Set(keywords)].slice(0, 10)
}

/**
 * Otimizar URL (slug)
 */
export function generateSEOSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por -
        .replace(/^-+|-+$/g, '') // Remove - do início e fim
}

/**
 * Gerar sitemap entry
 */
export function generateSitemapEntry(
    url: string,
    lastmod: Date,
    priority: number = 0.8
): string {
    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`.trim()
}

/**
 * Analisar SEO de um texto
 */
export function analyzeSEO(title: string, description: string): {
    score: number
    issues: string[]
    suggestions: string[]
} {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Título
    if (title.length < 30) {
        issues.push('Título muito curto')
        suggestions.push('Adicione mais detalhes ao título (mín. 30 caracteres)')
        score -= 20
    }
    if (title.length > 60) {
        issues.push('Título muito longo')
        suggestions.push('Reduza o título para até 60 caracteres')
        score -= 10
    }
    if (!title.includes('R$')) {
        suggestions.push('Adicione o preço no título')
        score -= 5
    }

    // Descrição
    if (description.length < 120) {
        issues.push('Descrição muito curta')
        suggestions.push('Adicione mais detalhes (mín. 120 caracteres)')
        score -= 20
    }
    if (description.length > 160) {
        issues.push('Descrição muito longa')
        suggestions.push('Reduza para até 160 caracteres')
        score -= 10
    }
    if (!description.toLowerCase().includes('frete')) {
        suggestions.push('Mencione "frete grátis" na descrição')
        score -= 5
    }

    return { score: Math.max(0, score), issues, suggestions }
}

/**
 * Exemplo de uso completo
 */
export function generateCompleteSEO(product: {
    name: string
    price: number
    category: string
    features: string[]
    image: string
    discount?: number
}): {
    metaTags: string
    schemaOrg: string
    slug: string
    analysis: ReturnType<typeof analyzeSEO>
} {
    const title = generateSEOTitle(product.name, product.price, product.category)
    const description = generateSEODescription(product.name, product.features, product.discount)
    const keywords = generateSEOKeywords(product.name, product.category)
    const slug = generateSEOSlug(product.name)

    const seoData: SEOData = {
        title,
        description,
        keywords,
        image: product.image,
        price: product.price,
        brand: 'Toca da Onça',
        availability: 'InStock',
        condition: 'NewCondition'
    }

    return {
        metaTags: generateMetaTags(seoData),
        schemaOrg: generateSchemaOrg(seoData),
        slug,
        analysis: analyzeSEO(title, description)
    }
}
