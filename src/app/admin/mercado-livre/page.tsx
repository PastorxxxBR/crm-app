'use client'

import { useState, useEffect } from 'react'

interface MLProduct {
    id: string
    title: string
    price: number
    available_quantity: number
    sold_quantity: number
    thumbnail: string
    permalink: string
    status: string
}

interface MLStats {
    totalProducts: number
    activeProducts: number
    pausedProducts: number
    totalSales: number
    totalRevenue: number
    avgPrice: number
    avgSoldQuantity: number
}

export default function MercadoLivrePage() {
    const [products, setProducts] = useState<MLProduct[]>([])
    const [stats, setStats] = useState<MLStats | null>(null)
    const [analysis, setAnalysis] = useState<string>('')
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        fetchMLData()
    }, [])

    const fetchMLData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/mercadolivre/products')
            const result = await response.json()

            if (result.success) {
                setProducts(result.data.products)
                setStats(result.data.stats)
                setAnalysis(result.data.analysis)
                setUser(result.data.user)
                console.log(`✅ ${result.message}`)
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = filter === 'all'
        ? products
        : filter === 'active'
            ? products.filter(p => p.status === 'active')
            : products.filter(p => p.status === 'paused')

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Buscando dados do Mercado Livre...</h2>
                    <p className="text-gray-500 mt-2">Aguarde enquanto carregamos seus produtos e vendas</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mercado Livre - Dados Reais</h1>
                    {user && (
                        <p className="text-gray-500">Vendedor: {user.nickname} (ID: {user.id})</p>
                    )}
                </div>
                <button
                    onClick={fetchMLData}
                    className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                    🔄 Atualizar
                </button>
            </header>

            {/* Estatísticas */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Produtos</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Ativos</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.activeProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Pausados</h3>
                        <p className="text-2xl font-bold text-orange-600 mt-2">{stats.pausedProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Vendas</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalSales}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
                        <p className="text-xl font-bold text-green-600 mt-2">
                            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Preço Médio</h3>
                        <p className="text-xl font-bold text-gray-900 mt-2">
                            R$ {stats.avgPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Média Vendidos</h3>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                            {stats.avgSoldQuantity.toFixed(0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Análise com IA */}
            {analysis && (
                <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                        🤖 Análise com IA Gemini - Mercado Livre
                    </h3>
                    <div className="prose prose-sm max-w-none text-yellow-900 whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                            ? 'bg-yellow-400 text-gray-900 font-semibold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Todos ({products.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active'
                            ? 'bg-green-600 text-white font-semibold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Ativos ({products.filter(p => p.status === 'active').length})
                </button>
                <button
                    onClick={() => setFilter('paused')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'paused'
                            ? 'bg-orange-600 text-white font-semibold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Pausados ({products.filter(p => p.status === 'paused').length})
                </button>
            </div>

            {/* Grid de Produtos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 relative">
                            <img
                                src={product.thumbnail.replace('-I.jpg', '-O.jpg')}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = product.thumbnail
                                }}
                            />
                            <div className="absolute top-2 right-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-orange-100 text-orange-800'
                                    }`}>
                                    {product.status === 'active' ? 'Ativo' : 'Pausado'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xl font-bold text-yellow-600">
                                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
                                {product.title}
                            </h3>

                            <div className="flex justify-between text-xs text-gray-600 mb-3">
                                <span>Vendidos: <strong className="text-green-600">{product.sold_quantity}</strong></span>
                                <span>Disponível: <strong className="text-blue-600">{product.available_quantity}</strong></span>
                            </div>

                            <a
                                href={product.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700"
                            >
                                Ver no ML
                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum produto encontrado neste filtro.</p>
                </div>
            )}

            {/* Info Box */}
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Dados Reais do Mercado Livre</h3>
                        <p className="mt-1 text-sm text-yellow-700">
                            Estes são os produtos e vendas REAIS da sua loja no Mercado Livre.
                            Os dados são atualizados em tempo real diretamente da API oficial do Mercado Livre.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
