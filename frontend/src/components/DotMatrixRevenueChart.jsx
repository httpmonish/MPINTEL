import React, { useState } from 'react';

export default function DotMatrixRevenueChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 35 columns of dots across the chart width
  // 25 rows of dots across chart height
  const cols = 35;
  const rows = 25;

  // Generate an upward trending curve with natural variance matching the screenshot
  const curveValues = [
    6, 7, 7, 6, 8, 9, 8, 7, 9, 10, 
    9, 8, 10, 11, 10, 12, 13, 11, 13, 14, 
    13, 15, 16, 15, 17, 18, 16, 18, 19, 18, 
    20, 21, 20, 22, 24
  ];

  // Grid dimensions for SVG
  const width = 280;
  const height = 180;
  const dotSpacingX = width / (cols - 1);
  const dotSpacingY = height / (rows - 1);

  return (
    <div className="clean-card rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue / Velocity Over Time</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Attributed via eSAKSHI
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ₹18,420 <span className="text-sm font-semibold text-slate-500">Lakhs</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ₹614 avg/day
            </span>
          </div>
        </div>
      </div>

      {/* Dot Matrix Area Chart Canvas */}
      <div className="relative flex items-center justify-between gap-3 pt-2">
        {/* Y Axis Values */}
        <div className="flex flex-col justify-between text-[10px] font-mono font-medium text-slate-400 h-44 py-1 select-none">
          <span>₹1000</span>
          <span>₹750</span>
          <span>₹500</span>
          <span>₹250</span>
          <span>₹0</span>
        </div>

        {/* SVG Dot Grid */}
        <div className="relative flex-1">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-44 overflow-visible select-none"
          >
            {/* Background grid light dots + Foreground filled dots */}
            {Array.from({ length: cols }).map((_, cIdx) => {
              const activeHeightInDots = curveValues[cIdx] || 5;
              const x = cIdx * dotSpacingX;

              return (
                <g key={cIdx} className="dot-col">
                  {Array.from({ length: rows }).map((_, rIdx) => {
                    const y = height - rIdx * dotSpacingY;
                    const isFilled = rIdx <= activeHeightInDots;
                    const isHovered = hoveredPoint?.col === cIdx;

                    return (
                      <circle
                        key={rIdx}
                        cx={x}
                        cy={y}
                        r={isHovered ? (isFilled ? 2.5 : 1.5) : (isFilled ? 2.0 : 1.2)}
                        fill={isFilled ? '#f97316' : '#e2e8f0'}
                        opacity={isFilled ? 1 : 0.45}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => {
                          setHoveredPoint({
                            col: cIdx,
                            val: Math.round((activeHeightInDots / rows) * 1000),
                            day: `Day ${cIdx + 1}`
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Hover Card */}
          {hoveredPoint && (
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-mono px-3 py-1 rounded-lg shadow-xl pointer-events-none border border-slate-700 animate-in fade-in"
            >
              <span className="text-orange-400 font-bold">{hoveredPoint.day}</span>: ₹{hoveredPoint.val}L Sanctioned
            </div>
          )}
        </div>
      </div>

      {/* X Axis Range */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-6 pt-1 border-t border-slate-100">
        <span>Jul 6</span>
        <span>Jul 18</span>
        <span>Jul 30</span>
        <span>Aug 8</span>
      </div>
    </div>
  );
}
