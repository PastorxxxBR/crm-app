'use client';

import ChartContainer from './ChartContainer';

interface PieChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    height?: number;
    colors?: string[];
}

export default function PieChart({
    data,
    title,
    height = 300,
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
}: PieChartProps) {
    const spec = {
        type: 'pie',
        data: [
            {
                id: 'pieData',
                values: data
            }
        ],
        categoryField: 'name',
        valueField: 'value',
        title: title ? {
            visible: true,
            text: title
        } : undefined,
        color: colors,
        pie: {
            style: {
                padAngle: 2,
                cornerRadius: 4
            },
            state: {
                hover: {
                    outerRadius: 0.85,
                    stroke: '#000',
                    strokeWidth: 1
                },
                selected: {
                    outerRadius: 0.9
                }
            }
        },
        label: {
            visible: true,
            style: {
                fill: 'currentColor'
            }
        },
        legends: {
            visible: true,
            orient: 'right',
            item: {
                label: {
                    style: {
                        fill: 'currentColor'
                    }
                }
            }
        },
        tooltip: {
            visible: true,
            mark: {
                content: [
                    {
                        key: (datum: any) => datum.name,
                        value: (datum: any) => datum.value
                    }
                ]
            }
        }
    };

    return <ChartContainer spec={spec} height={height} />;
}
