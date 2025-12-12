'use client'

import { useState } from 'react'
import { Card } from '@/components/admin/Card'
import { Users, TrendingUp, Target, Search, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Sparkles } from 'lucide-react'

export default function CustomerProfilePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [enrichedData, setEnrichedData] = useState<any>(null)

    async function handleEnrich() {
        setLoading(true)
        try {
            const response = await fetch('/api/customers/enrich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Ana Silva',
                    email: searchQuery || 'ana.silva@email.com',
                    phone: '(11) 98765-4321',
                }),
            })

            const data = await response.json()
            if (data.success) {
                setEnrichedData(data.data)
            }
        } catch (error) {
            console.error('Erro:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Perfil Enriquecido do Cliente</h1>
                <p className="text-gray-500">Dados completos das redes sociais e segmentação inteligente</p>
            </header>

            {/* Search Box */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Digite o email do cliente para buscar dados..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    <button
                        onClick={handleEnrich}
                        disabled={loading}
                        className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Sparkles className="h-5 w-5" />
                        {loading ? 'Buscando...' : 'Enriquecer Dados'}
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                    💡 O sistema buscará automaticamente dados do cliente em: Facebook, Instagram, LinkedIn, Google e mais
                </p>
            </div>

            {enrichedData && (
                <>
                    {/* Segment Badge */}
                    <div className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium opacity-90">Segmento Identificado</p>
                                <h2 className="text-3xl font-bold mt-1">{enrichedData.segment}</h2>
                            </div>
                            <Target className="h-12 w-12 opacity-80" />
                        </div>
                    </div>

                    {/* Social Profiles */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {enrichedData.socialProfiles?.facebook && (
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Facebook className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Facebook</h3>
                                        <p className="text-sm text-gray-500">Perfil encontrado</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">
                                        <strong>Amigos:</strong> {enrichedData.socialProfiles.facebook.friends}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Localização:</strong> {enrichedData.socialProfiles.facebook.location}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Curtidas:</strong> {enrichedData.socialProfiles.facebook.likes.join(', ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {enrichedData.socialProfiles?.instagram && (
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                        <Instagram className="h-6 w-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Instagram</h3>
                                        <p className="text-sm text-gray-500">@{enrichedData.socialProfiles.instagram.username}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">
                                        <strong>Seguidores:</strong> {enrichedData.socialProfiles.instagram.followers}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Seguindo:</strong> {enrichedData.socialProfiles.instagram.following}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Posts:</strong> {enrichedData.socialProfiles.instagram.posts}
                                    </p>
                                </div>
                            </div>
                        )}

                        {enrichedData.socialProfiles?.linkedin && (
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Linkedin className="h-6 w-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">LinkedIn</h3>
                                        <p className="text-sm text-gray-500">Perfil profissional</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">
                                        <strong>Empresa:</strong> {enrichedData.socialProfiles.linkedin.company}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Cargo:</strong> {enrichedData.socialProfiles.linkedin.position}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Conexões:</strong> {enrichedData.socialProfiles.linkedin.connections}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Demographics & Interests */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Demográficos</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Users className="h-5 w-5 text-gray-400" />
                                    <span><strong>Faixa Etária:</strong> {enrichedData.demographics?.ageRange} anos</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span><strong>Localização:</strong> {enrichedData.demographics?.location.city}, {enrichedData.demographics?.location.state}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span><strong>Email:</strong> {enrichedData.basicInfo.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <span><strong>Telefone:</strong> {enrichedData.basicInfo.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Interesses Identificados</h3>
                            <div className="flex flex-wrap gap-2">
                                {enrichedData.interests?.map((interest: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Network Insights */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Insights da Rede Social</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-3xl font-bold text-blue-600">
                                    {enrichedData.networkInsights?.potentialReach}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Alcance Potencial</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-3xl font-bold text-green-600">
                                    {enrichedData.networkInsights?.influenceScore}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Score de Influência</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-3xl font-bold text-purple-600">
                                    {enrichedData.networkInsights?.lookalikeFriends?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Amigos Similares</p>
                            </div>
                        </div>

                        {enrichedData.networkInsights?.lookalikeFriends && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Conexões Relevantes:</p>
                                <ul className="space-y-1">
                                    {enrichedData.networkInsights.lookalikeFriends.map((friend: string, idx: number) => (
                                        <li key={idx} className="text-sm text-gray-600">• {friend}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Marketing Recommendations */}
                    <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Recomendações de Marketing Personalizadas
                        </h3>
                        <ul className="space-y-2">
                            {enrichedData.recommendations?.map((rec: string, idx: number) => (
                                <li key={idx} className="text-green-800 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* LGPD Warning */}
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Aviso LGPD:</strong> O uso de dados de redes sociais deve estar em conformidade com a LGPD e termos de serviço das plataformas. Sempre obtenha consentimento explícito do cliente para coleta e uso de dados pessoais.
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}
