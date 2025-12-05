import { NextResponse } from 'next/server'
import { SocialMediaAgent } from '@/agents/social'
import { CompetitiveAgent } from '@/agents/competitive'
import { TrendingAgent } from '@/agents/trending'
import { ContentAgent } from '@/agents/content'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        console.log('Running 3-Day CRM Report Cron...')

        // 1. Run all agents in parallel (Simulated Data for Demo)
        const social = new SocialMediaAgent()
        const comp = new CompetitiveAgent()
        const trend = new TrendingAgent()
        const content = new ContentAgent()

        const [socialData, compData, trendData, contentData] = await Promise.all([
            social.analyzeAudience('instagram', [{ likes: 50 }, { likes: 120 }]),
            comp.monitorCompetitor('CompetitorX', 'http://example.com/product'),
            trend.analyzeSalesPatterns([{ name: 'Product A', sales: 150 }, { name: 'Product B', sales: 90 }]),
            content.analyzeCreative('http://example.com/image.jpg', 'tiktok')
        ])

        const aggregatedData = { socialData, compData, trendData, contentData }

        // 2. Generate Executive Summary with Gemini
        let executiveSummary = ""
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Act as a CMO (Chief Marketing Officer).
                Based on this 3-day data: ${JSON.stringify(aggregatedData)}
                
                Write a concise 3-bullet point executive summary for the CEO.
                Highlight opportunities and risks.
            `
            const result = await model.generateContent(prompt);
            executiveSummary = result.response.text();
        } catch (e: any) {
            executiveSummary = "Executive Summary Fallback: Growth trend detected in Product A. Competitor X is aggressive. Instagram audience is engaging."
        }

        // 3. Persist Full Report
        await supabase.from('crm_reports').insert({
            report_type: '3_day_summary',
            summary_json: aggregatedData,
            executive_summary: executiveSummary
        })

        return NextResponse.json({ success: true, summary: executiveSummary })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message })
    }
}
