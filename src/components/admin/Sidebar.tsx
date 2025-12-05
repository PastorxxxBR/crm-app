'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ShoppingBag, MessageSquare, Megaphone, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Clientes', href: '/admin/customers', icon: Users },
    { name: 'Campanhas', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 px-4 py-6 text-white">
            <div className="mb-8 flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-pink-500" />
                <span className="text-xl font-bold">FashionCRM</span>
            </div>

            <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-gray-800 pt-4">
                <button
                    onClick={() => console.log('Logout')}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                    <LogOut className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </div>
    )
}
