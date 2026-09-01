import React, { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';

// Generates an organic hexagonal grid matching Screenshot 1 & 3
export default function HoneycombDistributionChart({ onInspectCategory }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Category definitions matching image 1
  const categories = {
    stir: {
      id: 'stir',
      label: 'Stir in strength (Infrastructure)',
      shortLabel: 'Stir in strength',
      pct: '51%',
      amount: '₹3,420 Lakhs',
      color: '#2563eb', // Vibrant Blue
      bgClass: 'bg-blue-600',
      textClass: 'text-blue-600',
      borderClass: 'border-blue-200'
    },
    healthier: {
      id: 'healthier',
      label: 'Healthier every day (Healthcare)',
      shortLabel: 'Healthier every day',
      pct: '28%',
      amount: '₹1,880 Lakhs',
      color: '#f97316', // Orange / Amber
      bgClass: 'bg-orange-500',
      textClass: 'text-orange-600',
      borderClass: 'border-orange-200'
    },
    iron: {
      id: 'iron',
      label: 'Iron boost Q3 (Drinking Water)',
      shortLabel: 'Iron boost Q3',
      pct: '12%',
      amount: '₹840 Lakhs',
      color: '#10b981', // Emerald Green
      bgClass: 'bg-emerald-500',
      textClass: 'text-emerald-600',
      borderClass: 'border-emerald-200'
    },
    ambassador: {
      id: 'ambassador',
      label: 'Ambassador program (Community)',
      shortLabel: 'Ambassador program',
      pct: '9%',
      amount: '₹610 Lakhs',
      color: '#8b5cf6', // Violet / Purple
      bgClass: 'bg-purple-500',
      textClass: 'text-purple-600',
      borderClass: 'border-purple-200'
    }
  };

  // Hex coordinate generator for SVG honeycomb
  // Generates columns and rows with axial offset
  const hexRadius = 11;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const hexHeight = 2 * hexRadius;
  const vertSpacing = hexHeight * 0.75;
  const horizSpacing = hexWidth;

  // Custom map cluster configuration matching the organic shape in the reference screenshot
  // Coordinates (col, row) mapped to categories or empty background cells
  const hexMap = [
    // Background outline / padding hexes
    { c: 2, r: 1, type: 'empty' }, { c: 3, r: 1, type: 'empty' }, { c: 4, r: 1, type: 'empty' }, { c: 5, r: 1, type: 'empty' }, { c: 6, r: 1, type: 'empty' }, { c: 7, r: 1, type: 'empty' }, { c: 8, r: 1, type: 'empty' },
    { c: 1, r: 2, type: 'empty' }, { c: 2, r: 2, type: 'empty' }, { c: 3, r: 2, type: 'empty' }, { c: 7, r: 2, type: 'healthier' }, { c: 8, r: 2, type: 'healthier' }, { c: 9, r: 2, type: 'empty' }, { c: 10, r: 2, type: 'empty' },
    { c: 1, r: 3, type: 'empty' }, { c: 2, r: 3, type: 'stir' }, { c: 3, r: 3, type: 'stir' }, { c: 4, r: 3, type: 'stir' }, { c: 5, r: 3, type: 'healthier' }, { c: 6, r: 3, type: 'healthier' }, { c: 7, r: 3, type: 'healthier' }, { c: 8, r: 3, type: 'healthier' }, { c: 9, r: 3, type: 'stir' }, { c: 10, r: 3, type: 'empty' },
    { c: 1, r: 4, type: 'empty' }, { c: 2, r: 4, type: 'stir' }, { c: 3, r: 4, type: 'stir' }, { c: 4, r: 4, type: 'stir' }, { c: 5, r: 4, type: 'ambassador' }, { c: 6, r: 4, type: 'ambassador' }, { c: 7, r: 4, type: 'healthier' }, { c: 8, r: 4, type: 'healthier' }, { c: 9, r: 4, type: 'stir' }, { c: 10, r: 4, type: 'stir' }, { c: 11, r: 4, type: 'empty' },
    { c: 1, r: 5, type: 'empty' }, { c: 2, r: 5, type: 'stir' }, { c: 3, r: 5, type: 'stir' }, { c: 4, r: 5, type: 'iron' }, { c: 5, r: 5, type: 'ambassador' }, { c: 6, r: 5, type: 'ambassador' }, { c: 7, r: 5, type: 'healthier' }, { c: 8, r: 5, type: 'stir' }, { c: 9, r: 5, type: 'stir' }, { c: 10, r: 5, type: 'stir' }, { c: 11, r: 5, type: 'empty' },
    { c: 2, r: 6, type: 'empty' }, { c: 3, r: 6, type: 'stir' }, { c: 4, r: 6, type: 'iron' }, { c: 5, r: 6, type: 'iron' }, { c: 6, r: 6, type: 'iron' }, { c: 7, r: 6, type: 'ambassador' }, { c: 8, r: 6, type: 'stir' }, { c: 9, r: 6, type: 'stir' }, { c: 10, r: 6, type: 'empty' },
    { c: 2, r: 7, type: 'empty' }, { c: 3, r: 7, type: 'stir' }, { c: 4, r: 7, type: 'stir' }, { c: 5, r: 7, type: 'iron' }, { c: 6, r: 7, type: 'stir' }, { c: 7, r: 7, type: 'stir' }, { c: 8, r: 7, type: 'stir' }, { c: 9, r: 7, type: 'empty' },
    { c: 3, r: 8, type: 'empty' }, { c: 4, r: 8, type: 'stir' }, { c: 5, r: 8, type: 'stir' }, { c: 6, r: 8, type: 'stir' }, { c: 7, r: 8, type: 'stir' }, { c: 8, r: 8, type: 'healthier' }, { c: 9, r: 8, type: 'empty' },
    { c: 3, r: 9, type: 'empty' }, { c: 4, r: 9, type: 'empty' }, { c: 5, r: 9, type: 'stir' }, { c: 6, r: 9, type: 'stir' }, { c: 7, r: 9, type: 'empty' }, { c: 8, r: 9, type: 'empty' },
    // Outer surrounding light subtle mesh
    { c: 0, r: 2, type: 'empty' }, { c: 0, r: 3, type: 'empty' }, { c: 0, r: 4, type: 'empty' }, { c: 0, r: 5, type: 'empty' },
    { c: 11, r: 2, type: 'empty' }, { c: 11, r: 3, type: 'empty' }, { c: 12, r: 4, type: 'empty' }, { c: 12, r: 5, type: 'empty' },
    { c: 1, r: 8, type: 'empty' }, { c: 2, r: 8, type: 'empty' }, { c: 10, r: 7, type: 'empty' }, { c: 10, r: 8, type: 'empty' }
  ];

  // Helper to generate polygon points for a regular hexagon
  const getHexPoints = (x, y, r) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + (Math.PI / 6);
      points.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  return (
    <div className="clean-card rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attributed Revenue / Disbursal</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            ₹6,750 <span className="text-sm font-semibold text-slate-500">Lakhs</span>
          </div>
        </div>
        <button 
          onClick={() => onInspectCategory && onInspectCategory('all')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition group"
        >
          View full report 
          <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </button>
      </div>

      {/* Honeycomb Hexagon Matrix */}
      <div className="relative flex items-center justify-center py-2 min-h-[220px]">
        <svg 
          viewBox="-20 -10 270 190" 
          className="w-full max-w-[320px] sm:max-w-[360px] h-auto overflow-visible select-none"
        >
          {hexMap.map((hex, idx) => {
            const x = hex.c * horizSpacing + (hex.r % 2 === 1 ? horizSpacing / 2 : 0);
            const y = hex.r * vertSpacing;
            const cat = categories[hex.type];
            const isEmpty = hex.type === 'empty';
            const isDimmed = hoveredCategory && hex.type !== hoveredCategory && !isEmpty;
            const isHighlighted = hoveredCategory && hex.type === hoveredCategory;

            let fillColor = '#f1f5f9'; // Empty background gray
            let strokeColor = '#e2e8f0';

            if (!isEmpty && cat) {
              fillColor = cat.color;
              strokeColor = '#ffffff';
            }

            return (
              <polygon
                key={idx}
                points={getHexPoints(x, y, hexRadius - 1.2)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isEmpty ? "1" : "1.5"}
                className={`hex-cell transition-all duration-200 ${
                  isEmpty ? 'opacity-40 hover:opacity-75' : ''
                } ${isDimmed ? 'opacity-20' : ''} ${isHighlighted ? 'opacity-100 filter drop-shadow-md' : ''}`}
                onMouseEnter={() => {
                  setHoveredCell({ x, y, type: hex.type });
                  if (!isEmpty) setHoveredCategory(hex.type);
                }}
                onMouseLeave={() => {
                  setHoveredCell(null);
                  setHoveredCategory(null);
                }}
                onClick={() => {
                  if (!isEmpty && onInspectCategory) {
                    onInspectCategory(hex.type);
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredCategory && categories[hoveredCategory] && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in duration-150 border border-slate-700">
            <span className="font-bold">{categories[hoveredCategory].shortLabel}</span>: {categories[hoveredCategory].pct} ({categories[hoveredCategory].amount})
          </div>
        )}
      </div>

      {/* Legend Breakdown List */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {Object.values(categories).map((cat) => {
          const isHovered = hoveredCategory === cat.id;

          return (
            <div
              key={cat.id}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onInspectCategory && onInspectCategory(cat.id)}
              className={`flex items-center justify-between py-1 px-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                isHovered ? 'bg-slate-100/80 scale-[1.01]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                  style={{ backgroundColor: cat.color }}
                ></span>
                <span className="text-xs font-semibold text-slate-700 truncate">{cat.shortLabel}</span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {cat.pct}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 shrink-0 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {cat.amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
