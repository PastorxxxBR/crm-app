import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

export class TrendingAgent extends BaseAgent {
    constructor() {
        super('trending')
    }

    public async analyzeSalesPatterns(products: any[]) {
        this.log(`Analyzing Sales Trends for ${products.length} products...`)
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Senior Fashion Trend Forecaster specializing in Retail & Wholesale Clothing.
            Inventory Data: ${JSON.stringify(products)}
            
            Tasks:
            1. Analyze Sales velocity to identify High-Demand Attributes (e.g., "Linen Fabric", "Crop Cut", "Pastel Colors").
            2. Map current sales to global macro-trends (e.g., "Old Money", "Y2K", "Brazilcore", "Office Siren").
            3. Predic next month's "It Product" based on seasonality.

            Return JSON: { 
                "top_product": string, 
                "trend_score": number (0-100), 
                "pattern": "string (e.g. 'High demand for Linen Sets due to heatwave')", 
                "prediction": number,
                "fashion_insight": "string (Specific advice on fabric/style to restock)"
            }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            await this.persistResult("batch_analysis", analysis);
            return analysis

        } catch (e: any) {
            this.log(`Error analyzing Trends: ${e.message}`)
            const fallback = {
                top_product: products[0]?.name || "Unknown",
                trend_score: 85,
                pattern: "[FALLBACK] Seasonal peak detected (AI Unavailable)",
                prediction: 1200
            }
            await this.persistResult("batch_analysis", fallback);
            return fallback
        }
    }

    private async persistResult(name: string, data: any) {
        try {
            await supabase.from('trending_products').insert({
                product_name: data.top_product,
                ranking: 1,
                trend_score: data.trend_score,
                prediction: { next_month: data.prediction }
            })
        } catch (e) { this.log('DB Error') }
    }
}
