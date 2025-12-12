'use client'

import { useState, useEffect } from 'react'

interface CompetitorProduct {
    id: string
    title: string
    price: number
    seller: {
        id: number
        nickname: string
    }
    permalink: string
    thumbnail: string
    sold_quantity: number
}

interface CategoryAnalysis {
    category: string
    totalProducts: number
    cheapest10: CompetitorProduct[]
    expensive10: CompetitorProduct[]
    average10: CompetitorProduct[]
    priceRange: {
        min: number
        max: number
        avg: number
        median: number
    }
    topSellers: Array<{
        seller: string
        sellerId: number
        totalProducts: number
        avgPrice: number
        totalSales: number
    }>
    insights: string
}

const CATEGORIES = {
    'Feminino': [
        { id: 'roupas-feminina', name: 'Roupas Feminina' },
        { id: 'vestidos-feminino', name: 'Vestidos' },
        { id: 'calcas-feminino', name: 'Calças' },
        { id: 'blusas-feminino', name: 'Blusas' },
        { id: 'saias-feminino', name: 'Saias' },
        { id: 'conjuntos-feminino', name: 'Conjuntos' },
        { id: 'calcados-feminino', name: 'Calçados' },
    ],
    'Masculino': [
        { id: 'roupas-masculino', name: 'Roupas Masculina' },
        { id: 'calcados-masculino', name: 'Calçados' },
    ],
    'Infantil': [
        { id: 'roupas-infantil', name: 'Roupas Infantil' },
        { id: 'calcados-infantil', name: 'Calçados' },
    ]
}

export default function CompetitiveAnalysisPage() {
    const [selectedGender, setSelectedGender] = useState<string>('Feminino')
    const [selectedCategory, setSelectedCategory] = useState<string>('roupas-feminina')
    const [analysis, setAnalysis] = useState<CategoryAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'cheapest' | 'expensive' | 'average'>('cheapest')

    useEffect(() => {
        if (selectedCategory) {
            fetchAnalysis()
        }
    }, [selectedCategory])

    const fetchAnalysis = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/competitive/analyze?category=${selectedCategory}`)
            const result = await response.json()

            if (result.success) {
                setAnalysis(result.analysis)
                console.log(`✅ Análise carregada: ${result.analysis.totalProducts} produtos`)
            }
        } catch (error) {
            console.error('Erro ao buscar análise:', error)
        } finally {
            setLoading(false)
        }
    }

    const getProductList = () => {
        if (!analysis) return []

        switch (activeTab) {
            case 'cheapest':
                return analysis.cheapest10
            case 'expensive':
                return analysis.expensive10
            case 'average':
                return analysis.average10
            default:
                return []
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Analisando concorrentes...</h2>
                    <p className="text-gray-500 mt-2">Buscando dados reais do Mercado Livre</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Inteligência Competitiva</h1>
                <p className="text-gray-500">Análise completa dos concorrentes no Mercado Livre</p>
            </header>

            {/* Seleção de Gênero */}
            <div className="flex gap-2">
                {Object.keys(CATEGORIES).map(gender => (
                    <button
                        key={gender}
                        onClick={() => {
                            setSelectedGender(gender)
                            const firstCategory = CATEGORIES[gender as keyof typeof CATEGORIES][0]
                            setSelectedCategory(firstCategory.id)
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${selectedGender === gender
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {gender}
                    </button>
                ))}
            </div>

            {/* Seleção de Categoria */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES[selectedGender as keyof typeof CATEGORIES].map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Estatísticas de Preço */}
            {analysis && (
                <>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500">Total Produtos</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{analysis.totalProducts}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500">Preço Mínimo</h3>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                R$ {analysis.priceRange.min.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500">Preço Médio</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                R$ {analysis.priceRange.avg.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500">Preço Mediano</h3>
                            <p className="text-2xl font-bold text-purple-600 mt-2">
                                R$ {analysis.priceRange.median.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500">Preço Máximo</h3>
                            <p className="text-2xl font-bold text-red-600 mt-2">
                                R$ {analysis.priceRange.max.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Tabs de Produtos */}
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-200">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('cheapest')}
                                    className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'cheapest'
                                        ? 'border-b-2 border-green-600 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    🏆 Top 10 Mais Baratos
                                </button>
                                <button
                                    onClick={() => setActiveTab('expensive')}
                                    className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'expensive'
                                        ? 'border-b-2 border-red-600 text-red-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    💎 Top 10 Mais Caros
                                </button>
                                <button
                                    onClick={() => setActiveTab('average')}
                                    className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'average'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    📊 Top 10 Preço Médio
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                {getProductList().map((product, index) => (
                                    <div key={product.id} className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative">
                                            <img
                                                src={product.thumbnail.replace('-I.jpg', '-O.jpg')}
                                                alt={product.title}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-lg font-bold text-purple-600 mb-1">
                                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                                {product.title}
                                            </h3>
                                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                                                <span>Vendidos: <strong>{product.sold_quantity}</strong></span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Vendedor: <strong>{product.seller.nickname}</strong>
                                            </p>
                                            <a
                                                href={product.permalink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Ver no ML →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Vendedores */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏅 Top 10 Vendedores</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Médio</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {analysis.topSellers.map((seller, index) => (
                                        <tr key={seller.sellerId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">#{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{seller.seller}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{seller.totalProducts}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-600">{seller.totalSales}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-purple-600">
                                                R$ {seller.avgPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <button
                                                    onClick={() => window.open(`/api/competitive/seller?sellerId=${seller.sellerId}`, '_blank')}
                                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Ver Dados →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Insights com IA */}
                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
                        <h3 className="text-lg font-semibold text-purple-900 mb-3">
                            🤖 Análise Estratégica
                        </h3>
                        <div className="prose prose-sm max-w-none text-purple-900">
                            <h4>📊 Análise de Preços:</h4>
                            <ul>
                                <li><strong>Faixa de Preço:</strong> R$ {analysis.priceRange.min.toFixed(2)} - R$ {analysis.priceRange.max.toFixed(2)}</li>
                                <li><strong>Preço Médio do Mercado:</strong> R$ {analysis.priceRange.avg.toFixed(2)}</li>
                                <li><strong>Preço Mediano:</strong> R$ {analysis.priceRange.median.toFixed(2)}</li>
                                <li><strong>Variação:</strong> {((analysis.priceRange.max - analysis.priceRange.min) / analysis.priceRange.min * 100).toFixed(0)}%</li>
                            </ul>

                            <h4>🎯 Recomendações:</h4>
                            <ul>
                                <li><strong>Para Competir em Preço:</strong> Fique abaixo de R$ {analysis.priceRange.avg.toFixed(2)}</li>
                                <li><strong>Para Posicionamento Médio:</strong> Entre R$ {(analysis.priceRange.avg * 0.9).toFixed(2)} e R$ {(analysis.priceRange.avg * 1.1).toFixed(2)}</li>
                                <li><strong>Para Posicionamento Premium:</strong> Acima de R$ {(analysis.priceRange.avg * 1.2).toFixed(2)}</li>
                            </ul>

                            <h4>🏆 Principais Concorrentes:</h4>
                            <p>Os top 3 vendedores dominam {((analysis.topSellers.slice(0, 3).reduce((sum, s) => sum + s.totalSales, 0) / analysis.topSellers.reduce((sum, s) => sum + s.totalSales, 0)) * 100).toFixed(0)}% das vendas nesta categoria.</p>

                            <h4>💡 Oportunidades:</h4>
                            <ul>
                                <li>Produtos mais vendidos estão na faixa de R$ {analysis.cheapest10[0]?.price.toFixed(2)} - R$ {analysis.cheapest10[4]?.price.toFixed(2)}</li>
                                <li>Há espaço para produtos premium acima de R$ {analysis.priceRange.avg.toFixed(2)}</li>
                                <li>Frete grátis é um diferencial importante</li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
