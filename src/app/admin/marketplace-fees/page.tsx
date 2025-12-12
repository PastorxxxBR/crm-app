'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'
import { BarChart } from '@/components/charts'
import { Calculator, TrendingDown, TrendingUp, Info } from 'lucide-react'

interface MarketplaceFeeData {
    id: string
    name: string
    fees: {
        commission: number
        paymentFee: number
        fixedFee?: number
    }
    exampleCalculation: {
        basePrice: number
        commission: number
        paymentFee: number
        fixedFee: number
        totalFees: number
        netProfit: number
        profitMargin: number
    }
}

export default function MarketplaceFeesPage() {
    const [marketplaces, setMarketplaces] = useState<MarketplaceFeeData[]>([])
    const [testPrice, setTestPrice] = useState(100)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMarketplaces()
    }, [])

    async function loadMarketplaces() {
        try {
            const response = await fetch('/api/market/marketplaces?active=true&fashion=true')
            const data = await response.json()
            if (data.success) {
                setMarketplaces(data.marketplaces)
            }
        } catch (error) {
            console.error('Failed to load marketplaces:', error)
        } finally {
            setLoading(false)
        }
    }

    async function recalculate() {
        try {
            const response = await fetch(`/api/market/fees?price=${testPrice}`)
            const data = await response.json()
            if (data.success) {
                const updated = marketplaces.map(m => {
                    const comp = data.comparison.find((c: any) => c.id === m.id)
                    return comp ? { ...m, exampleCalculation: comp } : m
                })
                setMarketplaces(updated as any)
            }
        } catch (error) {
            console.error('Failed to recalculate:', error)
        }
    }

    if (loading) {
        return <div className="p-8">Carregando...</div>
    }

    const best = marketplaces.reduce((best, m) =>
        m.exampleCalculation.netProfit > best.exampleCalculation.netProfit ? m : best
        , marketplaces[0])

    const worst = marketplaces.reduce((worst, m) =>
        m.exampleCalculation.netProfit < worst.exampleCalculation.netProfit ? m : worst
        , marketplaces[0])

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Comparação de Taxas</h1>
                <p className="text-gray-500">Veja quanto cada marketplace cobra e compare</p>
            </header>

            {/* Calculator */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <Calculator className="h-5 w-5 text-pink-600" />
                    <h3 className="text-lg font-medium text-gray-900">Calculadora de Taxas</h3>
                </div>

                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preço de Venda
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <input
                                type="number"
                                value={testPrice}
                                onChange={(e) => setTestPrice(parseFloat(e.target.value) || 0)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            />
                        </div>
                    </div>
                    <button
                        onClick={recalculate}
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                    >
                        Calcular
                    </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-900">Melhor Opção</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">{best.name}</p>
                        <p className="text-sm text-green-700">
                            Lucro: R$ {best.exampleCalculation.netProfit.toFixed(2)} ({best.exampleCalculation.profitMargin.toFixed(1)}%)
                        </p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-medium text-red-900">Pior Opção</p>
                        </div>
                        <p className="text-2xl font-bold text-red-900">{worst.name}</p>
                        <p className="text-sm text-red-700">
                            Lucro: R$ {worst.exampleCalculation.netProfit.toFixed(2)} ({worst.exampleCalculation.profitMargin.toFixed(1)}%)
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Lucro Líquido por Marketplace</h3>
                <BarChart
                    data={marketplaces
                        .sort((a, b) => b.exampleCalculation.netProfit - a.exampleCalculation.netProfit)
                        .map(m => ({
                            name: m.name,
                            value: m.exampleCalculation.netProfit,
                        }))}
                    height={300}
                    color="#10b981"
                />
            </div>

            {/* Detailed Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Detalhamento de Taxas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Marketplace</th>
                                <th className="px-6 py-4 font-medium">Comissão</th>
                                <th className="px-6 py-4 font-medium">Taxa Pgto</th>
                                <th className="px-6 py-4 font-medium">Taxa Fixa</th>
                                <th className="px-6 py-4 font-medium">Total Taxas</th>
                                <th className="px-6 py-4 font-medium">Lucro Líquido</th>
                                <th className="px-6 py-4 font-medium">Margem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {marketplaces
                                .sort((a, b) => b.exampleCalculation.netProfit - a.exampleCalculation.netProfit)
                                .map((marketplace) => (
                                    <tr key={marketplace.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{marketplace.name}</td>
                                        <td className="px-6 py-4 text-gray-700">{marketplace.fees.commission}%</td>
                                        <td className="px-6 py-4 text-gray-700">{marketplace.fees.paymentFee}%</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            R$ {(marketplace.fees.fixedFee || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-red-600 font-medium">
                                            R$ {marketplace.exampleCalculation.totalFees.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-green-600 font-bold">
                                            R$ {marketplace.exampleCalculation.netProfit.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${marketplace.exampleCalculation.profitMargin > 70
                                                    ? 'bg-green-100 text-green-700'
                                                    : marketplace.exampleCalculation.profitMargin > 60
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                {marketplace.exampleCalculation.profitMargin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900">Sobre as Taxas</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            • <strong>Comissão:</strong> Percentual cobrado sobre cada venda<br />
                            • <strong>Taxa de Pagamento:</strong> Taxa para processar pagamentos<br />
                            • <strong>Taxa Fixa:</strong> Valor fixo cobrado por transação<br />
                            • <strong>Lucro Líquido:</strong> O que você recebe após todas as taxas
                        </p>
                        <p className="text-xs text-blue-600 mt-3">
                            💡 Dica: Use marketplaces com menor taxa total para produtos de menor margem
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
