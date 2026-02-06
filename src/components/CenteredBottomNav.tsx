import React from 'react';

interface CenteredBottomNavProps {
  children: React.ReactNode;
  maxWidth?: string;
  height?: string;
  backgroundColor?: string;
  zIndex?: number;
}

/**
 * CenteredBottomNav 组件
 * 用于在PC端将底部导航栏居中显示
 * 
 * @param children - 导航栏内容
 * @param maxWidth - 最大宽度，默认 '430px'
 * @param height - 高度，默认 '65px'
 * @param backgroundColor - 背景颜色，默认 '#151a23'
 * @param zIndex - 层级，默认 999
 */
export function CenteredBottomNav({
  children,
  maxWidth = '430px',
  height = '65px',
  backgroundColor = '#151a23',
  zIndex = 999
}: CenteredBottomNavProps) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: maxWidth,
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        height: height,
        margin: 0,
        padding: 0,
        background: backgroundColor,
        zIndex: zIndex,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

export default CenteredBottomNav;

