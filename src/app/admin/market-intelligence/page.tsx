'use client'

import { Card } from '@/components/admin/Card'
import { BarChart, LineChart, PieChart, AreaChart } from '@/components/charts'
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react'
import { useState } from 'react'

// Mock data - After this works, we'll integrate real APIs
const mockMarketplaceData = {
    mercadoLivre: [
        { name: 'Camiseta Básica', myPrice: 49.90, avgCompetitor: 45.50, margin: -8.8 },
        { name: 'Calça Jeans', myPrice: 129.90, avgCompetitor: 139.90, margin: 7.7 },
        { name: 'Vestido Floral', myPrice: 89.90, avgCompetitor: 95.00, margin: 5.7 },
    ],
    shopee: [
        { name: 'Camiseta Básica', myPrice: 49.90, avgCompetitor: 42.00, margin: -15.8 },
        { name: 'Calça Jeans', myPrice: 129.90, avgCompetitor: 125.90, margin: -3.1 },
        { name: 'Vestido Floral', myPrice: 89.90, avgCompetitor: 88.50, margin: -1.6 },
    ],
}

const segmentData = {
    masculino: { products: 45, avgPrice: 78.50, competitors: 23 },
    feminino: { products: 67, avgPrice: 92.30, competitors: 31 },
    infantil: { products: 34, avgPrice: 65.20, competitors: 18 },
}

const priceTrendData = [
    { name: 'Jan', masculino: 75, feminino: 88, infantil: 62 },
    { name: 'Fev', masculino: 76, feminino: 90, infantil: 63 },
    { name: 'Mar', masculino: 77, feminino: 91, infantil: 64 },
    { name: 'Abr', masculino: 78, feminino: 92, infantil: 65 },
    { name: 'Mai', masculino: 78.5, feminino: 92.3, infantil: 65.2 },
]

export default function MarketIntelligencePage() {
    const [activeMarketplace, setActiveMarketplace] = useState<'mercadoLivre' | 'shopee'>('mercadoLivre')
    const [activeSegment, setActiveSegment] = useState<'masculino' | 'feminino' | 'infantil'>('masculino')

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Inteligência de Mercado</h1>
                <p className="text-gray-500">Monitore preços e concorrentes em tempo real</p>
            </header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Produtos Monitorados"
                    value="146"
                    trend="Em 3 marketplaces"
                />
                <Card
                    title="Concorrentes Ativos"
                    value="72"
                    trend="23 novos este mês"
                />
                <Card
                    title="Competitividade Média"
                    value="94.5%"
                    trend="+2.3% vs mês passado"
                />
                <Card
                    title="Alertas de Preço"
                    value="12"
                    trend="Requer atenção"
                />
            </div>

            {/* Marketplace Selector */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveMarketplace('mercadoLivre')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMarketplace === 'mercadoLivre'
                            ? 'bg-pink-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Mercado Livre
                </button>
                <button
                    onClick={() => setActiveMarketplace('shopee')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMarketplace === 'shopee'
                            ? 'bg-pink-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Shopee
                </button>
            </div>

            {/* Price Comparison Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">
                        Comparação de Preços - {activeMarketplace === 'mercadoLivre' ? 'Mercado Livre' : 'Shopee'}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Produto</th>
                                <th className="px-6 py-4 font-medium">Seu Preço</th>
                                <th className="px-6 py-4 font-medium">Média Concorrentes</th>
                                <th className="px-6 py-4 font-medium">Diferença</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockMarketplaceData[activeMarketplace].map((product, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-900">
                                        R$ {product.myPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        R$ {product.avgCompetitor.toFixed(2)}
                                    </td>
                                    <td className={`px-6 py-4 font-medium ${product.margin > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {product.margin > 0 ? '+' : ''}{product.margin.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.margin > 0 ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                <TrendingUp className="h-3 w-3" />
                                                Competitivo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                                <TrendingDown className="h-3 w-3" />
                                                Atenção
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Segment Analysis */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Análise por Segmento</h3>

                {/* Segment Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['masculino', 'feminino', 'infantil'] as const).map((segment) => (
                        <button
                            key={segment}
                            onClick={() => setActiveSegment(segment)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeSegment === segment
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {segment}
                        </button>
                    ))}
                </div>

                {/* Segment Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Produtos</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {segmentData[activeSegment].products}
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Preço Médio</p>
                        <p className="text-2xl font-bold text-gray-900">
                            R$ {segmentData[activeSegment].avgPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-4">
                        <p className="text-sm text-gray-500">Concorrentes</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {segmentData[activeSegment].competitors}
                        </p>
                    </div>
                </div>
            </div>

            {/* Price Trends Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Tendência de Preços por Segmento</h3>
                <div className="h-80">
                    <AreaChart
                        data={priceTrendData.map(item => ({
                            name: item.name,
                            value: item[activeSegment]
                        }))}
                        height={280}
                        color={
                            activeSegment === 'masculino' ? '#3b82f6' :
                                activeSegment === 'feminino' ? '#ec4899' :
                                    '#10b981'
                        }
                    />
                </div>
            </div>

            {/* Market Share */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Distribuição por Marketplace</h3>
                    <PieChart
                        data={[
                            { name: 'Mercado Livre', value: 45 },
                            { name: 'Shopee', value: 32 },
                            { name: 'Amazon', value: 18 },
                            { name: 'Magalu', value: 12 },
                        ]}
                        height={280}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Top Concorrentes</h3>
                    <BarChart
                        data={[
                            { name: 'Loja A', value: 234 },
                            { name: 'Loja B', value: 198 },
                            { name: 'Loja C', value: 167 },
                            { name: 'Loja D', value: 145 },
                            { name: 'Loja E', value: 123 },
                        ]}
                        height={280}
                        color="#f59e0b"
                    />
                </div>
            </div>

            {/* Alert Box */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-900">Dados de Exemplo</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Estes são dados mock para demonstração. Na próxima etapa, vamos integrar as APIs reais
                            do Google Custom Search e dos marketplaces para dados em tempo real.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
