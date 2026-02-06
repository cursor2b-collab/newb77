/**
 * 额度转换页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGameApiList, getApiMoney, getGameBalance } from '@/lib/api/game';
import { gameTransferIn, gameTransferOut } from '@/lib/api/game';
import { changeTransferMode } from '@/lib/api/user';

interface GameApi {
  id: number;
  api_name: string;
  title: string;
  icon_url?: string;
  [key: string]: any;
}

export default function BalancePage() {
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, refreshUserInfo } = useAuth();
  const { t } = useLanguage();
  const [gameApis, setGameApis] = useState<GameApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState<{ [key: string]: boolean }>({});
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = useState<{ [key: string]: boolean }>({});
  const [accountType, setAccountType] = useState<'money' | 'fs_money'>('money'); // 'money' 账户余额, 'fs_money' 反水账户
  const [isAutoTransfer, setIsAutoTransfer] = useState(false); // 是否自动转入转出

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadGameApis();
    // 从用户信息中获取 is_trans_on 状态
    if (userInfo && userInfo.is_trans_on !== undefined) {
      setIsAutoTransfer(userInfo.is_trans_on === 1);
    }
  }, [isLoggedIn, navigate, userInfo]);

  // 添加旋转动画keyframes
  useEffect(() => {
    const styleId = 'refresh-spin-animation';
    if (document.getElementById(styleId)) {
      return; // 样式已存在，不需要重复添加
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const loadGameApis = async () => {
    try {
      setLoading(true);
      // 获取所有开启的游戏接口
      // 由于后端API需要gameType参数，我们需要获取不同类型的接口
      const gameTypes = [1, 2, 3, 4, 5, 6, 99]; // 常见的游戏类型
      const allApis: GameApi[] = [];
      const apiMap = new Map<string, GameApi>();

      // 并行获取所有游戏类型的接口
      const promises = gameTypes.map(gameType => 
        getGameApiList(gameType, 1).catch(error => {
          console.warn(`获取游戏类型 ${gameType} 的接口失败:`, error);
          return { code: 0, data: [] };
        })
      );

      const results = await Promise.all(promises);
      
      results.forEach((res) => {
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          res.data.forEach((api: GameApi) => {
            // 去重，只保留唯一的api_name，保留第一个出现的
            if (!apiMap.has(api.api_name)) {
              apiMap.set(api.api_name, api);
            }
          });
        }
      });

      setGameApis(Array.from(apiMap.values()));
    } catch (error) {
      console.error('加载游戏接口失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferIn = async (apiName: string) => {
    if (transferring[apiName]) return;
    
    const amount = prompt(t('enterTransferAmount').replace('{name}', apiName));
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert(t('enterValidAmount'));
      return;
    }

    setTransferring({ ...transferring, [apiName]: true });
    try {
      const res = await gameTransferIn(apiName, parseFloat(amount));
      if (res.code === 200 || res.status === 'success') {
        alert(t('transferInSuccess'));
        if (refreshUserInfo) {
          await refreshUserInfo(true);
        }
        // 刷新该接口的余额
        await refreshBalance(apiName);
      } else {
        alert(res.message || t('transferInFailed'));
      }
    } catch (error: any) {
      console.error('转入失败:', error);
      alert(error.message || error.response?.data?.message || t('transferOutFailedRetry'));
    } finally {
      setTransferring({ ...transferring, [apiName]: false });
    }
  };

  const handleTransferOut = async (apiName: string) => {
    if (transferring[apiName]) return;
    
    // 记录转出前的余额
    const beforeBalance = userInfo?.money !== undefined && userInfo?.money !== null 
      ? userInfo.money 
      : (userInfo?.balance || 0);
    console.log('💰 转出前账户余额:', beforeBalance);
    
    // 先获取接口余额，确认有余额可转
    let apiBalance = 0;
    try {
      const balanceRes = await getApiMoney(apiName);
      if (balanceRes.code === 200 && balanceRes.data && balanceRes.data.money_info) {
        const apiInfo = balanceRes.data.money_info.find((item: any) => item.api_name === apiName);
        if (apiInfo) {
          apiBalance = typeof apiInfo.money === 'number' ? apiInfo.money : 
                     (typeof apiInfo.money === 'string' && !isNaN(parseFloat(apiInfo.money)) ? parseFloat(apiInfo.money) : 0);
          console.log('💰 接口余额:', apiBalance);
        }
      }
    } catch (error) {
      console.warn('获取接口余额失败:', error);
    }
    
    if (apiBalance <= 0) {
      alert(t('apiBalanceZero'));
      return;
    }
    
    if (!window.confirm(t('confirmTransferOut').replace('{name}', apiName).replace('{amount}', apiBalance.toFixed(2)))) {
      return;
    }
    
    setTransferring({ ...transferring, [apiName]: true });
    try {
      const res = await gameTransferOut(apiName);
      console.log('🔄 转出完整响应:', JSON.stringify(res, null, 2));
      
      if (res.code === 200 && res.status !== 'error') {
        console.log('✅ 转出接口返回成功，开始刷新余额...');
        console.log('💰 转出金额:', res.data?.money || res.money || apiBalance);
        
        // 等待后端处理完成（数据库更新需要时间，特别是文件锁释放后）
        console.log('⏳ 等待后端处理完成...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 先刷新该接口的余额（应该变为0）
        console.log('🔄 刷新接口余额...');
        await refreshBalance(apiName);
        
        // 再次等待
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 强制刷新用户信息（中心钱包余额）多次，确保获取最新
        if (refreshUserInfo) {
          console.log('🔄 第1次刷新用户信息（中心钱包余额）...');
          await refreshUserInfo(true);
          
          // 等待状态更新
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          console.log('🔄 第2次刷新用户信息（中心钱包余额）...');
          await refreshUserInfo(true);
          
          // 再次等待
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('🔄 第3次刷新用户信息（中心钱包余额）...');
          await refreshUserInfo(true);
          
          // 最后一次等待，确保状态更新
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // 再次刷新接口余额，确认已转出
        console.log('🔄 最后刷新接口余额，确认已转出...');
        await refreshBalance(apiName);
        
        // 显示成功提示，并提示用户刷新页面查看最新余额
        alert(t('transferOutSuccess').replace('{amount}', apiBalance.toFixed(2)));
      } else {
        const errorMsg = res.message || t('transferOutFailed');
        console.error('❌ 转出失败:', errorMsg);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ 转出异常:', error);
      const errorMsg = error.message || error.response?.data?.message || t('transferOutFailedRetry');
      alert(errorMsg);
    } finally {
      setTransferring({ ...transferring, [apiName]: false });
    }
  };

  const refreshBalance = async (apiName: string) => {
    if (refreshing[apiName]) return;
    
    setRefreshing({ ...refreshing, [apiName]: true });
    try {
      const res = await getApiMoney(apiName);
      if (res.code === 200 && res.data && res.data.money_info) {
        const apiInfo = res.data.money_info.find((item: any) => item.api_name === apiName);
        if (apiInfo) {
          // 处理余额，如果是字符串"未开通"等，则设为0
          const balance = typeof apiInfo.money === 'number' ? apiInfo.money : 
                         (typeof apiInfo.money === 'string' && !isNaN(parseFloat(apiInfo.money)) ? parseFloat(apiInfo.money) : 0);
          setBalances({ ...balances, [apiName]: balance });
        }
      }
    } catch (error) {
      console.error(`刷新${apiName}余额失败:`, error);
    } finally {
      setRefreshing({ ...refreshing, [apiName]: false });
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'rgb(12, 16, 23)', 
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      {/* PC端居中容器 */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        minHeight: '100vh',
        background: 'rgb(12, 16, 23)'
      }}>
        {/* 头部 */}
        <div style={{ 
          padding: '15px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative'
        }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              cursor: 'pointer', 
              background: 'transparent', 
              border: 'none', 
              padding: 0,
              position: 'absolute',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: '#fff' }} />
          </button>
          <h1 style={{ margin: 0, fontSize: '20px', flex: 1, textAlign: 'center' }}>{t('balanceTitle')}</h1>
        </div>

        {/* 内容区域 */}
        <div style={{ padding: '20px' }}>

      {/* 钱包余额显示 */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px', 
        padding: '16px', 
        marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* 账户类型切换按钮 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setAccountType('money')}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: accountType === 'money' ? '#ffc53e' : 'rgba(255,255,255,0.1)',
              color: accountType === 'money' ? '#151A23' : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {t('accountBalance')}
          </button>
          <button
            onClick={() => setAccountType('fs_money')}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: accountType === 'fs_money' ? '#ffc53e' : 'rgba(255,255,255,0.1)',
              color: accountType === 'fs_money' ? '#151A23' : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {t('rebateAccount')}
          </button>
        </div>

        {/* 余额显示 */}
        <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
          {accountType === 'money' ? t('accountBalance') : t('rebateAccount')}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc53e', marginBottom: '12px' }}>
          ¥{accountType === 'money' 
            ? (userInfo?.money !== undefined && userInfo?.money !== null 
                ? userInfo.money 
                : (userInfo?.balance !== undefined && userInfo?.balance !== null 
                   ? userInfo.balance 
                   : 0)).toFixed(2)
            : (userInfo?.fs_money || 0).toFixed(2)}
        </div>

        {/* 自动/手动切换按钮 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={async () => {
              try {
                const newStatus = isAutoTransfer ? 0 : 1;
                const res = await changeTransferMode(newStatus);
                if (res.code === 200 || res.status === 'success') {
                  setIsAutoTransfer(newStatus === 1);
                  alert(res.message || (newStatus === 1 ? t('switchedToAutoMode') : t('switchedToManualMode')));
                  // 刷新用户信息
                  if (refreshUserInfo) {
                    await refreshUserInfo(true);
                  }
                } else {
                  alert(res.message || t('switchModeFailed'));
                }
              } catch (error: any) {
                console.error('切换转账模式失败:', error);
                alert(error.message || error.response?.data?.message || t('switchModeFailed'));
              }
            }}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: isAutoTransfer ? '#ffc53e' : 'rgba(255,255,255,0.1)',
              color: isAutoTransfer ? '#151A23' : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isAutoTransfer ? t('switchToManual') : t('switchToAuto')}
          </button>
        </div>
      </div>

      {/* 游戏接口列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>{t('loading')}</div>
      ) : gameApis.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>{t('noGameApis')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {gameApis.map((api) => (
            <div
              key={api.api_name}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '14px', textAlign: 'center', color: '#fff' }}>
                {api.title || api.api_name}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>余额: {balances[api.api_name] !== undefined ? `¥${balances[api.api_name].toFixed(2)}` : 'N/A'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshBalance(api.api_name);
                  }}
                  disabled={refreshing[api.api_name]}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4A9EFF',
                    cursor: refreshing[api.api_name] ? 'not-allowed' : 'pointer',
                    padding: '2px 4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: refreshing[api.api_name] ? 0.6 : 1,
                    width: '20px',
                    height: '20px'
                  }}
                  title={t('refreshBalance')}
                >
                  <RefreshCw 
                    size={16} 
                    style={{
                      animation: refreshing[api.api_name] ? 'spin 1s linear infinite' : 'none',
                      transformOrigin: 'center'
                    }}
                  />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  onClick={() => handleTransferIn(api.api_name)}
                  disabled={transferring[api.api_name]}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ffc53e',
                    color: '#151A23',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: transferring[api.api_name] ? 'not-allowed' : 'pointer',
                    opacity: transferring[api.api_name] ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t('transferIn')}
                </button>
                <button
                  onClick={() => handleTransferOut(api.api_name)}
                  disabled={transferring[api.api_name]}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: transferring[api.api_name] ? 'not-allowed' : 'pointer',
                    opacity: transferring[api.api_name] ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t('transferOut')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

