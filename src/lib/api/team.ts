/**
 * 团队管理（推广赚钱）相关API
 */
import apiClient from './client';

export interface TeamMember {
  id: number;
  name: string;
  balance: number;
  total_recharge: number;
  total_withdraw: number;
  created_at: string;
  [key: string]: any;
}

export interface TeamChildListRequest {
  page?: number;
  limit?: number;
  name?: string;
}

export interface TeamChildListResponse {
  code: number;
  message: string;
  data: {
    data: TeamMember[];
    total?: number;
  };
}

export interface TeamMoneyLogRequest {
  page?: number;
  limit?: number;
  member_name?: string;
}

export interface TeamMoneyLogResponse {
  code: number;
  message: string;
  data: {
    data: any[];
    total?: number;
  };
}

export interface TeamAddRequest {
  name: string;
  password?: string;
  code?: string;
  key?: string;
  [key: string]: any;
}

export interface TeamGameRecordRequest {
  page?: number;
  limit?: number;
  member_name?: string;
}

export interface TeamGameRecordResponse {
  code: number;
  message: string;
  data: {
    data: any[];
    total?: number;
  };
}

export interface TeamRate {
  api_name: string;
  rate: number;
  [key: string]: any;
}

export interface TeamFdInfoResponse {
  code: number;
  message: string;
  data: {
    agent_rates: TeamRate[];
  };
}

export interface TeamChartResponse {
  code: number;
  message: string;
  data: any;
}

export interface TeamReportRequest {
  start_time?: string;
  end_time?: string;
  created_at?: string; // 后端可能需要的字段
  [key: string]: any;
}

export interface TeamReportResponse {
  code: number;
  message: string;
  data: any;
}

export interface InviteLink {
  id: number;
  code: string;
  url: string;
  status: number;
  created_at: string;
  [key: string]: any;
}

export interface InviteLinkListResponse {
  code: number;
  message: string;
  data: InviteLink[];
}

export interface CreateInviteLinkRequest {
  name?: string;
  rates?: any; // 返点比例数据
  [key: string]: any;
}

export interface UpdateInviteLinkRequest {
  id: number;
  name?: string;
  status?: number;
}

export interface TeamResponse {
  code: number;
  message: string;
  data?: any;
}

// 获取下级会员列表
export const getTeamChildList = (params: TeamChildListRequest = {}): Promise<TeamChildListResponse> => {
  // 根据接口清单：POST /team/childlist
  return apiClient.post('/team/childlist', {
    page: params.page || 1,
    limit: params.limit || 20,
    name: params.name || ''
  }).then((res: any) => {
    // 处理不同的响应结构
    if (res.code === 200) {
      // 如果data是数组，包装成标准格式
      if (Array.isArray(res.data)) {
        return {
          ...res,
          data: {
            data: res.data,
            total: res.total || res.data.length
          }
        };
      }
      // 如果data是对象但没有data字段，尝试从其他字段获取
      if (res.data && !res.data.data && !Array.isArray(res.data)) {
        const dataArray = res.data.list || res.data.members || [];
        return {
          ...res,
          data: {
            data: Array.isArray(dataArray) ? dataArray : [],
            total: res.data.total || res.total || 0
          }
        };
      }
    }
    return res;
  });
};

// 获取团队资金流水
export const getTeamMoneyLog = (params: TeamMoneyLogRequest = {}): Promise<TeamMoneyLogResponse> => {
  // 根据接口清单：POST /team/moneylog
  return apiClient.post('/team/moneylog', {
    page: params.page || 1,
    limit: params.limit || 20,
    member_name: params.member_name || ''
  });
};

// 添加团队成员
export const addTeamMember = (params: TeamAddRequest): Promise<TeamResponse> => {
  // 根据接口清单：POST /team/add
  return apiClient.post('/team/add', params);
};

// 获取团队游戏记录
export const getTeamGameRecord = (params: TeamGameRecordRequest = {}): Promise<TeamGameRecordResponse> => {
  // 根据接口清单：POST /team/gamerecord
  return apiClient.post('/team/gamerecord', {
    page: params.page || 1,
    limit: params.limit || 20,
    member_name: params.member_name || ''
  });
};

// 获取下级返点设置
export const getTeamChildRates = (params: { member_name?: string }): Promise<TeamResponse> => {
  // 根据接口清单：POST /team/childrates
  return apiClient.post('/team/childrates', params);
};

// 获取返点信息
export const getTeamFdInfo = (): Promise<TeamFdInfoResponse> => {
  // 根据接口清单：GET /team/fdinfo
  return apiClient.get('/team/fdinfo');
};

// 获取团队图表数据
export const getTeamChart = (): Promise<TeamChartResponse> => {
  // 根据接口清单：POST /team/chart
  return apiClient.post('/team/chart');
};

// 获取团队报表
export const getTeamReport = (params: TeamReportRequest = {}): Promise<TeamReportResponse> => {
  // 根据接口清单：POST /team/report
  return apiClient.post('/team/report', params);
};

// 获取邀请链接列表
export const getInviteLinkList = (): Promise<InviteLinkListResponse> => {
  // 根据接口清单：GET /team/invite/list
  return apiClient.get('/team/invite/list').then((res: any) => {
    // 处理不同的响应结构
    if (res.code === 200) {
      // 如果data是数组，直接返回
      if (Array.isArray(res.data)) {
        return res;
      }
      // 如果data是对象，尝试提取数组
      if (res.data && !Array.isArray(res.data)) {
        const linkArray = res.data.list || res.data.data || res.data.links || [];
        return {
          ...res,
          data: Array.isArray(linkArray) ? linkArray : []
        };
      }
    }
    return res;
  });
};

// 创建邀请链接
export const createInviteLink = (params: CreateInviteLinkRequest = {}): Promise<TeamResponse> => {
  // 根据接口清单：POST /team/invite/create
  return apiClient.post('/team/invite/create', params);
};

// 更新邀请链接
export const updateInviteLink = (params: UpdateInviteLinkRequest): Promise<TeamResponse> => {
  // 根据接口清单：POST /team/invite/update
  return apiClient.post('/team/invite/update', params);
};

// export const getRechargeInfo = (bill_no: string = ''): Promise<any> => {
//   return apiClient.get('/recharge/info', {
//     params: {
//       bill_no
//     }
//   }).then((res: any) => {
//     return {
//       code: res.code || 200,
//       message: res.message || '',
//       data: res.data?.data || res.data || {}
//     };
//   });
// };
export const getRechargeInfo = (params: any): Promise<any> => {
  // 根据接口清单：POST auth/info/update
  return apiClient.post('/recharge/info', params).then((res: any) => {
    // 处理不同的响应结构
    if (res.code === 200) {
      return {
        "status": "success",
        "code": 200,
        "message": "",
        data: res.data
      };
    }
    return res;
  });
};