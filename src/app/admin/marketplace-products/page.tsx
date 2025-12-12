'use client'

import { useState } from 'react'
import { Card } from '@/components/admin/Card'
import { BarChart, PieChart, LineChart, AreaChart } from '@/components/charts'
import { Store, DollarSign, TrendingUp, Package, X, Plus } from 'lucide-react'

// Mock data - Depois integramos com Supabase
const initialMockProducts = [
    {
        id: '1',
        name: 'Camiseta Básica Preta',
        sku: 'CAM-001-P',
        category: 'masculino' as const,
        costPrice: 25.00,
        marketplaces: [
            { id: 'mercadolivre', name: 'Me', price: 49.90, stock: 45, active: true },
            { id: 'shopee', name: 'Sh', price: 47.90, stock: 50, active: true },
            { id: 'amazon', name: 'Am', price: 52.90, stock: 30, active: true },
        ],
    },
    {
        id: '2',
        name: 'Vestido Floral Rosa',
        sku: 'VES-002-R',
        category: 'feminino' as const,
        costPrice: 45.00,
        marketplaces: [
            { id: 'mercadolivre', name: 'Me', price: 89.90, stock: 20, active: true },
            { id: 'dafiti', name: 'Da', price: 95.00, stock: 15, active: true },
            { id: 'magalu', name: 'Ma', price: 92.90, stock: 25, active: true },
        ],
    },
]

const marketplaceNames: Record<string, string> = {
    mercadolivre: 'Mercado Livre',
    shopee: 'Shopee',
    amazon: 'Amazon',
    magalu: 'Magazine Luiza',
    dafiti: 'Dafiti',
    netshoes: 'Netshoes',
}

export default function MarketplaceProductsPage() {
    const [products, setProducts] = useState(initialMockProducts)
    const [selectedProduct, setSelectedProduct] = useState(products[0])
    const [showAddModal, setShowAddModal] = useState(false)
    const [newProduct, setNewProduct] = useState({
        name: '',
        sku: '',
        category: 'masculino' as 'masculino' | 'feminino' | 'infantil',
        costPrice: 0,
    })

    // Calcula métricas
    const totalProducts = products.length
    const totalMarketplaces = new Set(
        products.flatMap(p => p.marketplaces.map(m => m.id))
    ).size
    const avgPrice = products.reduce(
        (sum, p) => sum + p.marketplaces.reduce((s, m) => s + m.price, 0) / p.marketplaces.length,
        0
    ) / products.length
    const totalStock = products.reduce(
        (sum, p) => sum + p.marketplaces.reduce((s, m) => s + m.stock, 0),
        0
    )

    // Performance por marketplace
    const marketplacePerformance = products.flatMap(p =>
        p.marketplaces.map(m => ({
            marketplace: marketplaceNames[m.id] || m.id,
            revenue: m.price * m.stock,
            profit: (m.price - p.costPrice) * m.stock,
        }))
    ).reduce((acc, curr) => {
        const existing = acc.find(a => a.marketplace === curr.marketplace)
        if (existing) {
            existing.revenue += curr.revenue
            existing.profit += curr.profit
        } else {
            acc.push(curr)
        }
        return acc
    }, [] as Array<{ marketplace: string, revenue: number, profit: number }>)

    function handleAddProduct() {
        if (!newProduct.name || !newProduct.sku) {
            alert('Preencha nome e SKU!')
            return
        }

        const product = {
            id: (products.length + 1).toString(),
            ...newProduct,
            marketplaces: [
                { id: 'mercadolivre', name: 'Me', price: newProduct.costPrice * 2, stock: 10, active: true }
            ],
        }

        setProducts([...products, product])
        setShowAddModal(false)
        setNewProduct({ name: '', sku: '', category: 'masculino', costPrice: 0 })
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Produtos nos Marketplaces</h1>
                <p className="text-gray-500">Gerencie seus produtos em todas as plataformas</p>
            </header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Total de Produtos"
                    value={totalProducts.toString()}
                    trend="Ativos em marketplaces"
                />
                <Card
                    title="Marketplaces Ativos"
                    value={totalMarketplaces.toString()}
                    trend="13 disponíveis"
                />
                <Card
                    title="Preço Médio"
                    value={`R$ ${avgPrice.toFixed(2)}`}
                    trend="Todos os produtos"
                />
                <Card
                    title="Estoque Total"
                    value={totalStock.toString()}
                    trend="Todos os marketplaces"
                />
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Seus Produtos</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Produto
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Produto</th>
                                <th className="px-6 py-4 font-medium">SKU</th>
                                <th className="px-6 py-4 font-medium">Categoria</th>
                                <th className="px-6 py-4 font-medium">Custo</th>
                                <th className="px-6 py-4 font-medium">Marketplaces</th>
                                <th className="px-6 py-4 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-700">{product.sku}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 capitalize">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">R$ {product.costPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {product.marketplaces.map((m) => (
                                                <span
                                                    key={m.id}
                                                    className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                                                    title={marketplaceNames[m.id]}
                                                >
                                                    {m.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
                                        >
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Details */}
            {selectedProduct && (
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Detalhes: {selectedProduct.name}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Marketplaces Table */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Onde está vendendo:</h4>
                            <div className="space-y-2">
                                {selectedProduct.marketplaces.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{marketplaceNames[m.id]}</p>
                                            <p className="text-sm text-gray-500">Estoque: {m.stock}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">R$ {m.price.toFixed(2)}</p>
                                            <p className="text-xs text-green-600">
                                                +{(((m.price - selectedProduct.costPrice) / m.price) * 100).toFixed(0)}% margem
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Chart */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Comparação de Preços:</h4>
                            <BarChart
                                data={selectedProduct.marketplaces.map(m => ({
                                    name: marketplaceNames[m.id] || m.id,
                                    value: m.price,
                                }))}
                                height={250}
                                color="#10b981"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Receita por Marketplace</h3>
                    <BarChart
                        data={marketplacePerformance.map(m => ({
                            name: m.marketplace,
                            value: m.revenue,
                        }))}
                        height={280}
                        color="#3b82f6"
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Lucro por Marketplace</h3>
                    <BarChart
                        data={marketplacePerformance
                            .sort((a, b) => b.profit - a.profit)
                            .map(m => ({
                                name: m.marketplace,
                                value: m.profit,
                            }))}
                        height={280}
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Marketplace Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Distribuição por Marketplace</h3>
                    <PieChart
                        data={marketplacePerformance.map(m => ({
                            name: m.marketplace,
                            value: m.revenue,
                        }))}
                        height={280}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Crescimento de Estoque</h3>
                    <LineChart
                        data={[
                            { name: 'Jan', value: 120 },
                            { name: 'Fev', value: 145 },
                            { name: 'Mar', value: 165 },
                            { name: 'Abr', value: 180 },
                            { name: 'Mai', value: totalStock },
                        ]}
                        height={280}
                        color="#8b5cf6"
                    />
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Adicionar Novo Produto</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Produto
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="Ex: Camiseta Básica Branca"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.sku}
                                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="Ex: CAM-003-B"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoria
                                </label>
                                <select
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="infantil">Infantil</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preço de Custo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                                    <input
                                        type="number"
                                        value={newProduct.costPrice}
                                        onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900">13 Marketplaces Disponíveis</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Mercado Livre, Shopee, Amazon, Magazine Luiza, Americanas, Casas Bahia,
                            Carrefour, Netshoes, Dafiti, Centauro, Zattini, Shein e mais!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
