'use client'
import { useState } from 'react'

export default function StressTestPage() {
    const [logs, setLogs] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])

    const runTest = async (agent: string, count: number) => {
        setLoading(true)
        addLog(`>>> STARTING STRESS TEST: ${agent.toUpperCase()} (${count} items)...`)

        try {
            const res = await fetch(`/api/stress/${agent}`, {
                method: 'POST',
                body: JSON.stringify({ count }),
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()

            if (data.success) {
                addLog(`✅ SUCCESS: Processed ${data.count} items.`)
                addLog(`Sample Result: ${JSON.stringify(data.samples?.[0] || data.data)}`)
            } else {
                addLog(`❌ FAILED: ${data.error}`)
            }
        } catch (e: any) {
            addLog(`❌ ERROR: ${e.message}`)
        } finally {
            setLoading(false)
            addLog('<<< END TEST')
        }
    }

    return (
        <div className="p-10 space-y-6">
            <h1 className="text-3xl font-bold">Stress Test Control Center ⚡</h1>
            <p className="text-gray-600">Execute high-volume workloads to validate Agent resilience and Fallback AI.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    disabled={loading}
                    onClick={() => runTest('marketing', 100)}
                    className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 disabled:opacity-50">
                    Run Marketing (100)
                </button>
                <button
                    disabled={loading}
                    onClick={() => runTest('marketplaces', 200)}
                    className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700 disabled:opacity-50">
                    Run Marketplaces (200)
                </button>
                <button
                    disabled={loading}
                    onClick={() => runTest('security', 500)}
                    className="bg-red-600 text-white p-4 rounded hover:bg-red-700 disabled:opacity-50">
                    Run Security (500)
                </button>
                <button
                    disabled={loading}
                    onClick={() => runTest('bi', 1)}
                    className="bg-green-600 text-white p-4 rounded hover:bg-green-700 disabled:opacity-50">
                    Run BI (Deep Analyze)
                </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-auto font-mono text-xs">
                {logs.length === 0 && <span className="text-gray-500">Ready to test...</span>}
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    )
}
