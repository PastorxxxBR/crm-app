'use client'

import { useState, useEffect } from 'react'

interface MerchantProduct {
    id: string
    title: string
    description: string
    link: string
    imageLink: string
    price: {
        value: number
        currency: string
    }
    availability: string
    condition: string
    brand?: string
    productType?: string
}

export default function GoogleShoppingPage() {
    const [products, setProducts] = useState<MerchantProduct[]>([])
    const [stats, setStats] = useState<any>(null)
    const [analysis, setAnalysis] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        fetchMerchantData()
    }, [])

    const fetchMerchantData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/merchant/products')
            const result = await response.json()

            if (result.success) {
                setProducts(result.data.products)
                setStats(result.data.stats)
                setAnalysis(result.data.analysis)
                console.log(`✅ ${result.message}`)
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = filter === 'all'
        ? products
        : filter === 'in_stock'
            ? products.filter(p => p.availability === 'in stock')
            : products.filter(p => p.productType === filter)

    const categories = [...new Set(products.map(p => p.productType).filter(Boolean))]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Buscando produtos do Google Shopping...</h2>
                    <p className="text-gray-500 mt-2">Merchant Center ID: 699242218</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Google Shopping - Produtos Reais</h1>
                    <p className="text-gray-500">Merchant Center ID: 699242218</p>
                </div>
                <button
                    onClick={fetchMerchantData}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    🔄 Atualizar
                </button>
            </header>

            {/* Estatísticas */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total de Produtos</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Produtos Ativos</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.activeProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
                        <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Preço Médio</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            R$ {stats.avgPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Categorias</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.categories.length}</p>
                    </div>
                </div>
            )}

            {/* Análise com IA */}
            {analysis && (
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">
                        🤖 Análise com IA Gemini
                    </h3>
                    <div className="prose prose-sm max-w-none text-purple-800 whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Todos ({products.length})
                </button>
                <button
                    onClick={() => setFilter('in_stock')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'in_stock'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Em Estoque ({products.filter(p => p.availability === 'in stock').length})
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category!)}
                        className={`px-4 py-2 rounded-lg transition-colors capitalize ${filter === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category} ({products.filter(p => p.productType === category).length})
                    </button>
                ))}
            </div>

            {/* Grid de Produtos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {product.imageLink && (
                            <div className="aspect-square bg-gray-100 relative">
                                <img
                                    src={product.imageLink}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Sem+Imagem'
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.availability === 'in stock'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.availability === 'in stock' ? 'Em Estoque' : 'Indisponível'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                {product.productType && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                        {product.productType}
                                    </span>
                                )}
                                <span className="text-xl font-bold text-purple-600">
                                    R$ {product.price.value.toFixed(2)}
                                </span>
                            </div>

                            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                {product.title}
                            </h3>

                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                {product.description}
                            </p>

                            {product.brand && (
                                <p className="text-xs text-gray-500 mb-3">
                                    Marca: <span className="font-medium">{product.brand}</span>
                                </p>
                            )}

                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                                Ver produto
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
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Produtos do Google Merchant Center</h3>
                        <p className="mt-1 text-sm text-blue-700">
                            Estes são os produtos REAIS cadastrados no Google Merchant Center (ID: 699242218) e que aparecem no Google Shopping.
                            Os dados são atualizados em tempo real diretamente da API do Google.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
