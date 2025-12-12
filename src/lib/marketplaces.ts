// Base de dados completa de marketplaces brasileiros

export interface MarketplaceFees {
    id: string
    name: string
    displayName: string
    url: string
    logo?: string
    fees: {
        commission: number // % de comissão sobre venda
        paymentFee: number // % taxa de pagamento
        shippingFee?: number // taxa de envio (se aplicável)
        fixedFee?: number // taxa fixa por venda
    }
    categories: {
        fashion: boolean
        electronics: boolean
        home: boolean
    }
    popularityRank: number // 1 = mais popular
    active: boolean
}

export const brazilianMarketplaces: MarketplaceFees[] = [
    {
        id: 'mercadolivre',
        name: 'mercadolivre',
        displayName: 'Mercado Livre',
        url: 'https://mercadolivre.com.br',
        fees: {
            commission: 16, // Moda: ~16%
            paymentFee: 4.49, // Mercado Pago
            fixedFee: 5.00,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 1,
        active: true,
    },
    {
        id: 'shopee',
        name: 'shopee',
        displayName: 'Shopee',
        url: 'https://shopee.com.br',
        fees: {
            commission: 15, // Moda: ~15%
            paymentFee: 3.99,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 2,
        active: true,
    },
    {
        id: 'amazon',
        name: 'amazon',
        displayName: 'Amazon',
        url: 'https://amazon.com.br',
        fees: {
            commission: 17, // Moda: ~17%
            paymentFee: 0, // Incluído na comissão
            fixedFee: 2.00,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 3,
        active: true,
    },
    {
        id: 'magalu',
        name: 'magalu',
        displayName: 'Magazine Luiza',
        url: 'https://magazineluiza.com.br',
        fees: {
            commission: 18, // Moda: ~18%
            paymentFee: 4.00,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 4,
        active: true,
    },
    {
        id: 'americanas',
        name: 'americanas',
        displayName: 'Americanas',
        url: 'https://americanas.com.br',
        fees: {
            commission: 17.5,
            paymentFee: 3.99,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 5,
        active: true,
    },
    {
        id: 'casasbahia',
        name: 'casasbahia',
        displayName: 'Casas Bahia',
        url: 'https://casasbahia.com.br',
        fees: {
            commission: 17,
            paymentFee: 4.00,
        },
        categories: { fashion: true, electronics: true, home: true },
        popularityRank: 6,
        active: true,
    },
    {
        id: 'carrefour',
        name: 'carrefour',
        displayName: 'Carrefour',
        url: 'https://carrefour.com.br',
        fees: {
            commission: 16.5,
            paymentFee: 3.5,
        },
        categories: { fashion: true, electronics: false, home: true },
        popularityRank: 7,
        active: true,
    },
    {
        id: 'kabum',
        name: 'kabum',
        displayName: 'KaBuM!',
        url: 'https://kabum.com.br',
        fees: {
            commission: 14,
            paymentFee: 3.0,
        },
        categories: { fashion: false, electronics: true, home: false },
        popularityRank: 8,
        active: false, // Não vende moda
    },
    {
        id: 'netshoes',
        name: 'netshoes',
        displayName: 'Netshoes',
        url: 'https://netshoes.com.br',
        fees: {
            commission: 20, // Especializado em esporte/moda
            paymentFee: 4.5,
        },
        categories: { fashion: true, electronics: false, home: false },
        popularityRank: 9,
        active: true,
    },
    {
        id: 'dafiti',
        name: 'dafiti',
        displayName: 'Dafiti',
        url: 'https://dafiti.com.br',
        fees: {
            commission: 25, // Especializado em moda
            paymentFee: 0, // Incluído
        },
        categories: { fashion: true, electronics: false, home: false },
        popularityRank: 10,
        active: true,
    },
    {
        id: 'centauro',
        name: 'centauro',
        displayName: 'Centauro',
        url: 'https://centauro.com.br',
        fees: {
            commission: 22,
            paymentFee: 4.0,
        },
        categories: { fashion: true, electronics: false, home: false },
        popularityRank: 11,
        active: true,
    },
    {
        id: 'zattini',
        name: 'zattini',
        displayName: 'Zattini',
        url: 'https://zattini.com.br',
        fees: {
            commission: 23,
            paymentFee: 0,
        },
        categories: { fashion: true, electronics: false, home: false },
        popularityRank: 12,
        active: true,
    },
    {
        id: 'shein',
        name: 'shein',
        displayName: 'Shein',
        url: 'https://br.shein.com',
        fees: {
            commission: 10, // Preços muito baixos, difícil competir
            paymentFee: 5.0,
        },
        categories: { fashion: true, electronics: false, home: false },
        popularityRank: 13,
        active: true,
    },
]

/**
 * Calcula preço final considerando taxas do marketplace
 */
export function calculateFinalPrice(
    basePrice: number,
    marketplaceId: string,
    includeShipping: boolean = false
): {
    basePrice: number
    commission: number
    paymentFee: number
    fixedFee: number
    totalFees: number
    netProfit: number
    profitMargin: number
} {
    const marketplace = brazilianMarketplaces.find(m => m.id === marketplaceId)

    if (!marketplace) {
        return {
            basePrice,
            commission: 0,
            paymentFee: 0,
            fixedFee: 0,
            totalFees: 0,
            netProfit: basePrice,
            profitMargin: 100,
        }
    }

    const commission = (basePrice * marketplace.fees.commission) / 100
    const paymentFee = (basePrice * marketplace.fees.paymentFee) / 100
    const fixedFee = marketplace.fees.fixedFee || 0

    const totalFees = commission + paymentFee + fixedFee
    const netProfit = basePrice - totalFees
    const profitMargin = (netProfit / basePrice) * 100

    return {
        basePrice,
        commission,
        paymentFee,
        fixedFee,
        totalFees,
        netProfit,
        profitMargin,
    }
}

/**
 * Retorna marketplaces ativos para moda
 */
export function getActiveFashionMarketplaces(): MarketplaceFees[] {
    return brazilianMarketplaces.filter(m => m.active && m.categories.fashion)
}

/**
 * Compara taxas entre marketplaces
 */
export function compareMarketplaceFees(basePrice: number) {
    return getActiveFashionMarketplaces().map(marketplace => ({
        marketplace: marketplace.displayName,
        id: marketplace.id,
        ...calculateFinalPrice(basePrice, marketplace.id),
    })).sort((a, b) => b.netProfit - a.netProfit)
}
