'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await fetch('/api/calendar/events');
            const data = await res.json();

            const formattedEvents = data.map((event: any) => ({
                ...event,
                start: new Date(event.start_date),
                end: new Date(event.end_date),
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            // Mock data for now
            setEvents([
                {
                    id: '1',
                    title: 'Reunião com Cliente',
                    start: new Date(2025, 0, 15, 10, 0),
                    end: new Date(2025, 0, 15, 11, 0),
                },
                {
                    id: '2',
                    title: 'Follow-up Vendas',
                    start: new Date(2025, 0, 16, 14, 0),
                    end: new Date(2025, 0, 16, 15, 0),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        const title = window.prompt('Título do evento:');
        if (title) {
            const newEvent = {
                id: String(Date.now()),
                title,
                start,
                end,
            };
            setEvents([...events, newEvent]);
        }
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        alert(`Evento: ${event.title}\nInício: ${format(event.start, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`);
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
                    <h1 className="text-3xl font-bold">Calendário</h1>
                    <p className="text-muted-foreground">
                        Gerencie seus eventos e compromissos
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                </Button>
            </div>

            {/* Calendar */}
            <div className="flex-1 bg-card rounded-lg border p-4" style={{ minHeight: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    messages={{
                        next: 'Próximo',
                        previous: 'Anterior',
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Hora',
                        event: 'Evento',
                        noEventsInRange: 'Não há eventos neste período',
                    }}
                />
            </div>
        </div>
    );
}
