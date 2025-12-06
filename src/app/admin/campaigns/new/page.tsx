'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase'

export default function NewCampaignPage() {
    const router = useRouter()
    const supabase = createClientComponentClient({
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            segment: { tag: formData.get('segment') },
            message_template: formData.get('message_template'),
            scheduled_at: formData.get('scheduled_at'),
            status: 'scheduled'
        }

        const { error } = await supabase.from('campaigns').insert(data)

        if (!error) {
            router.push('/admin/campaigns')
            router.refresh()
        } else {
            alert('Erro ao criar campanha: ' + error.message)
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Nova Campanha</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Campanha</label>
                    <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Segmento</label>
                    <select name="segment" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none">
                        <option value="all">Todos</option>
                        <option value="varejo">Varejo</option>
                        <option value="atacado">Atacado</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Mensagem (Template)</label>
                    <p className="text-xs text-gray-500 mb-1">Variáveis disponíveis: {'{{name}}'}</p>
                    <textarea
                        name="message_template"
                        rows={4}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none"
                        placeholder="Olá {{name}}, confira nossas novidades..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Agendar Para</label>
                    <input
                        type="datetime-local"
                        name="scheduled_at"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 disabled:opacity-50"
                    >
                        {loading ? 'Criando...' : 'Agendar Disparo'}
                    </button>
                </div>
            </form>
        </div>
    )
}
