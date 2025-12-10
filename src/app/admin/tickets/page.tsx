'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'

interface Ticket {
    id: string
    customer_phone: string
    subject: string
    message: string
    status: string
    priority: string
    sentiment: string
    created_at: string
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [filter, setFilter] = useState<'all' | 'open' | 'high_priority'>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTickets()
    }, [filter])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            // TODO: Implement API call to fetch tickets
            // const response = await fetch(`/api/tickets?filter=${filter}`)
            // const data = await response.json()
            // setTickets(data)

            // Mock data for now
            setTickets([
                {
                    id: '1',
                    customer_phone: '5511999999999',
                    subject: 'Onde está meu pedido?',
                    message: 'Comprei há 5 dias e ainda não recebi',
                    status: 'open',
                    priority: 'high',
                    sentiment: 'negative',
                    created_at: new Date().toISOString()
                }
            ])
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getSentimentEmoji = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '😊'
            case 'neutral': return '😐'
            case 'negative': return '😞'
            default: return '❓'
        }
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tickets de Atendimento</h1>
                    <p className="text-gray-500">Gerencie solicitações de clientes</p>
                </div>
                <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Criar Ticket Manual
                </button>
            </header>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card title="Total de Tickets" value="24" trend="8 novos hoje" />
                <Card title="Abertos" value="12" trend="Prioridade alta: 3" />
                <Card title="Em Andamento" value="7" trend="Tempo médio: 2h" />
                <Card title="Resolvidos Hoje" value="5" trend="Taxa: 83%" />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('open')}
                    className={`px-4 py-2 rounded-lg ${filter === 'open' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                    Abertos
                </button>
                <button
                    onClick={() => setFilter('high_priority')}
                    className={`px-4 py-2 rounded-lg ${filter === 'high_priority' ? 'bg-black text-white' : 'bg-gray-100'}`}
                >
                    Alta Prioridade
                </button>
            </div>

            {/* Tickets List */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets Recentes</h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Carregando...</div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Nenhum ticket encontrado</div>
                    ) : (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">{getSentimentEmoji(ticket.sentiment)}</span>
                                                <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>📱 {ticket.customer_phone}</span>
                                                <span>🕐 {new Date(ticket.created_at).toLocaleString('pt-BR')}</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="ml-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
                                            Responder
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
