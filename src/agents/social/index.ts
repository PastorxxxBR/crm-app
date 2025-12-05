import { BaseAgent } from '../base'
import { supabase } from '@/lib/supabase'

export class SocialMediaAgent extends BaseAgent {
    constructor() {
        super('social-media')
    }

    public async analyzeAudience(platform: string, recentPosts: any[]) {
        this.log(`Analyzing audience for ${platform}...`)
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Social Media Manager.
            Platform: ${platform}
            Recent Posts Data: ${JSON.stringify(recentPosts)}
            
            Tasks:
            1. Segment the audience (Age, Interests, Location).
            2. Calculate Engagement Rate.
            3. Suggest 2 content improvements.

            Return JSON: { "segmentation": {}, "engagement_rate": number, "suggestions": [] }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            await this.persistResult(platform, analysis);
            return analysis

        } catch (e: any) {
            this.log(`Error analyzing Social Media: ${e.message}`)
            // Fallback
            const fallback = {
                segmentation: { age: "18-35", interests: ["Tech", "Lifestyle"] },
                engagement_rate: 0.04,
                suggestions: ["[FALLBACK] Use more video reels", "Post at 18:00"],
                note: "AI Unavailable"
            }
            await this.persistResult(platform, fallback);
            return fallback
        }
    }

    private async persistResult(platform: string, data: any) {
        try {
            await supabase.from('social_media_reports').insert({
                platform,
                segmentation_data: data.segmentation,
                post_analysis: { engagement_rate: data.engagement_rate },
                suggestions: data.suggestions
            })
        } catch (e) { this.log('DB Error') }
    }
}
