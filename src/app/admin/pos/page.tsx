'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone, Banknote, Calculator, User, Store as StoreIcon } from 'lucide-react'
import { toast } from 'sonner'
import { getPaymentFeeManager } from '@/lib/payment-fees'
import type { Product, Sale, SaleItem } from '@/lib/types/pos'

export default function POSPage() {
    const [cart, setCart] = useState<SaleItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPayment, setSelectedPayment] = useState<'credit' | 'debit' | 'pix' | 'cash'>('pix')
    const [selectedBrand, setSelectedBrand] = useState('visa')
    const [installments, setInstallments] = useState(1)
    const [discount, setDiscount] = useState(0)
    const [customerName, setCustomerName] = useState('')

    // Mock de produtos (depois virá do banco)
    const [products] = useState<Product[]>([
        { id: '1', name: 'Vestido Floral', price: 89.90, stock: 10, barcode: '7891234567890' },
        { id: '2', name: 'Calça Jeans', price: 129.90, stock: 15, barcode: '7891234567891' },
        { id: '3', name: 'Blusa Básica', price: 49.90, stock: 20, barcode: '7891234567892' },
        { id: '4', name: 'Saia Midi', price: 79.90, stock: 8, barcode: '7891234567893' },
        { id: '5', name: 'Conjunto Esportivo', price: 159.90, stock: 12, barcode: '7891234567894' },
    ])

    // Cálculos
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const total = subtotal - discount

    // Calcular taxa de pagamento
    const calculateFee = () => {
        if (selectedPayment === 'pix' || selectedPayment === 'cash') {
            return { fee: 0, net: total }
        }

        try {
            const feeManager = getPaymentFeeManager()
            const result = feeManager.calculateFee({
                amount: total,
                payment_method: selectedPayment,
                card_brand: selectedBrand as any,
                installments: selectedPayment === 'credit' ? installments : 1
            })
            return { fee: result.total_fee, net: result.net_amount }
        } catch {
            return { fee: 0, net: total }
        }
    }

    const { fee, net } = calculateFee()

    // Adicionar produto ao carrinho
    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product_id === product.id)

        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
                    : item
            ))
        } else {
            setCart([...cart, {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                unit_price: product.price,
                subtotal: product.price
            }])
        }

        toast.success(`${product.name} adicionado!`)
    }

    // Atualizar quantidade
    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty, subtotal: newQty * item.unit_price }
            }
            return item
        }))
    }

    // Remover item
    const removeItem = (productId: string) => {
        setCart(cart.filter(item => item.product_id !== productId))
        toast.success('Item removido')
    }

    // Finalizar venda
    const finalizeSale = async () => {
        if (cart.length === 0) {
            toast.error('Carrinho vazio!')
            return
        }

        const sale: Partial<Sale> = {
            store_id: 'store_1', // Virá do contexto
            employee_id: 'emp_1', // Virá do login
            cash_register_id: 'reg_1', // Virá do caixa aberto
            customer_name: customerName || undefined,
            items: cart,
            subtotal,
            discount,
            total_amount: total,
            payment_method: selectedPayment,
            card_brand: (selectedPayment !== 'pix' && selectedPayment !== 'cash') ? selectedBrand : undefined,
            installments: selectedPayment === 'credit' ? installments : 1,
            payment_fee: fee,
            net_amount: net,
        }

        try {
            const response = await fetch('/api/pos/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale)
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Venda finalizada!')
                // Limpar carrinho
                setCart([])
                setDiscount(0)
                setCustomerName('')
                setInstallments(1)
            } else {
                toast.error(data.error || 'Erro ao finalizar venda')
            }
        } catch (error) {
            toast.error('Erro ao processar venda')
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">PDV - Ponto de Venda</h1>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <StoreIcon className="w-4 h-4" />
                                    Loja Centro
                                    <span className="mx-2">•</span>
                                    <User className="w-4 h-4" />
                                    João Silva
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Caixa Aberto</p>
                                <p className="text-lg font-semibold text-green-600">R$ 200,00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Produtos */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos</h2>

                            {/* Busca */}
                            <input
                                type="text"
                                placeholder="Buscar produto ou código de barras..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 text-lg"
                                autoFocus
                            />

                            {/* Grid de produtos */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md"
                                    >
                                        <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center">
                                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{product.name}</h3>
                                        <p className="text-lg font-bold text-blue-600">R$ {product.price.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">Estoque: {product.stock}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Carrinho e Pagamento */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Carrinho</h2>

                            {/* Itens do carrinho */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.product_id} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-sm">{item.product_name}</span>
                                                <button
                                                    onClick={() => removeItem(item.product_id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, -1)}
                                                        className="w-6 h-6 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, 1)}
                                                        className="w-6 h-6 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-blue-600">R$ {item.subtotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Cliente (opcional) */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Nome do cliente (opcional)"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>

                            {/* Totais */}
                            <div className="space-y-2 mb-6 pb-6 border-b">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Desconto:</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                    />
                                </div>
                                {fee > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Taxa:</span>
                                        <span>- R$ {fee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>TOTAL:</span>
                                    <span className="text-blue-600">R$ {total.toFixed(2)}</span>
                                </div>
                                {fee > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Você recebe:</span>
                                        <span className="font-semibold">R$ {net.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Forma de pagamento */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Forma de Pagamento
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSelectedPayment('pix')}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedPayment === 'pix'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Smartphone className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs font-medium">PIX</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedPayment('cash')}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedPayment === 'cash'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Banknote className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs font-medium">Dinheiro</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedPayment('debit')}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedPayment === 'debit'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <CreditCard className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs font-medium">Débito</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedPayment('credit')}
                                        className={`p-3 rounded-lg border-2 transition-all ${selectedPayment === 'credit'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <CreditCard className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs font-medium">Crédito</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bandeira (se cartão) */}
                            {(selectedPayment === 'credit' || selectedPayment === 'debit') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bandeira
                                    </label>
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="visa">Visa</option>
                                        <option value="mastercard">Mastercard</option>
                                        <option value="elo">Elo</option>
                                        <option value="amex">American Express</option>
                                    </select>
                                </div>
                            )}

                            {/* Parcelas (se crédito) */}
                            {selectedPayment === 'credit' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parcelas
                                    </label>
                                    <select
                                        value={installments}
                                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                            <option key={n} value={n}>
                                                {n}x de R$ {(total / n).toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="space-y-2">
                                <button
                                    onClick={finalizeSale}
                                    disabled={cart.length === 0}
                                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Finalizar Venda
                                </button>
                                <button
                                    onClick={() => {
                                        setCart([])
                                        setDiscount(0)
                                        setCustomerName('')
                                    }}
                                    className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
