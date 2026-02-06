/**
 * 活动相关API
 */
import apiClient from './client';

export interface Activity {
  id: number;
  title: string;
  banner: string;
  content: string;
  memo?: string;
  type: number;
  type_text?: string;
  created_at: string;
}

export interface ActivityListResponse {
  code: number;
  message: string;
  data: Activity[] | { data: Activity[] };
}

export interface ActivityDetailResponse {
  code: number;
  message: string;
  data: Activity;
}

export interface ActivityApplyResponse {
  code: number;
  message: string;
}

// 获取活动列表
export const getActivityList = (type?: string): Promise<ActivityListResponse> => {
  // 使用GET请求，路径映射为 /act/list (lang参数由拦截器自动添加)
  return apiClient.get('act/list', { 
    params: { 
      type: type || ''
    }
  }).then((res: any) => {
    // 处理多种可能的数据结构
    let activities: Activity[] = [];
    const responseData = res.data || res;
    
    if (Array.isArray(responseData)) {
      activities = responseData;
    } else if (responseData && responseData.activity && Array.isArray(responseData.activity)) {
      activities = responseData.activity;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      activities = responseData.data;
    }
    
    // 映射字段：cover_image -> banner
    activities = activities.map((item: any) => ({
      ...item,
      banner: item.cover_image || item.banner || item.hall_image || ''
    }));
    
    return {
      ...res,
      data: activities
    };
  });
};

// 获取活动详情
export const getActivityDetail = (id: number | string): Promise<ActivityDetailResponse> => {
  // 使用GET请求，路径映射为 /act/${id} (lang参数由拦截器自动添加)
  return apiClient.get(`act/${id}`).then((res: any) => {
    // 处理banner字段映射
    if (res.data) {
      res.data.banner = res.data.cover_image || res.data.banner || res.data.hall_image || '';
    }
    return res;
  });
};

// 申请活动
export const applyActivity = (
  activityid: number | string,
  params?: {
    member_name?: string;
    captcha?: string;
    key?: string;
  }
): Promise<ActivityApplyResponse> => {
  // 使用POST请求，路径映射为 /act/apply/${activityid} (lang参数由拦截器自动添加)
  return apiClient.post(`act/apply/${activityid}`, params || {});
};

// 洗码返利相关接口
export interface RebateItem {
  gameType: string;
  total_valid: number;
  rate: number;
  fs_money: number;
  game_type_text: string;
  api_names: string;
}

export interface RebateListResponse {
  code: number;
  message: string;
  data: RebateItem[];
  deadtime?: number;
  today?: number;
  yesterday?: number;
  total?: number;
}

export interface RebateClaimResponse {
  code: number;
  message: string;
}

// 获取实时反水列表
export const getRebateList = (): Promise<RebateListResponse> => {
  // 根据MemberController.php: fs_now_list()
  // 后端路由: Route::get('fsnow/list','MemberController@fs_now_list');
  // 后端返回: {code: 200, status: 'success', data: {data: [...], deadtime: ..., today: ..., ...}}
  return apiClient.get('fsnow/list').then((res: any) => {
    console.log('🔍 getRebateList 原始响应:', res);
    console.log('🔍 getRebateList 响应类型:', typeof res);
    console.log('🔍 getRebateList 响应键:', res ? Object.keys(res) : 'null');
    
    // 处理返回数据结构
    if (res) {
      // 后端实际返回结构: {code: 200, status: 'success', data: [...], deadtime: ..., today: ..., ...}
      // data 字段直接是数组，不是嵌套对象
      
      console.log('🔍 res.data 类型:', Array.isArray(res.data) ? '数组' : typeof res.data);
      console.log('🔍 res.data 内容:', res.data);
      
      // 提取反水列表
      let rebateList: any[] = [];
      if (Array.isArray(res.data)) {
        // res.data 直接是数组
        rebateList = res.data;
        console.log('✅ 从 res.data 提取到数组，长度:', rebateList.length);
      } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
        // 兼容嵌套结构: res.data.data 是数组
        rebateList = res.data.data;
        console.log('✅ 从 res.data.data 提取到数组，长度:', rebateList.length);
      } else {
        console.warn('⚠️ 未找到有效的反水列表数据，res.data:', res.data);
      }
      
      const result = {
        code: res.code || 200,
        message: res.message || '',
        status: res.status || 'success',
        data: rebateList,
        deadtime: res.deadtime || Math.floor(Date.now() / 1000),
        today: res.today || 0,
        yesterday: res.yesterday || 0,
        total: res.total || 0
      };
      
      console.log('✅ 最终返回结果:', result);
      console.log('✅ 反水列表详情:', rebateList);
      return result;
    }
    
    // 如果响应为空，返回空数据
    console.warn('⚠️ 响应为空，返回默认空数据');
    return {
      code: 200,
      message: '',
      status: 'success',
      data: [],
      deadtime: Math.floor(Date.now() / 1000),
      today: 0,
      yesterday: 0,
      total: 0
    };
  }).catch((error: any) => {
    console.error('❌ getRebateList 请求失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      code: error.code,
      response: error.response,
      data: error.response?.data
    });
    // 即使请求失败，也返回空数据，不阻止页面显示
    return {
      code: error.code || 500,
      message: error.message || '请求失败',
      status: 'error',
      data: [],
      deadtime: Math.floor(Date.now() / 1000),
      today: 0,
      yesterday: 0,
      total: 0
    };
  });
};

// 领取实时反水
export const claimRebate = (deadtime: number): Promise<RebateClaimResponse> => {
  // 根据MemberController.php: fs_now()
  // 后端路由: Route::post('fsnow/fetch','MemberController@fs_now');
  return apiClient.post('fsnow/fetch', {
    deadtime: deadtime
  });
};