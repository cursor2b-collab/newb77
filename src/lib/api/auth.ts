/**
 * 认证相关API
 */
import apiClient from './client';

export interface LoginRequest {
  name: string;
  password: string;
  code: string;
  key: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  confirmPass: string;
  realname: string;
  paypassword: string;
  lang: string;
  code: string;
  inviteCode: string;
  key: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    api_token?: string;
    access_token?: string;
    user?: any;
  };
}

export interface CaptchaResponse {
  code: number;
  message: string;
  data: {
    img?: string;
    image?: string;
    key?: string;
    captcha_key?: string;
  };
}

export interface LanguageResponse {
  code: number;
  message: string;
  data: {
    list: Record<string, string>;
    default?: string;
  };
}

// 登录
export const login = (data: LoginRequest): Promise<AuthResponse> => {
  const postData = {
    name: data.name,
    password: data.password,
    key: data.key || '',
    captcha: data.code || '',
    register_site: window.location.origin || ''
  };
  
  return apiClient.post('/auth/login', postData, {
    params: { lang: localStorage.getItem('ly_lang') || 'zh_cn' },
    headers: {
      Accept: 'application/json'
    }
  });
};

// 注册
export const register = (data: RegisterRequest): Promise<AuthResponse> => {
  // 从localStorage获取lang（参考编译后的前端代码）
  // 确保lang值在后端允许的列表中（zh_cn, zh_hk, en, th, vi）
  const lang = data.lang || localStorage.getItem('ly_lang') || 'zh_cn';
  
  const postData: any = {
    name: data.name,
    password: data.password,
    password_confirmation: data.confirmPass || data.password,
    qk_pwd: data.paypassword,
    realname: data.realname || '',
    invite_code: data.inviteCode || '',
    register_site: window.location.origin || 'http://localhost:3000',
    lang: lang, // lang必须在后端允许的列表中
    is_mobile: 1
  };
  
  // 只有当验证码和key都存在时才添加
  if (data.code && data.key) {
    postData.captcha = data.code;
    postData.key = data.key;
  }
  
  console.log('📝 注册请求数据:', { ...postData, password: '***', password_confirmation: '***', qk_pwd: '***' });
  console.log('📝 注册lang值:', lang);
  
  // lang参数需要在URL参数中传递（参考编译后的前端代码：/auth/register?lang=...）
  // 注意：请求拦截器会自动将lang添加到请求体中，所以这里只需要在URL参数中传递
  return apiClient.post('/auth/register?lang=' + encodeURIComponent(lang), postData);
};

// 获取验证码
export const getCaptcha = (): Promise<CaptchaResponse> => {
  return apiClient.post('/auth/captcha', {});
};

// 获取语言/币种列表
export const getLanguages = async (): Promise<LanguageResponse> => {
  // 使用 GET 请求，路由是 /language（不是 /languages）
  const response = await apiClient.get('language');
  
  // 后端可能返回语言数据而不是币种数据，需要转换
  const currencyMap: Record<string, string> = {
    'zh_cn': '人民币(CNY)',
    'zh_hk': '港币(HKD)',
    'ja': '日元(JPY)',
    'id': '印尼盾(IDR)',
    'vi': '越南盾(VND)',
    'th': '泰铢(THB)',
    'en': '美元(USD)'
  };
  
  if (response.code === 200 && response.data) {
    let languages = response.data.list || {};
    const defaultLang = response.data.default || (Object.keys(languages)[0]) || 'zh_cn';
    
    // 检查后端返回的是否为语言数据（包含"中文"、"English"等）
    const hasLanguageText = Object.values(languages).some(val => 
      typeof val === 'string' && (val.includes('中文') || val.includes('English') || val.includes('ไทย') || val.includes('Name'))
    );
    
    // 如果后端返回的是语言数据，则转换为币种数据
    if (hasLanguageText || Object.keys(languages).length === 0) {
      languages = currencyMap;
      console.log('⚠️ 后端返回语言数据,已转换为币种:', languages);
    } else {
      console.log('✓ 后端返回币种数据:', languages);
    }
    
    return {
      ...response,
      data: {
        list: languages,
        default: defaultLang
      }
    };
  }
  
  return response;
};

// 获取用户信息
export const getUserInfo = (): Promise<any> => {
  return apiClient.post('/auth/me', {});
};

// 登出
export const logout = (): Promise<any> => {
  return apiClient.post('logout', {});
};

