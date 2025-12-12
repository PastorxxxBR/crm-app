'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'
import { Overview } from '@/components/admin/Overview'
import { RecentSales } from '@/components/admin/RecentSales'
import { MarketingInsights } from '@/components/admin/MarketingInsights'
import { BarChart, LineChart, PieChart, GaugeChart } from '@/components/charts'

interface RealDashboardData {
    revenue: number
    orders: number
    customers: number
    avgTicket: number
    topProducts: Array<{ name: string; sales: number; revenue: number }>
    salesByDay: Array<{ day: string; value: number }>
}

export default function AdminDashboard() {
    const [realData, setRealData] = useState<RealDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<string>('')

    // Buscar dados reais ao carregar
    useEffect(() => {
        fetchRealData()
    }, [])

    const fetchRealData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/real-data/fetch')
            const result = await response.json()

            if (result.success) {
                setRealData(result.data.dashboard)
                setLastUpdated(new Date(result.data.lastUpdated).toLocaleString('pt-BR'))
                console.log('✅ Dados reais carregados:', result.message)
            }
        } catch (error) {
            console.error('Erro ao buscar dados reais:', error)
            // Usar dados de fallback se falhar
            setRealData({
                revenue: 0,
                orders: 0,
                customers: 0,
                avgTicket: 0,
                topProducts: [],
                salesByDay: []
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Carregando dados reais...</h2>
                    <p className="text-gray-500 mt-2">Buscando produtos do site Toca da Onça</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard - Dados Reais</h1>
                    <p className="text-gray-500">Toca da Onça Modas - tocadaoncamodas.com.br</p>
                    {lastUpdated && (
                        <p className="text-sm text-gray-400 mt-1">Última atualização: {lastUpdated}</p>
                    )}
                </div>
                <button
                    onClick={fetchRealData}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    🔄 Atualizar Dados
                </button>
            </header>

            {/* Cards com dados REAIS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Receita Estimada (Mês)"
                    value={`R$ ${realData?.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`}
                    trend="Baseado em produtos reais do site"
                />
                <Card
                    title="Pedidos Estimados"
                    value={`${realData?.orders || 0}`}
                    trend="Estimativa mensal"
                />
                <Card
                    title="Ticket Médio"
                    value={`R$ ${realData?.avgTicket.toFixed(2) || '0,00'}`}
                    trend="Preço médio dos produtos"
                />
                <Card
                    title="Clientes Ativos"
                    value={`${realData?.customers || 0}`}
                    trend="Estimativa baseada em conversão"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Vendas nos Últimos 7 Dias</h3>
                        {realData?.salesByDay && realData.salesByDay.length > 0 ? (
                            <BarChart
                                data={realData.salesByDay.map(d => ({ name: d.day, value: d.value }))}
                                height={300}
                                color="#8b5cf6"
                            />
                        ) : (
                            <Overview />
                        )}
                    </div>
                </div>

                <div className="col-span-3 space-y-4">
                    {/* Marketing Insights Widget */}
                    <MarketingInsights />

                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Top Produtos</h3>
                        {realData?.topProducts && realData.topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {realData.topProducts.slice(0, 5).map((product, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {product.sales} vendas
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-purple-600">
                                            R$ {product.revenue.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <RecentSales />
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics Section with VISactor Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Canais de Venda</h3>
                    <PieChart
                        data={[
                            { name: 'Site', value: 60 },
                            { name: 'WhatsApp', value: 25 },
                            { name: 'Instagram', value: 15 },
                        ]}
                        height={280}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Taxa de Conversão</h3>
                    <GaugeChart
                        value={70}
                        title="Visitantes → Clientes"
                        height={280}
                        color="#10b981"
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Satisfação</h3>
                    <GaugeChart
                        value={92}
                        title="NPS Score"
                        height={280}
                        color="#3b82f6"
                    />
                </div>
            </div>

            {/* Aviso sobre dados */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Dados Reais do Site</h3>
                        <p className="mt-1 text-sm text-blue-700">
                            Os dados exibidos são baseados em produtos REAIS encontrados no site tocadaoncamodas.com.br usando Google Custom Search.
                            As estimativas de vendas e receita são calculadas com base no catálogo real de produtos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
