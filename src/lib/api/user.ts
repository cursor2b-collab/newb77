/**
 * 用户相关API
 */
import apiClient from './client';

export interface VipLevel {
  level: number;
  level_name: string;
  deposit_money: number;
  bet_money: number;
  level_bonus: number;
  day_bonus: number;
  week_bonus: number;
  month_bonus: number;
  year_bonus: number;
  credit_bonus: number;
  levelup_type: number;
  lang: string;
}

export interface UserInfoResponse {
  code: number;
  message: string;
  data: {
    username: string;
    balance: number;
    vip: number;
    paysum?: number;
  };
}

export interface VipInfoResponse {
  code: number;
  message: string;
  data: {
    levels: VipLevel[];
    total_bet: number;
    total_deposit: number;
    levelup_types: any;
    member_levels: {
      level_bonus: number;
      day_bonus: number;
      week_bonus: number;
      month_bonus: number;
      year_bonus: number;
      credit_bonus: number;
    };
  };
}

export interface VipResponse {
  code: number;
  message: string;
  data: VipLevel[];
}

// 获取用户信息（刷新余额）
// 使用 auth/me 接口，与 getUserInfo 相同，但保持此函数名以兼容现有代码
export const getUserInfoFromUser = (): Promise<UserInfoResponse> => {
  return apiClient.post('/auth/me', {}).then((res: any) => {
    // 调试：打印所有可能的余额字段
    if (res.code === 200 && res.data) {
      console.log('🔍 getUserInfoFromUser 余额字段检查:', {
        money: res.data.money,
        balance: res.data.balance,
        total_money: res.data.total_money,
        fs_money: res.data.fs_money,
        ml_money: res.data.ml_money,
        '原始数据': res.data
      });
      
      // 尝试多种可能的余额字段名（优先使用money，因为这是中心账户余额）
      const balanceValue = res.data.money !== undefined ? res.data.money :
                          res.data.balance !== undefined ? res.data.balance :
                          res.data.total_money ? parseFloat(res.data.total_money) :
                          0;
      
      return {
        ...res,
        data: {
          ...res.data,
          balance: balanceValue,
          username: res.data.username || res.data.name || '',
          vip: res.data.vip || res.data.vip_level || 0
        }
      };
    }
    return res;
  });
};

// 获取VIP信息（完整详情）
export const getUserVipInfo = (): Promise<VipInfoResponse> => {
  // 根据接口清单：GET /member/vips
  return apiClient.get('/member/vips');
};

// 获取VIP信息（兼容旧接口）
export const getUserVip = (): Promise<VipResponse> => {
  // 根据接口清单：GET /member/vips
  return apiClient.get('/member/vips');
};

export const getRegSetting = (): Promise<any> => {
  // 根据接口清单：GET /member/reg_setting
  return apiClient.get('/member/reg_setting');
};

// 退出登录
export const logoff = (): Promise<any> => {
  return apiClient.post('logoff', {});
};

// 上传头像
export const uploadAvatar = (formData: FormData): Promise<any> => {
  return apiClient.post('uploadimg', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 一键转账（回收所有游戏平台余额到钱包）
export const transferAll = (): Promise<any> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  console.log('💰 调用 transferAll API, lang:', lang);
  // 尝试使用 /transall 接口
  // 注意：如果后端没有这个接口，会返回404，需要处理
  return apiClient.post(`transall?lang=${lang}`, {}).then((res: any) => {
    console.log('💰 transferAll API 响应:', res);
    return res;
  }).catch((error: any) => {
    console.error('❌ transferAll API 错误:', error);
    // 如果是404，说明接口不存在
    if (error.response?.status === 404 || error.code === 404) {
      throw new Error('回收余额接口不存在，请使用游戏页面内的转出功能');
    }
    throw error;
  });
};

// 更新用户信息
export interface UpdateUserInfoRequest {
  realname?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  line?: string;
  [key: string]: any;
}

export const updateUserInfo = (params: UpdateUserInfoRequest): Promise<any> => {
  // 根据接口清单：POST auth/info/update
  return apiClient.post('auth/info/update', params);
};

// 切换转账模式（自动/手动）
export const changeTransferMode = (status: number): Promise<any> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  // 根据接口清单：POST /game/change_trans
  // status: 1 = 自动, 0 = 手动
  return apiClient.post(`game/change_trans?lang=${lang}`, {
    status: status
  });
};

