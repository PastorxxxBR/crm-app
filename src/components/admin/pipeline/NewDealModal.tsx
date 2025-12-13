'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Deal, PipelineStage } from '@/types/pipeline';

interface NewDealModalProps {
    open: boolean;
    onClose: () => void;
    pipelineId: string;
    stages: PipelineStage[];
    onDealCreated: (deal: Deal) => void;
}

export function NewDealModal({ open, onClose, pipelineId, stages, onDealCreated }: NewDealModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        value: '',
        stage_id: stages[0]?.id || '',
        expected_close_date: '',
        tags: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pipeline_id: pipelineId,
                    title: formData.title,
                    description: formData.description,
                    value: parseFloat(formData.value) || 0,
                    stage_id: formData.stage_id,
                    expected_close_date: formData.expected_close_date || null,
                    tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                }),
            });

            if (!response.ok) throw new Error('Failed to create deal');

            const deal = await response.json();
            onDealCreated(deal);

            // Reset form
            setFormData({
                title: '',
                description: '',
                value: '',
                stage_id: stages[0]?.id || '',
                expected_close_date: '',
                tags: '',
            });

            onClose();
        } catch (error) {
            console.error('Error creating deal:', error);
            alert('Erro ao criar deal. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Deal</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Venda para Cliente X"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes do negócio..."
                            rows={3}
                        />
                    </div>

                    {/* Value and Stage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor (R$)</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stage">Estágio</Label>
                            <Select
                                value={formData.stage_id}
                                onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((stage) => (
                                        <SelectItem key={stage.id} value={stage.id}>
                                            {stage.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Expected Close Date */}
                    <div className="space-y-2">
                        <Label htmlFor="expected_close_date">Data de Fechamento Esperada</Label>
                        <Input
                            id="expected_close_date"
                            type="date"
                            value={formData.expected_close_date}
                            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="urgente, vip, follow-up"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Deal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
