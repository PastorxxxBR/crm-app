'use client'

import { useState } from 'react'
import { Card } from '@/components/admin/Card'
import { MessageSquare, Send, Search, MoreVertical, Phone, Video } from 'lucide-react'

const conversations = [
    {
        id: 1,
        name: 'Ana Silva',
        lastMessage: 'Olá, gostaria de saber o status do meu pedido.',
        time: '10:30',
        unread: 2,
        online: true,
        avatar: 'A'
    },
    {
        id: 2,
        name: 'Carlos Souza',
        lastMessage: 'Obrigado pelo atendimento!',
        time: 'Ontem',
        unread: 0,
        online: false,
        avatar: 'C'
    },
    {
        id: 3,
        name: 'Mariana Oliveira',
        lastMessage: 'Vocês têm esse vestido no tamanho M?',
        time: 'Ontem',
        unread: 0,
        online: true,
        avatar: 'M'
    },
    {
        id: 4,
        name: 'Roberto Santos',
        lastMessage: 'Confirmado o pagamento.',
        time: '08/12',
        unread: 0,
        online: false,
        avatar: 'R'
    }
]

const messages = [
    {
        id: 1,
        sender: 'user',
        text: 'Olá Ana, bom dia! Tudo bem?',
        time: '10:31'
    },
    {
        id: 2,
        sender: 'other',
        text: 'Bom dia! Tudo sim. Gostaria de saber sobre o pedido #ORD-001.',
        time: '10:32'
    },
    {
        id: 3,
        sender: 'user',
        text: 'Só um momento que vou verificar para você.',
        time: '10:33'
    }
]

export default function ChatPage() {
    const [activeChat, setActiveChat] = useState(1)
    const [newMessage, setNewMessage] = useState('')

    return (
        <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-100 transition-colors ${activeChat === chat.id ? 'bg-white border-l-4 border-pink-500 shadow-sm' : ''}`}
                        >
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                    {chat.avatar}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm font-medium ${activeChat === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {chat.name}
                                    </h4>
                                    <span className="text-xs text-gray-400">{chat.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="flex flex-col justify-center">
                                    <span className="h-5 w-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold">
                                        {chat.unread}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Ana Silva</h3>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                ● Online agora
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Phone className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Video className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'user'
                                    ? 'bg-pink-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-[10px] mt-1 block ${msg.sender === 'user' ? 'text-pink-100' : 'text-gray-400'
                                    }`}>
                                    {msg.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-sm"
                        />
                        <button className="p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
