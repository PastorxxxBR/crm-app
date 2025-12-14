'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal, PipelineStage } from '@/types/pipeline';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { NewDealModal } from './NewDealModal';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PipelineKanbanProps {
    pipelineId: string;
}

export function PipelineKanban({ pipelineId }: PipelineKanbanProps) {
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewDealModal, setShowNewDealModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Carregar estágios e deals
    useEffect(() => {
        loadData();
    }, [pipelineId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Carregar estágios
            const stagesRes = await fetch(`/api/pipelines/${pipelineId}/stages`);
            const stagesData = await stagesRes.json();
            setStages(Array.isArray(stagesData) ? stagesData : []);

            // Carregar deals
            const dealsRes = await fetch(`/api/deals?pipeline_id=${pipelineId}&status=open`);
            const dealsData = await dealsRes.json();
            setDeals(Array.isArray(dealsData) ? dealsData : []);
        } catch (error) {
            console.error('Error loading pipeline data:', error);
            setStages([]);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const deal = deals.find((d) => d.id === active.id);
        setActiveDeal(deal || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStageId = over.id as string;

        const deal = deals.find((d) => d.id === dealId);
        if (!deal || deal.stage_id === newStageId) return;

        // Atualizar otimisticamente
        setDeals((prev) =>
            prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d))
        );

        // Atualizar no servidor
        try {
            await fetch(`/api/deals/${dealId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage_id: newStageId }),
            });
        } catch (error) {
            console.error('Error updating deal:', error);
            // Reverter em caso de erro
            loadData();
        }
    };

    const getDealsByStage = (stageId: string) => {
        return deals.filter((deal) => deal.stage_id === stageId);
    };

    const getStageStats = (stageId: string) => {
        const stageDeals = getDealsByStage(stageId);
        const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        return {
            count: stageDeals.length,
            totalValue,
        };
    };

    const filteredDeals = deals.filter((deal) =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDealCreated = (newDeal: Deal) => {
        setDeals((prev) => [...prev, newDeal]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar deals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                    </Button>
                </div>
                <Button onClick={() => setShowNewDealModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Deal
                </Button>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {stages.map((stage) => {
                        const stageDeals = searchQuery
                            ? filteredDeals.filter((d) => d.stage_id === stage.id)
                            : getDealsByStage(stage.id);
                        const stats = getStageStats(stage.id);

                        return (
                            <SortableContext
                                key={stage.id}
                                items={stageDeals.map((d) => d.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <KanbanColumn
                                    id={stage.id}
                                    title={stage.name}
                                    color={stage.color}
                                    count={stats.count}
                                    totalValue={stats.totalValue}
                                    deals={stageDeals}
                                />
                            </SortableContext>
                        );
                    })}
                </div>

                <DragOverlay>
                    {activeDeal ? (
                        <div className="rotate-3 opacity-80">
                            <DealCard deal={activeDeal} isDragging />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* New Deal Modal */}
            <NewDealModal
                open={showNewDealModal}
                onClose={() => setShowNewDealModal(false)}
                pipelineId={pipelineId}
                stages={stages}
                onDealCreated={handleDealCreated}
            />
        </div>
    );
}
