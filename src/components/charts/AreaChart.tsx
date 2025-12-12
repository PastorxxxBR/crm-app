'use client';

import ChartContainer from './ChartContainer';

interface AreaChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    xField?: string;
    yField?: string;
    height?: number;
    color?: string;
}

export default function AreaChart({
    data,
    title,
    xField = 'name',
    yField = 'value',
    height = 300,
    color = '#8b5cf6'
}: AreaChartProps) {
    const spec = {
        type: 'area',
        data: [
            {
                id: 'areaData',
                values: data
            }
        ],
        xField,
        yField,
        title: title ? {
            visible: true,
            text: title
        } : undefined,
        area: {
            style: {
                fill: color,
                fillOpacity: 0.3,
                curveType: 'monotone'
            }
        },
        line: {
            style: {
                stroke: color,
                lineWidth: 2,
                curveType: 'monotone'
            }
        },
        point: {
            visible: true,
            style: {
                fill: color,
                stroke: '#fff',
                strokeWidth: 2,
                size: 5
            },
            state: {
                hover: {
                    size: 7
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
