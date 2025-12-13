'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Eye, Clock, Package, Star } from 'lucide-react'
import { generateCompleteSEO } from '@/lib/seo-generator'
import { generateUrgencyBadges, type ProductUrgencyData } from '@/lib/social-proof'
import { toast } from 'sonner'

export default function SEOOptimizerPage() {
    const [productName, setProductName] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('Vestidos')
    const [features, setFeatures] = useState<string[]>([''])
    const [image, setImage] = useState('')
    const [discount, setDiscount] = useState('')

    const [seoResult, setSeoResult] = useState<any>(null)
    const [urgencyPreview, setUrgencyPreview] = useState<any>(null)

    const categories = [
        'Vestidos', 'Calças', 'Blusas', 'Saias', 'Conjuntos',
        'Roupas Masculinas', 'Roupas Infantis', 'Acessórios'
    ]

    const generateSEO = () => {
        if (!productName || !price) {
            toast.error('Preencha nome e preço do produto')
            return
        }

        const result = generateCompleteSEO({
            name: productName,
            price: parseFloat(price),
            category,
            features: features.filter(f => f.trim() !== ''),
            image: image || 'https://via.placeholder.com/800x600',
            discount: discount ? parseFloat(discount) : undefined
        })

        setSeoResult(result)

        // Gerar preview de urgência
        const urgencyData: ProductUrgencyData = {
            reviews: [
                { id: '1', product_id: '1', customer_name: 'Maria Silva', rating: 5, comment: 'Adorei!', verified_purchase: true, helpful_count: 12, created_at: new Date() },
                { id: '2', product_id: '1', customer_name: 'João Santos', rating: 5, comment: 'Perfeito!', verified_purchase: true, helpful_count: 8, created_at: new Date() },
                { id: '3', product_id: '1', customer_name: 'Ana Costa', rating: 4, comment: 'Muito bom', verified_purchase: true, helpful_count: 5, created_at: new Date() },
            ],
            sales_counter: {
                product_id: '1',
                total_sales: 234,
                sales_today: 12,
                sales_this_week: 45,
                last_sale_at: new Date()
            },
            stock: {
                product_id: '1',
                current_stock: 5,
                low_stock_threshold: 10,
                show_exact_count: true
            },
            countdown: {
                end_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
                label: 'Oferta Relâmpago',
                type: 'flash_sale'
            },
            viewers_count: 18
        }

        const badges = generateUrgencyBadges(urgencyData)
        setUrgencyPreview(badges)

        toast.success('SEO gerado com sucesso!')
    }

    const addFeature = () => {
        setFeatures([...features, ''])
    }

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features]
        newFeatures[index] = value
        setFeatures(newFeatures)
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado!`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        Otimizador de SEO e Conversão
                    </h1>
                    <p className="text-sm text-gray-600">Gere meta tags, Schema.org e badges de urgência automaticamente</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulário */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Dados do Produto</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Produto *
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Ex: Vestido Floral Elegante"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preço (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="89.90"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Desconto (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        placeholder="50"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoria
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL da Imagem
                                </label>
                                <input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Características
                                </label>
                                {features.map((feature, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder="Ex: Tecido leve e confortável"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                                    />
                                ))}
                                <button
                                    onClick={addFeature}
                                    className="text-sm text-purple-600 hover:text-purple-700"
                                >
                                    + Adicionar característica
                                </button>
                            </div>

                            <button
                                onClick={generateSEO}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Gerar SEO e Badges
                            </button>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="space-y-6">
                        {seoResult && (
                            <>
                                {/* Análise */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Análise SEO</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-4xl font-bold text-purple-600">
                                            {seoResult.analysis.score}
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{ width: `${seoResult.analysis.score}%` }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {seoResult.analysis.score >= 80 ? 'Excelente!' :
                                                    seoResult.analysis.score >= 60 ? 'Bom' : 'Precisa melhorar'}
                                            </p>
                                        </div>
                                    </div>

                                    {seoResult.analysis.suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">Sugestões:</p>
                                            {seoResult.analysis.suggestions.map((s: string, i: number) => (
                                                <p key={i} className="text-sm text-gray-600">• {s}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Meta Tags */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Meta Tags</h3>
                                        <button
                                            onClick={() => copyToClipboard(seoResult.metaTags, 'Meta tags')}
                                            className="text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                                        {seoResult.metaTags}
                                    </pre>
                                </div>

                                {/* Schema.org */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Schema.org</h3>
                                        <button
                                            onClick={() => copyToClipboard(seoResult.schemaOrg, 'Schema.org')}
                                            className="text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                                        {seoResult.schemaOrg}
                                    </pre>
                                </div>

                                {/* Badges de Urgência */}
                                {urgencyPreview && (
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview de Badges</h3>
                                        <div className="space-y-3">
                                            {urgencyPreview.rating && (
                                                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                                                    <Star className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-sm">{urgencyPreview.rating}</span>
                                                </div>
                                            )}
                                            {urgencyPreview.sales && (
                                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm">{urgencyPreview.sales}</span>
                                                </div>
                                            )}
                                            {urgencyPreview.stock && (
                                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                                                    <Package className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm font-semibold">{urgencyPreview.stock}</span>
                                                </div>
                                            )}
                                            {urgencyPreview.countdown && (
                                                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                                                    <Clock className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm font-semibold">{urgencyPreview.countdown}</span>
                                                </div>
                                            )}
                                            {urgencyPreview.viewers && (
                                                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                                                    <Eye className="w-4 h-4 text-purple-600" />
                                                    <span className="text-sm">{urgencyPreview.viewers}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {!seoResult && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Preencha os dados e clique em "Gerar SEO"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
