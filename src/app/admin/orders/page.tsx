'use client'

import { useState } from 'react'
import { Card } from '@/components/admin/Card'
import { BarChart, LineChart, PieChart } from '@/components/charts'
import { ShoppingBag, Clock, CheckCircle, Truck, FileText, Download, Upload, MapPin, User, CreditCard, Building2 } from 'lucide-react'

// Mock data completo para pedidos
const mockOrders = [
    {
        id: '#ORD-001',
        customer: {
            name: 'Ana Silva',
            cpf: '123.456.789-00',
            email: 'ana.silva@email.com',
            phone: '(11) 98765-4321',
        },
        address: {
            street: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234-567',
        },
        marketplace: 'mercadolivre',
        marketplaceName: 'Mercado Livre',
        orderDate: '2025-12-10T14:30:00',
        status: 'Pago',
        paymentMethod: 'Pix',
        items: [
            { name: 'Camiseta Básica', quantity: 2, price: 49.90 },
            { name: 'Calça Jeans', quantity: 1, price: 129.90 },
        ],
        subtotal: 229.70,
        shipping: 20.30,
        total: 250.00,
        tracking: 'BR123456789ML',
        invoiceUrl: '/invoices/001.xml',
    },
    {
        id: '#ORD-002',
        customer: {
            name: 'Carlos Souza',
            cpf: '987.654.321-00',
            email: 'carlos@email.com',
            phone: '(21) 91234-5678',
        },
        address: {
            street: 'Av. Paulista, 1000',
            city: 'Rio de Janeiro',
            state: 'RJ',
            cep: '20000-000',
        },
        marketplace: 'shopee',
        marketplaceName: 'Shopee',
        orderDate: '2025-12-09T10:15:00',
        status: 'Pendente',
        paymentMethod: 'Boleto',
        items: [
            { name: 'Vestido Floral', quantity: 1, price: 89.90 },
        ],
        subtotal: 89.90,
        shipping: 15.60,
        total: 105.50,
        tracking: null,
        invoiceUrl: null,
    },
    {
        id: '#ORD-003',
        customer: {
            name: 'Mariana Oliveira',
            cpf: '456.789.123-00',
            email: 'mari@email.com',
            phone: '(31) 99876-5432',
        },
        address: {
            street: 'Rua XV de Novembro, 500',
            city: 'Belo Horizonte',
            state: 'MG',
            cep: '30123-456',
        },
        marketplace: 'amazon',
        marketplaceName: 'Amazon',
        orderDate: '2025-12-08T16:45:00',
        status: 'Enviado',
        paymentMethod: 'Cartão de Crédito',
        items: [
            { name: 'Conjunto Infantil', quantity: 2, price: 79.90 },
            { name: 'Blusa Social', quantity: 1, price: 149.90 },
        ],
        subtotal: 309.70,
        shipping: 0,
        total: 309.70,
        tracking: 'AMZ987654321BR',
        invoiceUrl: '/invoices/003.xml',
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pago': return 'bg-green-100 text-green-700'
        case 'Pendente': return 'bg-yellow-100 text-yellow-700'
        case 'Enviado': return 'bg-blue-100 text-blue-700'
        case 'Entregue': return 'bg-purple-100 text-purple-700'
        case 'Cancelado': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

export default function OrdersPage() {
    const [orders] = useState(mockOrders)
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)
    const [showImportModal, setShowImportModal] = useState(false)

    // Metrics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const avgTicket = totalRevenue / totalOrders
    const pendingOrders = orders.filter(o => o.status === 'Pendente').length

    // Orders by marketplace
    const ordersByMarketplace = orders.reduce((acc, order) => {
        const existing = acc.find(a => a.name === order.marketplaceName)
        if (existing) {
            existing.value += 1
        } else {
            acc.push({ name: order.marketplaceName, value: 1 })
        }
        return acc
    }, [] as Array<{ name: string, value: number }>)

    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
        const existing = acc.find(a => a.name === order.status)
        if (existing) {
            existing.value += 1
        } else {
            acc.push({ name: order.status, value: 1 })
        }
        return acc
    }, [] as Array<{ name: string, value: number }>)

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
                    <p className="text-gray-500">Pedidos importados automaticamente dos marketplaces</p>
                </div>
                <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                    <Upload className="h-4 w-4" />
                    Importar Nota Fiscal
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    title="Total de Pedidos"
                    value={totalOrders.toString()}
                    trend="Todos os marketplaces"
                />
                <Card
                    title="Receita Total"
                    value={`R$ ${totalRevenue.toFixed(2)}`}
                    trend="+20.1% vs mês passado"
                />
                <Card
                    title="Pedidos Pendentes"
                    value={pendingOrders.toString()}
                    trend="Aguardando pagamento"
                />
                <Card
                    title="Ticket Médio"
                    value={`R$ ${avgTicket.toFixed(2)}`}
                    trend="+5% este mês"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Pedidos por Marketplace</h3>
                    <PieChart data={ordersByMarketplace} height={280} />
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Pedidos por Status</h3>
                    <BarChart data={ordersByStatus} height={280} color="#f59e0b" />
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">Todos os Pedidos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">Cliente</th>
                                <th className="px-6 py-4 font-medium">CPF</th>
                                <th className="px-6 py-4 font-medium">Cidade/Estado</th>
                                <th className="px-6 py-4 font-medium">Marketplace</th>
                                <th className="px-6 py-4 font-medium">Data</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Total</th>
                                <th className="px-6 py-4 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.customer.name}</p>
                                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.customer.cpf}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {order.address.city}/{order.address.state}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                            {order.marketplaceName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(order.orderDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        R$ {order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h3>
                                <p className="text-sm text-gray-500">
                                    Pedido em {new Date(selectedOrder.orderDate).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                    <User className="h-5 w-5" />
                                    Dados do Cliente
                                </div>
                                <div className="space-y-2 pl-7">
                                    <p className="text-gray-700"><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                                    <p className="text-gray-700"><strong>CPF:</strong> {selectedOrder.customer.cpf}</p>
                                    <p className="text-gray-700"><strong>Email:</strong> {selectedOrder.customer.email}</p>
                                    <p className="text-gray-700"><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                    <MapPin className="h-5 w-5" />
                                    Endereço de Entrega
                                </div>
                                <div className="space-y-2 pl-7">
                                    <p className="text-gray-700">{selectedOrder.address.street}</p>
                                    <p className="text-gray-700">{selectedOrder.address.city} - {selectedOrder.address.state}</p>
                                    <p className="text-gray-700"><strong>CEP:</strong> {selectedOrder.address.cep}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                    <Building2 className="h-5 w-5" />
                                    Informações do Pedido
                                </div>
                                <div className="space-y-2 pl-7">
                                    <p className="text-gray-700"><strong>Marketplace:</strong> {selectedOrder.marketplaceName}</p>
                                    <p className="text-gray-700"><strong>Status:</strong> {selectedOrder.status}</p>
                                    {selectedOrder.tracking && (
                                        <p className="text-gray-700"><strong>Rastreio:</strong> {selectedOrder.tracking}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
                                    <CreditCard className="h-5 w-5" />
                                    Pagamento
                                </div>
                                <div className="space-y-2 pl-7">
                                    <p className="text-gray-700"><strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                                    <p className="text-gray-700"><strong>Subtotal:</strong> R$ {selectedOrder.subtotal.toFixed(2)}</p>
                                    <p className="text-gray-700"><strong>Frete:</strong> R$ {selectedOrder.shipping.toFixed(2)}</p>
                                    <p className="text-lg font-bold text-gray-900"><strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Itens do Pedido</h4>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Produto</th>
                                            <th className="px-4 py-2 text-center font-medium text-gray-700">Qtd</th>
                                            <th className="px-4 py-2 text-right font-medium text-gray-700">Preço Unit.</th>
                                            <th className="px-4 py-2 text-right font-medium text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                <td className="px-4 py-2 text-right">R$ {item.price.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    R$ {(item.quantity * item.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex gap-3">
                            {selectedOrder.invoiceUrl && (
                                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Ver Nota Fiscal
                                </button>
                            )}
                            <button className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2">
                                <Download className="h-4 w-4" />
                                Baixar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Importar Nota Fiscal</h3>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Arraste o arquivo XML da nota fiscal ou
                                </p>
                                <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">
                                    Selecionar Arquivo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Aceita arquivos .xml de NF-e
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Automático:</strong> O sistema extrairá automaticamente:
                                    <br />• Nome e CPF do cliente
                                    <br />• Endereço completo com CEP
                                    <br />• Produtos e valores
                                    <br />• Origem da compra (marketplace)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
