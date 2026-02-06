/**
 * USDT自动充值API
 * 
 * 支持链上监听自动回调上分
 */
import apiClient from './client';

// 创建USDT充值订单请求
export interface CreateUsdtOrderRequest {
  amount: number;      // USDT金额
  payment_id: number;  // 支付方式ID
}

// USDT充值订单响应
export interface UsdtOrderData {
  order_id: number;
  bill_no: string;
  receive_address: string;      // 收款地址
  usdt_amount: number;          // 应付USDT金额(含唯一标识)
  original_amount: number;      // 原始USDT金额
  cny_amount: number;           // 折算人民币金额
  usdt_rate: number;            // 汇率
  usdt_type: string;            // 钱包协议 TRC20/ERC20
  qrcode: string;               // 收款二维码
  expire_at: string;            // 过期时间
  expire_minutes: number;       // 有效期(分钟)
}

export interface CreateUsdtOrderResponse {
  code: number;
  message: string;
  status?: string;
  data?: UsdtOrderData;
}

// 订单状态
export interface UsdtOrderStatus {
  bill_no: string;
  status: number;               // 1待确认 2成功 3失败 4过期 5取消
  status_text: string;
  usdt_amount: number;
  cny_amount: number;
  receive_address: string;
  tx_hash: string | null;       // 交易哈希
  from_address: string | null;  // 付款地址
  expire_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface GetOrderStatusResponse {
  code: number;
  message: string;
  status?: string;
  data?: UsdtOrderStatus;
}

// 待处理订单
export interface PendingOrderData {
  has_pending: boolean;
  order?: {
    bill_no: string;
    usdt_amount: number;
    cny_amount: number;
    receive_address: string;
    usdt_type: string;
    remaining_seconds: number;
    expire_at: string;
    created_at: string;
  };
}

export interface GetPendingOrderResponse {
  code: number;
  message: string;
  status?: string;
  data?: PendingOrderData;
}

// 订单列表
export interface UsdtOrderListItem {
  id: number;
  bill_no: string;
  usdt_amount: number;
  cny_amount: number;
  status: number;
  status_text: string;
  tx_hash: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface GetOrderListResponse {
  code: number;
  message: string;
  status?: string;
  data?: {
    data: UsdtOrderListItem[];
    total: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * 创建USDT充值订单
 * 
 * @param params 创建订单参数
 * @returns 订单信息
 */
export const createUsdtOrder = async (params: CreateUsdtOrderRequest): Promise<CreateUsdtOrderResponse> => {
  try {
    console.log('💰 创建USDT充值订单:', params);
    const res = await apiClient.post('usdt/recharge/create', params);
    console.log('💰 创建订单响应:', res);
    console.log('💰 响应类型检查:', typeof res, Array.isArray(res), res?.status, res?.code);
    
    // 后端返回的数据直接在根对象中，不是嵌套在data字段里
    // success方法会将data合并到响应中：array_merge($status, $data)
    const isSuccess = res.status === 'success' || res.code === 200;
    
    // 从响应中提取订单数据（排除status/code/message字段）
    const orderData: UsdtOrderData | undefined = isSuccess ? {
      order_id: res.order_id,
      bill_no: res.bill_no,
      receive_address: res.receive_address,
      usdt_amount: res.usdt_amount,
      original_amount: res.original_amount,
      cny_amount: res.cny_amount,
      usdt_rate: res.usdt_rate,
      usdt_type: res.usdt_type,
      qrcode: res.qrcode,
      expire_at: res.expire_at,
      expire_minutes: res.expire_minutes,
    } : undefined;
    
    console.log('💰 解析后的订单数据:', orderData);
    
    return {
      code: res.code || (isSuccess ? 200 : 400),
      message: res.message || '',
      data: orderData
    };
  } catch (error: any) {
    console.error('❌ 创建USDT订单失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '创建订单失败',
      data: undefined
    };
  }
};

/**
 * 查询订单状态
 * 
 * @param billNo 订单号
 * @returns 订单状态
 */
export const getUsdtOrderStatus = async (billNo: string): Promise<GetOrderStatusResponse> => {
  try {
    console.log('🔍 查询USDT订单状态:', billNo);
    const res = await apiClient.get('usdt/recharge/status', { params: { bill_no: billNo } });
    console.log('🔍 订单状态响应:', res);
    
    const isSuccess = res.status === 'success' || res.code === 200;
    
    // 从响应中提取订单状态数据
    const statusData: UsdtOrderStatus | undefined = isSuccess ? {
      bill_no: res.bill_no,
      status: res.order_status || res.status_code,
      status_text: res.status_text || '',
      usdt_amount: res.usdt_amount,
      cny_amount: res.cny_amount,
      receive_address: res.receive_address,
      tx_hash: res.tx_hash || null,
      from_address: res.from_address || null,
      expire_at: res.expire_at || null,
      confirmed_at: res.confirmed_at || null,
      created_at: res.created_at || '',
    } : undefined;
    
    return {
      code: res.code || (isSuccess ? 200 : 400),
      message: res.message || '',
      data: statusData
    };
  } catch (error: any) {
    console.error('❌ 查询订单状态失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '查询失败',
      data: undefined
    };
  }
};

/**
 * 获取待处理的订单
 * 
 * @returns 待处理订单信息
 */
export const getPendingUsdtOrder = async (): Promise<GetPendingOrderResponse> => {
  try {
    const res = await apiClient.get('usdt/recharge/pending');
    
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: res.data
    };
  } catch (error: any) {
    console.error('❌ 获取待处理订单失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '获取失败',
      data: undefined
    };
  }
};

/**
 * 取消订单
 * 
 * @param billNo 订单号
 * @returns 操作结果
 */
export const cancelUsdtOrder = async (billNo: string): Promise<{ code: number; message: string }> => {
  try {
    console.log('🚫 取消USDT订单:', billNo);
    const res = await apiClient.post('usdt/recharge/cancel', { bill_no: billNo });
    console.log('🚫 取消订单响应:', res);
    
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || ''
    };
  } catch (error: any) {
    console.error('❌ 取消订单失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '取消失败'
    };
  }
};

/**
 * 获取订单列表
 * 
 * @param status 状态筛选(可选)
 * @param limit 每页数量
 * @param page 页码
 * @returns 订单列表
 */
export const getUsdtOrderList = async (
  status?: number,
  limit: number = 10,
  page: number = 1
): Promise<GetOrderListResponse> => {
  try {
    const params: any = { limit, page };
    if (status) {
      params.status = status;
    }
    
    const res = await apiClient.get('usdt/recharge/list', { params });
    
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: res.data
    };
  } catch (error: any) {
    console.error('❌ 获取订单列表失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '获取失败',
      data: undefined
    };
  }
};

/**
 * 手动触发检查(用于前端主动查询)
 * 
 * @param billNo 订单号(可选)
 * @returns 检查结果
 */
export const checkUsdtOrder = async (billNo?: string): Promise<GetOrderStatusResponse> => {
  try {
    console.log('🔄 手动检查USDT订单:', billNo || '全部待处理订单');
    const params: any = {};
    if (billNo) {
      params.bill_no = billNo;
    }
    
    const res = await apiClient.post('usdt/recharge/check', params);
    console.log('🔄 检查结果:', res);
    
    const isSuccess = res.status === 'success' || res.code === 200;
    
    // 从响应中提取订单状态数据
    const statusData: UsdtOrderStatus | undefined = isSuccess && res.bill_no ? {
      bill_no: res.bill_no,
      status: res.order_status || res.status_code,
      status_text: res.status_text || '',
      usdt_amount: res.usdt_amount,
      cny_amount: res.cny_amount,
      receive_address: res.receive_address,
      tx_hash: res.tx_hash || null,
      from_address: res.from_address || null,
      expire_at: res.expire_at || null,
      confirmed_at: res.confirmed_at || null,
      created_at: res.created_at || '',
    } : undefined;
    
    return {
      code: res.code || (isSuccess ? 200 : 400),
      message: res.message || '',
      data: statusData
    };
  } catch (error: any) {
    console.error('❌ 检查订单失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '检查失败',
      data: undefined
    };
  }
};

// 订单状态常量
export const USDT_ORDER_STATUS = {
  PENDING: 1,     // 待确认
  SUCCESS: 2,     // 成功
  FAILED: 3,      // 失败
  EXPIRED: 4,     // 过期
  CANCELLED: 5,   // 取消
} as const;

// 状态文本映射
export const USDT_ORDER_STATUS_TEXT: Record<number, string> = {
  [USDT_ORDER_STATUS.PENDING]: '待确认',
  [USDT_ORDER_STATUS.SUCCESS]: '充值成功',
  [USDT_ORDER_STATUS.FAILED]: '充值失败',
  [USDT_ORDER_STATUS.EXPIRED]: '已过期',
  [USDT_ORDER_STATUS.CANCELLED]: '已取消',
};
