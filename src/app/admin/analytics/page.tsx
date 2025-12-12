'use client'

import { Card } from '@/components/admin/Card'
import { BarChart, LineChart, PieChart, GaugeChart, AreaChart } from '@/components/charts'
import { TrendingUp, Users, ShoppingCart, MessageSquare } from 'lucide-react'

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-500">Análises detalhadas e visualizações de dados</p>
            </header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Taxa de Conversão"
                    value="12.5%"
                    trend="+2.3% vs mês passado"
                />
                <Card
                    title="Ticket Médio"
                    value="R$ 320,00"
                    trend="+8% este mês"
                />
                <Card
                    title="Tempo Médio de Resposta"
                    value="4.2 min"
                    trend="-12% este mês"
                />
                <Card
                    title="Satisfação (NPS)"
                    value="92"
                    trend="+5 pontos"
                />
            </div>

            {/* Main Analytics Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Receita Semanal</h3>
                    <AreaChart
                        data={[
                            { name: 'Seg', value: 12400 },
                            { name: 'Ter', value: 15300 },
                            { name: 'Qua', value: 13800 },
                            { name: 'Qui', value: 18100 },
                            { name: 'Sex', value: 21200 },
                            { name: 'Sáb', value: 25500 },
                            { name: 'Dom', value: 9900 },
                        ]}
                        height={300}
                        color="#8b5cf6"
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Produtos Mais Vendidos</h3>
                    <BarChart
                        data={[
                            { name: 'Vestido A', value: 156 },
                            { name: 'Blusa B', value: 134 },
                            { name: 'Calça C', value: 98 },
                            { name: 'Saia D', value: 87 },
                            { name: 'Casaco E', value: 72 },
                        ]}
                        height={300}
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Secondary Analytics Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Canais de Venda</h3>
                    <PieChart
                        data={[
                            { name: 'Online', value: 620 },
                            { name: 'WhatsApp', value: 380 },
                            { name: 'Loja Física', value: 210 },
                            { name: 'Instagram', value: 140 },
                        ]}
                        height={280}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Meta de Vendas</h3>
                    <GaugeChart
                        value={78500}
                        max={100000}
                        title="Meta Mensal"
                        height={280}
                        color="#3b82f6"
                        unit=""
                    />
                    <p className="text-center text-sm text-gray-500 mt-2">
                        R$ 78.500 de R$ 100.000
                    </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Taxa de Retenção</h3>
                    <GaugeChart
                        value={87}
                        max={100}
                        title="Clientes Retidos"
                        height={280}
                        color="#10b981"
                    />
                </div>
            </div>

            {/* Customer Behavior Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Horários de Pico</h3>
                    <LineChart
                        data={[
                            { name: '08h', value: 12 },
                            { name: '10h', value: 28 },
                            { name: '12h', value: 45 },
                            { name: '14h', value: 52 },
                            { name: '16h', value: 38 },
                            { name: '18h', value: 64 },
                            { name: '20h', value: 42 },
                        ]}
                        height={300}
                        color="#f59e0b"
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Categorias Populares</h3>
                    <BarChart
                        data={[
                            { name: 'Vestidos', value: 450 },
                            { name: 'Blusas', value: 380 },
                            { name: 'Calças', value: 320 },
                            { name: 'Acessórios', value: 280 },
                            { name: 'Sapatos', value: 210 },
                        ]}
                        height={300}
                        color="#ec4899"
                    />
                </div>
            </div>
        </div>
    )
}
