/**
 * 取款相关API
 */
import apiClient from './client';

export interface WithdrawRequest {
  name?: string; // 用户姓名（从userInfo获取）
  money: number | string; // 提现金额
  account?: string; // 提现账户
  member_bank_id: number; // 银行卡ID
  member_bank_text?: string; // 银行卡类型文本
  member_remark?: string; // 备注
  qk_pwd: string; // 提款密码
  
  // 兼容旧版本参数（向后兼容）
  amount?: number; // 兼容amount字段
  bank_id?: number; // 兼容bank_id字段
}

export interface WithdrawResponse {
  code: number;
  message: string;
  data?: any;
}

// 提交取款申请
export const submitWithdraw = (params: WithdrawRequest): Promise<WithdrawResponse> => {
  // 根据接口文档：POST /api/drawing
  // 参数格式：
  // {
  //   "name": "用户姓名",
  //   "money": "金额",
  //   "account": "提现账户",
  //   "member_bank_id": 银行卡ID,
  //   "member_bank_text": "银行卡类型文本",
  //   "member_remark": "备注",
  //   "qk_pwd": "提款密码"
  // }
  
  // 构建新格式的请求参数
  const requestParams: any = {
    money: params.money || params.amount || 0,
    member_bank_id: params.member_bank_id || params.bank_id || 0,
    qk_pwd: params.qk_pwd
  };
  
  // 如果有新格式参数，直接使用
  if (params.name) requestParams.name = params.name;
  if (params.account) requestParams.account = params.account;
  if (params.member_bank_text) requestParams.member_bank_text = params.member_bank_text;
  if (params.member_remark) requestParams.member_remark = params.member_remark;
  
  console.log('💸 提交提现请求:', requestParams);
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`drawing?lang=${lang}`, requestParams).then((res: any) => {
    console.log('💸 提现响应:', res);
    return {
      code: res.code || (res.status === 'success' ? 200 : 400),
      message: res.message || '',
      data: res.data
    };
  }).catch((error: any) => {
    console.error('❌ 提现失败:', error);
    return {
      code: error.code || error.response?.status || 500,
      message: error.message || error.response?.data?.message || '提现失败',
      data: null
    };
  });
};

