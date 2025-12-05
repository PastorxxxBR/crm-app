import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

export class BIAgent extends BaseAgent {
    constructor() {
        super('bi')
    }

    /**
     * Generate Comprehensive Business Report
     */
    public async generateReport(data: { revenueHistory: number[], activeClients: number, churn: number }) {
        this.log('Generating BI Report with Gemini...')
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Business Intelligence Analyst.
            Data:
            - Revenue History (Last 3 months): ${data.revenueHistory.join(', ')}
            - Active Clients: ${data.activeClients}
            - Churn (Last Month): ${data.churn}
            
            Tasks:
            1. Predict revenue for next month.
            2. Analyze churn risk (High/Medium/Low).
            3. Provide 1 strategic insight.

            Return JSON: { "revenue_prediction": number, "churn_risk": "string", "insight": "string" }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            // Persist Report
            try {
                await supabase.from('bi_reports').insert({
                    report_data: analysis,
                    input_metrics: data,
                    created_at: new Date()
                })
            } catch (e) {
                this.log('Warning: DB persistence failed')
            }

            return analysis
        } catch (e: any) {
            this.log(`Error generating report: ${e.message}`)
            const lastMonth = data.revenueHistory[data.revenueHistory.length - 1] || 0
            return {
                revenue_prediction: Math.round(lastMonth * 1.1),
                churn_risk: data.churn > 50 ? "High" : "Low",
                insight: "[FALLBACK] Calculated simple 10% growth projection (AI Unavailable)"
            }
        }
    }
}
