'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package, CheckCircle, XCircle, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import type { StockAlert } from '@/lib/stock-alerts'

export default function StockAlertsPage() {
    const [alerts, setAlerts] = useState<StockAlert[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'out'>('all')

    useEffect(() => {
        loadAlerts()
        loadStats()
    }, [])

    const loadAlerts = async () => {
        try {
            const response = await fetch('/api/stock-alerts?active_only=true')
            const data = await response.json()

            if (data.success) {
                setAlerts(data.alerts)
            }
        } catch (error) {
            toast.error('Erro ao carregar alertas')
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch('/api/stock-alerts?stats=true')
            const data = await response.json()

            if (data.success) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas')
        }
    }

    const resolveAlert = async (alertId: string) => {
        try {
            const response = await fetch('/api/stock-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alert_id: alertId })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Alerta resolvido!')
                loadAlerts()
                loadStats()
            }
        } catch (error) {
            toast.error('Erro ao resolver alerta')
        }
    }

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true
        return alert.severity === filter
    })

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'out': return 'bg-red-100 text-red-700 border-red-200'
            case 'critical': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'out': return <XCircle className="w-5 h-5" />
            case 'critical': return <AlertTriangle className="w-5 h-5" />
            case 'low': return <TrendingDown className="w-5 h-5" />
            default: return <Package className="w-5 h-5" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando alertas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        Alertas de Estoque
                    </h1>
                    <p className="text-sm text-gray-600">Monitore produtos com estoque baixo</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Total de Alertas</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total_alerts}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                            <p className="text-sm text-red-700 mb-1">Esgotados</p>
                            <p className="text-3xl font-bold text-red-600">{stats.out_of_stock}</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                            <p className="text-sm text-orange-700 mb-1">Críticos</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.critical_alerts}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                            <p className="text-sm text-yellow-700 mb-1">Baixos</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.low_alerts}</p>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos ({alerts.length})
                        </button>
                        <button
                            onClick={() => setFilter('out')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'out'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Esgotados
                        </button>
                        <button
                            onClick={() => setFilter('critical')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'critical'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Críticos
                        </button>
                        <button
                            onClick={() => setFilter('low')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'low'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Baixos
                        </button>
                    </div>
                </div>

                {/* Lista de Alertas */}
                <div className="space-y-3">
                    {filteredAlerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`rounded-xl border-2 p-4 ${getSeverityColor(alert.severity)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    {getSeverityIcon(alert.severity)}
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">{alert.message}</h3>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span>Produto: {alert.product_name}</span>
                                            <span>•</span>
                                            <span>Loja: {alert.store_name}</span>
                                            <span>•</span>
                                            <span>Estoque: {alert.current_stock} / Mínimo: {alert.min_stock}</span>
                                        </div>
                                        <p className="text-xs mt-2 opacity-75">
                                            {new Date(alert.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => resolveAlert(alert.id)}
                                    className="ml-4 bg-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Resolver
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredAlerts.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum alerta</h3>
                            <p className="text-gray-600">Todos os produtos estão com estoque adequado!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
