import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, loading, refreshUserInfo } = useAuth();
  const { t } = useLanguage();
  
  // 调试日志
  useEffect(() => {
    // console.log('📊 Header 状态更新:', { isLoggedIn, userInfo, loading });
  }, [isLoggedIn, userInfo, loading]);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // 定期刷新余额（类似PC端）
  useEffect(() => {
    if (isLoggedIn) {
      const refreshBalance = async () => {
        try {
          // 强制刷新，跳过缓存
          if (refreshUserInfo) {
            await refreshUserInfo(true);
          }
        } catch (error) {
          console.error('刷新余额失败:', error);
        }
      };

      // 立即刷新一次
      refreshBalance();
      // 每3.3秒刷新一次（与PC端保持一致）
      const interval = setInterval(() => {
        refreshBalance();
      }, 3300);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, refreshUserInfo]);

  const [xxJilu, setXxJilu] = useState(38219);
 
   useEffect(() => {
     const timer = setInterval(() => {
       setXxJilu(prevCount => prevCount + 25);
     }, 5000);
     return () => clearInterval(timer);
   }, []);
   useEffect(() => {
     const timer = setInterval(() => {
       setXxJilu(prevCount => prevCount - 5);
     }, 2000);
     return () => clearInterval(timer);
   }, []);

  const logos = [
    'https://www.xpj00000.vip/indexImg/logo-ag.446396fe.webp',
    'https://www.xpj00000.vip/indexImg/logo-1.708d8eb1.png',
    '/images/logo-anniversary.d8eb1379.png',
  ];

  // 创建扩展数组，在末尾添加第一张图片的副本
  const extendedLogos = [...logos, logos[0]];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentLogoIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 当滚动到复制的第一张图片时（索引为logos.length），瞬间跳回真正的第一张（索引0）
    if (currentLogoIndex === logos.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentLogoIndex(0);
      }, 500); // 等待过渡动画完成
    }
  }, [currentLogoIndex, logos.length]);

  return (
    <>
      <style>{`
        .header-cur-online:before {
            content: "";
            background: #1eff1e;
            filter: drop-shadow(0px 0px .3125rem #1eff1e);
            width: .375rem;
            height: .375rem;
            border-radius: 100%;
            margin: 0 .25rem;
        }
      `}
      </style>
    <header 
      className="px-4 py-2 border-b border-gray-800 relative"
      style={{
        // backgroundColor: 'rgba(0,0,0,0.93)',
        backgroundImage: 'url(https://www.xpj00000.vip/indexImg/bg.e96230e4.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex items-center justify-between relative z-10">
        {/* 左侧 Logo 区域 */}
        <div className="flex items-center gap-1">
          {/* 固定 Logo */}
          <div className="flex items-center" style={{ height: '33px' }}>
            <img
              src="/images/newimg/8ec32.avif"
              alt="Logo"
              className="h-full"
              style={{ width: '74px', paddingRight: '4px' }}
            />
          </div>

          {/* 轮播 Logo */}
          <div className="relative overflow-hidden" style={{ width: '80px', height: '30px' }}>
            <div
              className={isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}
              style={{
                transform: `translateY(-${currentLogoIndex * 30}px)`,
              }}
            >
              {extendedLogos.map((logo, index) => (
                <div key={index} style={{ height: '30px' }} className="flex items-center justify-center">
                  <img
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧登录/注册按钮或用户信息 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
           
              <div 
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  flexDirection: 'row',
                  height: '32px',
                  padding: '4px 4px 4px 8px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                <div className='header-cur-online' style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  flexDirection: 'row',
                  overflow: 'hidden',
                  color: '#fff',
                  fontFamily: 'DINAlternate-Bold, Arial, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  
                  <span className="decimal" style={{ color: '#fff' }}>
                    {xxJilu}玩家
                  </span>
                  
                </div>
              </div>
          </div>
          {isLoggedIn && userInfo ? (
            <div 
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                height: '32px',
                padding: '4px 4px 4px 8px',
                borderLeft: '0.5px solid rgba(252, 26, 25, 0.45)',
                borderRight: '0.5px solid rgba(252, 26, 25, 0.45)',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.25)',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                overflow: 'hidden',
                color: '#ffc53e',
                fontFamily: 'DINAlternate-Bold, Arial, sans-serif',
                fontSize: '16px',
                fontWeight: 700
              }}>
                <img 
                  src="https://www.xpj00000.vip/indexImg/CNY.1969f5d5.png" 
                  alt="货币"
                  className="money-icon"
                  style={{
                    width: '16px',
                    height: '16px',
                    marginRight: '4px'
                  }}
                />
                <span>{(userInfo.balance || 0).toFixed(2).split('.')[0]}. </span>
                <span className="decimal" style={{ color: 'rgba(255, 197, 62, 0.45)' }}>{(userInfo.balance || 0).toFixed(2).split('.')[1]} </span>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: '24px',
                  height: '24px',
                  marginLeft: '8px',
                  borderRadius: '4px',
                  background: '#151a23'
                }}>
                  <img 
                    src="https://www.xpj00000.vip/indexImg/arrow2.be71e249.png" 
                    alt="下拉"
                    style={{
                      width: '8px',
                      transition: 'transform 0.4s ease-in-out'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <button 
                className="px-4 py-1.5 text-white text-sm rounded transition-colors hover:bg-blue-800/30"
                style={{
                  padding: '6px',
                  width: '40px',
                }}
                onClick={() => navigate('/login')}
              >
                {t('headerLogin')}
              </button>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  padding: '6px 10px',
                  background: '#ffc53e',
                  boxShadow: 'inset 0 0 13px 0 rgba(255, 46, 0, 0.45098039215686275), 0 0 10px 0 rgba(255, 46, 0, 0.25098039215686274)',
                  color: 'rgba(0, 0, 0, 0.8509803921568627)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
              >
                {t('headerRegister')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>

    </>
  );
}