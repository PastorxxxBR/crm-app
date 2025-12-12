'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingDown, TrendingUp, BarChart3, Store, Package, DollarSign, Users, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
    id: string
    title: string
    price: number
    seller: { id: number; name: string }
    link: string
    image: string
    soldQuantity: number
    freeShipping: boolean
}

interface CategoryAnalysis {
    category: string
    totalProducts: number
    cheapest10: Product[]
    expensive10: Product[]
    average10: Product[]
    priceRange: {
        min: number
        max: number
        avg: number
        median: number
    }
    topSellers: Array<{
        name: string
        id: number
        totalProducts: number
        avgPrice: number
        totalSales: number
    }>
}

const CATEGORIES = {
    'Feminino': [
        { id: 'roupas-feminina', name: 'Roupas Feminina', icon: '👗' },
        { id: 'vestidos-feminino', name: 'Vestidos', icon: '👗' },
        { id: 'calcas-feminino', name: 'Calças', icon: '👖' },
        { id: 'blusas-feminino', name: 'Blusas', icon: '👚' },
        { id: 'saias-feminino', name: 'Saias', icon: '🩱' },
        { id: 'conjuntos-feminino', name: 'Conjuntos', icon: '👗' },
        { id: 'calcados-feminino', name: 'Calçados', icon: '👠' },
    ],
    'Masculino': [
        { id: 'roupas-masculino', name: 'Roupas Masculina', icon: '👔' },
        { id: 'calcados-masculino', name: 'Calçados', icon: '👞' },
    ],
    'Infantil': [
        { id: 'roupas-infantil', name: 'Roupas Infantil', icon: '👶' },
        { id: 'calcados-infantil', name: 'Calçados', icon: '👟' },
    ]
}

export default function CompetitiveAnalysisPage() {
    const [selectedGender, setSelectedGender] = useState<string>('Feminino')
    const [selectedCategory, setSelectedCategory] = useState<string>('conjuntos-feminino')
    const [analysis, setAnalysis] = useState<CategoryAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'cheapest' | 'expensive' | 'average'>('average')

    useEffect(() => {
        fetchAnalysis()
    }, [selectedCategory])

    const fetchAnalysis = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/competitive/analyze?category=${selectedCategory}`)
            const data = await response.json()

            if (data.success) {
                setAnalysis(data.analysis)
            }
        } catch (error) {
            console.error('Erro ao buscar análise:', error)
        } finally {
            setLoading(false)
        }
    }

    const currentProducts = analysis ? {
        'cheapest': analysis.cheapest10,
        'expensive': analysis.expensive10,
        'average': analysis.average10
    }[activeTab] : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                    Inteligência Competitiva
                                </h1>
                                <p className="text-sm text-gray-600">Análise completa dos concorrentes no Mercado Livre</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Gender Tabs */}
                <div className="flex gap-3 mb-6">
                    {Object.keys(CATEGORIES).map((gender) => (
                        <button
                            key={gender}
                            onClick={() => {
                                setSelectedGender(gender)
                                setSelectedCategory(CATEGORIES[gender as keyof typeof CATEGORIES][0].id)
                            }}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedGender === gender
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {gender}
                        </button>
                    ))}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {CATEGORIES[selectedGender as keyof typeof CATEGORIES].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Analisando concorrentes...</p>
                        </div>
                    </div>
                ) : analysis ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <Package className="w-5 h-5 text-gray-600" />
                                    <p className="text-sm text-gray-600 font-medium">Total Produtos</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{analysis.totalProducts}</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingDown className="w-5 h-5 text-green-600" />
                                    <p className="text-sm text-green-700 font-medium">Preço Mínimo</p>
                                </div>
                                <p className="text-3xl font-bold text-green-600">R$ {analysis.priceRange.min.toFixed(2)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <p className="text-sm text-blue-700 font-medium">Preço Médio</p>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">R$ {analysis.priceRange.avg.toFixed(2)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-purple-600" />
                                    <p className="text-sm text-purple-700 font-medium">Preço Mediano</p>
                                </div>
                                <p className="text-3xl font-bold text-purple-600">R$ {analysis.priceRange.median.toFixed(2)}</p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                    <p className="text-sm text-red-700 font-medium">Preço Máximo</p>
                                </div>
                                <p className="text-3xl font-bold text-red-600">R$ {analysis.priceRange.max.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Product Tabs */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
                            <div className="border-b border-gray-200 px-6">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setActiveTab('cheapest')}
                                        className={`px-6 py-4 font-semibold transition-all relative ${activeTab === 'cheapest'
                                                ? 'text-green-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-5 h-5" />
                                            Top 10 Mais Baratos
                                        </div>
                                        {activeTab === 'cheapest' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t"></div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('expensive')}
                                        className={`px-6 py-4 font-semibold transition-all relative ${activeTab === 'expensive'
                                                ? 'text-red-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Top 10 Mais Caros
                                        </div>
                                        {activeTab === 'expensive' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t"></div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('average')}
                                        className={`px-6 py-4 font-semibold transition-all relative ${activeTab === 'average'
                                                ? 'text-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5" />
                                            Top 10 Preço Médio
                                        </div>
                                        {activeTab === 'average' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {currentProducts.map((product, index) => (
                                        <div key={product.id} className="group relative bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200">
                                            <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                #{index + 1}
                                            </div>

                                            <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>

                                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                                                {product.title}
                                            </h3>

                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold text-purple-600">
                                                    R$ {product.price.toFixed(2)}
                                                </p>

                                                <div className="flex items-center justify-between text-xs text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Store className="w-3 h-3" />
                                                        {product.seller.name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-green-600 font-medium">
                                                        {product.soldQuantity} vendidos
                                                    </span>
                                                    {product.freeShipping && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                            Frete Grátis
                                                        </span>
                                                    )}
                                                </div>

                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg font-medium transition-colors text-sm mt-3"
                                                >
                                                    Ver Produto
                                                    <ExternalLink className="w-3 h-3 inline ml-1" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Sellers */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-purple-600" />
                                Top 10 Vendedores
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendedor</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Produtos</th>
                                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Vendas</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Preço Médio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.topSellers.map((seller, index) => (
                                            <tr key={seller.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-medium text-gray-900">{seller.name}</td>
                                                <td className="py-4 px-4 text-center text-gray-700">{seller.totalProducts}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                                        {seller.totalSales.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-semibold text-purple-600">
                                                    R$ {seller.avgPrice.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    )
}
