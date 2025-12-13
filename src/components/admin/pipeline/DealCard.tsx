'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/pipeline';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, DollarSign, User, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DealCardProps {
    deal: Deal;
    isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: deal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''
                }`}
        >
            <CardContent className="p-3 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1">
                        {deal.title}
                    </h4>
                    <button className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>

                {/* Description */}
                {deal.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {deal.description}
                    </p>
                )}

                {/* Value */}
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(deal.value)}
                </div>

                {/* Tags */}
                {deal.tags && deal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {deal.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {deal.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{deal.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                    {/* Expected Close Date */}
                    {deal.expected_close_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(deal.expected_close_date), 'dd/MM', {
                                locale: ptBR,
                            })}
                        </div>
                    )}

                    {/* Assigned To */}
                    {deal.assigned_to && (
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                                {getInitials(deal.assigned_to)}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
