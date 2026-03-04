/**
 * @file GridBackground.tsx
 * @description 网格背景组件
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

'use client';

import React from 'react';

// 网格背景属性接?interface GridBackgroundProps {
  gridSize: number;
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  className?: string;
}

/**
 * 网格背景组件
 */
export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize,
  width,
  height,
  color = '#e5e7eb',
  opacity = 0.5,
  className = '',
}) => {
  // 生成网格线的SVG图案
  const generateGridPattern = () => {
    const patternId = `grid-pattern-${gridSize}`;

    return (
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <pattern
            id={patternId}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#${patternId})`} />
      </svg>
    );
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width, height }}
    >
      {generateGridPattern()}
    </div>
  );
};

// 点状网格背景组件
export const DotGridBackground: React.FC<GridBackgroundProps> = ({
  gridSize,
  width,
  height,
  color = '#e5e7eb',
  opacity = 0.3,
  className = '',
}) => {
  const generateDotPattern = () => {
    const patternId = `dot-pattern-${gridSize}`;

    return (
      <svg width={width} height={height} className="absolute inset-0">
        <defs>
          <pattern
            id={patternId}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gridSize / 2}
              cy={gridSize / 2}
              r="1"
              fill={color}
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#${patternId})`} />
      </svg>
    );
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width, height }}
    >
      {generateDotPattern()}
    </div>
  );
};

// 棋盘网格背景组件
export const CheckerboardBackground: React.FC<
  Omit<GridBackgroundProps, 'gridSize'> & {
    cellSize?: number;
    color1?: string;
    color2?: string;
  }
> = ({
  width,
  height,
  cellSize = 10,
  color1 = '#f8fafc',
  color2 = '#f1f5f9',
  className = '',
}) => {
  const patternId = `checkerboard-pattern-${cellSize}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width, height }}
    >
      <svg width={width} height={height}>
        <defs>
          <pattern
            id={patternId}
            width={cellSize * 2}
            height={cellSize * 2}
            patternUnits="userSpaceOnUse"
          >
            <rect width={cellSize} height={cellSize} fill={color1} />
            <rect
              x={cellSize}
              y={cellSize}
              width={cellSize}
              height={cellSize}
              fill={color1}
            />
            <rect
              x={cellSize}
              width={cellSize}
              height={cellSize}
              fill={color2}
            />
            <rect
              y={cellSize}
              width={cellSize}
              height={cellSize}
              fill={color2}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
