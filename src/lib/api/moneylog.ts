/**
 * 资金流水相关API
 */
import apiClient from './client';

export interface MoneyLogRequest {
  page?: number;
  limit?: number;
  operate_type?: string; // 流水类型（后端参数名是operate_type）
  created_at?: string[]; // 时间范围（后端期望的是created_at数组）
  type?: string; // 兼容字段
  start_time?: string; // 兼容字段
  end_time?: string; // 兼容字段
}

export interface MoneyLogItem {
  id: number;
  operate_type?: string; // 操作类型
  operate_type_text?: string; // 操作类型文本（后端返回的字段名）
  money_type?: string; // 钱包类型
  money_type_text?: string; // 钱包类型文本
  type?: string; // 兼容字段
  type_text?: string; // 兼容字段
  money: number;
  number_type?: number; // 数量类型：1=增加(MONEY_TYPE_ADD), -1=减少(MONEY_TYPE_SUB)
  money_before?: number; // 变动前余额（后端字段名）
  money_after?: number; // 变动后余额（后端字段名）
  before_money?: number; // 兼容字段
  after_money?: number; // 兼容字段
  description?: string;
  created_at: string;
  [key: string]: any;
}

export interface MoneyLogResponse {
  code: number;
  message: string;
  data: any; // 使用any类型避免类型冲突，实际结构由后端决定
}

export interface MoneyLogType {
  value: string;
  label: string;
}

export interface MoneyLogTypeResponse {
  code: number;
  message: string;
  data: {
    operate_type?: Record<string, string>; // 操作类型对象
    money_type?: Record<string, string>; // 钱包类型对象
    [key: string]: any;
  };
}

// 获取资金流水列表
export const getMoneyLog = (params: MoneyLogRequest = {}): Promise<MoneyLogResponse> => {
  // 根据后端代码：期望created_at数组和operate_type参数
  // 编译后的代码：POST /moneylog?lang=xxx
  const requestParams: any = {
    page: params.page || 1,
    limit: params.limit || 20,
  };
  
  // 处理时间参数：转换为created_at数组格式
  if (params.start_time && params.end_time) {
    requestParams.created_at = [params.start_time, params.end_time];
  } else if (params.created_at) {
    requestParams.created_at = params.created_at;
  }
  
  // 处理类型参数：使用operate_type（后端期望的参数名）
  if (params.operate_type) {
    requestParams.operate_type = params.operate_type;
  } else if (params.type) {
    requestParams.operate_type = params.type;
  }
  
  console.log('📊 资金流水请求参数:', requestParams);
  
  // lang参数在URL中传递（参考编译后的前端代码）
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`moneylog?lang=${encodeURIComponent(lang)}`, requestParams);
};

// 获取资金流水类型
export const getMoneyLogType = (): Promise<MoneyLogTypeResponse> => {
  // 根据接口清单：Route::get('moneylog/type','MemberController@money_log_type')
  // 编译后的代码：GET /moneylog/type?lang=xxx
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.get(`moneylog/type?lang=${encodeURIComponent(lang)}`);
};

