import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getGameUrl, gameTransferOut } from '@/lib/api/game';
// import { shouldUseNewGameApi, getUserId, mapApiCodeToVendorCode } from '@/lib/api/game'; // 已注释：新游戏API调用已全部注释掉
// import { newGameApiService } from '@/lib/api/newGameApi';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/Loader';
import { PageLoader } from '@/components/PageLoader';



export default function GamePage() {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUserInfo } = useAuth();
  const [gameUrl, setGameUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const hasTransferredOut = useRef(false);
  const isLoadingRef = useRef(false); // 防止重复请求

  const platformName = searchParams.get('platform') || searchParams.get('api_code') || '';
  const vendorCode = searchParams.get('vendorCode') || ''; // 新游戏接口的供应商代码
  const gameType = parseInt(searchParams.get('gameType') || '0');
  const gameCode = searchParams.get('gameCode') || '0';


  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX - position.x;
    const startY = touch.clientY - position.y;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - startX, y: touch.clientY - startY });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };



  useEffect(() => {
    
    const loadGame = async () => {
      
      // 防止重复请求
      if (isLoadingRef.current) {
        return;
      }
      
      // 检查登录状态
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ 未登录，跳转到登录页');
        alert('请先登录后再进入游戏');
        navigate('/login');
        return;
      }

      // 如果使用新游戏接口（有 vendorCode），直接使用新接口 - 已全部注释
      // 注意：新接口只支持真人（gameType=1）和电游（gameType=2,3），不支持体育、彩票、棋牌
      // 如果 gameType 是 4（彩票）、5（体育）、6（棋牌），即使有 vendorCode 也不使用新接口
      // const isNewApiSupportedGameType = gameType === 1 || gameType === 2 || gameType === 3 || gameType === 0;
      // if (vendorCode && isNewApiSupportedGameType) {
      /* if (false) { // 新游戏API调用已全部注释掉
        try {
          isLoadingRef.current = true;
          setLoading(true);
          setError('');
          
          // 使用新游戏接口
          const userId = await getUserId();
          if (!userId) {
            throw new Error('无法获取用户ID');
          }
          
          // 语言代码处理
          const { getGameApiLanguage } = await import('@/utils/languageMapper');
          const langCode = getGameApiLanguage();
          
          // ========== 自动转入余额逻辑 ==========
          try {
            // 1. 创建用户（如果不存在）
            try {
              const createUserResponse = await newGameApiService.createUser(userId);
              if (createUserResponse && createUserResponse.errorCode !== undefined) {
                if (createUserResponse.errorCode === 0) {
                  console.log('✅ 用户创建成功');
                } else if (createUserResponse.errorCode === 1) {
                  console.log('ℹ️ 用户已存在');
                } else {
                  console.warn('⚠️ 用户创建返回错误码:', createUserResponse.errorCode);
                }
              } else if (createUserResponse && createUserResponse.success === true) {
                console.log('✅ 用户创建成功');
              }
            } catch (userError: any) {
              const errorCode = userError?.response?.errorCode || userError?.errorCode || userError?.error?.errorCode;
              if (errorCode === 1) {
                console.log('ℹ️ 用户已存在');
              } else {
                console.warn('⚠️ 用户创建检查失败，继续执行:', userError);
              }
            }

            // 2. 获取用户钱包余额
            const { getUserInfo } = await import('@/lib/api/auth');
            const userInfoResponse = await getUserInfo();
            const walletBalance = userInfoResponse?.data?.money || userInfoResponse?.data?.balance || 0;
            
            console.log('💰 钱包余额:', walletBalance);
            
            if (walletBalance > 0) {
              // 3. 获取游戏中的余额（对于分离钱包，需要传递 vendorCode）
              let gameBalance = 0;
              try {
                // 对于分离钱包的供应商（如 PlayAce），需要传递 vendorCode 才能获取正确的余额
                const balanceResponse = await newGameApiService.getUserBalance(userId, vendorCode);
                console.log('📊 getUserBalance 响应:', balanceResponse);
                console.log('📊 请求参数:', { userId, vendorCode });
                
                if (balanceResponse && balanceResponse.success === true) {
                  // 尝试从不同字段获取余额
                  const balanceStr = balanceResponse.message || balanceResponse.data?.balance || balanceResponse.balance || '0';
                  gameBalance = parseFloat(String(balanceStr)) || 0;
                  console.log('💰 游戏中余额:', gameBalance);
                } else {
                  console.warn('⚠️ getUserBalance 返回失败，假设余额为0:', balanceResponse);
                  gameBalance = 0;
                }
              } catch (balanceError: any) {
                console.error('❌ 获取游戏中余额异常:', balanceError);
                console.error('❌ 错误详情:', {
                  message: balanceError?.message,
                  response: balanceError?.response,
                  error: balanceError
                });
                // 如果获取余额失败，假设余额为0，继续执行转入
                gameBalance = 0;
              }
              
              // 4. 计算需要转入的金额（钱包余额 - 游戏中余额）
              const transferAmount = walletBalance - gameBalance;
              console.log('💰 余额计算:', {
                钱包余额: walletBalance,
                游戏中余额: gameBalance,
                需要转入: transferAmount
              });
              
              // 5. 如果有余额需要转入，执行转入操作
              if (transferAmount > 0.01) { // 至少转入0.01，避免精度问题
                // 生成订单号
                const orderNo = `DEPOSIT_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                try {
                  console.log('🔄 开始转入余额到游戏:', {
                    userId,
                    transferAmount: transferAmount.toFixed(2),
                    orderNo,
                    vendorCode
                  });
                  
                  const depositResponse = await newGameApiService.deposit(
                    userId,
                    transferAmount,
                    orderNo,
                    vendorCode
                  );
                  
                  console.log('📊 deposit 响应:', depositResponse);
                  
                  if (depositResponse && (depositResponse.success === true || depositResponse.success === 'true')) {
                    const newGameBalance = parseFloat(depositResponse.message || depositResponse.data?.balance || '0') || 0;
                    console.log('✅ 余额转入成功！', {
                      转入金额: transferAmount.toFixed(2),
                      游戏中新余额: newGameBalance
                    });
                    
                    // 刷新用户余额
                    if (refreshUserInfo) {
                      setTimeout(() => refreshUserInfo(), 500);
                    }
                  } else {
                    console.error('❌ 余额转入失败:', depositResponse);
                    console.error('❌ 失败详情:', {
                      success: depositResponse?.success,
                      message: depositResponse?.message,
                      error: depositResponse?.error,
                      errorCode: depositResponse?.errorCode,
                      data: depositResponse?.data
                    });
                  }
                } catch (depositError: any) {
                  console.error('❌ 余额转入异常:', depositError);
                  console.error('❌ 异常详情:', {
                    message: depositError?.message,
                    response: depositError?.response,
                    error: depositError?.error,
                    errorCode: depositError?.errorCode,
                    data: depositError?.data
                  });
                  // 余额转入失败不影响游戏启动，继续执行
                }
              } else if (transferAmount < -0.01) {
                console.log('ℹ️ 游戏中余额大于钱包余额，无需转入');
              } else {
                console.log('ℹ️ 余额已同步，无需转入');
              }
            } else {
              console.log('ℹ️ 钱包余额为0，无需转入');
            }
          } catch (transferError: any) {
            console.error('❌ 自动转入余额过程异常:', transferError);
            // 余额转入失败不影响游戏启动，继续执行
          }
          // ========== 余额转入逻辑结束 ==========
          
          // 检测是否为移动端
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const lobbyUrl = `${window.location.origin}/gamelobby`;
          
          // 调用新游戏接口获取游戏启动URL
          const response = await newGameApiService.getLaunchUrl(
            vendorCode,
            gameCode,
            userId,
            langCode,
            isMobileDevice ? lobbyUrl : undefined
          );
          
          if (response && (response.success === true || response.success === 'true')) {
            const gameUrl = typeof response.message === 'string' 
              ? response.message 
              : (response.message?.gameUrl || response.message?.url || response.data?.gameUrl || response.data?.url || '');
            
            if (gameUrl) {
              setGameUrl(gameUrl);
              setLoading(false);
              isLoadingRef.current = false;
              // 刷新用户余额
              if (refreshUserInfo) {
                setTimeout(() => refreshUserInfo(), 1000);
              }
              return;
            } else {
              throw new Error('游戏URL为空');
            }
          } else {
            throw new Error(response?.message || response?.error || '获取游戏链接失败');
          }
        } catch (error: any) {
          console.error('❌ 新游戏接口调用失败:', error);
          setError(error.message || '获取游戏链接失败');
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }
      } */ // 新游戏API调用已全部注释掉

      if (!platformName) {
        console.error('❌ 缺少游戏平台参数');
        setError('缺少游戏平台参数');
        setLoading(false);
        return;
      }

      try {
        isLoadingRef.current = true; // 标记请求开始
        setLoading(true);
        setError(''); // 清除之前的错误
        
        // 添加超时保护
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('请求超时：30秒内未获取到响应'));
          }, 30000);
        });
        
        const gameUrlPromise = getGameUrl({
          api_code: platformName,
          gameType: gameType,
          gameCode: gameCode,
          isMobile: 1
        });
        
        const res = await Promise.race([gameUrlPromise, timeoutPromise]) as any;

        
        // 如果游戏URL获取成功，刷新用户余额（新游戏接口会自动转入余额）
        if (res?.status === 'success' || (res?.code === 200 && res?.status !== 'error')) {
          // 等待后端处理完成（deposit 操作需要时间）
          setTimeout(async () => {
            if (refreshUserInfo) {
              await refreshUserInfo(true);
            }
          }, 2000);
        }

        // 处理各种可能的响应格式
        let gameUrl = '';
        
        // 正确判断：status === 'error' 时视为失败，即使code是200
        if (res?.status === 'error') {
          let errorMsg = res?.message || res?.error || '启动游戏失败';
          // 将技术性错误消息转换为更友好的提示
          if (errorMsg.includes('Permission denied') || errorMsg.includes('lock.txt')) {
            errorMsg = '服务器繁忙，请稍后重试';
          } else if (errorMsg.includes('请勿频进行繁点击')) {
            errorMsg = '操作过于频繁，请稍后重试';
          }
          console.error('❌ 游戏启动失败:', errorMsg, res);
          setError(errorMsg);
          setLoading(false);
        } else if (res?.status === 'success' || (res?.code === 200 && res?.status !== 'error')) {
          const data = res.data || res || {};
          gameUrl = data.game_url || data.url || data.gameUrl || '';
          
          
          if (gameUrl) {
            setGameUrl(gameUrl);
            setLoading(false);
          } else {
            console.error('❌ 游戏URL为空, 响应数据:', JSON.stringify(res, null, 2));
            setError('获取游戏链接失败：URL为空');
            setLoading(false);
          }
        } else {
          const errorMsg = res?.message || res?.error || '启动游戏失败';
          console.error('❌ 游戏启动失败:', errorMsg, res);
          setError(errorMsg);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ 启动游戏异常:', error);
        console.error('❌ 错误详情:', {
          message: error?.message,
          code: error?.code,
          response: error?.response,
          stack: error?.stack
        });
        
        // 检查是否是网络错误（CORS问题）
        if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
          setError('网络连接失败，可能是跨域问题。请检查网络连接或联系客服。');
        } else {
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              error?.data?.message ||
                              '启动游戏失败，请稍后重试';
          setError(errorMessage);
        }
        setLoading(false);
      } finally {
        isLoadingRef.current = false; // 标记请求结束
      }
    };

    loadGame();
  }, [platformName, gameType, gameCode, navigate]);

  // 游戏转出逻辑（使用 useCallback 避免重复创建）
  const handleTransferOut = useCallback(async () => {
    // 如果已经转出过，直接返回
    if (hasTransferredOut.current) {
      console.log('ℹ️ 已经转出过，跳过');
      return;
    }

    try {
      hasTransferredOut.current = true;
      console.log('🔄 开始转出余额:', { platformName, vendorCode });
      
      // 优先检查是否有 vendorCode（新游戏接口）- 已注释
      // 如果有 vendorCode，直接使用新接口转出
      // if (vendorCode) {
      //   console.log('✅ 使用新游戏接口转出（vendorCode）:', vendorCode);
      //   try {
      //     // 获取用户ID
      //     const userId = await getUserId();
      //     if (!userId) {
      //       console.warn('⚠️ 无法获取用户ID，无法转出');
      //       return;
      //     }
      //     
      //     console.log('🔄 调用 withdrawAll:', { userId, vendorCode });
      //     
      //     // 使用 withdrawAll 转出所有余额
      //     const withdrawResponse = await newGameApiService.withdrawAll(userId, vendorCode);
      //     
      //     console.log('📊 withdrawAll 响应:', withdrawResponse);
      //     
      //     if (withdrawResponse && (withdrawResponse.success === true || withdrawResponse.success === 'true')) {
      //       console.log('✅ 余额转出成功！');
      //       // 刷新用户余额
      //       if (refreshUserInfo) {
      //         await refreshUserInfo(true);
      //       }
      //     } else {
      //       console.error('❌ 新游戏接口转出失败:', withdrawResponse);
      //       console.error('❌ 失败详情:', {
      //         success: withdrawResponse?.success,
      //         message: withdrawResponse?.message,
      //         error: withdrawResponse?.error,
      //         errorCode: withdrawResponse?.errorCode,
      //         data: withdrawResponse?.data
      //       });
      //     }
      //   } catch (newApiError: any) {
      //     console.error('❌ 新游戏接口转出异常:', newApiError);
      //     console.error('❌ 异常详情:', {
      //       message: newApiError?.message,
      //       response: newApiError?.response,
      //       error: newApiError?.error,
      //       errorCode: newApiError?.errorCode,
      //       data: newApiError?.data
      //     });
      //   }
      //   return;
      // }
      
      // 如果没有 vendorCode，检查是否使用新游戏接口 - 已注释
      // 注意：新接口只支持真人（gameType=1）和电游（gameType=2,3），不支持体育、彩票、棋牌
      // PA、AG、BG 强制使用旧接口
      // const apiCode = platformName.replace(/[^0-9a-z]/gi, '').toUpperCase();
      // const isPA = apiCode === 'PA';
      // const isAG = apiCode === 'AG';
      // const isBG = apiCode === 'BG';
      // const isNewApiSupportedGameType = gameType === 1 || gameType === 2 || gameType === 3 || gameType === 0;
      // const useNewApi = shouldUseNewGameApi() && isNewApiSupportedGameType && !isPA && !isAG && !isBG;
      // 
      // if (useNewApi && platformName) {
      //   console.log('✅ 使用新游戏接口转出（通过映射）');
      //   // 使用新游戏接口转出余额
      //   try {
      //     // 获取用户ID
      //     const userId = await getUserId();
      //     if (!userId) {
      //       console.warn('⚠️ 无法获取用户ID，使用旧接口转出');
      //       const res = await gameTransferOut(platformName);
      //       if (res.code === 200 || res.status === 'success') {
      //         if (refreshUserInfo) {
      //           await refreshUserInfo(true);
      //         }
      //       }
      //       return;
      //     }
      //     
      //     // 映射平台代码到vendorCode
      //     const mappedVendorCode = mapApiCodeToVendorCode(apiCode);
      //     
      //     console.log('🔄 调用 withdrawAll（映射）:', { userId, vendorCode: mappedVendorCode, apiCode });
      //     
      //     // 使用 withdrawAll 转出所有余额
      //     const withdrawResponse = await newGameApiService.withdrawAll(userId, mappedVendorCode);
      //     
      //     console.log('📊 withdrawAll 响应（映射）:', withdrawResponse);
      //     
      //     if (withdrawResponse && (withdrawResponse.success === true || withdrawResponse.success === 'true')) {
      //       console.log('✅ 余额转出成功！');
      //       // 刷新用户余额
      //       if (refreshUserInfo) {
      //         await refreshUserInfo(true);
      //       }
      //     } else {
      //       console.warn('⚠️ 新游戏接口转出失败，尝试旧接口:', withdrawResponse);
      //       // 如果新接口失败，尝试使用旧接口
      //       const res = await gameTransferOut(platformName);
      //       if (res.code === 200 || res.status === 'success') {
      //         if (refreshUserInfo) {
      //           await refreshUserInfo(true);
      //         }
      //       }
      //     }
      //   } catch (newApiError: any) {
      //     console.error('❌ 新游戏接口转出异常，尝试旧接口:', newApiError);
      //     // 如果新接口异常，尝试使用旧接口
      //     try {
      //       const res = await gameTransferOut(platformName);
      //       if (res.code === 200 || res.status === 'success') {
      //         if (refreshUserInfo) {
      //           await refreshUserInfo(true);
      //         }
      //       }
      //     } catch (oldApiError) {
      //       console.error('❌ 旧接口转出也失败:', oldApiError);
      //     }
      //   }
      // }
      
      // 使用旧接口转出
      if (platformName) {
        // 使用旧接口转出
        console.log('✅ 使用旧接口转出:', platformName);
        const res = await gameTransferOut(platformName);
        
        // 检查响应状态：status === 'error' 时视为失败，即使code是200
        if (res.status === 'error') {
          console.warn('⚠️ 游戏余额转出失败:', res.message);
        } else if (res.code === 200 || res.status === 'success') {
          console.log('✅ 余额转出成功！');
          // 刷新用户余额
          if (refreshUserInfo) {
            await refreshUserInfo(true);
          }
        } else {
          console.warn('⚠️ 游戏余额转出失败:', res.message);
        }
      } else {
        console.warn('⚠️ 没有平台信息，无法转出');
      }
    } catch (err) {
      console.error('❌ 游戏余额转出异常:', err);
      // 转出失败不影响返回，只记录错误
    }
  }, [platformName, vendorCode, refreshUserInfo]);

  // 页面卸载/隐藏时自动转出
  useEffect(() => {
    // 如果没有平台信息也没有 vendorCode，无法转出
    if (!platformName && !vendorCode) return;

    // 监听页面隐藏事件（切换标签页、最小化等）
    const handleVisibilityChange = () => {
      if (document.hidden && !hasTransferredOut.current) {
        // 页面隐藏时尝试转出
        handleTransferOut().catch(() => {
          // 忽略错误
        });
      }
    };

    // 监听页面卸载事件（浏览器关闭/刷新）
    const handleBeforeUnload = () => {
      if (!hasTransferredOut.current) {
        // 使用同步方式发送请求（使用 fetch keepalive）
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          if (!token) {
            return;
          }
          
          const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://api.beeb77.net/api');
          
          // 优先使用新接口（如果有 vendorCode）
          if (vendorCode) {
            // 尝试获取用户ID（同步方式，从localStorage）
            try {
              const userInfo = localStorage.getItem('userInfo');
              if (userInfo) {
                const user = JSON.parse(userInfo);
                const userId = user.id || user.user_id || user.username;
                if (userId) {
                  // 使用新接口转出
                  const newApiUrl = `${apiBaseUrl}/game-api/user/withdraw-all`;
                  fetch(newApiUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                      userCode: String(userId),
                      vendorCode: vendorCode
                    }),
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    keepalive: true
                  }).catch(() => {
                    // 忽略错误
                  });
                  hasTransferredOut.current = true;
                  return;
                }
              }
            } catch (err) {
              // 如果新接口失败，继续尝试旧接口
            }
          }
          
          // 如果没有 vendorCode 或新接口失败，使用旧接口
          if (platformName) {
            const lang = localStorage.getItem('ly_lang') || 'zh_cn';
            const url = `${apiBaseUrl}/game/change_trans?lang=${lang}`;
            
            const data = new URLSearchParams({
              api_code: platformName,
              type: 'out'
            });

            // 使用 fetch with keepalive（即使页面关闭也能发送）
            fetch(url, {
              method: 'POST',
              body: data,
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              keepalive: true
            }).catch(() => {
              // 忽略错误
            });
            
            hasTransferredOut.current = true;
          }
        } catch (err) {
          // 忽略错误
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 组件卸载时也尝试转出
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // 组件卸载时同步转出
      if (!hasTransferredOut.current && (platformName || vendorCode)) {
        handleTransferOut().catch(() => {
          // 忽略错误
        });
      }
    };
  }, [platformName, vendorCode, handleTransferOut]);

  // 调试信息

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh', // 使用动态视口高度，适配移动端浏览器地址栏
        minHeight: '100vh', // 兼容不支持 dvh 的浏览器
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: '50px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}>
        {/* 视频背景 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 0
          }}
        >
          <source src="/images/bg-hnyl.mp4" type="video/mp4" />
        </video>
        
        {/* 加载内容 - 位于底部 */}
        <div style={{ 
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: '50px'
        }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>❌ 加载失败</h2>
          <p style={{ marginBottom: '30px' }}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if(gameUrl == '111'){
    console.warn('⚠️ 返回');
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
      <img
        src="/images/week/11.png"
        alt="背景"
        style={{
          display: 'block',
          width: '100%',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      </div>
    );
  }// 如果没有游戏URL，显示错误
  else if (!gameUrl && !error) {
    console.warn('⚠️ 没有游戏URL也没有错误，显示默认错误');
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>❌ 游戏URL为空</h2>
          <p style={{ marginBottom: '30px' }}>未能获取到游戏链接，请稍后重试</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 返回按钮点击处理
  const handleBack = async () => {

    setGameUrl('111');
    // if (iframeRef.current) {
    //   // 方法1: 通过移除DOM元素来关闭
    //   const iframe = iframeRef.current;
    //   if (iframe.parentNode) {
    //     iframe.parentNode.removeChild(iframe);
    //   }
    // }

    // 先转出余额，再返回
    await handleTransferOut();
    // navigate(-1);
    // 跳转到电游大厅而不是首页
    navigate('/game-lobby');
  };

  
  return (
    <>
      <PageLoader loading={loading} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: '#000'
      }}>
      <iframe
        src={gameUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: gameUrl ? 'block' : 'none'
        }}
        title="游戏"
        allow="fullscreen; autoplay; microphone; camera; payment; geolocation; encrypted-media; picture-in-picture; display-capture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
        // 移动端和视频直播游戏需要完全移除 sandbox 限制以支持 WebSocket 连接
        // 检测是否为移动端
        // 检测是否为视频直播游戏（Pragmatic Live, Evolution 等）
        sandbox={
          (() => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isVideoLiveGame = 
              vendorCode === 'casino-playace' || 
              vendorCode === 'casino-evolution' ||
              vendorCode === 'casino-sa' ||
              vendorCode === 'casino-micro' ||
              vendorCode === 'casino-ezugi' ||
              gameUrl?.includes('pragmatic') || 
              gameUrl?.includes('thefanz.net') ||
              gameUrl?.includes('evolution') ||
              gameUrl?.includes('playace');
            
            // 移动端或视频直播游戏：完全移除 sandbox 限制
            if (isMobileDevice || isVideoLiveGame) {
              return undefined;
            }
            
            // 其他游戏：使用 sandbox 限制
            return "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals allow-presentation allow-downloads allow-storage-access-by-user-activation";
          })()
        }
        onLoad={() => {
          // iframe 加载完成
          console.log('✅ iframe 加载完成', {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            vendorCode,
            gameUrl: gameUrl?.substring(0, 100)
          });
        }}
        onError={(e) => {
          console.error('❌ iframe 加载错误:', e);
          console.error('📱 错误时的设备信息:', {
            userAgent: navigator.userAgent,
            platform: platformName,
            vendorCode: vendorCode,
            gameUrl: gameUrl?.substring(0, 100),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          });
        }}
      />
      
        <button
          ref={ref}
          // onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleBack}
          style={{
            position: 'fixed',
            left: position.x, 
            top: position.y,
            zIndex: 9999,
            width: '60px',
            height: '60px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '2px solid #C0C0C0',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '10px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            padding: '4px'
          }}
        >
          <svg 
            viewBox="0 0 1024 1024" 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24"
            style={{ flexShrink: 0 }}
          >
            <path 
              d="M660.931435 397.915685c-16.344916-15.452947-31.059639-29.41903-44.134958-41.900296l-33.88101-31.204699c-8.917456-8.327666-14.263426-13.375635-16.048145-15.160281-16.641687-15.454994-35.369981-22.730701-56.171579-21.840424-20.805691 0.889253-38.638555 8.1711-53.4945 21.840424-2.383378 2.378164-8.177575 7.875365-17.390778 16.499789-9.20911 8.619308-20.653212 19.164478-34.32412 31.646767-13.668861 12.476149-28.82567 26.301016-45.473497 41.453111-16.645781 15.162328-33.287468 30.464849-49.923015 45.918819-39.830756 36.252669-84.111029 76.670194-132.854124 121.247458L177.235709 912.096351c0 14.262842 5.054316 25.261337 15.157832 32.984229 10.108633 7.730055 23.778517 11.588943 41.016816 11.588943l175.649519 0c-0.119732-1.866511-0.2016-3.744277-0.2016-5.641487L408.858277 798.964734c0-48.060599 38.961933-87.020936 87.025525-87.020936l32.231373 0c48.062568 0 87.024501 38.960337 87.024501 87.020936l0 152.064324c0 1.89721-0.081868 3.773953-0.2016 5.641487l175.72013 0c16.643734-0.590448 29.869485-5.941316 39.672137-16.044418 9.811862-10.106172 14.717793-21.695115 14.717793-34.770921l0-337.650113c-49.33766-45.76737-93.917774-87.074148-133.740343-123.926474C694.066424 428.824649 677.276351 413.370679 660.931435 397.915685zM959.165779 478.153124c-0.595589-14.266935-7.128643-27.336602-19.61349-39.225373l-22.291592-22.287609c-11.289577-11.295254-25.256232-24.817222-41.904059-40.563858-16.641687-15.754822-34.919708-33.43653-54.833039-53.049217-19.907191-19.617803-40.272842-39.375799-61.073416-59.290361-20.805691-19.915585-41.308471-39.673581-61.513456-59.291384-20.219312-19.612687-38.492216-37.294394-54.842249-53.0441-16.3398-15.750729-30.167279-29.127388-41.454809-40.120766-11.29674-10.998495-18.724201-17.97949-22.295686-20.955264-18.42129-17.83418-40.708789-26.598798-66.871707-26.295899-26.146545 0.296759-50.522697 11.435447-73.103897 33.431414-2.97692 2.967588-13.526616 12.924357-31.653181 29.863145-18.129635 16.941857-39.824616 37.298488-65.086988 61.07603-25.265442 23.775496-52.604187 49.333592-82.029539 76.67531-29.420235 27.336602-56.913506 52.898791-82.470602 76.670194-25.559143 23.777543-47.550894 44.284599-65.978324 61.519122-18.426406 17.2335-29.420235 27.6395-32.990697 31.203676-9.509974 8.916067-14.564291 20.951171-15.152716 36.103266-0.597635 15.161305 5.0492 28.091802 16.938458 38.788421 10.701151 9.508561 23.480723 13.964036 38.336668 13.371542 14.860038-0.594541 26.749297-4.455475 35.665729-11.586896 2.972826-2.379187 11.737803-10.254551 26.303117-23.626094 14.559174-13.372565 31.948929-29.574572 52.155961-48.594765 20.212149-19.018146 42.204923-39.522132 65.982417-61.512982 23.7734-21.995967 46.362787-43.092447 67.756903-63.303768 21.400256-20.207227 40.272842-37.887912 56.617758-53.05024 16.344916-15.152095 27.489177-25.405623 33.438923-30.751375 17.829794-16.052604 35.958406-24.375154 54.379696-24.968671 18.431523-0.592494 37.155724 7.730055 56.176695 24.968671 4.158887 3.565199 13.965632 12.773931 29.420235 27.633361 15.454603 14.860453 33.886127 32.396851 55.278196 52.602032 21.401279 20.212344 44.138028 41.756009 68.206153 64.642253 24.079381 22.881127 46.660581 44.279483 67.76816 64.188928 21.099392 19.909445 39.22698 37.001729 54.384813 51.263547 15.157832 14.267958 24.215487 22.590508 27.192406 24.968671 8.916432 7.723915 20.804667 11.889795 35.658565 12.478196 14.863108 0.596588 27.944567-4.158716 39.232097-14.262842C955.005869 504.308831 959.761368 492.420059 959.165779 478.153124z" 
              fill="#ffffff"
            />
          </svg>
          <span style={{ fontSize: '10px', lineHeight: '1' }}>首页</span>
        </button>
      
    </div>
    </>
  );
}

