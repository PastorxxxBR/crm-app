'use client';

import { VChart } from '@visactor/react-vchart';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ChartContainerProps {
    spec: any;
    className?: string;
    height?: number;
}

export default function ChartContainer({ spec, className = '', height = 300 }: ChartContainerProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} style={{ height }} />
        );
    }

    // Configuração de tema baseada no dark/light mode
    const themeConfig = theme === 'dark' ? {
        background: 'transparent',
        color: '#fff',
        colorScheme: 'dark',
    } : {
        background: 'transparent',
        color: '#000',
        colorScheme: 'light',
    };

    const chartSpec = {
        ...spec,
        ...themeConfig,
        height,
    };

    return (
        <div className={`rounded-lg p-4 ${className}`}>
            <VChart spec={chartSpec} />
        </div>
    );
}
