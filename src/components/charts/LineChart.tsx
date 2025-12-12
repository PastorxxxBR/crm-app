'use client';

import ChartContainer from './ChartContainer';

interface LineChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    xField?: string;
    yField?: string;
    height?: number;
    color?: string;
}

export default function LineChart({
    data,
    title,
    xField = 'name',
    yField = 'value',
    height = 300,
    color = '#10b981'
}: LineChartProps) {
    const spec = {
        type: 'line',
        data: [
            {
                id: 'lineData',
                values: data
            }
        ],
        xField,
        yField,
        title: title ? {
            visible: true,
            text: title
        } : undefined,
        line: {
            style: {
                stroke: color,
                lineWidth: 2,
                lineCap: 'round',
                curveType: 'monotone'
            }
        },
        point: {
            visible: true,
            style: {
                fill: color,
                stroke: '#fff',
                strokeWidth: 2,
                size: 6
            },
            state: {
                hover: {
                    size: 8
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
