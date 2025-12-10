'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'

interface LoyaltyStats {
    total_customers: number
    bronze_count: number
    silver_count: number
    gold_count: number
    platinum_count: number
    total_points_issued: number
    total_points_redeemed: number
}

export default function LoyaltyPage() {
    const [stats, setStats] = useState<LoyaltyStats>({
        total_customers: 0,
        bronze_count: 0,
        silver_count: 0,
        gold_count: 0,
        platinum_count: 0,
        total_points_issued: 0,
        total_points_redeemed: 0
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        // TODO: Implement API call
        // Mock data
        setStats({
            total_customers: 2350,
            bronze_count: 1800,
            silver_count: 400,
            gold_count: 120,
            platinum_count: 30,
            total_points_issued: 125000,
            total_points_redeemed: 45000
        })
    }

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return 'from-orange-400 to-orange-600'
            case 'silver': return 'from-gray-300 to-gray-500'
            case 'gold': return 'from-yellow-400 to-yellow-600'
            case 'platinum': return 'from-purple-400 to-purple-600'
            default: return 'from-gray-400 to-gray-600'
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Programa de Fidelidade</h1>
                <p className="text-gray-500">Gerencie pontos e recompensas dos clientes</p>
            </header>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card
                    title="Total de Clientes"
                    value={stats.total_customers.toLocaleString()}
                    trend="No programa de fidelidade"
                />
                <Card
                    title="Pontos Emitidos"
                    value={stats.total_points_issued.toLocaleString()}
                    trend="Últimos 30 dias"
                />
                <Card
                    title="Pontos Resgatados"
                    value={stats.total_points_redeemed.toLocaleString()}
                    trend={`${((stats.total_points_redeemed / stats.total_points_issued) * 100).toFixed(1)}% de uso`}
                />
                <Card
                    title="Clientes VIP"
                    value={stats.platinum_count.toString()}
                    trend="Tier Platinum"
                />
            </div>

            {/* Tier Distribution */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Distribuição por Tier</h3>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { tier: 'bronze', count: stats.bronze_count, icon: '🥉' },
                        { tier: 'silver', count: stats.silver_count, icon: '🥈' },
                        { tier: 'gold', count: stats.gold_count, icon: '🥇' },
                        { tier: 'platinum', count: stats.platinum_count, icon: '💎' }
                    ].map(({ tier, count, icon }) => (
                        <div
                            key={tier}
                            className={`bg-gradient-to-br ${getTierColor(tier)} rounded-lg p-6 text-white`}
                        >
                            <div className="text-3xl mb-2">{icon}</div>
                            <div className="text-2xl font-bold mb-1">{count}</div>
                            <div className="text-sm opacity-90 capitalize">{tier}</div>
                            <div className="text-xs opacity-75 mt-1">
                                {((count / stats.total_customers) * 100).toFixed(1)}% do total
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rewards Catalog */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Catálogo de Recompensas</h3>
                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                        Adicionar Recompensa
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        { name: '5% de Desconto', points: 100, type: 'discount', value: 5 },
                        { name: '10% de Desconto', points: 250, type: 'discount', value: 10 },
                        { name: 'Frete Grátis', points: 200, type: 'free_shipping', value: 0 },
                        { name: '15% de Desconto', points: 500, type: 'discount', value: 15 },
                        { name: 'Produto Grátis R$ 50', points: 800, type: 'free_product', value: 50 },
                        { name: 'Super Desconto 30%', points: 2500, type: 'discount', value: 30 }
                    ].map((reward, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{reward.name}</h4>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {reward.type}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                                {reward.points} pts
                            </div>
                            <div className="text-sm text-gray-600">
                                {reward.type === 'discount' && `${reward.value}% OFF`}
                                {reward.type === 'free_shipping' && 'Frete grátis'}
                                {reward.type === 'free_product' && `Até R$ ${reward.value}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>

                <div className="space-y-3">
                    {[
                        { customer: 'Maria Silva', action: 'ganhou 150 pontos', detail: 'Compra de R$ 150', time: '5 min atrás' },
                        { customer: 'João Santos', action: 'resgatou 10% OFF', detail: '250 pontos', time: '1 hora atrás' },
                        { customer: 'Ana Costa', action: 'subiu para Gold', detail: '2.000 pontos lifetime', time: '2 horas atrás' },
                        { customer: 'Pedro Lima', action: 'ganhou bônus de aniversário', detail: '+100 pontos', time: '3 horas atrás' }
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <div className="font-medium text-gray-900">{activity.customer}</div>
                                <div className="text-sm text-gray-600">{activity.action} • {activity.detail}</div>
                            </div>
                            <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
