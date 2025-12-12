'use client'

import { useState, useEffect } from 'react'

interface RealProduct {
    title: string
    link: string
    snippet: string
    category?: string
    estimatedPrice?: number
}

export default function RealProductsPage() {
    const [products, setProducts] = useState<RealProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        fetchRealProducts()
    }, [])

    const fetchRealProducts = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/real-data/fetch')
            const result = await response.json()

            if (result.success) {
                setProducts(result.data.products)
                setStats(result.data.stats)
                console.log(`✅ ${result.data.products.length} produtos reais carregados!`)
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter)

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Buscando produtos reais...</h2>
                    <p className="text-gray-500 mt-2">Aguarde enquanto buscamos no site</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Produtos Reais do Site</h1>
                    <p className="text-gray-500">tocadaoncamodas.com.br</p>
                </div>
                <button
                    onClick={fetchRealProducts}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    🔄 Atualizar
                </button>
            </header>

            {/* Estatísticas */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total de Produtos</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Categorias</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.categories.length}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Preço Médio</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            R$ {stats.avgPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Faixa de Preço</h3>
                        <p className="text-sm font-bold text-gray-900 mt-2">
                            R$ {stats.priceRange.min.toFixed(2)} - R$ {stats.priceRange.max.toFixed(2)}
                        </p>
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
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setFilter(category!)}
                        className={`px-4 py-2 rounded-lg transition-colors capitalize ${filter === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category} ({products.filter(p => p.category === category).length})
                    </button>
                ))}
            </div>

            {/* Lista de Produtos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product, index) => (
                    <div key={index} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                {product.category || 'Geral'}
                            </span>
                            {product.estimatedPrice && (
                                <span className="text-lg font-bold text-purple-600">
                                    R$ {product.estimatedPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {product.snippet}
                        </p>

                        <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                            Ver no site
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                </div>
            )}
        </div>
    )
}
