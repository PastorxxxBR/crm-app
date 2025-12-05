'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'

interface Recommendation {
    id: string
    type: string
    suggestion: string
    priority: string
    status: string
}

export function MarketingInsights() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchRecs = async () => {
            const { data } = await supabase
                .from('marketing_recommendations')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setRecommendations(data)
            setLoading(false)
        }

        fetchRecs()
    }, [supabase])

    if (loading) return <div>Loading insights...</div>
    if (recommendations.length === 0) return null

    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Marketing Insights 🧠</CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-2">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 border">
                            {rec.priority === 'high' ? (
                                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                            ) : (
                                <TrendingUp className="h-5 w-5 text-blue-500 shrink-0" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{rec.suggestion}</p>
                                <p className="text-xs text-muted-foreground capitalize">{rec.type} • {rec.priority} priority</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
