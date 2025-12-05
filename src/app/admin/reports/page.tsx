'use client'
import { useState, useEffect } from 'react'

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        setLoading(true)
        try {
            // Mock fetching from a GET endpoint or using Supabase client directly
            // For now, let's trigger the generation to see immediate results or just list simulated items
            // But we actually created a CRON job that returns the summary. A real app would list from DB.
            // Let's implement a 'Generate New Report' button that hits the cron route.
            setLoading(false)
        } catch (e) { setLoading(false) }
    }

    const generateReport = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/cron/report')
            const data = await res.json()
            if (data.success) {
                setReports(prev => [data, ...prev])
            }
        } catch (e) { alert('Error generating report') }
        finally { setGenerating(false) }
    }

    return (
        <div className="p-10 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Relatórios Estratégicos (Multi-Agentes) 🤖</h1>
                <button
                    onClick={generateReport}
                    disabled={generating}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {generating ? 'Gerando Análise via IA...' : 'Gerar Novo Relatório Agora'}
                </button>
            </div>

            <div className="space-y-6">
                {reports.map((report, idx) => (
                    <div key={idx} className="bg-white border rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Relatório Executivo #{idx + 1}</h2>

                        {/* Executive Summary */}
                        <div className="bg-indigo-50 p-4 rounded-lg mb-6 border-l-4 border-indigo-500">
                            <h3 className="font-bold text-indigo-900 mb-2">Resumo do CEO (Gemini)</h3>
                            <p className="text-indigo-800 whitespace-pre-line">{report.summary}</p>
                        </div>
                    </div>
                ))}

                {reports.length === 0 && !generating && (
                    <div className="text-center text-gray-500 py-10">
                        Nenhum relatório gerado ainda. Clique no botão acima para acionar os agentes.
                    </div>
                )}
            </div>
        </div>
    )
}
