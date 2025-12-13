'use client';

import { useDroppable } from '@dnd-kit/core';
import { Deal } from '@/types/pipeline';
import { DealCard } from './DealCard';
import { formatCurrency } from '@/lib/utils';

interface KanbanColumnProps {
    id: string;
    title: string;
    color: string;
    count: number;
    totalValue: number;
    deals: Deal[];
}

export function KanbanColumn({
    id,
    title,
    color,
    count,
    totalValue,
    deals,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div className="flex flex-col min-w-[320px] max-w-[320px]">
            {/* Column Header */}
            <div
                className="flex items-center justify-between p-3 rounded-t-lg border-b-2"
                style={{ borderColor: color }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                    {formatCurrency(totalValue)}
                </span>
            </div>

            {/* Column Content */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-2 space-y-2 min-h-[500px] rounded-b-lg border border-t-0 transition-colors ${isOver ? 'bg-accent/50 border-primary' : 'bg-card'
                    }`}
            >
                {deals.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                        Nenhum deal neste estágio
                    </div>
                ) : (
                    deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
                )}
            </div>
        </div>
    );
}
