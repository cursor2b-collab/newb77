/**
 * Axios API 客户端配置
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

// API 基础URL - 可通过环境变量配置
// 开发环境使用相对路径，通过 Vite 代理解决跨域问题
// 生产环境使用完整 URL
// 注意：如果环境变量未设置，生产环境默认使用 https://api.beeb77.net/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'https://api.beeb77.net/api');

// console.log('🔧 API配置:', {
//   VITE_API_URL: import.meta.env.VITE_API_URL,
//   DEV: import.meta.env.DEV,
//   MODE: import.meta.env.MODE,
//   PROD: import.meta.env.PROD,
//   API_BASE_URL
// });

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加语言参数（如果URL中已经有lang参数，则不再添加，避免重复）
    if (!config.url?.includes('lang=')) {
      const lang = localStorage.getItem('ly_lang') || 'zh_cn';
      if (config.method === 'get') {
        config.params = { ...config.params, lang };
      } else if (config.method === 'post') {
        config.data = { ...config.data, lang };
      }
    }

    // 游戏接口超时100秒
    if (config.url?.includes('/game/login')) {
      config.timeout = 100000;
    }

    // console.log('🚀 API请求:', config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // console.log('✅ API响应:', response.config.url, response.data);
    return response.data;
  },
  (error: AxiosError) => {
    console.error('❌ API错误:', error.config?.url, error.response?.data || error.message);

    // 401 未授权 - 清除token并跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 网络错误（CORS、连接失败等）
    if (!error.response) {
      const networkError: any = {
        code: 'ERR_NETWORK',
        message: error.message || '网络连接失败',
        isNetworkError: true,
        originalError: error
      };
      
      // 如果是 CORS 错误，添加更详细的提示
      if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
        networkError.message = '网络连接失败，可能是跨域问题。请检查后端API的CORS配置。';
        networkError.isCorsError = true;
      }
      
      return Promise.reject(networkError);
    }

    // 返回错误响应数据
    if (error.response) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

