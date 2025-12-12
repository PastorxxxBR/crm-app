'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Users, TrendingUp, Zap, RefreshCw, AlertCircle, Target } from 'lucide-react'

export default function FacebookAdsDashboard() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [period, setPeriod] = useState<'today' | 'last_7d' | 'last_30d'>('last_30d')

    const loadData = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`/api/meta/ads?period=${period}`)
            const result = await res.json()

            if (result.error) {
                setError(result.error)
            } else {
                setData(result)
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [period])

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                                <Zap className="text-white w-8 h-8" />
                            </div>
                            Facebook Ads - Toca da Onça
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Dados reais de campanhas e métricas do Facebook Ads
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as any)}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="today">Hoje</option>
                            <option value="last_7d">Últimos 7 dias</option>
                            <option value="last_30d">Últimos 30 dias</option>
                        </select>

                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Atualizando...' : 'Atualizar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Erro de Configuração */}
            {error && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-bold text-yellow-900 mb-2">⚠️ Configuração Necessária</h3>
                            <p className="text-yellow-700 mb-3">{error}</p>
                            <div className="bg-yellow-100 p-4 rounded text-sm text-yellow-800">
                                <p className="font-semibold mb-2">Adicione no arquivo .env.local:</p>
                                <code className="block bg-white p-2 rounded">
                                    META_ACCESS_TOKEN=seu_token_aqui<br />
                                    META_AD_ACCOUNT_ID=act_123456789
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard de Métricas */}
            {data && data.success && (
                <>
                    {/* Cards de Métricas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Investimento */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                                    <DollarSign className="w-8 h-8" />
                                </div>
                                <span className="text-xs bg-blue-400 bg-opacity-30 px-2 py-1 rounded">
                                    {period === 'today' ? 'Hoje' : period === 'last_7d' ? '7 dias' : '30 dias'}
                                </span>
                            </div>
                            <p className="text-blue-100 text-sm mb-1">Investimento</p>
                            <h3 className="text-4xl font-bold">
                                R$ {parseFloat(data.summary?.spend || '0').toFixed(2)}
                            </h3>
                        </div>

                        {/* Alcance */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                                    <Users className="w-8 h-8" />
                                </div>
                                <span className="text-xs bg-green-400 bg-opacity-30 px-2 py-1 rounded">
                                    Pessoas
                                </span>
                            </div>
                            <p className="text-green-100 text-sm mb-1">Alcance</p>
                            <h3 className="text-4xl font-bold">
                                {(data.summary?.reach || 0).toLocaleString()}
                            </h3>
                        </div>

                        {/* Impressões */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <span className="text-xs bg-purple-400 bg-opacity-30 px-2 py-1 rounded">
                                    Views
                                </span>
                            </div>
                            <p className="text-purple-100 text-sm mb-1">Impressões</p>
                            <h3 className="text-4xl font-bold">
                                {(data.summary?.impressions || 0).toLocaleString()}
                            </h3>
                        </div>

                        {/* CTR */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                                    <Target className="w-8 h-8" />
                                </div>
                                <span className="text-xs bg-orange-400 bg-opacity-30 px-2 py-1 rounded">
                                    Taxa
                                </span>
                            </div>
                            <p className="text-orange-100 text-sm mb-1">CTR</p>
                            <h3 className="text-4xl font-bold">
                                {(data.summary?.ctr || 0).toFixed(2)}%
                            </h3>
                        </div>
                    </div>

                    {/* Métricas Secundárias */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow">
                            <p className="text-gray-600 text-sm mb-1">Cliques</p>
                            <p className="text-2xl font-bold text-gray-900">{data.summary?.clicks || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow">
                            <p className="text-gray-600 text-sm mb-1">CPM (Custo por Mil)</p>
                            <p className="text-2xl font-bold text-gray-900">R$ {(data.summary?.cpm || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow">
                            <p className="text-gray-600 text-sm mb-1">CPC (Custo por Clique)</p>
                            <p className="text-2xl font-bold text-gray-900">R$ {(data.summary?.cpc || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow">
                            <p className="text-gray-600 text-sm mb-1">Conversões</p>
                            <p className="text-2xl font-bold text-gray-900">{data.summary?.conversions || 0}</p>
                        </div>
                    </div>

                    {/* Lista de Campanhas */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    🚀 Campanhas Ativas
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {data.activeCampaigns || 0} de {data.totalCampaigns || 0} campanhas estão ativas
                                </p>
                            </div>
                        </div>

                        {data.campaigns && data.campaigns.length > 0 ? (
                            <div className="space-y-4">
                                {data.campaigns.map((campaign: any) => (
                                    <div
                                        key={campaign.id}
                                        className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all"
                                    >
                                        {/* Header da Campanha */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                    {campaign.name}
                                                </h3>
                                                <div className="flex gap-3 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-4 h-4" />
                                                        {campaign.objective}
                                                    </span>
                                                    {campaign.daily_budget && (
                                                        <span>💰 Orçamento: R$ {parseFloat(campaign.daily_budget).toFixed(2)}/dia</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${campaign.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : campaign.status === 'PAUSED'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {campaign.status === 'ACTIVE' ? '🟢 Ativa' :
                                                    campaign.status === 'PAUSED' ? '🟡 Pausada' : '⚪ Inativa'}
                                            </span>
                                        </div>

                                        {/* Métricas da Campanha */}
                                        {campaign.insights && (
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Gasto</p>
                                                    <p className="font-bold text-gray-900">
                                                        R$ {parseFloat(campaign.insights.spend).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Impressões</p>
                                                    <p className="font-bold text-gray-900">
                                                        {campaign.insights.impressions.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Alcance</p>
                                                    <p className="font-bold text-gray-900">
                                                        {campaign.insights.reach.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Cliques</p>
                                                    <p className="font-bold text-gray-900">
                                                        {campaign.insights.clicks}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">CTR</p>
                                                    <p className="font-bold text-blue-600">
                                                        {campaign.insights.ctr.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">CPC</p>
                                                    <p className="font-bold text-gray-900">
                                                        R$ {campaign.insights.cpc.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">Nenhuma campanha encontrada</p>
                                <p className="text-sm mt-2">Crie campanhas no Facebook Ads Manager</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Estado Inicial */}
            {!data && !error && !loading && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <Zap className="w-24 h-24 text-blue-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Configure a Integração Facebook Ads
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Adicione seu token de acesso no arquivo .env.local para começar
                    </p>
                    <button
                        onClick={loadData}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        Testar Conexão
                    </button>
                </div>
            )}
        </div>
    )
}
