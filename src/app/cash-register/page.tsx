'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/admin/Card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface CashRegister {
    id: string
    store_id: string
    cashier_id: string
    opened_at: string
    initial_balance: number
    total_sales: number
    total_commission: number
    status: 'open' | 'closed'
}

interface SaleEntry {
    id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
    created_at: string
}

export default function CashRegisterPage() {
    const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'open' | 'sale' | 'close' | 'history'>('open')

    // State for opening register
    const [initialBalance, setInitialBalance] = useState('0')

    // State for adding sale
    const [description, setDescription] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [unitPrice, setUnitPrice] = useState('')

    // Auth and Context state
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [storeId, setStoreId] = useState<string>('')

    // State for history
    const [historyEntries, setHistoryEntries] = useState<SaleEntry[]>([])

    // Check auth and fetch active register
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // TODO: In a real app, fetch the store associated with this cashier
            // For now, we'll fetch the first available store or use a placeholder
            const { data: stores } = await supabase.from('stores').select('id').limit(1)
            if (stores && stores.length > 0) {
                setStoreId(stores[0].id)
            }
        }
        checkAuth()
    }, [router])

    const fetchHistory = async () => {
        if (!activeRegister) return
        setLoading(true)
        try {
            const res = await fetch(`/api/cash-register/history?registerId=${activeRegister.id}`)
            const data = await res.json()
            if (data.success) {
                setHistoryEntries(data.entries)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Refresh history when tab changes
    useEffect(() => {
        if (activeTab === 'history' && activeRegister) {
            fetchHistory()
        }
    }, [activeTab, activeRegister])

    const handleOpenRegister = async () => {
        if (!user || !storeId) {
            alert('Erro: Usuário ou Loja não identificados')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/cash-register/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: storeId,
                    cashierId: user.id,
                    initialBalance: parseFloat(initialBalance)
                })
            })
            const data = await res.json()
            if (data.success) {
                setActiveRegister(data.register)
                setActiveTab('sale')
            } else {
                alert('Erro ao abrir caixa: ' + data.error)
            }
        } catch (err: any) {
            alert('Erro: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSale = async () => {
        if (!activeRegister) return
        setLoading(true)
        try {
            const res = await fetch('/api/cash-register/entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registerId: activeRegister.id,
                    description,
                    quantity: parseInt(quantity),
                    unitPrice: parseFloat(unitPrice)
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('✅ Venda registrada!')
                setDescription('')
                setQuantity('1')
                setUnitPrice('')
                // Refresh register totals
                // TODO: Fetch updated register
            } else {
                alert('Erro: ' + data.error)
            }
        } catch (err: any) {
            alert('Erro: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCloseRegister = async () => {
        if (!activeRegister) return
        const confirmed = confirm('Deseja realmente fechar o caixa?')
        if (!confirmed) return

        setLoading(true)
        try {
            const res = await fetch('/api/cash-register/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registerId: activeRegister.id,
                    finalBalance: activeRegister.total_sales,
                    pixReceived: false
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('✅ Caixa fechado com sucesso!')
                setActiveRegister(null)
                setActiveTab('open')
            } else {
                alert('Erro: ' + data.error)
            }
        } catch (err: any) {
            alert('Erro: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        💰 Caixa de Vendas
                    </h1>
                    <p className="text-gray-300">Sistema de controle de caixa e comissões</p>
                </header>

                {/* Status Cards */}
                {activeRegister && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card title="Saldo Inicial" value={`R$ ${activeRegister.initial_balance.toFixed(2)}`} trend="Abertura do caixa" />
                        <Card title="Total Vendas" value={`R$ ${activeRegister.total_sales.toFixed(2)}`} trend="Acumulado hoje" />
                        <Card title="Comissão" value={`R$ ${activeRegister.total_commission.toFixed(2)}`} trend="5% sobre vendas" />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'open'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                        disabled={!!activeRegister}
                    >
                        Abrir Caixa
                    </button>
                    <button
                        onClick={() => setActiveTab('sale')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'sale'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                        disabled={!activeRegister}
                    >
                        Registrar Venda
                    </button>
                    <button
                        onClick={() => setActiveTab('close')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'close'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                        disabled={!activeRegister}
                    >
                        Fechar Caixa
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 font-medium transition-all ${activeTab === 'history'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Histórico
                    </button>
                </div>

                {/* Tab Content */}
                <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-lg p-8 shadow-2xl">
                    {activeTab === 'open' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Abrir Novo Caixa</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Saldo Inicial (R$)</label>
                                    <input
                                        type="number"
                                        value={initialBalance}
                                        onChange={(e) => setInitialBalance(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                                <button
                                    onClick={handleOpenRegister}
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Abrindo...' : '🚀 Abrir Caixa'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sale' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Registrar Nova Venda</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Descrição do Produto</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                        placeholder="Ex: Vestido Floral"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Preço Unitário (R$)</label>
                                        <input
                                            type="number"
                                            value={unitPrice}
                                            onChange={(e) => setUnitPrice(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/30">
                                    <p className="text-sm text-gray-300">Total da Venda</p>
                                    <p className="text-3xl font-bold text-purple-400">
                                        R$ {((parseInt(quantity) || 0) * (parseFloat(unitPrice) || 0)).toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleAddSale}
                                    disabled={loading || !description || !unitPrice}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Registrando...' : '✅ Registrar Venda'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'close' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Fechar Caixa</h2>
                            <div className="space-y-4">
                                <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Saldo Inicial:</span>
                                        <span className="text-white font-semibold">R$ {activeRegister?.initial_balance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Total Vendas:</span>
                                        <span className="text-green-400 font-semibold">R$ {activeRegister?.total_sales.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Comissão (5%):</span>
                                        <span className="text-purple-400 font-semibold">R$ {activeRegister?.total_commission.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-600 flex justify-between">
                                        <span className="text-white font-bold">Saldo Final:</span>
                                        <span className="text-2xl text-white font-bold">
                                            R$ {((activeRegister?.initial_balance || 0) + (activeRegister?.total_sales || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseRegister}
                                    disabled={loading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Fechando...' : '🔒 Fechar Caixa'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">Histórico de Vendas</h2>
                                <button
                                    onClick={fetchHistory}
                                    className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
                                >
                                    Atualizar
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-700">
                                <table className="min-w-full divide-y divide-gray-700 bg-gray-800/50">
                                    <thead className="bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hora</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qtd</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {historyEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                    Nenhuma venda registrada neste caixa.
                                                </td>
                                            </tr>
                                        ) : (
                                            historyEntries.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {new Date(entry.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                                        {entry.description || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {entry.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        R$ {entry.unit_price.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-bold">
                                                        R$ {entry.amount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
