'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calculator, CreditCard, DollarSign, Save, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface FeeConfig {
    id?: string
    store_id: string
    payment_method: 'credit' | 'debit' | 'pix' | 'cash'
    card_brand?: string
    fee_percentage: number
    fee_fixed: number
    max_installments?: number
    installment_fee_percentage?: number
    active: boolean
}

const CARD_BRANDS = [
    { value: 'visa', label: 'Visa', icon: '💳' },
    { value: 'mastercard', label: 'Mastercard', icon: '💳' },
    { value: 'elo', label: 'Elo', icon: '💳' },
    { value: 'amex', label: 'American Express', icon: '💳' },
    { value: 'hipercard', label: 'Hipercard', icon: '💳' },
    { value: 'diners', label: 'Diners Club', icon: '💳' },
]

export default function PaymentFeesConfigPage() {
    const [configs, setConfigs] = useState<FeeConfig[]>([])
    const [loading, setLoading] = useState(true)
    const [testAmount, setTestAmount] = useState('100.00')
    const [testMethod, setTestMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('credit')
    const [testBrand, setTestBrand] = useState('visa')
    const [testInstallments, setTestInstallments] = useState(1)
    const [testResult, setTestResult] = useState<any>(null)

    useEffect(() => {
        fetchConfigs()
    }, [])

    const fetchConfigs = async () => {
        try {
            const response = await fetch('/api/payment-fees/config')
            const data = await response.json()

            if (data.success) {
                setConfigs(data.configs)
            }
        } catch (error) {
            toast.error('Erro ao carregar configurações')
        } finally {
            setLoading(false)
        }
    }

    const saveConfig = async (config: FeeConfig) => {
        try {
            const response = await fetch('/api/payment-fees/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Configuração salva!')
                fetchConfigs()
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Erro ao salvar configuração')
        }
    }

    const calculateTest = async () => {
        try {
            const response = await fetch('/api/payment-fees/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(testAmount),
                    payment_method: testMethod,
                    card_brand: testMethod !== 'pix' && testMethod !== 'cash' ? testBrand : undefined,
                    installments: testMethod === 'credit' ? testInstallments : 1
                })
            })

            const data = await response.json()

            if (data.success) {
                setTestResult(data.calculation)
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Erro ao calcular')
        }
    }

    const updateConfig = (index: number, field: string, value: any) => {
        const newConfigs = [...configs]
        newConfigs[index] = { ...newConfigs[index], [field]: value }
        setConfigs(newConfigs)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Calculator className="w-6 h-6 text-blue-600" />
                                Configuração de Taxas de Pagamento
                            </h1>
                            <p className="text-sm text-gray-600">Configure as taxas da maquininha por bandeira</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configurações */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Taxas por Bandeira</h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* PIX */}
                                    <div className="border-b pb-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            📱 PIX
                                        </h3>
                                        {configs.filter(c => c.payment_method === 'pix').map((config, index) => (
                                            <div key={index} className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Taxa (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={config.fee_percentage}
                                                        onChange={(e) => updateConfig(index, 'fee_percentage', parseFloat(e.target.value))}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Taxa Fixa (R$)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={config.fee_fixed}
                                                        onChange={(e) => updateConfig(index, 'fee_fixed', parseFloat(e.target.value))}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Débito */}
                                    <div className="border-b pb-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            💳 Cartão de Débito
                                        </h3>
                                        <div className="space-y-4">
                                            {CARD_BRANDS.map((brand) => {
                                                const config = configs.find(c =>
                                                    c.payment_method === 'debit' && c.card_brand === brand.value
                                                )
                                                const configIndex = configs.findIndex(c =>
                                                    c.payment_method === 'debit' && c.card_brand === brand.value
                                                )

                                                return (
                                                    <div key={brand.value} className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-medium mb-3">{brand.icon} {brand.label}</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Taxa (%)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config?.fee_percentage || 0}
                                                                    onChange={(e) => updateConfig(configIndex, 'fee_percentage', parseFloat(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Taxa Fixa (R$)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config?.fee_fixed || 0}
                                                                    onChange={(e) => updateConfig(configIndex, 'fee_fixed', parseFloat(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Crédito */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            💳 Cartão de Crédito
                                        </h3>
                                        <div className="space-y-4">
                                            {CARD_BRANDS.map((brand) => {
                                                const config = configs.find(c =>
                                                    c.payment_method === 'credit' && c.card_brand === brand.value
                                                )
                                                const configIndex = configs.findIndex(c =>
                                                    c.payment_method === 'credit' && c.card_brand === brand.value
                                                )

                                                return (
                                                    <div key={brand.value} className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-medium mb-3">{brand.icon} {brand.label}</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Taxa (%)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config?.fee_percentage || 0}
                                                                    onChange={(e) => updateConfig(configIndex, 'fee_percentage', parseFloat(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Taxa Fixa (R$)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config?.fee_fixed || 0}
                                                                    onChange={(e) => updateConfig(configIndex, 'fee_fixed', parseFloat(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Taxa Parcelamento (%)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={config?.installment_fee_percentage || 0}
                                                                    onChange={(e) => updateConfig(configIndex, 'installment_fee_percentage', parseFloat(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm text-gray-600 mb-1">Máx. Parcelas</label>
                                                                <input
                                                                    type="number"
                                                                    value={config?.max_installments || 12}
                                                                    onChange={(e) => updateConfig(configIndex, 'max_installments', parseInt(e.target.value))}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => configs.forEach((config, index) => saveConfig(config))}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Salvar Todas as Configurações
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calculadora de Teste */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-600" />
                                Calculadora de Teste
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valor (R$)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={testAmount}
                                        onChange={(e) => setTestAmount(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Forma de Pagamento
                                    </label>
                                    <select
                                        value={testMethod}
                                        onChange={(e) => setTestMethod(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="pix">PIX</option>
                                        <option value="debit">Débito</option>
                                        <option value="credit">Crédito</option>
                                        <option value="cash">Dinheiro</option>
                                    </select>
                                </div>

                                {(testMethod === 'credit' || testMethod === 'debit') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bandeira
                                        </label>
                                        <select
                                            value={testBrand}
                                            onChange={(e) => setTestBrand(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        >
                                            {CARD_BRANDS.map(brand => (
                                                <option key={brand.value} value={brand.value}>
                                                    {brand.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {testMethod === 'credit' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parcelas
                                        </label>
                                        <select
                                            value={testInstallments}
                                            onChange={(e) => setTestInstallments(parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                                <option key={n} value={n}>{n}x</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={calculateTest}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Calcular
                                </button>

                                {testResult && (
                                    <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Valor Bruto:</span>
                                            <span className="font-semibold">R$ {testResult.gross_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Taxa (%):</span>
                                            <span className="text-red-600">- R$ {testResult.fee_percentage_amount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Taxa Fixa:</span>
                                            <span className="text-red-600">- R$ {testResult.fee_fixed_amount.toFixed(2)}</span>
                                        </div>
                                        {testResult.installment_fee_amount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Taxa Parcelamento:</span>
                                                <span className="text-red-600">- R$ {testResult.installment_fee_amount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-3 flex justify-between font-semibold">
                                            <span>Valor Líquido:</span>
                                            <span className="text-green-600">R$ {testResult.net_amount.toFixed(2)}</span>
                                        </div>
                                        {testResult.installment_value && (
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Valor da Parcela:</span>
                                                <span>R$ {testResult.installment_value.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
