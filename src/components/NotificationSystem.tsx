'use client'

import { useState, useEffect } from 'react'
import { X, Bell, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'

interface Notification {
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    timestamp: Date
    read: boolean
    action?: {
        label: string
        href: string
    }
}

export function NotificationSystem() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Connect to SSE endpoint for real-time notifications
        const eventSource = new EventSource('/api/notifications/stream')

        eventSource.onmessage = (event) => {
            const notification: Notification = JSON.parse(event.data)
            addNotification(notification)
        }

        eventSource.onerror = () => {
            console.error('SSE connection error')
            eventSource.close()
        }

        // Mock notifications for demo
        setTimeout(() => {
            addNotification({
                id: '1',
                type: 'warning',
                title: 'Estoque Baixo',
                message: 'Produto "Blusa Cropped" tem apenas 5 unidades restantes',
                timestamp: new Date(),
                read: false,
                action: { label: 'Ver Produto', href: '/admin/inventory' }
            })
        }, 2000)

        return () => {
            eventSource.close()
        }
    }, [])

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length)
    }, [notifications])

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />
            case 'info': return <Info className="w-5 h-5 text-blue-600" />
        }
    }

    const getBgColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200'
            case 'warning': return 'bg-yellow-50 border-yellow-200'
            case 'error': return 'bg-red-50 border-red-200'
            case 'info': return 'bg-blue-50 border-blue-200'
        }
    }

    return (
        <>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getBgColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-medium text-gray-900 text-sm">
                                                    {notification.title}
                                                </h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeNotification(notification.id)
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                >
                                                    <X className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatTimestamp(notification.timestamp)}
                                                </span>
                                                {notification.action && (
                                                    <a
                                                        href={notification.action.href}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {notification.action.label} →
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <a
                                href="/admin/notifications"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Ver todas as notificações
                            </a>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

function formatTimestamp(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
}
