import React, { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  backgroundColor?: string;
  showShadow?: boolean;
}

/**
 * MobileLayout 组件
 * 用于在PC端将移动端界面居中显示
 * 参考：C:\Users\alex\Downloads\参考PC端布局样式\src\components\MobileLayout.tsx
 * 
 * @param children - 子组件内容
 * @param maxWidth - 最大宽度，默认 '430px'
 * @param backgroundColor - 背景颜色，默认 '#0C1017'
 * @param showShadow - 是否显示阴影，默认 true
 */
export function MobileLayout({ 
  children, 
  maxWidth = '430px',
  backgroundColor = '#0C1017',
  showShadow = true
}: MobileLayoutProps) {
  return (
    <div 
      className="mobile-layout-wrapper" 
      style={{ 
        backgroundColor: backgroundColor, 
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch',
        minHeight: '100vh'
      }}
    >
      {/* PC端居中容器 */}
      <div 
        className="mobile-layout-container"
        style={{
          maxWidth: maxWidth,
          margin: '0 auto',
          backgroundColor: backgroundColor,
          minHeight: '100vh',
          position: 'relative',
          boxShadow: showShadow ? '0 0 50px rgba(0, 0, 0, 0.5)' : 'none',
          paddingBottom: '65px'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default MobileLayout;

