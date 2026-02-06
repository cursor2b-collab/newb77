import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { login, getCaptcha, getUserInfo } from '@/lib/api';
import { translations, LanguageCode } from '@/i18n/translations';
import { PageLoader } from '@/components/PageLoader';

interface Language {
  code: LanguageCode;
  nameKey: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'zh_cn', nameKey: 'langChina', flag: '🇨🇳' },
  { code: 'ja', nameKey: 'langJapan', flag: '🇯🇵' },
  { code: 'id', nameKey: 'langIndonesia', flag: '🇮🇩' },
  { code: 'vi', nameKey: 'langVietnam', flag: '🇻🇳' },
  { code: 'th', nameKey: 'langThailand', flag: '🇹🇭' },
  { code: 'zh_hk', nameKey: 'langHongKong', flag: '🇭🇰' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUserInfo } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageWrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', password: '', code: '', key: '' });
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const secondImageRef = useRef<HTMLImageElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageWrapperRef.current &&
        !languageWrapperRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);
  
  const currentLang = languages.find(lang => lang.code === language) || languages[0];
  
  const handleLanguageSelect = (code: LanguageCode) => {
    setShowLanguageMenu(false);
    setLanguage(code);
  };

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await getCaptcha();
      if (res.code === 200 && res.data) {
        const img = res.data.img || res.data.image || '';
        setCaptchaImage(img.startsWith('data:') ? img : 'data:image/png;base64,' + img);
        setFormData((prev) => ({ ...prev, key: res.data.key || res.data.captcha_key || '' }));
      }
    } catch (err) {
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.password) {
      setError(t('enterAccountAndPassword'));
      return;
    }
    if (!formData.code) {
      setError(t('enterCodeError'));
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData);
      if (res.code === 200) {
        const token = res.data && (res.data.api_token || res.data.access_token);
        if (token) {
          // 保存token（参考Vue实现）
          sessionStorage.setItem('token', token);
          localStorage.setItem('token', token);
          
          // 获取用户信息并保存（参考Vue的getUserInfo实现）
          try {
            const userRes = await getUserInfo();
            if (userRes.code === 200 && userRes.data) {
              const userData = {
                ...userRes.data,
                username: userRes.data.username || userRes.data.name,
                balance: userRes.data.balance || userRes.data.money || 0
              };
              localStorage.setItem('userInfo', JSON.stringify(userData));
            }
          } catch (userErr) {
          }
          
          // 刷新AuthContext状态（参考Vue的changToken和getUserInfo）
          await refreshUserInfo();
          
          // 触发自定义事件，通知AuthContext更新状态
          window.dispatchEvent(new Event('authStateChange'));
          
          // 延迟1秒后跳转（参考Vue的setTimeout 1000ms）
          setTimeout(() => {
            // 使用window.location.href强制刷新页面，确保状态更新
            sessionStorage.setItem('hasVisited', 'false');
            window.location.href = '/';
          }, 1000);
        } else {
          setError(t('loginFailedNoToken'));
        }
      } else {
        setError(res.message || t('loginFailed'));
        setFormData((prev) => ({ ...prev, code: '' }));
        refreshCaptcha();
      }
    } catch (err: any) {
      setError(err?.message || t('loginFailed'));
      setFormData((prev) => ({ ...prev, code: '' }));
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageLoader loading={loading} />
      <div style={{
        width: '100%',
        minHeight: '100vh',
        overflow: 'auto',
        background: '#151A23',
        position: 'relative',
        zIndex: 0
      }}>
      {/* 背景图片 */}
      <img
        src="/images/newimg/bg.avif"
        alt="背景"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
          {/* 语言切换按钮 - 右上角 */}
          <div style={{
            position: 'fixed',
            top: '15px',
            right: '15px',
            zIndex: 1000
          }}>
            <div
              onClick={() => setShowLanguageMenu(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 12px',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block' }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>

      {/* 语言选择抽屉 */}
      {showLanguageMenu && (
        <>
          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
          {/* 遮罩层 */}
          <div
            onClick={() => setShowLanguageMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s ease'
            }}
          />
          {/* 抽屉内容 */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#000',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              zIndex: 9999,
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease',
              transform: 'translateY(0)'
            }}
          >
            {/* 头部 */}
            <div style={{
              background: '#000',
              padding: '20px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>
                {t('footerLanguage')}
              </h2>
              <button
                onClick={() => setShowLanguageMenu(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* 语言列表 */}
            <div style={{ padding: '10px 20px 20px 20px' }}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '16px',
                    background: language === lang.code ? 'rgba(255, 197, 62, 0.15)' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '2px',
                    transition: 'background 0.2s',
                    border: language === lang.code ? '1px solid rgba(255, 197, 62, 0.3)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>{lang.flag}</span>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: language === lang.code ? '600' : '400' }}>
                        {t(lang.nameKey)}
                      </div>
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '2px' }}>
                        {lang.code.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {language === lang.code && (
                    <span style={{ color: '#ffc53e', fontSize: '20px' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* 第二张图片容器 - 用于定位标签栏 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1
      }}>
        <img
          ref={secondImageRef}
          src="https://www.xpj00000.vip/loginImg/header_bg.png"
          alt="背景"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 1
          }}
        />
        
        {/* Tab 切换 - 固定在第二张图片中间缝隙区域 */}
        <div style={{
          position: 'absolute',
          top: '90%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 0',
          lineHeight: 1,
          color: '#fff',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <div style={{ 
            pointerEvents: 'auto', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{
              padding: '8px 20px',
              margin: '0 8px',
              fontSize: '18px',
              color: '#fff',
              cursor: 'pointer',
              position: 'relative',
              fontWeight: 500
            }}>
              {t('accountLogin')}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '22px',
                backgroundImage: 'url(/images/newimg/daaf2.avif)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                zIndex: -1,
                pointerEvents: 'none'
              }}></div>
            </div>
            <div onClick={() => navigate('/register')} style={{
              padding: '8px 20px',
              margin: '0 8px',
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer'
            }}>
              {t('accountRegister')}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ marginTop: '360px', padding: '0 20px', position: 'relative', zIndex: 2 }}>

        {/* 表单 */}
        <div>
          {error && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: 'rgba(217, 28, 28, 0.1)',
              border: '1px solid rgba(217, 28, 28, 0.3)',
              borderRadius: '4px',
              color: '#d91c1c',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* 用户名 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'name' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img src="https://www.xpj00000.vip/loginImg/account.png" style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} alt="用户名" />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                placeholder={t('enterAccount')}
                maxLength={50}
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'name' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* 密码 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'password' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img src="https://www.xpj00000.vip/loginImg/password.png" style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} alt="密码" />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                placeholder={t('enterPassword')}
                maxLength={32}
                autoComplete="new-password"
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'password' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* 验证码 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'code' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img src="https://www.xpj00000.vip/loginImg/recommend.png" style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} alt="验证码" />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                onFocus={() => setFocusedInput('code')}
                onBlur={() => setFocusedInput(null)}
                placeholder={t('enterCode')}
                maxLength={4}
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'code' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
              {captchaImage ? (
                <img
                  src={captchaImage}
                  onClick={refreshCaptcha}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    cursor: 'pointer',
                    height: '36px',
                    width: 'auto',
                    background: '#0C0E13',
                    padding: '2px',
                    borderRadius: '4px',
                    mixBlendMode: 'screen'
                  }}
                  alt="验证码"
                />
              ) : (
                <span onClick={refreshCaptcha} style={{ cursor: 'pointer', color: '#999', marginLeft: '10px' }}>
                  {t('clickGetCode')}
                </span>
              )}
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            onClick={!loading ? handleLogin : undefined}
            disabled={loading}
            style={{
              WebkitTextSizeAdjust: 'none',
              textSizeAdjust: 'none',
              margin: '32px 0 0 0',
              padding: 0,
              boxSizing: 'border-box',
              fontFamily: 'PingFang SC',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              borderRadius: '12px',
              background: '#ffc53e',
              boxShadow: 'inset 0 0 13px 0 rgba(255, 46, 0, 0.45098039215686275), 0 0 10px 0 rgba(255, 46, 0, 0.25098039215686274)',
              color: 'rgba(0, 0, 0, 0.8509803921568627)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.3s ease'
            }}
          >
            {loading ? t('loggingIn') : t('loginNow')}
          </button>

          {/* 服务按钮组 */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px'
          }}>
            <div
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '200px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(199, 218, 255, 0.050980392156862744)',
                color: 'hsla(0, 0%, 100%, 0.8509803921568627)',
                fontSize: '16px',
                fontWeight: 400,
                cursor: 'pointer',
                gap: '8px'
              }}
            >
              <img
                src="/images/newimg/gg.avif"
                alt="tour"
                style={{ width: '20px', height: '20px' }}
              />
              {t('goShopping')}
            </div>
            <div
              onClick={() => navigate('/service')}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '200px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(199, 218, 255, 0.050980392156862744)',
                color: 'hsla(0, 0%, 100%, 0.8509803921568627)',
                fontSize: '16px',
                fontWeight: 400,
                cursor: 'pointer',
                gap: '8px'
              }}
            >
              <img
                src="/images/newimg/kfsy.avif"
                alt="service"
                style={{ width: '20px', height: '20px' }}
              />
              {t('contactService')}
            </div>
          </div>
        </div>

        {/* 底部安全说明 */}
        <img
          src="https://www.xpj00000.vip/loginImg/ag-logo.webp"
          alt="安全加密说明"
          style={{
            display: 'block',
            width: '150px',
            maxWidth: '50%',
            margin: '30px auto 20px',
            height: 'auto'
          }}
        />
      </div>
    </div>
    </>
  );
}
