/**
 * 系统相关API
 */
import apiClient from './client';

export interface Notice {
  title: string;
  content: string;
  url?: string;
}

export interface NoticeResponse {
  code: number;
  message: string;
  data: string[]; // 返回的是标题数组
}

export interface Banner {
  id?: number;
  src: string;
  url?: string;
  link?: string;
  [key: string]: any;
}

export interface BannerResponse {
  code: number;
  message: string;
  data: Banner[];
}

// 获取首页公告（消息栏）
export const getHomeNotices = (): Promise<NoticeResponse> => {
  // 使用GET请求，路径映射为 /system/notices (lang参数由拦截器自动添加)
  return apiClient.get('system/notices').then((res: any) => {
    // 处理数据转换：将公告对象数组转换为标题字符串数组
    const notices = res.data || [];
    // const titles = notices.map((item: Notice) => item.title || item.content || '').filter(Boolean);
    
    return {
      ...res,
      data: notices
    };
  });
};

// 获取轮播图
export const getBanners = (type: number = 2): Promise<BannerResponse> => {
  // type: 1 = new1, 2 = mobile1
  const group = type === 2 ? 'mobile1' : type === 1 ? 'new1' : 'mobile1';
  
  return apiClient.get('banners', {
    params: {
      group
    }
  }).then((res: any) => {
    // 数据适配：将后端的url字段映射为前端的src字段
    const banners = (res.data || []).map((item: any) => ({
      ...item,
      src: item.url || item.src
    }));
    
    return {
      ...res,
      data: banners
    };
  });
};

// 获取系统配置
export interface SystemConfigResponse {
  code: number;
  message: string;
  data: {
    [key: string]: any;
  };
}

export const getSystemConfig = (group: string = 'system'): Promise<SystemConfigResponse> => {
  return apiClient.get('system/configs', {
    params: {
      group
    }
  }).then((res: any) => {
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data?.data || res.data || {}
    };
  });
};

// 获取客服链接
export interface ServiceUrlResponse {
  code: number;
  message: string;
  data: {
    url?: string;
  };
}

export const getServiceUrl = (): Promise<ServiceUrlResponse> => {
  // 使用 getSystemConfig 接口获取客服链接，group=service 包含 service_link 配置
  // 根据 wap 项目的实现，应该使用 group=service 而不是 group=system
  return apiClient.get('system/configs', {
    params: {
      group: 'service'  // 改为 service 组，因为客服配置在 service 组中
    }
  }).then((res: any) => {
    console.log('📞 系统配置API完整响应:', JSON.stringify(res, null, 2));
    
    // 从 system config 中获取 service_link
    // 后端可能返回多种格式：
    // 1. { code: 200, data: { data: { service_link: '...' } } }
    // 2. { code: 200, data: { service_link: '...' } }
    // 3. { status: 'success', code: 200, data: { data: { service_link: '...' } } }
    let url = '';
    
    // 尝试多种数据结构
    if (res.data) {
      // 情况1: res.data.data 存在（嵌套结构）
      if (res.data.data && typeof res.data.data === 'object') {
        url = res.data.data.service_link || res.data.data.service_url || '';
        console.log('📞 从 res.data.data 中提取:', { service_link: res.data.data.service_link, service_url: res.data.data.service_url });
      }
      // 情况2: res.data 直接包含 service_link
      else if (typeof res.data === 'object' && res.data.service_link) {
        url = res.data.service_link || res.data.service_url || '';
        console.log('📞 从 res.data 中提取:', { service_link: res.data.service_link, service_url: res.data.service_url });
      }
      // 情况3: res.data 是字符串（直接返回链接）
      else if (typeof res.data === 'string') {
        url = res.data;
        console.log('📞 res.data 是字符串:', url);
      }
    }
    
    // 如果还是空，尝试从 res 根级别获取
    if (!url && res.service_link) {
      url = res.service_link;
      console.log('📞 从 res 根级别提取 service_link:', url);
    }
    
    console.log('📞 最终解析后的客服链接:', url || '(为空)');
    
    return {
      code: (res.status === 'success' || res.code === 200) ? 200 : (res.code || 200),
      message: res.message || '',
      data: {
        url: url
      }
    };
  }).catch((error: any) => {
    console.error('❌ 获取客服链接失败:', error);
    // 返回空链接，让前端显示加载提示
    return {
      code: error.code || 500,
      message: error.message || '获取客服链接失败',
      data: {
        url: ''
      }
    };
  });
};

