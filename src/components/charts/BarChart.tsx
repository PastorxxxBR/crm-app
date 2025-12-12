'use client';

import ChartContainer from './ChartContainer';

interface BarChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    xField?: string;
    yField?: string;
    height?: number;
    color?: string;
}

export default function BarChart({
    data,
    title,
    xField = 'name',
    yField = 'value',
    height = 300,
    color = '#3b82f6'
}: BarChartProps) {
    const spec = {
        type: 'bar',
        data: [
            {
                id: 'barData',
                values: data
            }
        ],
        xField,
        yField,
        seriesField: xField,
        title: title ? {
            visible: true,
            text: title
        } : undefined,
        bar: {
            style: {
                fill: color,
                cornerRadius: [4, 4, 0, 0]
            },
            state: {
                hover: {
                    stroke: '#000',
                    strokeWidth: 1
                }
            }
        },
        axes: [
            {
                orient: 'bottom',
                type: 'band',
                label: {
                    style: {
                        fill: 'currentColor'
                    }
                }
            },
            {
                orient: 'left',
                type: 'linear',
                label: {
                    style: {
                        fill: 'currentColor'
                    }
                }
            }
        ],
        tooltip: {
            visible: true
        }
    };

    return <ChartContainer spec={spec} height={height} />;
}
