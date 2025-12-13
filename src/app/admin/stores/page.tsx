'use client'

import { useState, useEffect } from 'react'
import { Store, Building2, MapPin, Phone, Mail, Clock, Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import type { Store as StoreType } from '@/lib/stores'

export default function StoresManagementPage() {
    const [stores, setStores] = useState<StoreType[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStore, setSelectedStore] = useState<StoreType | null>(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        loadStores()
    }, [])

    const loadStores = async () => {
        try {
            const response = await fetch('/api/stores')
            const data = await response.json()

            if (data.success) {
                setStores(data.stores)
            }
        } catch (error) {
            toast.error('Erro ao carregar lojas')
        } finally {
            setLoading(false)
        }
    }

    const deleteStore = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta loja?')) return

        try {
            const response = await fetch(`/api/stores?id=${id}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Loja removida!')
                loadStores()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Erro ao remover loja')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando lojas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-blue-600" />
                                Gestão de Lojas
                            </h1>
                            <p className="text-sm text-gray-600">Gerencie suas {stores.length} lojas</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Loja
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Grid de Lojas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map(store => (
                        <div key={store.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            {/* Header do Card */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Store className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{store.name}</h3>
                                        <p className="text-xs text-gray-500">ID: {store.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedStore(store)
                                            setShowForm(true)
                                        }}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteStore(store.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span className="text-gray-600">{store.address}, {store.city} - {store.state}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{store.phone}</span>
                                </div>
                                {store.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{store.email}</span>
                                    </div>
                                )}
                                {store.opening_hours && (
                                    <div className="flex items-start gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <span className="text-gray-600">{store.opening_hours}</span>
                                    </div>
                                )}
                            </div>

                            {/* Gerente */}
                            {store.manager_name && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Gerente</p>
                                    <p className="text-sm font-medium text-gray-900">{store.manager_name}</p>
                                </div>
                            )}

                            {/* Estatísticas Mock */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                                <div>
                                    <p className="text-xs text-gray-500">Vendas Hoje</p>
                                    <p className="text-lg font-bold text-green-600">R$ 2.5k</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Produtos</p>
                                    <p className="text-lg font-bold text-blue-600">250</p>
                                </div>
                            </div>

                            {/* Botão Ver Detalhes */}
                            <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Ver Relatórios
                            </button>
                        </div>
                    ))}
                </div>

                {/* Mensagem se não houver lojas */}
                {stores.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma loja cadastrada</h3>
                        <p className="text-gray-600 mb-4">Comece adicionando sua primeira loja</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Adicionar Loja
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
