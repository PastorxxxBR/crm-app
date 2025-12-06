import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

export class ContentAgent extends BaseAgent {
    constructor() {
        super('content')
    }

    public async analyzeCreative(mediaUrl: string, platform: string) {
        this.log(`Analyzing Creative Content for ${platform}...`)
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Viral Fashion Content Strategist for a Clothing Brand (Retail & Wholesale).
            Media/Context: ${mediaUrl}
            Platform: ${platform}
            
            Tasks:
            1. Suggest a High-Conversion Theme (e.g., "GRWM for Date Night", "How to Style: Office Siren", "Wholesale Unboxing").
            2. Define the Format: (Reels/TikTok, Carousel, Story).
            3. Write TWO Hooks:
               - Hook A (Retail/Consumer): Focus on style, beauty, emotion.
               - Hook B (Wholesale/B2B): Focus on margin, resale value, "grade fechada".

            Return JSON: { 
                "theme": "string", 
                "media_type": "string", 
                "retail_hook": "string",
                "wholesale_hook": "string",
                "hashtags": "string (e.g. #ModaAtacado #LookDoDia)"
            }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            await this.persistResult("content_analysis", analysis);
            return analysis

        } catch (e: any) {
            this.log(`Error analyzing Content: ${e.message}`)
            const fallback = {
                theme: "Fashion Trend Showcase",
                media_type: "Reels / TikTok",
                retail_hook: "Discover your new favorite outfit!",
                wholesale_hook: "High margin pieces for your store - Stock up now!",
                hashtags: "#FashionTrends #NewArrivals"
            }
            await this.persistResult("content_analysis", fallback);
            return fallback
        }
    }

    private async persistResult(id: string, data: any) {
        try {
            await supabase.from('content_strategies').insert({
                theme: data.theme,
                media_type: data.media_type,
                creative_suggestion: `Retail: ${data.retail_hook} | Wholesale: ${data.wholesale_hook}`
            })
        } catch (e) { this.log('DB Error') }
    }
}
