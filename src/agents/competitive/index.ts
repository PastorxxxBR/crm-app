import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

export class CompetitiveAgent extends BaseAgent {
    constructor() {
        super('competitive')
    }

    public async monitorCompetitor(competitorName: string, productUrl: string) {
        this.log(`Monitoring Competitor: ${competitorName}...`)
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Competitive Intelligence Specialist.
            Analysing Competitor URL (Simulated Content): ${productUrl}
            
            Tasks:
            1. Extract Price and Product Features (Simulate reasonable values).
            2. Identify 1 Sales Strategy (e.g., Discount, Bundle).
            3. Compare with "Standard" market offering.

            Return JSON: { "price": number, "features": [], "strategy": "string", "comparison": "string" }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            await this.persistResult(competitorName, analysis);
            return analysis

        } catch (e: any) {
            this.log(`Error analyzing Competitor: ${e.message}`)
            const fallback = {
                price: 99.99,
                features: ["Free Shipping"],
                strategy: "[FALLBACK] Aggressive Discount",
                comparison: "Undercutting by 10% (AI Unavailable)"
            }
            await this.persistResult(competitorName, fallback);
            return fallback
        }
    }

    private async persistResult(name: string, data: any) {
        try {
            await supabase.from('competitive_reports').insert({
                competitor_name: name,
                product_comparison: { price: data.price, features: data.features },
                strategies_detected: { main_strategy: data.strategy }
            })
        } catch (e) { this.log('DB Error') }
    }
}
