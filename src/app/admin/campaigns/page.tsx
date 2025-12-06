import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
    const supabase = createServerComponentClient({ cookies }, {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY
    })
    const { data: campaigns } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
                <Link
                    href="/admin/campaigns/new"
                    className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
                >
                    Criar Nova Campanha
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Canal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Agendado Para</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {campaigns?.map((campaign) => (
                            <tr key={campaign.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{campaign.channel}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
