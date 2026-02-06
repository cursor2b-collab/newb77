/**
 * 银行卡管理相关API
 */
import apiClient from './client';

export interface Bank {
  id: number;
  bank_name: string;
  bank_no: string;
  bank_owner: string;
  bank_address?: string;
  [key: string]: any;
}

export interface BankListResponse {
  code: number;
  message: string;
  data: Bank[];
}

export interface BankType {
  value: string;
  label: string;
}

export interface BankTypeResponse {
  code: number;
  message: string;
  data: BankType[];
  usdt?: {
    [key: string]: string; // 例如: {omni: 'Omni', erc: 'ERC20', trc: 'TRC20'}
  };
}

export interface WalletType {
  value: string;
  label: string;
}

export interface WalletTypeResponse {
  code: number;
  message: string;
  data: WalletType[];
}

export interface CreateBankRequest {
  bank_type: string; // 后端字段名：bank_type (开户银行)
  card_no: string; // 后端字段名：card_no (银行卡号/钱包地址)
  owner_name: string; // 后端字段名：owner_name (开户人姓名)
  bank_address?: string; // 开户网点
  wallet_type?: string; // 钱包类型（USDT时使用）
  // 兼容前端使用的字段名
  bank_name?: string;
  bank_no?: string;
  bank_owner?: string;
}

export interface UpdateBankRequest extends CreateBankRequest {
  id: number;
}

export interface BankResponse {
  code: number;
  message: string;
  data?: Bank;
}

// 获取银行卡列表
export const getBankList = (): Promise<BankListResponse> => {
  // 根据接口清单：GET /member/bank
  return apiClient.get('/member/bank');
};

// 获取银行卡类型列表
export const getBankType = (): Promise<BankTypeResponse> => {
  // 根据接口清单：GET /member/bank/type
  return apiClient.get('/member/bank/type');
};

// 添加银行卡
export const createBank = (params: CreateBankRequest): Promise<BankResponse> => {
  // 根据接口清单：POST /member/bank
  // 转换字段名以匹配后端API
  const requestParams: any = {
    bank_type: params.bank_type || params.bank_name || '',
    card_no: params.card_no || params.bank_no || '',
    owner_name: params.owner_name || params.bank_owner || '',
  };
  
  // 可选字段
  if (params.bank_address) {
    requestParams.bank_address = params.bank_address;
  }
  if (params.wallet_type) {
    requestParams.wallet_type = params.wallet_type;
  }
  
  return apiClient.post('/member/bank', requestParams);
};

// 更新银行卡
export const updateBank = (params: UpdateBankRequest): Promise<BankResponse> => {
  // 根据接口清单：PATCH /member/bank/{id}
  // 转换字段名以匹配后端API
  const requestParams: any = {
    bank_type: params.bank_type || params.bank_name || '',
    card_no: params.card_no || params.bank_no || '',
    owner_name: params.owner_name || params.bank_owner || '',
  };
  
  // 可选字段
  if (params.bank_address) {
    requestParams.bank_address = params.bank_address;
  }
  if (params.wallet_type) {
    requestParams.wallet_type = params.wallet_type;
  }
  
  return apiClient.patch(`/member/bank/${params.id}`, requestParams);
};

// 删除银行卡
export const deleteBank = (id: number): Promise<BankResponse> => {
  // 根据接口清单：DELETE /member/bank/{id}
  return apiClient.delete(`/member/bank/${id}`);
};

// 获取钱包类型列表（已废弃，钱包类型从 getBankType 接口的 usdt 字段获取）
// export const getWalletType = (): Promise<WalletTypeResponse> => {
//   const lang = localStorage.getItem('ly_lang') || 'zh_cn';
//   return apiClient.get(`/member/bank/wallet/type?lang=${lang}`);
// };

