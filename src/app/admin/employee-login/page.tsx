'use client'

import { useState } from 'react'
import { Lock, Store, User, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function EmployeeLoginPage() {
    const router = useRouter()
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit)
        }
    }

    const handleBackspace = () => {
        setPin(pin.slice(0, -1))
    }

    const handleLogin = async () => {
        if (pin.length !== 4) {
            toast.error('Digite o PIN completo')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/employees/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin })
            })

            const data = await response.json()

            if (data.success) {
                // Salvar sessão
                localStorage.setItem('employee', JSON.stringify(data.employee))
                localStorage.setItem('permissions', JSON.stringify(data.permissions))

                toast.success(data.message)

                // Redirecionar para PDV
                router.push('/admin/pos')
            } else {
                toast.error(data.error)
                setPin('')
            }
        } catch (error) {
            toast.error('Erro ao fazer login')
            setPin('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Login de Funcionário</h1>
                    <p className="text-gray-600">Digite seu PIN de 4 dígitos</p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-bold ${pin.length > i
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : 'border-gray-300 bg-gray-50 text-gray-300'
                                }`}
                        >
                            {pin.length > i ? '●' : ''}
                        </div>
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handlePinInput(num.toString())}
                            disabled={loading}
                            className="h-16 bg-gray-100 hover:bg-gray-200 rounded-xl text-2xl font-semibold text-gray-900 transition-colors disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleBackspace}
                        disabled={loading}
                        className="h-16 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-semibold text-red-700 transition-colors disabled:opacity-50"
                    >
                        ← Apagar
                    </button>
                    <button
                        onClick={() => handlePinInput('0')}
                        disabled={loading}
                        className="h-16 bg-gray-100 hover:bg-gray-200 rounded-xl text-2xl font-semibold text-gray-900 transition-colors disabled:opacity-50"
                    >
                        0
                    </button>
                    <button
                        onClick={handleLogin}
                        disabled={loading || pin.length !== 4}
                        className="h-16 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Entrar
                            </>
                        )}
                    </button>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">📌 PINs de Teste:</p>
                    <div className="space-y-1 text-xs text-blue-700">
                        <p>• 1234 - Maria (Gerente Loja Centro)</p>
                        <p>• 2345 - João (Gerente Loja Shopping)</p>
                        <p>• 3456 - Ana (Gerente Loja Bairro)</p>
                        <p>• 4567 - Carlos (Caixa Loja Centro)</p>
                        <p>• 5678 - Paula (Caixa Loja Shopping)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
