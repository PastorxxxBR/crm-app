/**
 * Schemas de Validação com Zod
 * Validação de dados para todas as APIs
 */

import { z } from 'zod'

// TikTok Schemas
export const TikTokProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1).max(200),
    description: z.string().min(10).max(5000),
    price: z.number().positive(),
    images: z.array(z.string().url()).min(1).max(9),
    category: z.string(),
    stock: z.number().int().nonnegative(),
    sku: z.string().optional()
})

export const TikTokOrderSchema = z.object({
    orderId: z.string(),
    products: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive()
    })),
    customer: z.object({
        name: z.string(),
        phone: z.string(),
        address: z.string()
    }),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    totalAmount: z.number().positive(),
    createdAt: z.string().datetime()
})

// Mercado Livre Schemas
export const MLProductSchema = z.object({
    id: z.string(),
    title: z.string(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    discount: z.number().min(0).max(100).optional(),
    seller: z.object({
        id: z.number(),
        name: z.string(),
        link: z.string().url(),
        reputation: z.any().optional()
    }),
    link: z.string().url(),
    image: z.string().url(),
    soldQuantity: z.number().int().nonnegative(),
    freeShipping: z.boolean(),
    condition: z.enum(['new', 'used']),
    availableQuantity: z.number().int().nonnegative()
})

export const CategoryAnalysisSchema = z.object({
    category: z.string(),
    searchTerm: z.string(),
    totalProducts: z.number().int().nonnegative(),
    cheapest10: z.array(MLProductSchema),
    expensive10: z.array(MLProductSchema),
    average10: z.array(MLProductSchema),
    priceRange: z.object({
        min: z.number().nonnegative(),
        max: z.number().positive(),
        avg: z.number().positive(),
        median: z.number().positive()
    }),
    topSellers: z.array(z.object({
        name: z.string(),
        id: z.number(),
        totalProducts: z.number().int().positive(),
        avgPrice: z.number().positive(),
        totalSales: z.number().int().nonnegative()
    }))
})

// API Request Schemas
export const CompetitiveAnalysisRequestSchema = z.object({
    category: z.string().min(1),
    limit: z.number().int().positive().max(100).optional()
})

export const TikTokSyncRequestSchema = z.object({
    products: z.array(TikTokProductSchema).min(1).max(100)
})

// Types exportados
export type TikTokProduct = z.infer<typeof TikTokProductSchema>
export type TikTokOrder = z.infer<typeof TikTokOrderSchema>
export type MLProduct = z.infer<typeof MLProductSchema>
export type CategoryAnalysis = z.infer<typeof CategoryAnalysisSchema>
export type CompetitiveAnalysisRequest = z.infer<typeof CompetitiveAnalysisRequestSchema>
export type TikTokSyncRequest = z.infer<typeof TikTokSyncRequestSchema>
