
import { MarketingAgent } from '@/agents/marketing'

export default async function TestAgentPage() {
    let result: any = {}
    let error: string = ''

    try {
        const agent = new MarketingAgent()
        const campaignId = 'test-campaign-id'

        const mockMetrics = {
            reach: 1000,
            impressions: 1000,
            clicks: 25, // 2.5% rate
            conversions: 5
        }

        console.log('Running Marketing Agent Analysis...')
        result = await agent.analyzePerformance(campaignId, mockMetrics)

    } catch (e: any) {
        console.error(e)
        error = e.message + '\n' + e.stack
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Marketing Agent Test Result (Gemini)</h1>

            {error ? (
                <div className="bg-red-100 p-4 rounded text-red-900 overflow-auto">
                    <h2 className="font-bold">Error:</h2>
                    <pre>{error}</pre>
                </div>
            ) : (
                <div className="bg-green-100 p-4 rounded text-green-900 overflow-auto">
                    <h2 className="font-bold">Success!</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    )
}
