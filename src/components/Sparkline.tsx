import React from 'react';

export function Sparkline({ history, color }: { history: number[], color: string }) {
    if (!history || history.length === 0) return <div className="h-[40px] w-full bg-gray-50 rounded"></div>;
    const max = 100;
    const height = 40;
    const width = 100;

    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - (val / max) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-[40px] mt-2 mb-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 rounded-sm overflow-hidden relative">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
