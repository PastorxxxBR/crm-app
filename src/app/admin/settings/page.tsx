'use client'

import { useState } from 'react'
import { Card } from '@/components/admin/Card'
import { Bell, Lock, User, Store, CreditCard, HelpCircle, Globe, Shield } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general')

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-500">Gerencie as preferências da sua conta e loja</p>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'general' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Store className="h-5 w-5" />
                        Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <User className="h-5 w-5" />
                        Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Bell className="h-5 w-5" />
                        Notificações
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                            }`}
                    >
                        <Shield className="h-5 w-5" />
                        Segurança
                    </button>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Configurações da Loja</h3>
                                    <p className="text-sm text-gray-500">Informações básicas sobre seu estabelecimento.</p>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-900">Nome da Loja</label>
                                        <input
                                            type="text"
                                            defaultValue="Fashion Store"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-900">Email de Contato</label>
                                        <input
                                            type="email"
                                            defaultValue="contato@fashionstore.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-900">Moeda</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none">
                                            <option>BRL (R$)</option>
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Perfil do Administrador</h3>
                                    <p className="text-sm text-gray-500">Gerencie suas informações pessoais.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-bold">
                                        JD
                                    </div>
                                    <button className="text-sm font-medium text-pink-600 hover:text-pink-700">
                                        Alterar foto
                                    </button>
                                </div>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-gray-900">Nome Completo</label>
                                        <input
                                            type="text"
                                            defaultValue="Jane Doe"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
                                    <p className="text-sm text-gray-500">Escolha como você quer ser notificado.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">Novos Pedidos</p>
                                            <p className="text-sm text-gray-500">Receba um alerta quando entrar um novo pedido.</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">Chat</p>
                                            <p className="text-sm text-gray-500">Receba notificações de novas mensagens.</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">Marketing</p>
                                            <p className="text-sm text-gray-500">Relatórios semanais de desempenho.</p>
                                        </div>
                                        <input type="checkbox" className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Segurança</h3>
                                    <p className="text-sm text-gray-500">Proteja sua conta.</p>
                                </div>
                                <div className="space-y-4">
                                    <button className="text-sm font-medium text-pink-600 hover:text-pink-700">
                                        Alterar senha
                                    </button>
                                    <div className="pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Autenticação de dois fatores</h4>
                                        <p className="text-sm text-gray-500 mb-4">Adicione uma camada extra de segurança à sua conta.</p>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Configurar 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors shadow-sm">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
