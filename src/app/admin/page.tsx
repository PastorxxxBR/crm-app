'use client'

import { Card } from '@/components/admin/Card'
import { Overview } from '@/components/admin/Overview'
import { RecentSales } from '@/components/admin/RecentSales'
import { MarketingInsights } from '@/components/admin/MarketingInsights'

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Visão geral da sua loja</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Receita Total (Mês)" value="R$ 45.231,89" trend="+20.1% vs mês passado" />
                <Card title="Novos Pedidos" value="+573" trend="+12% vs mês passado" />
                <Card title="Vendas Hoje" value="R$ 3.420,00" trend="14 pedidos" />
                <Card title="Clientes Ativos" value="2.350" trend="+180 novos este mês" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Receita nos Últimos 30 Dias</h3>
                        <Overview />
                    </div>
                </div>

                <div className="col-span-3 space-y-4">
                    {/* Marketing Insights Widget */}
                    <MarketingInsights />

                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">Vendas Recentes</h3>
                        <RecentSales />
                    </div>
                </div>
            </div>
        </div>
    )
}
