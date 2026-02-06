/**
 * 存款相关API
 */
import apiClient from './client';

export interface PayWayList {
  usdt?: number;
  card?: number;
  alipay?: number;
  wechat?: number;
  wxpay?: number;
}

export interface PayWayResponse {
  code: number;
  message: string;
  data: PayWayList;
}

export interface Bank {
  bank_name: string;
  [key: string]: any;
}

export interface BankListResponse {
  code: number;
  message: string;
  data: Bank[];
}

export interface PayBank {
  bank_data?: {
    bank_name: string;
  };
  bank_no: string;
  bank_owner: string;
  bank_address: string;
  mch_id?: string;
  payimg?: string;
  [key: string]: any;
}

export interface PayBankResponse {
  code: number;
  message: string;
  data: PayBank | PayBank[];
}

export interface RechargeRequest {
  name?: string; // 转账人姓名
  money: number | string; // 充值金额
  account?: string; // 转账账户
  hk_at?: string; // 转账时间 (格式: YYYY-MM-DD HH:mm:ss)
  payment_account?: string; // 收款账户
  payment_name?: string; // 收款人姓名
  payment_id?: number; // 支付方式ID
  payment_type?: string; // 支付类型 (company_bankpay, company_alipay等)
  payment_pic?: string; // 支付凭证图片URL
  payment_bank_type?: string; // 银行类型 (ABC, COMM等)
  
  // 兼容旧版本参数（向后兼容）
  paytype?: string; // 'usdt' | 'bank' | 'alipay' | 'wxpay'
  amount?: number; // 兼容amount字段
  catepay?: string; // 'TRC20' | 'ERC20' (仅usdt需要)
  bank?: string; // 银行类型 (仅bank需要)
  bank_address?: string; // 开户行 (仅bank需要)
  bank_no?: string; // 银行卡号 (仅bank需要)
  bank_owner?: string; // 汇款姓名 (仅bank需要)
}

export interface RechargeResponse {
  code: number;
  message: string;
  data?: any;
}

export interface PayInfoRequest {
  deposit_no: string;
}

export interface PayInfo {
  info: {
    amount: number;
    real_money: number;
    paytype: string;
    bank?: string;
    account?: string; // 收款账户
    name?: string; // 收款姓名
  };
  cardlist: {
    mch_id: string;
    payimg: string;
    account?: string; // 收款账户
    name?: string; // 收款姓名
  };
  payment?: {
    account?: string; // 收款账户（从Payment模型）
    name?: string; // 收款姓名（从Payment模型）
  };
}

export interface PayInfo2 {
  id: number,
  bill_no: string,
  member_id: number,
  name: string,
  origin_money: string,
  forex: string,
  lang: string,
  money: string,
  payment_type: string,
  account: string,
  payment_desc: string,
  payment_detail: {
    payment_id: number,
    payment_account: string,
    payment_name: string,
    usdt_rate: string,
    usdt_type: string,
  },
  payment_pic: string,
  status: number,
  diff_money: string,
  before_money: string,
  after_money: string,
  score: string,
  fail_reason: null,
  hk_at: string,
  confirm_at: null,
  user_id: number,
  created_at: string,
  updated_at: string,
  status_text: string,
  payment_type_text: string,
}

export interface PayInfoResponse {
  code: number;
  message: string;
  data: PayInfo;
}

// 获取支付方式列表
export const getPayWay = (): Promise<PayWayResponse> => {
  // Vue项目使用: GET /api/get_pay_way
  // baseURL已经包含/api，所以直接使用get_pay_way
  return apiClient.get('get_pay_way', {}).then((res: any) => {
    console.log('📋 支付方式列表响应:', res);
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data || {}
    };
  }).catch((error: any) => {
    console.error('❌ 获取支付方式失败:', error);
    return {
      code: error.code || 500,
      message: error.message || '获取支付方式失败',
      data: {}
    };
  });
};

// 获取银行列表
export const getBankList = (): Promise<BankListResponse> => {
  // Vue项目使用: POST /api/banklist
  return apiClient.post('banklist', {}).then((res: any) => {
    console.log('🏦 银行列表响应:', res);
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data || []
    };
  }).catch((error: any) => {
    console.error('❌ 获取银行列表失败:', error);
    return {
      code: error.code || 500,
      message: error.message || '获取银行列表失败',
      data: []
    };
  });
};

// 获取支付银行信息
export const getPayBank = (): Promise<PayBankResponse> => {
  // Vue项目使用: POST /api/getpaybank
  return apiClient.post('getpaybank', {}).then((res: any) => {
    console.log('💳 支付银行信息响应:', res);
    // Vue项目处理逻辑：如果res.data是数组，直接使用；否则包装成数组
    let data = res.data || [];
    if (!Array.isArray(data)) {
      data = [data];
    }
    return {
      code: res.code || 200,
      message: res.message || '',
      data: data.filter(item => item) // 过滤空值
    };
  }).catch((error: any) => {
    console.error('❌ 获取支付银行失败:', error);
    return {
      code: error.code || 500,
      message: error.message || '获取支付银行失败',
      data: []
    };
  });
};

// 获取在线支付方式列表（包含收款账户和收款姓名）
export interface OnlinePayment {
  id: number;
  account: string; // 收款账号
  name: string; // 收款人姓名
  qrcode: string; // 支付二维码
  type: string; // 支付类型，如 'online_alipay', 'online_wxpay'
  [key: string]: any;
}

export interface OnlinePaymentListResponse {
  code: number;
  message: string;
  data: OnlinePayment[];
}

export const getOnlinePaymentList = (): Promise<OnlinePaymentListResponse> => {
  // Vue项目使用: GET /api/payment/online/list
  // 后端路由: Route::get('payment/online/list','MemberController@payment_online');
  return apiClient.get('payment/online/list', {}).then((res: any) => {
    console.log('💳 在线支付方式列表响应（原始）:', res);
    console.log('💳 在线支付方式列表响应（data）:', res.data);
    
    // 确保data是数组
    let data = res.data || [];
    if (!Array.isArray(data)) {
      if (data && typeof data === 'object') {
        // 如果data是对象，尝试转换为数组
        data = [data];
      } else {
        data = [];
      }
    }
    
    console.log('💳 在线支付方式列表（处理后）:', data);
    console.log('💳 在线支付方式数量:', data.length);
    
    return {
      code: res.code || 200,
      message: res.message || '',
      data: data
    };
  }).catch((error: any) => {
    console.error('❌ 获取在线支付方式列表失败:', error);
    console.error('❌ 错误详情:', error.response?.data || error.message);
    return {
      code: error.code || 500,
      message: error.message || '获取在线支付方式列表失败',
      data: []
    };
  });
};

// 获取公司入款支付方式列表
export interface NormalPayment {
  id: number;
  account: string; // 收款账户
  name: string; // 收款人姓名
  desc: string; // 描述
  type: string; // 支付类型，如 'company_bankpay', 'company_alipay'
  qrcode: string; // 支付二维码
  memo: string; // 备注
  params?: any; // 参数（如银行类型等）
  rate: string; // 费率
  min: number; // 最小金额
  max: number; // 最大金额
  is_open: number; // 是否开启
  remark_code?: number; // 备注码
  type_text: string; // 类型文本
  [key: string]: any;
}

export interface NormalPaymentListResponse {
  code: number;
  message: string;
  data: NormalPayment[];
}

export const getNormalPaymentList = (): Promise<NormalPaymentListResponse> => {
  // 根据接口文档：GET /api/payment/normal/list
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.get(`payment/normal/list?lang=${lang}`, {}).then((res: any) => {
    console.log('💳 公司入款支付方式列表响应:', res);
    const code = res.code || (res.status === 'success' ? 200 : 400);
    const data = res.data || [];
    console.log('💳 解析后的数据 - code:', code, 'data:', data);
    console.log('💳 数据详情:', data.map((item: any) => ({
      id: item.id,
      type: item.type,
      type_text: item.type_text,
      account: item.account,
      name: item.name,
      qrcode: item.qrcode
    })));
    return {
      code: code,
      message: res.message || '',
      data: data
    };
  }).catch((error: any) => {
    console.error('❌ 获取公司入款支付方式列表失败:', error);
    return {
      code: error.code || 500,
      message: error.message || '获取公司入款支付方式列表失败',
      data: []
    };
  });
};

// 提交充值请求（公司入款）
export const recharge = (params: RechargeRequest): Promise<RechargeResponse> => {
  // 根据接口文档：POST /api/recharge/normal
  // 参数格式：
  // {
  //   "name": "转账人姓名",
  //   "money": "金额",
  //   "account": "转账账户",
  //   "hk_at": "转账时间",
  //   "payment_account": "收款账户",
  //   "payment_name": "收款人姓名",
  //   "payment_id": 支付方式ID,
  //   "payment_type": "支付类型",
  //   "payment_pic": "支付凭证图片URL",
  //   "payment_bank_type": "银行类型"
  // }
  
  // 构建新格式的请求参数
  const requestParams: any = {
    money: params.money || params.amount || 0
  };
  
  // 如果有新格式参数，直接使用
  if (params.name) requestParams.name = params.name;
  if (params.account) requestParams.account = params.account;
  if (params.hk_at) requestParams.hk_at = params.hk_at;
  if (params.payment_account) requestParams.payment_account = params.payment_account;
  if (params.payment_name) requestParams.payment_name = params.payment_name;
  if (params.payment_id) requestParams.payment_id = params.payment_id;
  if (params.payment_type) requestParams.payment_type = params.payment_type;
  if (params.payment_pic) requestParams.payment_pic = params.payment_pic;
  if (params.payment_bank_type) requestParams.payment_bank_type = params.payment_bank_type;
  
  console.log('💰 提交充值请求（公司入款）:', requestParams);
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`recharge/normal?lang=${lang}`, requestParams).then((res: any) => {
    console.log('💰 充值响应:', res);
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: res.data
    };
  }).catch((error: any) => {
    console.error('❌ 充值失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '充值失败',
      data: null
    };
  });
};

export const rechargeEdit = (payment_pic: string, id: string): Promise<RechargeResponse> => {
  // 根据接口文档：POST /api/recharge/edit/normal

  // 构建新格式的请求参数
  const requestParams: any = {
    payment_pic: payment_pic || '',
    id: id || ''
  };
  
  console.log('💰 提交充值请求（公司入款）:', requestParams);
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`recharge/edit/normal?lang=${lang}&id=${id}`, requestParams).then((res: any) => {
    console.log('💰 充值响应:', res);
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: res.data
    };
  }).catch((error: any) => {
    console.error('❌ 充值失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '充值失败',
      data: null
    };
  });
};

// 在线充值（第三方支付接口）
export interface RechargeOnlineRequest {
  money: number | string; // 充值金额
  payment_type: string; // 支付类型，如 'online_alipay', 'online_wxpay'
  payment_id: number; // 支付方式ID（必填）
}

export interface RechargeOnlineResponse {
  code: number;
  message: string;
  data?: {
    pay_url?: string; // 支付URL（二维码地址或跳转地址）
    bill_no?: string; // 订单号
    deposit_no?: string; // 订单号（兼容字段）
  };
}

export const rechargeOnline = (params: RechargeOnlineRequest): Promise<RechargeOnlineResponse> => {
  // 根据接口文档：POST /api/recharge/online
  // 参数格式：
  // {
  //   "money": "金额",
  //   "payment_type": "支付类型",
  //   "payment_id": 支付方式ID
  // }
  
  const requestParams: any = {
    money: params.money || 0,
    payment_type: params.payment_type,
    payment_id: params.payment_id
  };
  
  console.log('💰 提交在线充值请求:', requestParams);
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`recharge/online?lang=${lang}`, requestParams).then((res: any) => {
    console.log('💰 在线充值响应（原始）:', res);
    
    // 后端返回格式：{ status: "success", code: 200, message: "...", pay_url: "..." }
    // pay_url 可能在 res.pay_url 或 res.data.pay_url
    const payUrl = res.pay_url || res.data?.pay_url || '';
    const billNo = res.data?.bill_no || res.bill_no || '';
    
    console.log('💰 解析后的支付地址:', payUrl);
    console.log('💰 解析后的订单号:', billNo);
    
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: {
        pay_url: payUrl,
        bill_no: billNo,
        deposit_no: billNo
      }
    };
  }).catch((error: any) => {
    console.error('❌ 在线充值失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '在线充值失败',
      data: undefined
    };
  });
};

// 上传充值凭证图片
export const uploadRechargePic = (file: File): Promise<{ code: number; message: string; data?: { file_url: string } }> => {
  const formData = new FormData();
  formData.append('file', file);
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`recharge/picture/upload?lang=${lang}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res: any) => {
    console.log('📤 上传凭证图片响应:', res);
    // 后端返回格式：{ status: "success", code: 200, message: "", file_url: "..." }
    // 需要检查 file_url 是在 res 中还是在 res.data 中
    const fileUrl = res.file_url || res.data?.file_url || '';
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: fileUrl ? { file_url: fileUrl } : undefined
    };
  }).catch((error: any) => {
    console.error('❌ 上传凭证图片失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '上传凭证图片失败',
      data: undefined
    };
  });
};

// 获取支付信息（二维码等）
export const getPayInfo = (params: PayInfoRequest): Promise<PayInfoResponse> => {
  // Vue项目使用: POST /api/payinfo
  // 参数: { deposit_no: string }
  console.log('📱 获取支付信息:', params);
  return apiClient.post('payinfo', params).then((res: any) => {
    console.log('📱 支付信息响应:', res);
    const data = res.data || {};
    
    // 确保数据结构正确，支持多种可能的字段位置
    const payInfoData: PayInfo = {
      info: {
        amount: data.info?.amount || data.amount || 0,
        real_money: data.info?.real_money || data.real_money || 0,
        paytype: data.info?.paytype || data.paytype || '',
        bank: data.info?.bank || data.bank,
        account: data.info?.account || data.account || data.payment?.account,
        name: data.info?.name || data.name || data.payment?.name
      },
      cardlist: {
        mch_id: data.cardlist?.mch_id || data.mch_id || '',
        payimg: data.cardlist?.payimg || data.payimg || data.qrcode || '',
        account: data.cardlist?.account || data.account || data.payment?.account,
        name: data.cardlist?.name || data.name || data.payment?.name
      },
      payment: {
        account: data.payment?.account || data.account,
        name: data.payment?.name || data.name
      }
    };
    
    return {
      code: res.code || 200,
      message: res.message || '',
      data: payInfoData
    };
  }).catch((error: any) => {
    console.error('❌ 获取支付信息失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '获取支付信息失败',
      data: {} as PayInfo
    };
  });
};

