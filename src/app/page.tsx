'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o admin
    router.push('/admin')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white">Carregando CRM...</h1>
        <p className="text-white/80 mt-2">Redirecionando para o painel</p>
      </div>
    </div>
  )
}
