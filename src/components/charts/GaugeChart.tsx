'use client';

import ChartContainer from './ChartContainer';

interface GaugeChartProps {
    value: number;
    max?: number;
    title?: string;
    height?: number;
    color?: string;
    unit?: string;
}

export default function GaugeChart({
    value,
    max = 100,
    title,
    height = 250,
    color = '#10b981',
    unit = '%'
}: GaugeChartProps) {
    const percentage = (value / max) * 100;

    const spec = {
        type: 'gauge',
        data: [
            {
                id: 'gaugeData',
                values: [
                    {
                        type: 'Target',
                        value: percentage
                    }
                ]
            }
        ],
        categoryField: 'type',
        valueField: 'value',
        title: title ? {
            visible: true,
            text: title
        } : undefined,
        gauge: {
            type: 'circularProgress',
            progress: {
                style: {
                    fill: color
                }
            },
            track: {
                style: {
                    fill: '#e5e7eb'
                }
            }
        },
        indicator: {
            visible: true,
            content: [
                {
                    style: {
                        text: `${value}${unit}`,
                        fontSize: 32,
                        fontWeight: 'bold',
                        fill: 'currentColor'
                    }
                },
                {
                    style: {
                        text: `de ${max}${unit}`,
                        fontSize: 14,
                        fill: 'currentColor',
                        dy: 10
                    }
                }
            ]
        }
    };

    return <ChartContainer spec={spec} height={height} />;
}
