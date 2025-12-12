'use client'

import { Card } from '@/components/admin/Card'
import { Users, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { BarChart, LineChart, PieChart } from '@/components/charts'

// Mock data for customers
const customers = [
    {
        id: '#CUST-001',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '(11) 99999-9999',
        totalSpent: 'R$ 1.250,00',
        orders: 5,
        status: 'Ativo',
        lastOrder: '10/12/2025'
    },
    {
        id: '#CUST-002',
        name: 'Carlos Souza',
        email: 'carlos.s@email.com',
        phone: '(11) 98888-8888',
        totalSpent: 'R$ 3.450,00',
        orders: 12,
        status: 'VIP',
        lastOrder: '09/12/2025'
    },
    {
        id: '#CUST-003',
        name: 'Mariana Oliveira',
        email: 'mari.oli@email.com',
        phone: '(21) 97777-7777',
        totalSpent: 'R$ 890,90',
        orders: 3,
        status: 'Ativo',
        lastOrder: '05/12/2025'
    },
    {
        id: '#CUST-004',
        name: 'Roberto Santos',
        email: 'beto.santos@email.com',
        phone: '(31) 96666-6666',
        totalSpent: 'R$ 450,00',
        orders: 2,
        status: 'Inativo',
        lastOrder: '20/11/2025'
    },
    {
        id: '#CUST-005',
        name: 'Fernanda Lima',
        email: 'fe.lima@email.com',
        phone: '(41) 95555-5555',
        totalSpent: 'R$ 2.100,00',
        orders: 8,
        status: 'Ativo',
        lastOrder: '08/12/2025'
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'VIP':
            return 'bg-purple-100 text-purple-700'
        case 'Ativo':
            return 'bg-green-100 text-green-700'
        case 'Inativo':
            return 'bg-gray-100 text-gray-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-500">Gerencie sua base de clientes</p>
            </header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Total de Clientes"
                    value="2.350"
                    trend="+180 novos este mês"
                />
                <Card
                    title="Clientes Ativos"
                    value="1.890"
                    trend="80% da base"
                />
                <Card
                    title="Novos (Mês)"
                    value="180"
                    trend="+12% vs mês passado"
                />
                <Card
                    title="Ticket Médio"
                    value="R$ 320,00"
                    trend="+8% este mês"
                />
            </div>

            {/* Customer Analytics Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Segmentação de Clientes</h3>
                    <PieChart
                        data={[
                            { name: 'VIP', value: 280 },
                            { name: 'Ativo', value: 1610 },
                            { name: 'Inativo', value: 460 },
                        ]}
                        height={280}
                        colors={['#8b5cf6', '#10b981', '#6b7280']}
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Crescimento Mensal</h3>
                    <LineChart
                        data={[
                            { name: 'Jan', value: 1850 },
                            { name: 'Fev', value: 1980 },
                            { name: 'Mar', value: 2150 },
                            { name: 'Abr', value: 2280 },
                            { name: 'Mai', value: 2350 },
                        ]}
                        height={280}
                        color="#10b981"
                    />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Top Clientes por Valor</h3>
                    <BarChart
                        data={[
                            { name: 'Ana S.', value: 3450 },
                            { name: 'Carlos', value: 2890 },
                            { name: 'Mariana', value: 2340 },
                            { name: 'Roberto', value: 1950 },
                            { name: 'Fernanda', value: 1560 },
                        ]}
                        height={280}
                        color="#3b82f6"
                    />
                </div>
            </div>

            {/* Customers List */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Lista de Clientes</h3>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors">
                        Adicionar Cliente
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">Contato</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Total Gasto</th>
                                <th className="px-6 py-4 font-medium">Pedidos</th>
                                <th className="px-6 py-4 font-medium text-right">Última Compra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{customer.name}</div>
                                        <div className="text-xs text-gray-500">{customer.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{customer.email}</div>
                                        <div className="text-xs text-gray-500">{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(customer.status)}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{customer.totalSpent}</td>
                                    <td className="px-6 py-4 text-gray-500">{customer.orders} pedidos</td>
                                    <td className="px-6 py-4 text-right text-gray-500">{customer.lastOrder}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
