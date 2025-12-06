
import { MarketingAgent } from '@/agents/marketing'
import { MarketplacesAgent } from '@/agents/marketplaces'
import { SecurityAgent } from '@/agents/security'
import { BIAgent } from '@/agents/bi'
import { SocialMediaAgent } from '@/agents/social'
import { CompetitiveAgent } from '@/agents/competitive'
import { TrendingAgent } from '@/agents/trending'
import { ContentAgent } from '@/agents/content'

export default async function VerifyPage() {
    const results: any = {}

    // 1. Marketing
    try {
        const mkt = new MarketingAgent()
        results.marketing = await mkt.analyzePerformance('mock-natal-2025', { reach: 500, clicks: 10, conversions: 2 })
    } catch (e: any) { results.marketing_error = e.message }

    // 2. Marketplaces (Fashion B2B Test)
    try {
        const mp = new MarketplacesAgent()
        results.marketplaces = await mp.suggestPricing('Vestido Linho Premium', 89.90, 85.00, 'wholesale')
    } catch (e: any) { results.marketplaces_error = e.message }

    // 3. BI
    try {
        const bi = new BIAgent()
        results.bi = await bi.generateReport({ revenueHistory: [15000, 18000, 22000], activeClients: 120, churn: 5 })
    } catch (e: any) { results.bi_error = e.message }

    // 4. Security
    try {
        const sec = new SecurityAgent()
        results.security = await sec.analyzeLog({
            events: [
                { user: 'admin', status: 'success' },
                { user: 'client_loja_sp', status: 'fail' },
                { user: 'unknown_ip', status: 'fail_unauthorized', resource: '/admin/wholesale_prices' }
            ]
        })
    } catch (e: any) { results.security_error = e.message }

    // 5. Social Media
    try {
        const social = new SocialMediaAgent()
        results.social = await social.analyzeAudience('instagram', [{ likes: 500 }, { likes: 1200 }])
    } catch (e: any) { results.social_error = e.message }

    // 6. Competitive
    try {
        const comp = new CompetitiveAgent()
        results.competitive = await comp.monitorCompetitor('ZaraCompetitor', 'http://store.com/summer-collection')
    } catch (e: any) { results.competitive_error = e.message }

    // 7. Trending (Fashion)
    try {
        const trend = new TrendingAgent()
        const salesData = [
            { name: 'Cropped Renda Branco', sales: 450, category: 'Tops' },
            { name: 'Calça Alfaiataria Bege', sales: 300, category: 'Bottoms' },
            { name: 'Jaqueta Couro (Inverno)', sales: 20, category: 'Outerwear' }
        ]
        results.trending = await trend.analyzeSalesPatterns(salesData)
    } catch (e: any) { results.trending_error = e.message }

    // 8. Content (Viral Fashion)
    try {
        const content = new ContentAgent()
        results.content = await content.analyzeCreative('http://cdn.store.com/provador_video.mp4', 'instagram')
    } catch (e: any) { results.content_error = e.message }

    return (
        <div className="p-10 space-y-8 font-sans">
            <h1 className="text-4xl font-extrabold mb-6 text-gray-900 border-b pb-4">
                CRM Intelligence Showcase 🧠
                <span className="text-sm font-normal ml-4 text-gray-500">8 Agents Live</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Core Agents */}
                <AgentCard title="Marketing Agent" color="blue" description="Campaign Optimization" result={results.marketing} error={results.marketing_error} />
                <AgentCard title="Marketplaces Agent" color="purple" description="Dynamic Pricing" result={results.marketplaces} error={results.marketplaces_error} />
                <AgentCard title="BI Agent" color="green" description="Demand Forecasting" result={results.bi} error={results.bi_error} />
                <AgentCard title="Security Agent" color="red" description="Intrusion Detection" result={results.security} error={results.security_error} />

                {/* Expansion Agents */}
                <AgentCard title="Social Media Agent" color="pink" description="Audience & Engagement" result={results.social} error={results.social_error} />
                <AgentCard title="Competitive Agent" color="orange" description="Competitor Spy" result={results.competitive} error={results.competitive_error} />
                <AgentCard title="Trending Agent" color="yellow" description="Market Trends" result={results.trending} error={results.trending_error} />
                <AgentCard title="Content Agent" color="indigo" description="Creative Strategy" result={results.content} error={results.content_error} />

            </div>
        </div>
    )
}

function AgentCard({ title, color, description, result, error }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-800 border-blue-200',
        purple: 'bg-purple-50 text-purple-800 border-purple-200',
        green: 'bg-green-50 text-green-800 border-green-200',
        red: 'bg-red-50 text-red-800 border-red-200',
        pink: 'bg-pink-50 text-pink-800 border-pink-200',
        orange: 'bg-orange-50 text-orange-800 border-orange-200',
        yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    }

    return (
        <div className={`border p-5 rounded-xl shadow-sm ${colorClasses[color] || 'bg-gray-50'}`}>
            <h2 className="font-bold text-xl mb-1">{title}</h2>
            <div className="text-xs uppercase tracking-wide opacity-70 mb-3">{description}</div>
            <pre className="bg-white p-3 rounded border overflow-auto text-xs h-32 font-mono text-gray-700">
                {JSON.stringify(result || error, null, 2)}
            </pre>
        </div>
    )
}
