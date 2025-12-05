import { BaseAgent } from '../base'

export class SecurityAgent extends BaseAgent {
    constructor() {
        super('security')
    }

    public async audit(actor: string, action: string, resource: string) {
        this.log(`AUDIT: User ${actor} performed ${action} on ${resource}`)
        // In real app: save to DB
        await this.analyzeLog({ actor, action, resource })
    }

    /**
     * Detect Suspicious Activity
     */
    public async analyzeLog(logEntry: any) {
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            Act as a Security Analyst.
            Log Entry: ${JSON.stringify(logEntry)}
            
            Is this suspicious? (e.g. mass deletion, unauthorized access attempts).
            Return JSON: { "suspicious": boolean, "risk_level": "low|medium|high", "reason": "string" }
            No markdown.
        `

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(text);

            if (analysis.suspicious) {
                this.log(`🚨 SECURITY ALERT: ${analysis.reason}`)
                await this.publishEvent('security_alert', analysis)
            }

            return analysis
        } catch (e: any) {
            this.log(`Error analyzing log: ${e.message}`)
            const isSuspicious = JSON.stringify(logEntry).includes('fail') || JSON.stringify(logEntry).includes('unauthorized')
            return {
                suspicious: isSuspicious,
                risk_level: isSuspicious ? "high" : "low",
                reason: "[FALLBACK] Detected 'fail' or 'unauthorized' keywords in payload (AI Unavailable)"
            }
        }
    }
}
