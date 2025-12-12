// Utilitários para formatação de dados de gráficos

/**
 * Formata dados agregados para gráfico de barras/linha
 */
export function formatChartData(
    data: any[],
    nameField: string,
    valueField: string
): Array<{ name: string; value: number }> {
    return data.map(item => ({
        name: item[nameField]?.toString() || 'N/A',
        value: Number(item[valueField]) || 0
    }));
}

/**
 * Formata dados de série temporal
 */
export function formatTimeSeriesData(
    data: any[],
    dateField: string,
    valueField: string,
    dateFormat: 'day' | 'month' | 'year' = 'day'
): Array<{ name: string; value: number }> {
    return data.map(item => {
        const date = new Date(item[dateField]);
        let name = '';

        switch (dateFormat) {
            case 'day':
                name = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                break;
            case 'month':
                name = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                break;
            case 'year':
                name = date.getFullYear().toString();
                break;
        }

        return {
            name,
            value: Number(item[valueField]) || 0
        };
    });
}

/**
 * Agrupa dados por campo e soma valores
 */
export function aggregateByField(
    data: any[],
    groupField: string,
    sumField: string
): Array<{ name: string; value: number }> {
    const grouped = data.reduce((acc, item) => {
        const key = item[groupField]?.toString() || 'Outros';
        if (!acc[key]) {
            acc[key] = 0;
        }
        acc[key] += Number(item[sumField]) || 0;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({
        name,
        value: value as number
    }));
}

/**
 * Calcula percentual para gráficos gauge
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número grande com abreviação (K, M, B)
 */
export function formatLargeNumber(value: number): string {
    if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

/**
 * Gera dados mock para testes
 */
export function generateMockData(count: number = 7): Array<{ name: string; value: number }> {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return Array.from({ length: count }, (_, i) => ({
        name: days[i % 7],
        value: Math.floor(Math.random() * 100) + 20
    }));
}
