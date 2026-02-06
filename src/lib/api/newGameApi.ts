/**
 * 新游戏接口API服务 (API v2.15.2)
 * 通过后端API代理调用新游戏接口
 * 
 * 重要说明：
 * - 前端不直接调用游戏API，而是通过自己的后端API代理
 * - 后端负责创建和缓存游戏API的token，避免前端暴露clientSecret
 * - 前端只需要传递用户认证token（用于后端API的JWT认证）
 */

// 获取新游戏API URL
// ⚠️ 始终通过后端API代理，绝不直接调用游戏API
const getNewGameApiUrl = () => {
  // 开发环境：使用相对路径，通过 Vite 代理
  // 生产环境：使用完整的后端API URL（因为生产环境可能没有 nginx 代理）
  const apiBaseUrl = import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV ? '/api' : 'https://api.xpj66666.com/api');
  const gameApiUrl = `${apiBaseUrl}/game-api`;
  return gameApiUrl;
};

/**
 * 新游戏接口服务类
 */
class NewGameApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getNewGameApiUrl();
  }

  /**
   * 通用请求方法
   */
  private async request(endpoint: string, method: string = 'GET', data: any = null): Promise<any> {
    // 保存 endpoint 用于错误处理判断
    const currentEndpoint = endpoint;
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      // 获取认证token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      // console.log('📤 新游戏API请求:', {
      //   url,
      //   method,
      //   data: data ? JSON.stringify(data) : null,
      //   headers: options.headers,
      //   baseUrl: this.baseUrl,
      //   endpoint: currentEndpoint,
      //   isDev: import.meta.env.DEV
      // });
      
      let response: Response;
      try {
        // 添加超时处理（30秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 30000);
        
        try {
          response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          // 如果是超时错误
          if (fetchError.name === 'AbortError') {
            const timeoutError: any = new Error('请求超时（30秒），请检查网络连接或稍后重试');
            timeoutError.isTimeout = true;
            timeoutError.url = url;
            throw timeoutError;
          }
          throw fetchError;
        }
      } catch (fetchError: any) {
        // 处理网络错误（CORS、连接失败等）
        console.error('❌ 新游戏API网络错误:', {
          url,
          error: fetchError,
          message: fetchError.message,
          name: fetchError.name,
          isTimeout: fetchError.isTimeout
        });
        
        // 如果是 CORS 错误或网络错误
        if (fetchError.message?.includes('CORS') || 
            fetchError.message?.includes('NetworkError') ||
            fetchError.name === 'TypeError' ||
            fetchError.message?.includes('Failed to fetch') ||
            fetchError.isTimeout) {
          const networkError: any = new Error(
            fetchError.isTimeout 
              ? '请求超时，请检查网络连接'
              : '网络连接失败，可能是跨域问题或网络不可达。请检查：1) 后端API的CORS配置 2) 网络连接 3) API地址是否正确'
          );
          networkError.isNetworkError = true;
          networkError.isCorsError = fetchError.message?.includes('CORS') || false;
          networkError.isTimeout = fetchError.isTimeout || false;
          networkError.originalError = fetchError;
          networkError.url = url;
          throw networkError;
        }
        throw fetchError;
      }
      
      // 处理响应
      const contentType = response.headers.get('content-type');
      let result: any;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch {
          result = { message: text, success: false };
        }
      }

      // console.log('📥 新游戏API响应:', {
      //   status: response.status,
      //   ok: response.ok,
      //   result: result
      // });

      // 检查HTTP状态码
      if (!response.ok) {
        // 422 通常是验证错误
        if (response.status === 422) {
          const errorMsg = result.message || result.error || '请求参数验证失败';
          const validationErrors = result.errors || result.data || {};
          console.error('❌ 新游戏API验证错误 (422):', {
            url,
            status: response.status,
            result,
            validationErrors,
            '发送的参数': data
          });
          
          // 构建详细的错误消息
          let detailedError = errorMsg;
          if (validationErrors && Object.keys(validationErrors).length > 0) {
            const errorDetails = Object.entries(validationErrors)
              .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
            detailedError = `${errorMsg} - ${errorDetails}`;
          }
          
          throw new Error(detailedError);
        }
        console.error('❌ 新游戏API请求失败:', {
          url,
          status: response.status,
          result,
          '发送的参数': data
        });
        throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
      }

      // 检查业务错误码
      // 注意：errorCode: 1 (用户已存在) 在 createUser 方法中会被特殊处理，所以这里不抛出错误
      // 但其他方法需要检查 errorCode
      if (result && result.errorCode && result.errorCode !== 0) {
        // errorCode: 1 在 createUser 中会被特殊处理，这里先不抛出
        // 但我们需要将 errorCode 附加到结果中，让调用方知道
        if (result.errorCode === 1 && currentEndpoint.includes('/user/create')) {
          // 对于 createUser，errorCode: 1 表示用户已存在，这是可以接受的
          // 返回结果，让 createUser 方法处理
          return result;
        }
        
        console.error('❌ 新游戏API业务错误:', {
          url,
          errorCode: result.errorCode,
          message: result.message,
          result: result
        });
        // 将errorCode附加到错误对象，方便调用方检查
        const error: any = new Error();
        error.errorCode = result.errorCode;
        error.response = result;
        
        // 根据errorCode提供更详细的错误信息
        let errorMessage = result.message || result.error;
        if (!errorMessage) {
          // 如果没有message，根据errorCode提供默认错误信息
          const errorCodeMessages: Record<number, string> = {
            1: '用户已存在', // 这个错误在createUser中会被特殊处理
            10: '游戏启动失败：用户可能未创建或参数错误',
            401: '认证失败：Token无效或已过期',
            403: '访问被拒绝：IP未在白名单中',
            404: '资源不存在：游戏或供应商不存在',
            422: '参数验证失败：请检查请求参数',
            429: '请求过于频繁：请稍后重试',
            500: '服务器内部错误：请稍后重试'
          };
          errorMessage = errorCodeMessages[result.errorCode] || `请求失败 (错误代码: ${result.errorCode})`;
        }
        error.message = errorMessage;
        throw error;
      }

      return result;
    } catch (error: any) {
      console.error('❌ 新游戏API错误:', {
        endpoint: currentEndpoint,
        url: `${this.baseUrl}${currentEndpoint}`,
        error: error,
        message: error.message,
        isNetworkError: error.isNetworkError,
        isCorsError: error.isCorsError
      });
      
      // 如果是网络错误，提供更详细的错误信息
      if (error.isNetworkError || error.isCorsError) {
        const detailedError: any = new Error(
          error.message || '网络连接失败。请检查：1) 后端API是否正常运行 2) CORS配置是否正确 3) 网络连接是否正常'
        );
        detailedError.isNetworkError = true;
        detailedError.isCorsError = error.isCorsError;
        detailedError.url = `${this.baseUrl}${currentEndpoint}`;
        detailedError.originalError = error;
        throw detailedError;
      }
      
      throw error;
    }
  }

  /**
   * 2.2 获取供应商列表
   */
  async getVendorsList(): Promise<any> {
    return this.request('/vendors/list', 'GET');
  }

  /**
   * 2.3 获取游戏列表
   * @param vendorCode - 供应商代码
   * @param language - 语言代码，默认从localStorage获取并映射
   */
  async getGamesList(vendorCode: string, language?: string): Promise<any> {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    
    return this.request('/games/list', 'POST', {
      vendorCode,
      language
    });
  }

  /**
   * 2.4 获取迷你游戏列表
   * @param language - 语言代码，默认从localStorage获取并映射
   */
  async getMiniGamesList(language?: string): Promise<any> {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    
    // 注意：根据API文档，/games/mini/list 是GET请求，可能需要language参数
    // 如果API支持，可以在URL参数中传递
    return this.request(`/games/mini/list${language ? `?language=${language}` : ''}`, 'GET');
  }

  /**
   * 2.5 获取游戏详情
   * @param vendorCode - 供应商代码
   * @param gameCode - 游戏代码
   */
  async getGameDetail(vendorCode: string, gameCode: string): Promise<any> {
    return this.request('/game/detail', 'POST', {
      vendorCode,
      gameCode
    });
  }

  /**
   * 2.11 创建用户
   * @param userCode - 用户代码（用户标识符）
   */
  async createUser(userCode: string): Promise<any> {
    // 确保userCode是字符串且不为空
    userCode = String(userCode || '').trim();
    if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
      throw new Error('用户代码无效');
    }
    
    try {
      const result = await this.request('/user/create', 'POST', {
        userCode
      });
      
      // 检查响应中的errorCode
      // errorCode: 0 表示成功创建
      // errorCode: 1 表示用户已存在（这也是成功的情况）
      if (result && result.errorCode !== undefined) {
        if (result.errorCode === 0) {
          return result;
        } else if (result.errorCode === 1) {
          // 返回一个成功的响应对象
          return {
            success: true,
            errorCode: 1,
            message: '用户已存在'
          };
        } else {
          // 其他错误码，抛出错误
          throw new Error(result.message || `创建用户失败 (errorCode: ${result.errorCode})`);
        }
      }
      
      // 如果result.success为true，也认为是成功
      if (result && result.success === true) {
        return result;
      }
      
      // 如果request没有抛出错误，说明成功
      return result;
    } catch (error: any) {
      // 检查错误信息中是否包含errorCode: 1（用户已存在）
      const errorCode = error?.errorCode || error?.response?.errorCode;
      const errorMessage = error?.message || '';
      
      // errorCode: 1 通常表示用户已存在，这是可以接受的
      if (errorCode === 1 || errorMessage.includes('errorCode: 1') || errorMessage.includes('errorCode:1')) {
        console.log('ℹ️ 用户已存在 (errorCode: 1)，继续...');
        // 返回一个成功的响应对象
        return {
          success: true,
          errorCode: 1,
          message: '用户已存在'
        };
      }
      
      // 其他错误，重新抛出
      throw error;
    }
  }

  /**
   * 2.6 获取游戏启动URL
   * @param vendorCode - 供应商代码
   * @param gameCode - 游戏代码
   * @param userCode - 用户代码（用户标识符）
   * @param language - 语言代码，默认从localStorage获取并映射
   * @param lobbyUrl - 大厅URL（可选，某些游戏提供商关闭游戏时需要重定向）
   */
  async getLaunchUrl(
    vendorCode: string,
    gameCode: string,
    userCode: string,
    language?: string,
    lobbyUrl?: string
  ): Promise<any> {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    // 确保所有参数都是字符串且不为空
    vendorCode = String(vendorCode || '').trim();
    gameCode = String(gameCode || '').trim();
    userCode = String(userCode || '').trim();
    language = String(language || 'zh').trim() || 'zh';
    
    // 验证必需参数
    if (!vendorCode || vendorCode.length === 0) {
      throw new Error('供应商代码不能为空');
    }
    if (!gameCode || gameCode.length === 0 || gameCode === '0') {
      throw new Error('游戏代码不能为空');
    }
    if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
      throw new Error('用户代码无效，请重新登录');
    }
    
    const params: any = {
      vendorCode,
      gameCode,
      userCode,
      language
    };
    
    if (lobbyUrl) {
      params.lobbyUrl = String(lobbyUrl).trim();
    }
    
    return this.request('/game/launch-url', 'POST', params);
  }

  /**
   * 2.7 获取用户余额
   * @param userId - 用户ID
   */
  async getUserBalance(userId: string, vendorCode?: string): Promise<any> {
    // 确保userCode是字符串且不为空
    userId = String(userId || '').trim();
    if (!userId || userId === '0' || userId === 'null' || userId === 'undefined') {
      throw new Error('用户代码无效');
    }
    const data: any = {
      userCode: userId
    };
    
    // 如果提供了 vendorCode（分离钱包时需要），添加到请求中
    if (vendorCode) {
      data.vendorCode = vendorCode;
    }
    
    return this.request('/user/balance', 'POST', data);
  }

  /**
   * 2.13 存款（余额转账API）
   * @param userCode - 用户代码
   * @param balance - 要存入的金额
   * @param orderNo - 存款标识符（可选）
   * @param vendorCode - 供应商代码（可选，分离钱包时需要）
   */
  async deposit(userCode: string, balance: number, orderNo?: string, vendorCode?: string): Promise<any> {
    const data: any = {
      userCode,
      balance
    };
    
    if (orderNo) {
      data.orderNo = orderNo;
    }
    
    if (vendorCode) {
      data.vendorCode = vendorCode;
    }
    
    return this.request('/user/deposit', 'POST', data);
  }

  /**
   * 2.14 提款（余额转账API）
   * @param userCode - 用户代码
   * @param balance - 要提取的金额
   * @param orderNo - 提款标识符（可选）
   * @param vendorCode - 供应商代码（可选，分离钱包时需要）
   */
  async withdraw(userCode: string, balance: number, orderNo?: string, vendorCode?: string): Promise<any> {
    const data: any = {
      userCode,
      balance
    };
    
    if (orderNo) {
      data.orderNo = orderNo;
    }
    
    if (vendorCode) {
      data.vendorCode = vendorCode;
    }
    
    return this.request('/user/withdraw', 'POST', data);
  }

  /**
   * 2.15 全部提款（余额转账API）
   * @param userCode - 用户代码
   * @param vendorCode - 供应商代码（可选，分离钱包时需要）
   */
  async withdrawAll(userCode: string, vendorCode?: string): Promise<any> {
    const data: any = {
      userCode
    };
    
    if (vendorCode) {
      data.vendorCode = vendorCode;
    }
    
    return this.request('/user/withdraw-all', 'POST', data);
  }

  /**
   * 2.10 获取投注历史
   * @param userId - 用户ID
   * @param page - 页码，默认 1
   * @param limit - 每页数量，默认 20
   */
  async getBettingHistory(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    return this.request('/betting/history', 'POST', {
      userId,
      page,
      limit
    });
  }

  /**
   * 2.11 获取投注历史（按日期）
   * @param userId - 用户ID
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param page - 页码，默认 1
   * @param limit - 每页数量，默认 20
   */
  async getBettingHistoryByDate(
    userId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return this.request('/betting/history/by-date', 'POST', {
      userId,
      startDate,
      endDate,
      page,
      limit
    });
  }

  /**
   * 2.12 获取投注历史V2（按日期）
   * @param userId - 用户ID
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param page - 页码，默认 1
   * @param limit - 每页数量，默认 20
   */
  async getBettingHistoryByDateV2(
    userId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return this.request('/betting/history/by-date-v2', 'POST', {
      userId,
      startDate,
      endDate,
      page,
      limit
    });
  }

  /**
   * 2.13 获取交易详情
   * @param transactionId - 交易ID
   */
  async getTransactionDetail(transactionId: string): Promise<any> {
    return this.request('/betting/transaction', 'POST', {
      transactionId
    });
  }

  /**
   * 2.14 获取交易详情页面URL
   * @param transactionId - 交易ID
   */
  async getTransactionDetailUrl(transactionId: string): Promise<any> {
    return this.request('/betting/transaction/url', 'POST', {
      transactionId
    });
  }

  /**
   * 2.8 获取投注历史（按ID）
   * @param id - 历史记录ID
   */
  async getBettingHistoryById(id: number): Promise<any> {
    return this.request('/betting/history/by-id', 'POST', {
      id
    });
  }

  /**
   * 2.9 获取交易历史（按ID）
   * @param id - 历史记录ID
   */
  async getTransactionHistoryByWagerId(id: number | string): Promise<any> {
    return this.request('/transaction/history/by-id', 'POST', {
      id: typeof id === 'string' ? parseInt(id, 10) : id
    });
  }

  /**
   * 2.15 设置用户RTP
   * @param userId - 用户ID
   * @param vendorCode - 供应商代码
   * @param rtp - RTP值（30-99）
   */
  async setUserRtp(userId: string, vendorCode: string, rtp: number): Promise<any> {
    return this.request('/game/users/rtp', 'POST', {
      userId,
      vendorCode,
      rtp
    });
  }

  /**
   * 2.16 获取用户RTP
   * @param userId - 用户ID
   * @param vendorCode - 供应商代码
   */
  async getUserRtp(userId: string, vendorCode: string): Promise<any> {
    return this.request('/game/users/rtp', 'GET', {
      userId,
      vendorCode
    });
  }

  /**
   * 2.17 重置用户RTP
   * @param vendorCode - 供应商代码
   * @param rtp - RTP值（30-99）
   */
  async resetUserRtp(vendorCode: string, rtp: number): Promise<any> {
    return this.request('/game/users/reset-rtp', 'POST', {
      vendorCode,
      rtp
    });
  }

  /**
   * 2.18 批量设置用户RTP
   * @param userIds - 用户ID数组
   * @param vendorCode - 供应商代码
   * @param rtp - RTP值（30-99）
   */
  async batchSetUserRtp(userIds: string[], vendorCode: string, rtp: number): Promise<any> {
    return this.request('/game/users/batch-rtp', 'POST', {
      userIds,
      vendorCode,
      rtp
    });
  }

  /**
   * 2.19 获取用户余额历史
   * @param userId - 用户ID
   * @param page - 页码，默认 1
   * @param limit - 每页数量，默认 20
   */
  async getUserBalanceHistory(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    return this.request('/game/users/balance-history', 'POST', {
      userId,
      page,
      limit
    });
  }

  /**
   * 2.20 获取交易历史（按ID）
   * @param transactionId - 交易ID
   */
  async getTransactionHistoryById(transactionId: string): Promise<any> {
    return this.request('/betting/transaction/by-id', 'POST', {
      transactionId
    });
  }

  /**
   * 2.21 批量交易
   * @param transactions - 交易数组
   */
  async batchTransaction(transactions: any[]): Promise<any> {
    return this.request('/betting/batch-transaction', 'POST', {
      transactions
    });
  }
}

// 导出单例
export const newGameApiService = new NewGameApiService();
export default newGameApiService;
