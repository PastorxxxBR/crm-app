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
            Act as a Creative Director.
            Media: ${mediaUrl}
            Platform: ${platform}
            
            Tasks:
            1. Suggest Creative Theme.
            2. Recommend Media Type (Image/Video).
            3. Provide 1 Hook for the caption.

            Return JSON: { "theme": "string", "media_type": "string", "hook": "string" }
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
                theme: "UGC (User Generated Content)",
                media_type: "Reels",
                hook: "[FALLBACK] 'You won't believe this hack...'"
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
                creative_suggestion: data.hook
            })
        } catch (e) { this.log('DB Error') }
    }
}
