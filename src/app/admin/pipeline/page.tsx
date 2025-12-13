'use client';

import { useState, useEffect } from 'react';
import { PipelineKanban } from '@/components/admin/pipeline/PipelineKanban';
import { Button } from '@/components/ui/button';
import { Settings, Plus, BarChart3 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Pipeline {
    id: string;
    name: string;
    color: string;
    is_default?: boolean;
}

export default function PipelinePage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [selectedPipeline, setSelectedPipeline] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPipelines();
    }, []);

    const loadPipelines = async () => {
        try {
            const res = await fetch('/api/pipelines');
            const data = await res.json();
            setPipelines(data);

            // Selecionar o pipeline padrão
            const defaultPipeline = data.find((p: Pipeline) => p.is_default);
            if (defaultPipeline) {
                setSelectedPipeline(defaultPipeline.id);
            } else if (data.length > 0) {
                setSelectedPipeline(data[0].id);
            }
        } catch (error) {
            console.error('Error loading pipelines:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas oportunidades de vendas visualmente
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estatísticas
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                    </Button>
                </div>
            </div>

            {/* Pipeline Selector */}
            <div className="flex items-center gap-4">
                <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Selecione um pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                        {pipelines.map((pipeline) => (
                            <SelectItem key={pipeline.id} value={pipeline.id}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: pipeline.color }}
                                    />
                                    {pipeline.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pipeline
                </Button>
            </div>

            {/* Kanban Board */}
            {selectedPipeline && <PipelineKanban pipelineId={selectedPipeline} />}
        </div>
    );
}
