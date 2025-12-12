'use client'

import { useState } from 'react'
import {
    Zap, TrendingUp, Users, DollarSign, Target, AlertTriangle,
    CheckCircle, X, Upload, Image as ImageIcon, Edit, Eye, Download
} from 'lucide-react'

interface CarouselCard {
    image: string
    headline: string
    description: string
    cta: string
}

interface ComplianceCheck {
    isCompliant: boolean
    severity: 'error' | 'warning' | 'info'
    rule: string
    description: string
    fix?: string
}

export default function CampaignsPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'carousel'>('dashboard')
    const [campaignData, setCampaignData] = useState({
        headline: '',
        description: '',
        targetAudience: '',
        budget: 100,
        images: [] as string[],
    })
    const [compliance, setCompliance] = useState<any>(null)
    const [carouselCards, setCarouselCards] = useState<CarouselCard[]>([])
    const [loading, setLoading] = useState(false)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)

    // Validar campanha contra políticas Meta
    const validateCampaign = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/campaigns/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaign: campaignData }),
            })
            const data = await res.json()
            setCompliance(data.compliance)
        } catch (error) {
            console.error('Erro:', error)
        }
        setLoading(false)
    }

    // Gerar carrossel automático
    const generateCarousel = async () => {
        setLoading(true)
        try {
            const products = [
                { name: 'Vestido Floral Verão', price: 89.90, category: 'Moda Feminina', image: '/products/1.jpg' },
                { name: 'Camisa Social Slim', price: 129.90, category: 'Moda Masculina', image: '/products/2.jpg' },
                { name: 'Tênis Esportivo Pro', price: 249.90, category: 'Calçados', image: '/products/3.jpg' },
                { name: 'Bolsa Couro Premium', price: 199.90, category: 'Acessórios', image: '/products/4.jpg' },
                { name: 'Óculos de Sol UV', price: 79.90, category: 'Acessórios', image: '/products/5.jpg' },
            ]

            const res = await fetch('/api/campaigns/carousel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products }),
            })
            const data = await res.json()
            setCarouselCards(data.carousel)
        } catch (error) {
            console.error('Erro:', error)
        }
        setLoading(false)
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="text-purple-600" />
                    Campanhas Meta Ads - Dashboard Profissional
                </h1>
                <p className="text-gray-600 mt-2">
                    Sistema completo com validação de conformidade Meta e criação automática de carrosséis
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'dashboard'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                >
                    📊 Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'create'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                >
                    ✨ Criar Campanha
                </button>
                <button
                    onClick={() => setActiveTab('carousel')}
                    className={`px-6 py-3 font-semibold transition-all ${activeTab === 'carousel'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                >
                    🎨 Carrossel Automático
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div>
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Orçamento Total</p>
                                    <h3 className="text-3xl font-bold">R$ 5.000</h3>
                                    <p className="text-blue-100 text-xs mt-2">Para novas campanhas</p>
                                </div>
                                <DollarSign className="w-10 h-10 text-blue-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Alcance Estimado</p>
                                    <h3 className="text-3xl font-bold">125K</h3>
                                    <p className="text-green-100 text-xs mt-2">Pessoas atingidas</p>
                                </div>
                                <Users className="w-10 h-10 text-green-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-purple-100 text-sm mb-1">ROI Projetado</p>
                                    <h3 className="text-3xl font-bold">385%</h3>
                                    <p className="text-purple-100 text-xs mt-2">Retorno esperado</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-purple-200" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-orange-100 text-sm mb-1">Conversões</p>
                                    <h3 className="text-3xl font-bold">847</h3>
                                    <p className="text-orange-100 text-xs mt-2">Meta mensal</p>
                                </div>
                                <Target className="w-10 h-10 text-orange-200" />
                            </div>
                        </div>
                    </div>

                    {/* Campanhas Ativas */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">🚀 Campanhas Ativas</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Black Friday 2025', status: 'Ativa', spent: 1250, conversions: 89, ctr: 4.2 },
                                { name: 'Coleção Verão', status: 'Em Análise', spent: 800, conversions: 45, ctr: 3.8 },
                                { name: 'Lançamento Produto', status: 'Pausada', spent: 450, conversions: 12, ctr: 2.1 },
                            ].map((campaign, idx) => (
                                <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                            <div className="flex gap-6 mt-2 text-sm text-gray-600">
                                                <span>💰 Gasto: R$ {campaign.spent}</span>
                                                <span>🎯 Conversões: {campaign.conversions}</span>
                                                <span>📊 CTR: {campaign.ctr}%</span>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${campaign.status === 'Ativa' ? 'bg-green-100 text-green-700' :
                                                campaign.status === 'Em Análise' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Criar Campanha Tab */}
            {activeTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulário */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6">✨ Nova Campanha Meta Ads</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Título da Campanha</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Promoção Verão 2025"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={campaignData.headline}
                                    onChange={(e) => setCampaignData({ ...campaignData, headline: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {campaignData.headline.length}/40 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Descrição</label>
                                <textarea
                                    placeholder="Descreva sua campanha..."
                                    rows={3}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={campaignData.description}
                                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {campaignData.description.length}/125 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Público-Alvo</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Mulheres 18-35 anos interessadas em moda"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={campaignData.targetAudience}
                                    onChange={(e) => setCampaignData({ ...campaignData, targetAudience: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Orçamento Diário (R$)</label>
                                <input
                                    type="number"
                                    min="20"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={campaignData.budget}
                                    onChange={(e) => setCampaignData({ ...campaignData, budget: Number(e.target.value) })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Mínimo: R$ 20 (exigência Meta)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Imagens (3-10)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-600">Arraste ou clique para adicionar imagens</p>
                                    <p className="text-xs text-gray-500 mt-2">1080x1080px recomendado</p>
                                </div>
                            </div>

                            <button
                                onClick={validateCampaign}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                {loading ? 'Validando...' : 'Validar Conformidade Meta'}
                            </button>
                        </div>
                    </div>

                    {/* Resultado da Validação */}
                    <div className="space-y-6">
                        {compliance && (
                            <>
                                {/* Score */}
                                <div className={`rounded-xl p-6 text-white shadow-lg ${compliance.canPublish
                                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                                        : 'bg-gradient-to-br from-red-500 to-red-600'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">Score de Conformidade</p>
                                            <h3 className="text-5xl font-bold mt-2">{compliance.score}/100</h3>
                                            <p className="mt-2">
                                                {compliance.canPublish ? '✅ APROVADO PARA PUBLICAÇÃO' : '❌ REQUER CORREÇÕES'}
                                            </p>
                                        </div>
                                        {compliance.canPublish ? (
                                            <CheckCircle className="w-16 h-16" />
                                        ) : (
                                            <AlertTriangle className="w-16 h-16" />
                                        )}
                                    </div>
                                </div>

                                {/* Problemas Encontrados */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h3 className="text-lg font-bold mb-4">🔍 Análise Detalhada</h3>
                                    <div className="space-y-3">
                                        {compliance.checks.map((check: ComplianceCheck, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${check.severity === 'error' ? 'bg-red-50 border-red-500' :
                                                    check.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                                        'bg-blue-50 border-blue-500'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    {check.severity === 'error' ? (
                                                        <X className="w-5 h-5 text-red-500 mt-0.5" />
                                                    ) : check.severity === 'warning' ? (
                                                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">{check.rule}</p>
                                                        <p className="text-sm text-gray-700 mt-1">{check.description}</p>
                                                        {check.fix && (
                                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                                💡 {check.fix}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Carrossel Tab */}
            {activeTab === 'carousel' && (
                <div>
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold">🎨 Criador de Carrossel Meta Ads</h2>
                                <p className="text-gray-600 mt-1">IA gera automaticamente 5 cards otimizados</p>
                            </div>
                            <button
                                onClick={generateCarousel}
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                {loading ? 'Gerando...' : 'Gerar Carrossel com IA'}
                            </button>
                        </div>

                        {/* Preview do Carrossel */}
                        {carouselCards.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-bold text-lg mb-4">📱 Preview do Carrossel</h3>

                                {/* Card Atual */}
                                <div className="relative bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
                                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                                        {/* Imagem */}
                                        <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                            <ImageIcon className="w-24 h-24 text-white opacity-50" />
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="p-6">
                                            <h4 className="font-bold text-xl mb-2">
                                                {carouselCards[currentCardIndex].headline}
                                            </h4>
                                            <p className="text-gray-700 mb-4">
                                                {carouselCards[currentCardIndex].description}
                                            </p>
                                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                                                {carouselCards[currentCardIndex].cta}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Navegação */}
                                    <div className="flex justify-center gap-2 mt-4">
                                        {carouselCards.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentCardIndex(idx)}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentCardIndex
                                                        ? 'bg-purple-600 w-8'
                                                        : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Lista de Cards */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {carouselCards.map((card, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-bold">Card {idx + 1}</span>
                                                <div className="flex gap-2">
                                                    <button className="p-2 hover:bg-gray-100 rounded" title="Editar">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 rounded" title="Visualizar">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p><strong>Título:</strong> {card.headline}</p>
                                                <p className="text-gray-600">{card.description}</p>
                                                <p className="text-purple-600 font-semibold">{card.cta}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-5 h-5" />
                                        Exportar para Meta Ads Manager
                                    </button>
                                    <button className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                                        Salvar Rascunho
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
