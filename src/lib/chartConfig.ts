// Configurações globais para gráficos VISactor
export const chartTheme = {
    light: {
        background: 'transparent',
        color: '#000',
        colorScheme: 'light',
    },
    dark: {
        background: 'transparent',
        color: '#fff',
        colorScheme: 'dark',
    }
};

// Paleta de cores padrão
export const colorPalette = {
    primary: '#3b82f6',    // blue
    success: '#10b981',    // green
    warning: '#f59e0b',    // amber
    danger: '#ef4444',     // red
    purple: '#8b5cf6',     // purple
    pink: '#ec4899',       // pink
    indigo: '#6366f1',     // indigo
    teal: '#14b8a6',       // teal
};

// Array de cores para gráficos multi-categoria
export const chartColors = [
    colorPalette.primary,
    colorPalette.success,
    colorPalette.warning,
    colorPalette.danger,
    colorPalette.purple,
    colorPalette.pink,
    colorPalette.indigo,
    colorPalette.teal,
];

// Configurações de responsividade
export const responsiveConfig = {
    mobile: {
        height: 250,
        fontSize: 12,
    },
    tablet: {
        height: 300,
        fontSize: 14,
    },
    desktop: {
        height: 350,
        fontSize: 16,
    }
};
