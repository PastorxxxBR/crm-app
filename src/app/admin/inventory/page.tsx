'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react'

interface Product {
    id: string
    sku: string
    name: string
    stock_quantity: number
    velocity: number
    category: string
    price: number
}

interface Alert {
    id: string
    product_id: string
    alert_type: string
    current_quantity: number
    suggested_action: string
    product: {
        sku: string
        name: string
        price: number
    }
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [filter, setFilter] = useState<'all' | 'low_stock' | 'stockout' | 'slow_mover'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // TODO: Implement real API calls
            // Mock data
            setProducts([
                {
                    id: '1',
                    sku: 'BLS-001',
                    name: 'Blusa Cropped Linho',
                    stock_quantity: 5,
                    velocity: 2.5,
                    category: 'Blusas',
                    price: 89.90
                },
                {
                    id: '2',
                    sku: 'CALC-002',
                    name: 'Calça Wide Leg',
                    stock_quantity: 0,
                    velocity: 1.8,
                    category: 'Calças',
                    price: 149.90
                }
            ])

            setAlerts([
                {
                    id: '1',
                    product_id: '1',
                    alert_type: 'low_stock',
                    current_quantity: 5,
                    suggested_action: '⚠️ Estoque baixo! Restam apenas 2 dias. Considere repor.',
                    product: { sku: 'BLS-001', name: 'Blusa Cropped Linho', price: 89.90 }
                },
                {
                    id: '2',
                    product_id: '2',
                    alert_type: 'stockout',
                    current_quantity: 0,
                    suggested_action: '🚨 URGENTE: Produto esgotado! Repor imediatamente.',
                    product: { sku: 'CALC-002', name: 'Calça Wide Leg', price: 149.90 }
                }
            ])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'stockout': return 'bg-red-100 text-red-800 border-red-200'
            case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'slow_mover': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'excess': return 'bg-purple-100 text-purple-800 border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStockStatus = (quantity: number, velocity: number) => {
        if (quantity === 0) return { label: 'Esgotado', color: 'text-red-600' }
        const days = velocity > 0 ? quantity / velocity : 999
        if (days < 7) return { label: `${Math.floor(days)} dias`, color: 'text-yellow-600' }
        if (days > 90) return { label: 'Parado', color: 'text-blue-600' }
        return { label: `${Math.floor(days)} dias`, color: 'text-green-600' }
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
                    <p className="text-gray-500">Monitore e gerencie seu inventário</p>
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Analisar Inventário
                </button>
            </header>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card
                    title="Total de Produtos"
                    value="150"
                    trend="12 categorias"
                />
                <Card
                    title="Estoque Baixo"
                    value="12"
                    trend="Requer atenção"
                />
                <Card
                    title="Esgotados"
                    value="3"
                    trend="Repor urgente"
                />
                <Card
                    title="Valor Total"
                    value="R$ 45.230"
                    trend="Em estoque"
                />
            </div>

            {/* Alerts */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Alertas de Estoque</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilter('stockout')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'stockout' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                        >
                            Esgotados
                        </button>
                        <button
                            onClick={() => setFilter('low_stock')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'low_stock' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
                        >
                            Baixo
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`border rounded-lg p-4 ${getAlertColor(alert.alert_type)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-5 h-5" />
                                        <h4 className="font-medium">{alert.product.name}</h4>
                                        <span className="text-xs bg-white/50 px-2 py-1 rounded">
                                            {alert.product.sku}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2">{alert.suggested_action}</p>
                                    <div className="text-xs">
                                        Estoque atual: <strong>{alert.current_quantity} unidades</strong>
                                    </div>
                                </div>
                                <button className="ml-4 px-3 py-1 bg-white text-gray-900 rounded hover:bg-gray-50 text-sm font-medium">
                                    Repor
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Produtos</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Velocidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => {
                                const status = getStockStatus(product.stock_quantity, product.velocity)
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{product.sku}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`font-medium ${product.stock_quantity === 0 ? 'text-red-600' : product.stock_quantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {product.velocity.toFixed(1)} un/dia
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            R$ {product.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
