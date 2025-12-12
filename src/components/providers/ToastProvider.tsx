'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                style: {
                    background: 'white',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                },
                className: 'toast',
            }}
        />
    )
}
