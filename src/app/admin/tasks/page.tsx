'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            // Garantir que data é um array
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading tasks:', error);
            setTasks([]); // Definir array vazio em caso de erro
        } finally {
            setLoading(false);
        }
    };

    const createTask = async () => {
        if (!newTaskTitle.trim()) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTaskTitle }),
            });

            const newTask = await res.json();
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'destructive';
            case 'high': return 'default';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'secondary';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Urgente';
            case 'high': return 'Alta';
            case 'medium': return 'Média';
            case 'low': return 'Baixa';
            default: return priority;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Tarefas</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas tarefas e atividades
                    </p>
                </div>
            </div>

            {/* Quick Add */}
            <div className="flex gap-2">
                <Input
                    placeholder="Adicionar nova tarefa..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createTask()}
                    className="flex-1"
                />
                <Button onClick={createTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>

            {/* Tasks List */}
            <div className="space-y-6">
                {/* Pending Tasks */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Circle className="h-5 w-5" />
                        Pendentes ({pendingTasks.length})
                    </h2>
                    <div className="space-y-2">
                        {pendingTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <Checkbox
                                    checked={false}
                                    onCheckedChange={() => toggleTaskStatus(task)}
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{task.title}</span>
                                        <Badge variant={getPriorityColor(task.priority)}>
                                            {getPriorityLabel(task.priority)}
                                        </Badge>
                                    </div>
                                    {task.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {task.due_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                                            </span>
                                        )}
                                        {task.assigned_to && (
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Atribuído
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhuma tarefa pendente
                            </p>
                        )}
                    </div>
                </div>

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Concluídas ({completedTasks.length})
                        </h2>
                        <div className="space-y-2">
                            {completedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-4 rounded-lg border bg-card opacity-60"
                                >
                                    <Checkbox
                                        checked={true}
                                        onCheckedChange={() => toggleTaskStatus(task)}
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium line-through">{task.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
