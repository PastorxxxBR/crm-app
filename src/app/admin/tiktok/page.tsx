'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Music, Package, ShoppingBag, TrendingUp, Users, RefreshCw, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TikTokPage() {
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Buscar produtos
            const productsRes = await fetch('/api/tiktok/products')
            const productsData = await productsRes.json()

            if (productsData.success) {
                setProducts(productsData.products || [])
                setStats(prev => ({ ...prev, totalProducts: productsData.products?.length || 0 }))
            }

            // Buscar pedidos
            const ordersRes = await fetch('/api/tiktok/orders')
            const ordersData = await ordersRes.json()

            if (ordersData.success) {
                setOrders(ordersData.orders || [])
                setStats(prev => ({
                    ...prev,
                    totalOrders: ordersData.orders?.length || 0,
                    pendingOrders: ordersData.orders?.filter((o: any) => o.status === 'pending').length || 0
                }))
            }

            toast.success('Dados atualizados!')
        } catch (error) {
            console.error('Erro ao buscar dados:', error)
            toast.error('Erro ao carregar dados do TikTok')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            {/* Header */}
            <div className="bg-black border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Music className="w-7 h-7 text-pink-500" />
                                    TikTok Shopping
                                </h1>
                                <p className="text-sm text-gray-400">Gerencie seus produtos e vendas no TikTok</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.totalProducts}</span>
                        </div>
                        <p className="text-pink-100 font-medium">Produtos Ativos</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingBag className="w-8 h-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.totalOrders}</span>
                        </div>
                        <p className="text-blue-100 font-medium">Total de Pedidos</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 opacity-80" />
                            <span className="text-3xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</span>
                        </div>
                        <p className="text-purple-100 font-medium">Receita Total</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.pendingOrders}</span>
                        </div>
                        <p className="text-orange-100 font-medium">Pedidos Pendentes</p>
                    </div>
                </div>

                {/* Configuração */}
                <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">⚙️ Configuração</h2>

                    <div className="space-y-4">
                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-3">📋 Credenciais Necessárias</h3>
                            <p className="text-gray-400 mb-4">
                                Para conectar com o TikTok Shopping, você precisa adicionar as seguintes credenciais no arquivo <code className="bg-gray-800 px-2 py-1 rounded text-pink-400">.env.local</code>:
                            </p>

                            <div className="bg-black rounded-lg p-4 font-mono text-sm text-gray-300 space-y-2">
                                <div>TIKTOK_APP_KEY=<span className="text-pink-400">sua_app_key</span></div>
                                <div>TIKTOK_APP_SECRET=<span className="text-pink-400">sua_app_secret</span></div>
                                <div>TIKTOK_ACCESS_TOKEN=<span className="text-pink-400">seu_access_token</span></div>
                                <div>TIKTOK_SHOP_ID=<span className="text-pink-400">seu_shop_id</span></div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                                <h4 className="text-blue-300 font-semibold mb-2">📍 Onde encontrar:</h4>
                                <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                                    <li>Acesse: <a href="https://seller-us.tiktok.com/" target="_blank" className="text-pink-400 hover:underline">TikTok Seller Center</a></li>
                                    <li>Vá em <strong>Settings</strong> → <strong>Open Platform</strong></li>
                                    <li>Copie as credenciais</li>
                                    <li>Cole no arquivo .env.local</li>
                                    <li>Reinicie o servidor</li>
                                </ol>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-3">🚀 Funcionalidades</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Sincronização de Produtos</h4>
                                        <p className="text-gray-400 text-sm">Envie produtos do CRM para o TikTok automaticamente</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ShoppingBag className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Gestão de Pedidos</h4>
                                        <p className="text-gray-400 text-sm">Receba e gerencie pedidos do TikTok</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Analytics</h4>
                                        <p className="text-gray-400 text-sm">Acompanhe vendas e performance</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <RefreshCw className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Automação</h4>
                                        <p className="text-gray-400 text-sm">Sincronização automática de estoque e preços</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documentação */}
                <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-2xl p-8 border border-pink-700/50">
                    <h2 className="text-2xl font-bold text-white mb-4">📚 Documentação Completa</h2>
                    <p className="text-gray-300 mb-6">
                        Confira o guia completo de integração com TikTok Shopping no arquivo <code className="bg-black px-2 py-1 rounded text-pink-400">TIKTOK_INTEGRATION.md</code>
                    </p>
                    <a
                        href="https://seller-us.tiktok.com/university/home"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Ver Documentação TikTok
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}
