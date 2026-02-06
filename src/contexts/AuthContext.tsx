import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserInfo } from '@/lib/api/auth';

interface UserInfo {
  username?: string;
  name?: string;
  balance?: number;
  money?: number;
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  loading: boolean;
  refreshUserInfo: (forceRefresh?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserInfo = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // console.log('🔄 refreshUserInfo 被调用, token:', token ? '存在' : '不存在', 'forceRefresh:', forceRefresh);
    
    if (!token) {
      // console.log('❌ 没有token，清除登录状态');
      setIsLoggedIn(false);
      setUserInfo(null);
      setLoading(false);
      return;
    }

    // 如果不是强制刷新，先检查是否有缓存的用户信息，立即更新状态
    if (!forceRefresh) {
      const cachedUserInfo = localStorage.getItem('userInfo');
      if (cachedUserInfo) {
        try {
          const userData = JSON.parse(cachedUserInfo);
          // console.log('✅ 使用缓存的用户信息:', userData);
          setUserInfo(userData);
          setIsLoggedIn(true);
          setLoading(false);
        } catch (e) {
          console.error('解析缓存的用户信息失败:', e);
        }
      }
    }

    try {
      // console.log('📡 调用 getUserInfo API...');
      let res = null
      const res2 = await getUserInfo();
      // const res = await getUserInfo();
      // console.log('📡 getUserInfo 响应:', res2);
      if(Object.prototype.toString.call(res2) !== '[object Object]'){
        res = JSON.parse(res2.replace('{"lang":"zh_cn"}', ''))
      }else{
        res = res2
      }
      
      
      // 正确判断：status === 'error' 时视为失败，即使code是200
      if (res.status === 'error') {
        console.error('❌ 获取用户信息失败:', res.message);
        // 如果获取用户信息失败，但token存在，不清除token（可能是网络问题或频率限制）
        // 只清除状态
        setIsLoggedIn(false);
        setUserInfo(null);
      } else if (res.code === 200 && res.data) {
        // 调试：打印所有可能的余额字段
        // console.log('🔍 余额字段检查:', {
        //   money: res.data.money,
        //   balance: res.data.balance,
        //   total_money: res.data.total_money,
        //   fs_money: res.data.fs_money,
        //   ml_money: res.data.ml_money,
        //   score: res.data.score,
        //   '原始数据': res.data
        // });
        
        // 处理用户信息，添加别名字段
        // 优先使用 money 字段（这是后端返回的账户余额字段）
        // 不要使用 balance 字段，因为它可能被错误地设置为其他值（如投注额）
        const balanceValue = res.data.money !== undefined && res.data.money !== null 
                            ? res.data.money 
                            : (res.data.balance !== undefined && res.data.balance !== null 
                               ? res.data.balance 
                               : 0);
        
        const userData = {
          ...res.data,
          username: res.data.username || res.data.name,
          balance: balanceValue,
          // 确保 is_trans_on 字段也被保存
          is_trans_on: res.data.is_trans_on !== undefined ? res.data.is_trans_on : userInfo?.is_trans_on
        };
        // console.log('✅ 更新用户信息:', userData, '余额:', balanceValue, '自动转入:', userData.is_trans_on === 1 ? '已开启' : '未开启');
        setUserInfo(userData);
        setIsLoggedIn(true);
        // 保存到localStorage
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } else {
        console.error('❌ 获取用户信息失败，响应码:', res.code);
        // 如果获取用户信息失败，但token存在，不清除token（可能是网络问题）
        // 只清除状态
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (err) {
      console.error('❌ 获取用户信息异常:', err);
      // 如果API调用失败，但token存在，保留token和缓存信息
      // 不清除登录状态（可能是网络问题）
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // console.log('🚀 AuthContext 初始化, token:', token ? '存在' : '不存在');
    
    if (token) {
      // 先检查localStorage中是否有缓存的用户信息
      const cachedUserInfo = localStorage.getItem('userInfo');
      if (cachedUserInfo) {
        try {
          const userData = JSON.parse(cachedUserInfo);
          // console.log('✅ 初始化时使用缓存的用户信息:', userData);
          setUserInfo(userData);
          setIsLoggedIn(true);
          setLoading(false);
        } catch (e) {
          console.error('解析缓存的用户信息失败:', e);
          // 如果解析失败，重新获取
          refreshUserInfo();
        }
      } else {
        // console.log('📡 没有缓存，调用 refreshUserInfo');
        // 如果没有缓存，获取用户信息
        refreshUserInfo();
      }
    } else {
      // console.log('❌ 没有token，设置未登录状态');
      setIsLoggedIn(false);
      setUserInfo(null);
      setLoading(false);
    }
  }, [refreshUserInfo]);

  // 监听storage变化，实现跨标签页同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          refreshUserInfo();
        } else {
          logout();
        }
      }
    };

    // 监听自定义事件，用于同标签页内通知
    const handleAuthChange = () => {
      // console.log('🔔 authStateChange 事件触发');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        // 先检查是否有缓存的用户信息
        const cachedUserInfo = localStorage.getItem('userInfo');
        if (cachedUserInfo) {
          try {
            const userData = JSON.parse(cachedUserInfo);
            // console.log('✅ 事件处理：使用缓存的用户信息:', userData);
            setUserInfo(userData);
            setIsLoggedIn(true);
            setLoading(false);
          } catch (e) {
            console.error('解析缓存的用户信息失败:', e);
            refreshUserInfo();
          }
        } else {
          // console.log('📡 事件处理：没有缓存，调用 refreshUserInfo');
          refreshUserInfo();
        }
      } else {
        // console.log('❌ 事件处理：没有token，调用 logout');
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, [refreshUserInfo, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, loading, refreshUserInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

