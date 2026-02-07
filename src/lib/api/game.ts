/**
 * 游戏相关API
 */
import apiClient from './client';
// import { newGameApiService } from './newGameApi';

export interface Game {
  id?: number;
  name: string;
  platform_name: string;
  game_code: string;
  game_type: number;
  gameType: number;
  category_id: string;
  cover?: string;
  app_state?: number;
  tags?: string;
  params?: any;
  [key: string]: any;
}

export interface GameCategory {
  title: string;
  child: Game[];
}

export interface GameListResponse {
  code: number;
  message: string;
  data: Game[];
}

export interface GameUrlResponse {
  code: number;
  message: string;
  status?: string; // 添加 status 属性
  data: {
    game_url?: string;
    url?: string;
  };
}

// 获取游戏接口列表（用于额度转换）
export interface GameApi {
  id: number;
  api_name: string;
  title: string;
  icon_url?: string;
  game_type?: number;
  [key: string]: any;
}

export interface GameApiListResponse {
  code: number;
  message: string;
  data: GameApi[];
}

export const getGameApiList = (gameType: number, isMobile: number = 1): Promise<GameApiListResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.get('games/apis', {
    params: {
      gameType,
      isMobile,
      lang
    }
  }).then((res: any) => {
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data || []
    };
  });
};

// 获取游戏列表
// 从 game_lists 表获取所有游戏数据（使用 /api/games/lists 接口）
// 游戏类型映射：1=真人视讯, 3=电子游戏, 4=彩票, 5=体育, 6=小游戏
// 注意：gameType=2 从 ApiGame 表获取，其他从 GameList 表（game_lists）获取
export const getGameList = (category?: string): Promise<GameListResponse> => {
  // 游戏类型映射
  const typeMap: Record<number, string> = {
    1: 'realbet',  // 真人视讯
    3: 'gaming',   // 电子游戏
    4: 'lottery',  // 彩票
    5: 'sport',    // 体育
    6: 'joker'     // 小游戏
  };
  
  // 需要获取的游戏类型列表（从 game_lists 表获取的类型）
  // gameType=2 从 ApiGame 表获取，所以不包含在这里
  const gameTypes = [1, 3, 4, 5, 6];
  
  // 并行获取所有类型的游戏
  const promises = gameTypes.map(async (gameType) => {
    try {
      const res = await apiClient.get('games/lists', {
        params: {
          gameType,
          isMobile: 1 // 移动端
        }
      });
      
      if (res.code === 200 && res.data) {
        const games = Array.isArray(res.data) ? res.data : (res.data.data || []);
        return games.map((game: any) => {
          const typeValue = Number(game.game_type || gameType);
          const type = Number.isNaN(typeValue) ? gameType : typeValue;
          const categoryId = typeMap[type] || 'concise';
          
          // 处理参数
          let params: any = {};
          if (game.param_remark) {
            try {
              params = typeof game.param_remark === 'string' 
                ? JSON.parse(game.param_remark) 
                : game.param_remark;
            } catch (e) {
              console.warn('解析 param_remark 失败:', game.param_remark);
            }
          }
          
          // 获取游戏代码
          const gameCode = params.gameCode || params.game_code || params.code || game.game_code || '';
          
          // 获取图片URL（优先使用 full_image_url，然后是 img_url，最后是 img_path）
          const cover = game.full_image_url || game.img_url || game.img_path || '';
          
          return {
            id: game.id,
            category_id: categoryId,
            name: game.name || '',
            platform_name: (game.api_name || '').toUpperCase(),
            game_code: gameCode,
            game_type: type,
            gameType: type,
            app_state: game.is_open === 1 || game.is_open === '1' ? 1 : 0,
            cover: cover,
            tags: game.tags || '',
            params: params,
            raw: game
          };
        });
      }
      return [];
    } catch (error) {
      console.error(`❌ 获取 gameType=${gameType} 的游戏失败:`, error);
      return [];
    }
  });
  
  // 等待所有请求完成并合并结果
  return Promise.all(promises).then((results) => {
    const allGames = results.flat();
    console.log('✅ 从 game_lists 表获取到游戏数据:', allGames.length, '个游戏');
    
    // 按游戏类型统计
    const stats = {
      realbet: allGames.filter((g: Game) => g.category_id === 'realbet').length,
      gaming: allGames.filter((g: Game) => g.category_id === 'gaming').length,
      joker: allGames.filter((g: Game) => g.category_id === 'joker').length,
      sport: allGames.filter((g: Game) => g.category_id === 'sport').length,
      lottery: allGames.filter((g: Game) => g.category_id === 'lottery').length
    };
    console.log('📊 游戏分类统计:', stats);
    
    return {
      code: 200,
      message: 'success',
      data: allGames
    };
  }).catch((error) => {
    console.error('❌ 获取游戏列表失败:', error);
    return {
      code: 500,
      message: error.message || '获取游戏列表失败',
      data: []
    };
  });
};

// 检查是否使用新游戏接口
// export const shouldUseNewGameApi = (): boolean => {
//   // 可以通过环境变量或localStorage配置
//   const envValue = import.meta.env.VITE_USE_NEW_GAME_API;
//   const localStorageValue = localStorage.getItem('use_new_game_api');
//   
//   // 临时强制启用新接口（用于测试和调试）
//   // 注意：生产环境应该通过环境变量或localStorage控制
//   const FORCE_ENABLE_NEW_API = true; // 临时设置为true强制启用
//   
//   const useNewApi = FORCE_ENABLE_NEW_API || 
//                     envValue === 'true' || 
//                     String(envValue) === 'true' ||  // 兼容字符串类型
//                     localStorageValue === 'true';
//   
//   
//   return useNewApi;
// };
export const shouldUseNewGameApi = (): boolean => {
  return false; // 禁用新游戏接口
};

// 获取用户ID（从用户信息中获取）
export const getUserId = async (): Promise<string | null> => {
  try {
    // 尝试从localStorage获取用户ID
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      const userId = user.id || user.user_id || user.username || null;
      // 确保返回字符串类型（根据新游戏接口文档，userCode必须是string）
      if (userId !== null) {
        return String(userId);
      }
    }
    
    // 如果没有，尝试从API获取
    const { getUserInfo } = await import('@/lib/api/auth');
    const response = await getUserInfo();
    const userId = response?.data?.id || response?.data?.user_id || response?.data?.username || null;
    if (userId !== null) {
      // 确保返回字符串类型
      return String(userId);
    }
    
    return null;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return null;
  }
};

// 将旧平台代码映射到新接口的vendorCode
export const mapApiCodeToVendorCode = (apiCode: string): string => {
  // 平台代码映射（旧接口 -> 新接口vendorCode）
  // 注意：这些映射需要根据实际的供应商列表调整
  const vendorMapping: Record<string, string> = {
    'AG': 'casino-evolution',      // AG -> Evolution
    'BBIN': 'casino-evolution',     // BBIN -> Evolution (示例)
    'PT': 'slot-pragmatic',         // PT -> Pragmatic
    'PP': 'slot-pragmatic',         // PP -> Pragmatic Play
    'CQ9': 'slot-cq9',              // CQ9
    'PG': 'slot-pgsoft',            // PG -> PGSoft
    'JDB': 'slot-jdb',              // JDB
    'WG': 'slot-wg',                // WG -> WG (Wazdan Games)
    'HACKSAW': 'slot-hacksaw',      // Hacksaw Gaming
    'TITAN': 'slot-titan',          // Titan Gaming
    'UPPERCUT': 'slot-uppercut',    // Uppercut Gaming
    'PETER': 'slot-peter',          // Peter & Sons
    'FC': 'slot-fachai',            // FC -> FaChai
    'JILI': 'slot-jili',            // JILI
    'MG': 'slot-mg',                // MG -> Microgaming (可能是 slot-mg 或 casino-mg，根据类型判断)
    'EVO': 'casino-evolution',      // EVO -> Evolution
    'PL': 'casino-playace',         // PL -> PlayAce
    'SA': 'casino-sa',              // SA -> SA Gaming
    // 可以根据实际情况添加更多映射
  };
  
  const mapped = vendorMapping[apiCode];
  if (mapped) {
    return mapped;
  }
  
  // 如果没有映射，尝试转换为小写并添加前缀
  const lowerCode = apiCode.toLowerCase();
  console.warn(`⚠️ 平台代码 ${apiCode} 没有映射，使用默认格式: slot-${lowerCode}`);
  return `slot-${lowerCode}`;
};

// 获取游戏URL
export const getGameUrl = async (params: {
  api_code: string;
  gameType: number;
  gameCode?: string;
  isMobile?: number;
}): Promise<GameUrlResponse> => {
  // 游戏类型：1=真人, 2=电游, 3=电游, 4=彩票, 5=体育, 6=棋牌
  // 新接口只支持真人（gameType=1）和电游（gameType=2,3），不支持体育、彩票、棋牌
  const isNewApiSupportedGameType = params.gameType === 1 || params.gameType === 2 || params.gameType === 3;
  
  // PA视讯、AG、BG 强制使用旧接口
  let apiCode = params.api_code.replace(/[^0-9a-z]/gi, '').toUpperCase();
  if (!apiCode && params.api_code) {
    apiCode = params.api_code.toUpperCase();
  }
  const isPA = apiCode === 'PA';
  const isAG = apiCode === 'AG';
  const isBG = apiCode === 'BG';
  
  // 检查是否使用新游戏接口（在函数开始时检查，确保每次调用都检查最新配置）
  // PA视讯、AG、BG 强制使用旧接口，不使用新接口
  const useNewApi = shouldUseNewGameApi() && isNewApiSupportedGameType && !isPA && !isAG && !isBG;
  
  // 如果启用了新接口且游戏类型支持，优先使用新接口
  // 新游戏API调用已全部注释掉
  /* if (useNewApi) {
    try {
      
      // 获取用户ID
      let userId = await getUserId();
      if (!userId) {
        throw new Error('无法获取用户ID，请先登录');
      }
      
      // apiCode 已经在上面定义过了，这里直接使用
      // 先尝试获取供应商列表，确认正确的vendorCode
      let vendorCode = mapApiCodeToVendorCode(apiCode);
      try {
        const vendorsResponse = await newGameApiService.getVendorsList();
        if (vendorsResponse && vendorsResponse.message && Array.isArray(vendorsResponse.message)) {
          const vendors = vendorsResponse.message;
          
          // 检查映射的vendorCode是否存在
          const foundVendor = vendors.find((v: any) => v.vendorCode === vendorCode);
          if (!foundVendor) {
            console.warn(`⚠️ 映射的vendorCode "${vendorCode}" 不存在于供应商列表中`);
            // 尝试根据名称匹配
            const nameMatch = vendors.find((v: any) => 
              v.name.toLowerCase().includes(apiCode.toLowerCase()) ||
              v.vendorCode.toLowerCase().includes(apiCode.toLowerCase())
            );
            if (nameMatch) {
              vendorCode = nameMatch.vendorCode;
            } else {
              console.warn(`⚠️ 无法找到匹配的供应商，使用映射值: ${vendorCode}`);
            }
          } else {
          }
        }
      } catch (vendorError) {
        console.warn('⚠️ 获取供应商列表失败，使用映射值:', vendorError);
      }
      
      // gameCode 不能为空字符串，如果为空则使用 'lobby'（大厅）
      let gameCode = params.gameCode || '';
      if (!gameCode || gameCode === '0' || gameCode === '') {
        // 如果游戏代码为空，使用 'lobby' 作为默认值（某些供应商支持）
        // 或者根据游戏类型设置默认值
        if (params.gameType === 1) {
          // 真人娱乐场，使用 lobby
          gameCode = 'lobby';
        } else {
          // 其他类型，可能需要具体的游戏代码
          gameCode = 'lobby'; // 临时使用 lobby，实际应该根据供应商调整
        }
      }
      
      // 语言代码处理（根据文档，language是必需参数）
      // 使用语言映射工具函数
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      let langCode: string = getGameApiLanguage();
      
      
      // 确保所有参数都是字符串类型（根据新游戏接口文档，所有参数都必须是字符串）
      if (typeof userId !== 'string') {
        userId = String(userId);
      }
      if (typeof vendorCode !== 'string') {
        vendorCode = String(vendorCode);
      }
      if (typeof gameCode !== 'string') {
        gameCode = String(gameCode);
      }
      if (typeof langCode !== 'string') {
        langCode = String(langCode);
      }
      
      // 去除前后空格
      vendorCode = vendorCode.trim();
      gameCode = gameCode.trim();
      userId = userId.trim();
      langCode = langCode.trim();
      
      // 验证参数（确保所有必需参数都是非空字符串）
      if (!vendorCode || vendorCode === '') {
        throw new Error('vendorCode 不能为空，必须是有效的字符串');
      }
      if (!gameCode || gameCode === '' || gameCode === '0') {
        throw new Error('gameCode 不能为空，必须是有效的字符串');
      }
      if (!userId || userId === '' || userId === '0' || userId === 'null' || userId === 'undefined') {
        throw new Error('userCode 不能为空，必须是有效的字符串，请重新登录');
      }
      if (!langCode || langCode === '') {
        throw new Error('language 不能为空，必须是有效的字符串');
      }
      
      
      // 验证参数（确保所有必需参数都是非空字符串）
      if (!vendorCode || vendorCode === '') {
        throw new Error('vendorCode 不能为空，必须是有效的字符串');
      }
      if (!gameCode || gameCode === '') {
        throw new Error('gameCode 不能为空，必须是有效的字符串');
      }
      if (!userId || userId === '') {
        throw new Error('userCode 不能为空，必须是有效的字符串');
      }
      if (!langCode || langCode === '') {
        throw new Error('language 不能为空，必须是有效的字符串');
      }
      
      // 自动创建用户（如果用户不存在，API会创建；如果已存在，API会返回成功）
      try {
        const createUserResponse = await newGameApiService.createUser(userId);
        
        // 检查响应中的errorCode
        if (createUserResponse && createUserResponse.errorCode !== undefined) {
          // errorCode: 0 表示成功
          // errorCode: 1 可能表示用户已存在（根据API文档，某些API会这样返回）
          if (createUserResponse.errorCode === 0) {
          } else if (createUserResponse.errorCode === 1) {
          } else {
            console.warn('⚠️ 用户创建返回错误码:', createUserResponse.errorCode, createUserResponse);
          }
        } else if (createUserResponse && createUserResponse.success === true) {
        }
      } catch (userError: any) {
        // 如果创建用户失败，检查是否是用户已存在的错误
        const errorCode = userError?.response?.errorCode || userError?.errorCode || userError?.error?.errorCode;
        const errorMessage = userError?.message || userError?.response?.message || userError?.error?.message || '';
        
        console.warn('⚠️ 用户创建检查失败:', {
          errorCode,
          message: errorMessage,
          error: userError
        });
        
        // errorCode: 1 通常表示用户已存在，可以继续
        // 其他错误也继续尝试，因为可能是网络问题等临时错误
        if (errorCode === 1) {
        } else {
          console.warn('⚠️ 用户创建失败，但继续尝试获取游戏URL (可能用户已存在)');
        }
      }

      // 自动转入余额到游戏
      try {
        
        // 1. 获取用户钱包余额
        const { getUserInfo } = await import('@/lib/api/auth');
        const userInfoResponse = await getUserInfo();
        const walletBalance = userInfoResponse?.data?.money || userInfoResponse?.data?.balance || 0;
        
        if (walletBalance <= 0) {
        } else {
          // 2. 获取游戏中的余额（对于分离钱包，需要传递 vendorCode）
          let gameBalance = 0;
          try {
            const balanceResponse = await newGameApiService.getUserBalance(userId, vendorCode);
            if (balanceResponse && balanceResponse.success === true) {
              const balanceStr = balanceResponse.message || balanceResponse.data?.balance || balanceResponse.balance || '0';
              gameBalance = parseFloat(String(balanceStr)) || 0;
            }
          } catch (balanceError: any) {
            console.warn('⚠️ 获取游戏中余额失败，假设余额为0:', balanceError);
            gameBalance = 0;
          }
          
          // 3. 计算需要转入的金额（钱包余额 - 游戏中余额）
          const transferAmount = walletBalance - gameBalance;
          // 4. 如果有余额需要转入，执行转入操作
          if (transferAmount > 0) {
            
            // 生成订单号
            const orderNo = `DEPOSIT_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            try {
              const depositResponse = await newGameApiService.deposit(
                userId,
                transferAmount,
                orderNo,
                vendorCode
              );
              
              if (depositResponse && depositResponse.success === true) {
                const newGameBalance = parseFloat(depositResponse.message || '0') || 0;
              } else {
                console.warn('⚠️ 余额转入失败:', depositResponse);
              }
            } catch (depositError: any) {
              console.error('❌ 余额转入异常:', depositError);
              // 余额转入失败不影响游戏启动，继续执行
            }
          } else if (transferAmount < 0) {
          }
        }
      } catch (transferError: any) {
        console.error('❌ 自动转入余额过程异常:', transferError);
        // 余额转入失败不影响游戏启动，继续执行
      }
      
      // 调用新游戏接口获取游戏启动URL
      // 检测是否为移动端
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // 构建 lobbyUrl（游戏关闭时的重定向地址）
      // 对于移动端，使用当前页面的 URL
      // 对于 PG 平台，移动端可能需要特殊处理
      let lobbyUrl: string | undefined;
      if (isMobileDevice || params.isMobile === 1) {
        // 移动端：使用游戏大厅页面
        lobbyUrl = `${window.location.origin}/gamelobby`;
      } else {
        // PC端：使用游戏大厅页面
        lobbyUrl = `${window.location.origin}/gamelobby`;
      }
      
      const response = await newGameApiService.getLaunchUrl(
        vendorCode,
        gameCode,
        userId, // userCode
        langCode, // language
        lobbyUrl // lobbyUrl - 移动端需要传递，以便游戏关闭时正确重定向
      );
      
      console.log('📥 新游戏接口响应:', response);
      
      // 处理响应（新接口返回格式：{success: true, message: "游戏URL", errorCode: 0}）
      if (response && (response.success === true || response.success === 'true')) {
        // response.message 直接是URL字符串
        const gameUrl = typeof response.message === 'string' 
          ? response.message 
          : (response.message?.gameUrl || response.message?.url || response.data?.gameUrl || response.data?.url || '');
        
        console.log('✅ 新游戏接口返回URL:', gameUrl ? gameUrl.substring(0, 100) + '...' : '空');
        
        if (gameUrl) {
          console.log('✅ 新游戏接口调用成功，返回游戏URL');
          return {
            code: 200,
            message: '成功',
            status: 'success',
            data: {
              game_url: gameUrl,
              url: gameUrl
            }
          };
        } else {
          console.warn('⚠️ 新游戏接口返回成功，但URL为空');
          throw new Error('游戏URL为空');
        }
      } else {
        console.error('❌ 新游戏接口返回失败:', response);
        throw new Error(response?.message || response?.error || '获取游戏链接失败');
      }
    } catch (error: any) {
      console.error('❌ 新游戏接口调用失败:', error);
      console.error('❌ 错误详情:', {
        message: error.message,
        stack: error.stack,
        response: error.response || error.data
      });
      // 如果新接口失败，可以回退到旧接口
      console.log('🔄 回退到旧游戏接口');
      // 继续执行旧接口逻辑
    }
  } else {
    console.log('ℹ️ 使用旧游戏接口（未启用新接口）');
  } */
  
  // 使用旧游戏接口（原有逻辑）
  // 根据Vue项目配置，使用GET请求，参数通过URL query传递
  // 平台代码映射（参考Vue项目的endpointAdapters）
  // apiCode 已经在上面定义过了，这里直接使用
  // 如果 apiCode 还没有定义（理论上不会发生），则重新定义
  if (typeof apiCode === 'undefined') {
    apiCode = params.api_code.replace(/[^0-9a-z]/gi, '').toUpperCase();
    if (!apiCode && params.api_code) {
      apiCode = params.api_code.toUpperCase();
    }
  }
  
  // 平台代码映射
  const platformMapping: Record<string, string> = {
    'PA': 'AG',  // PA视讯映射为AG（使用AG的旧接口）
    'CQ': 'CQ9',  // CQ映射为CQ9
    'BA': 'BG'    // BA映射为BG
  };
  
  if (platformMapping[apiCode]) {
    console.log(`🔄 平台代码映射: ${apiCode} -> ${platformMapping[apiCode]}`);
    apiCode = platformMapping[apiCode];
  }
  
  // ========== 旧接口余额转入逻辑（仅针对体育、彩票、棋牌） ==========
  // 游戏类型：4=彩票, 5=体育, 6=棋牌
  const needTransferIn = params.gameType === 4 || params.gameType === 5 || params.gameType === 6;
  
  if (needTransferIn) {
    console.log(`🔄 旧接口余额转入逻辑（游戏类型: ${params.gameType}）`);
    // 异步执行余额转入，不阻塞游戏URL获取
    (async () => {
      try {
        // 1. 获取用户钱包余额
        const { getUserInfo } = await import('@/lib/api/auth');
        let userInfoResponse = await getUserInfo();
        
        // 处理可能的字符串响应（参考 AuthContext 的处理方式）
        if (Object.prototype.toString.call(userInfoResponse) !== '[object Object]') {
          try {
            userInfoResponse = JSON.parse(String(userInfoResponse).replace('{"lang":"zh_cn"}', ''));
          } catch (e) {
            console.error('❌ 解析用户信息响应失败:', e);
          }
        }
        
        // 检查响应状态
        if (userInfoResponse?.status === 'error') {
          console.error('❌ 获取用户信息失败:', userInfoResponse?.message);
          return;
        }
        
        // 获取余额（与 AuthContext 中的逻辑一致）
        // 优先使用 money 字段，然后是 balance 字段
        const walletBalance = userInfoResponse?.data?.money !== undefined && userInfoResponse?.data?.money !== null
          ? userInfoResponse.data.money
          : (userInfoResponse?.data?.balance !== undefined && userInfoResponse?.data?.balance !== null
            ? userInfoResponse.data.balance
            : 0);
        
        console.log('💰 钱包余额:', walletBalance, '响应数据:', {
          money: userInfoResponse?.data?.money,
          balance: userInfoResponse?.data?.balance,
          code: userInfoResponse?.code,
          status: userInfoResponse?.status
        });
        
        if (walletBalance > 0) {
          // 2. 获取游戏中的余额
          let gameBalance = 0;
          try {
            const balanceResponse = await getGameBalance(apiCode);
            if (balanceResponse && balanceResponse.code === 200) {
              gameBalance = parseFloat(String(balanceResponse.money || balanceResponse.data?.money || '0')) || 0;
              console.log('💰 游戏中余额:', gameBalance);
            }
          } catch (balanceError: any) {
            console.warn('⚠️ 获取游戏中余额失败，假设余额为0:', balanceError);
            gameBalance = 0;
          }
          
          // 3. 计算需要转入的金额（钱包余额 - 游戏中余额）
          const transferAmount = walletBalance - gameBalance;
          console.log('💰 余额计算:', {
            钱包余额: walletBalance,
            游戏中余额: gameBalance,
            需要转入: transferAmount
          });
          
          // 4. 如果有余额需要转入，执行转入操作
          if (transferAmount > 0.01) {
            try {
              console.log('🔄 开始转入余额到游戏:', {
                apiCode,
                transferAmount: transferAmount.toFixed(2),
                gameType: params.gameType
              });
              
              // 使用 gameTransferIn 接口转入余额
              const transferResponse = await gameTransferIn(apiCode, transferAmount);
              
              console.log('📊 余额转入响应:', transferResponse);
              
              if (transferResponse && (transferResponse.code === 200 || transferResponse.status === 'success')) {
                console.log('✅ 余额转入成功！', {
                  转入金额: transferAmount.toFixed(2)
                });
              } else {
                console.warn('⚠️ 余额转入失败:', transferResponse);
              }
            } catch (transferError: any) {
              console.error('❌ 余额转入异常:', transferError);
              // 余额转入失败不影响游戏启动
            }
          } else if (transferAmount < -0.01) {
            console.log('ℹ️ 游戏中余额大于钱包余额，无需转入');
          } else {
            console.log('ℹ️ 余额已同步，无需转入');
          }
        } else {
          console.log('ℹ️ 钱包余额为0，无需转入');
        }
      } catch (error: any) {
        console.error('❌ 旧接口余额转入过程异常:', error);
        // 余额转入失败不影响游戏启动
      }
    })();
  }
  // ========== 旧接口余额转入逻辑结束 ==========
  
  // 获取语言参数
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  
  // 构建查询参数
  const queryParams: any = {
    api_code: apiCode,
    gameType: params.gameType,
    isMobile: params.isMobile || 1,
    lang: lang
  };
  
  // 如果游戏代码存在且不为0，则添加
  if (params.gameCode && params.gameCode !== '0' && params.gameCode !== '') {
    queryParams.gameCode = params.gameCode;
  }
  
  // 调试日志：打印请求参数
  console.log('🎮 游戏登录请求参数:', {
    apiCode,
    queryParams,
    fullUrl: `game/login?${new URLSearchParams(queryParams as any).toString()}`
  });
  
  // 使用GET请求，所有参数放在URL查询参数中
  return apiClient.get('game/login', {
    params: queryParams
  }).then((res: any) => {
    // 处理响应数据，支持多种URL字段名（参考Vue项目的responseTransformers）
    const responseData = res?.data || res || {};
    const nestedData = responseData.data || responseData;
    
    // 尝试多种方式获取URL（包括大小写变体）
    const url = nestedData.game_url || 
                nestedData.gameUrl ||
                nestedData.url || 
                nestedData.URL ||
                nestedData.href || 
                nestedData.Href ||
                responseData.game_url || 
                responseData.gameUrl ||
                responseData.url || 
                responseData.URL ||
                responseData.href ||
                res.url ||
                res.game_url ||
                '';
    
    // 提取错误信息
    const message = res?.message || 
                    res?.Message || 
                    res?.msg || 
                    nestedData?.message ||
                    nestedData?.Message ||
                    '';
    
    // 正确判断：status === 'error' 时视为失败，即使code是200
    if (res?.status === 'error') {
      return {
        code: res?.code || 400,
        message: message || res?.message || '获取游戏链接失败',
        status: 'error',
        data: {}
      };
    }
    
    // 判断成功条件：status === 'success' 或 (code为200且status不是error) 且有URL
    if ((res?.status === 'success' || (res?.code === 200 && res?.status !== 'error')) && url) {
      return {
        code: 200,
        message: message || '成功',
        status: 'success',
        data: { 
          game_url: url,
          url: url
        }
      };
    }
    
    // 如果没有URL，返回错误
    if (!url) {
      return {
        code: res?.code || 400,
        message: message || '游戏链接为空，请稍后重试',
        status: res?.status || 'error',
        data: {}
      };
    }
    
    // 其他情况
    return {
      code: res?.code || 400,
      message: message || '获取游戏链接失败',
      status: res?.status || 'error',
      data: { 
        game_url: url || '',
        url: url || ''
      }
    };
  });
};

// 游戏记录相关
export interface GameRecord {
  id?: number;
  bet_id?: string; // 订单号
  Code?: string; // 游戏代码/名称
  api_name?: string; // 游戏平台名称
  api_name_text?: string; // 游戏平台名称文本（后端append字段）
  game_name?: string; // 游戏名称
  betAmount?: number; // 投注金额（后端字段名）
  bet_amount?: number; // 投注金额（兼容）
  validBetAmount?: number; // 有效投注金额（后端字段名）
  valid_bet_amount?: number; // 有效投注金额（兼容）
  win_amount?: number; // 派彩金额
  netAmount?: number; // 净盈亏（后端字段名）
  net_amount?: number; // 净盈亏（兼容）
  win_loss?: number; // 盈亏金额（派彩）
  betTime?: string; // 投注时间（后端字段名，可能是Date对象）
  bet_time?: string; // 投注时间（兼容）
  created_at?: string; // 创建时间
  state?: number | string; // 状态
  status?: number | string; // 状态（兼容）
  [key: string]: any;
}

export interface GameRecordRequest {
  page?: number;
  limit?: number;
  api_name?: string; // 游戏平台名称（后端参数名）
  api_code?: string; // 游戏平台代码（兼容）
  api_type?: string; // 游戏平台类型（兼容）
  gameType?: string | number; // 游戏类型筛选（后端参数名）
  game_type?: string | number; // 游戏类型筛选（兼容）
  date?: string; // 日期筛选（Vue中使用：1=今日, 2=7日内, 3=半月内, 4=一月内）
  created_at?: string[]; // 创建时间数组（后端参数名）
  start_time?: string; // 开始时间（兼容，会转换为created_at）
  end_time?: string; // 结束时间（兼容，会转换为created_at）
}

export interface GameRecordResponse {
  code: number;
  message: string;
  data: {
    data: GameRecord[]; // 分页数据中的记录列表（直接是数组）
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    from?: number | null;
    to?: number | null;
    path?: string;
    statistic?: {
      sum_bet_amount?: number; // 总投注
      sum_valid_bet_amount?: number; // 总有效投注
      sum_net_amount?: number; // 总派彩金额
    };
    apis?: string[]; // API列表
    gametypes?: Array<{ key: string | number; value: string }>; // 游戏类型列表
  };
}

// 获取游戏类型
export interface GameType {
  value: number | string;
  label: string;
}

export interface GameTypeResponse {
  code: number;
  message: string;
  data: GameType[];
}

export const getGameType = (): Promise<GameTypeResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`/game/type?lang=${lang}`, {});
};

// 获取游戏记录（投注记录）
export const getGameRecord = (params: GameRecordRequest = {}): Promise<GameRecordResponse> => {
  // 根据接口清单：POST /game/record
  // 参考Vue实现，添加lang参数
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  
  // 构建请求参数（后端期望的参数名）
  // 根据接口文档：POST /api/game/record
  // 参数格式：
  // {
  //   "created_at": ["开始时间", "结束时间"],
  //   "api_name": "平台名称",
  //   "page": 1,
  //   "gameType": 游戏类型,
  //   "limit": 10
  // }
  const requestParams: any = {
    limit: params.limit || 20,
    page: params.page || 1
  };
  
  // 确保至少有一个参数，避免后端 $data 未初始化错误
  // 但根据后端代码，只要有参数传入就会初始化，所以这里应该没问题
  
  // 平台名称筛选（后端参数名是api_name）
  if (params.api_name) {
    requestParams.api_name = params.api_name;
  } else if (params.api_code) {
    requestParams.api_name = params.api_code; // 兼容api_code
  } else if (params.api_type) {
    requestParams.api_name = params.api_type; // 兼容api_type
  }
  
  // 游戏类型筛选（后端参数名是gameType）
  if (params.gameType !== undefined && params.gameType !== null && params.gameType !== '') {
    requestParams.gameType = params.gameType;
  } else if (params.game_type !== undefined && params.game_type !== null && params.game_type !== '') {
    requestParams.gameType = params.game_type; // 兼容game_type
  }
  
  // 时间筛选（后端参数名是created_at，格式为数组）
  if (params.created_at && Array.isArray(params.created_at)) {
    requestParams.created_at = params.created_at;
  } else if (params.date) {
    // 如果提供了date参数，转换为created_at数组
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startTime = '';
    let endTime = '';

    // 使用本地时间而不是UTC时间，避免时区问题
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (params.date) {
      case '1': // 今日
        startTime = formatLocalDate(today) + ' 00:00:00';
        endTime = formatLocalDate(now) + ' 23:59:59';
        break;
      case '2': // 昨日
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startTime = formatLocalDate(yesterday) + ' 00:00:00';
        endTime = formatLocalDate(yesterday) + ' 23:59:59';
        break;
      case '3': // 半月内
        const halfMonthAgo = new Date(today);
        halfMonthAgo.setDate(halfMonthAgo.getDate() - 15);
        startTime = formatLocalDate(halfMonthAgo) + ' 00:00:00';
        endTime = formatLocalDate(now) + ' 23:59:59';
        break;
      case '4': // 30天内
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startTime = formatLocalDate(thirtyDaysAgo) + ' 00:00:00';
        endTime = formatLocalDate(now) + ' 23:59:59';
        break;
    }
    
    requestParams.created_at = [startTime, endTime];
  } else if (params.start_time && params.end_time) {
    // 兼容start_time和end_time，转换为created_at数组
    requestParams.created_at = [params.start_time, params.end_time];
  }
  
  console.log('📊 投注记录请求参数:', requestParams);
  
  return apiClient.post(`/game/record?lang=${lang}`, requestParams);
};

// 游戏转账相关
export interface GameTransferRequest {
  api_code: string; // 游戏平台代码
  type: 'in' | 'out'; // 转入或转出
  amount?: number; // 转账金额（可选，不传则全部）
}

export interface GameTransferResponse {
  code: number;
  message: string;
  status?: string; // 添加 status 属性
  data?: any;
}

// 游戏转账（转入或转出）
export const gameTransfer = (params: GameTransferRequest): Promise<GameTransferResponse> => {
  // 根据接口清单：POST /game/change_trans 或 /game/transfer
  // 添加lang参数到URL（参考编译后的Vue代码）
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`game/change_trans?lang=${encodeURIComponent(lang)}`, {
    api_code: params.api_code,
    type: params.type,
    amount: params.amount
  }).then((res: any): GameTransferResponse => {
    // 确保返回类型符合 GameTransferResponse
    return {
      code: res.code || 200,
      message: res.message || '',
      status: res.status,
      data: res.data
    };
  }).catch((error: any) => {
    // 如果change_trans接口不存在，尝试使用transfer接口
    if (error.response?.status === 404 || error.code === 404) {
      return apiClient.post(`game/transfer?lang=${encodeURIComponent(lang)}`, {
        api_code: params.api_code,
        type: params.type,
        amount: params.amount
      }).then((res: any): GameTransferResponse => {
        // 确保返回类型符合 GameTransferResponse
        return {
          code: res.code || 200,
          message: res.message || '',
          status: res.status,
          data: res.data
        };
      });
    }
    throw error;
  });
};

// 游戏转入（从钱包转到游戏平台）- 使用 /game/deposit 接口
export const gameDeposit = (apiCode: string, money?: number): Promise<GameTransferResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`game/deposit?lang=${encodeURIComponent(lang)}`, {
    api_code: apiCode,
    money: money // 如果不传money，后端会转入全部余额（根据后端代码，但实际需要money参数）
  });
};

// 游戏转入（从钱包转到游戏平台）- 使用 change_trans 接口（兼容）
export const gameTransferIn = (apiCode: string, amount?: number): Promise<GameTransferResponse> => {
  return gameTransfer({
    api_code: apiCode,
    type: 'in',
    amount: amount
  });
};

// 获取游戏接口余额
export const getGameBalance = (apiCode: string): Promise<any> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`game/balance?lang=${encodeURIComponent(lang)}`, {
    api_code: apiCode
  }).then((res: any) => {
    // 后端返回格式：{ status: "success", code: 200, message: "", money: "206" }
    // money 字段直接在 res 上，不在 res.data 里
    return res;
  });
};

// 游戏转出（从游戏平台转回钱包）
export const gameTransferOut = async (apiCode: string): Promise<GameTransferResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  
  // 根据后端代码分析：
  // 1. withdrawal 接口需要 money 参数（第282行：$money = $request->input('money');）
  // 2. 后端会执行：$amount = intval($money);（第317行）
  // 3. 如果 money 为空或0，amount 会是0，第三方接口可能返回失败
  // 4. 只有第三方接口返回 Code == 0 时，才会：
  //    - 更新 MemberApi.money = 0（第336-338行）
  //    - 增加 member.money（第363行：$member->increment('money', $amount);）
  // 5. 如果第三方接口返回 Code != 0，会返回错误，不会更新余额
  
  // 步骤1: 先获取接口余额（从第三方接口获取真实余额）
  let balance = 0;
  try {
    const balanceRes = await getGameBalance(apiCode);
    console.log('💰 获取接口余额响应:', balanceRes);
    
    // 根据日志，后端返回格式：{ status: "success", code: 200, message: "", money: "206" }
    // money 字段直接在 balanceRes 上，不在 balanceRes.data 里
    if (balanceRes.code === 200) {
      // 优先从 balanceRes.money 获取（直接字段）
      if (balanceRes.money !== undefined && balanceRes.money !== null) {
        balance = parseFloat(String(balanceRes.money)) || 0;
      } 
      // 如果没有，尝试从 balanceRes.data.money 获取
      else if (balanceRes.data && balanceRes.data.money !== undefined) {
        balance = parseFloat(String(balanceRes.data.money)) || 0;
      }
      console.log('💰 解析后的接口余额:', balance);
    }
    
    // 如果余额为0或负数，直接返回
    if (balance <= 0) {
      console.warn('⚠️ 接口余额为0或负数，无需转出');
      return {
        code: 200,
        message: '该接口余额为0，无需转出',
        status: 'success',
        data: { money: 0 }
      };
    }
  } catch (error: any) {
    console.error('❌ 获取接口余额失败:', error);
    throw new Error('获取接口余额失败，无法转出');
  }
  
  // 步骤2: 调用 withdrawal 接口转出
  // 关键：必须传递 money 参数，且必须是大于0的整数
  // 后端会执行 intval($money)，所以传整数
  const withdrawalParams: any = {
    api_code: apiCode,
    money: Math.floor(balance) // 向下取整，确保是整数
  };
  
  console.log('🔄 调用转出接口，参数:', withdrawalParams);
  console.log('🔄 转出金额:', withdrawalParams.money, '(整数)');
  
  // 验证金额
  if (!withdrawalParams.money || withdrawalParams.money <= 0) {
    throw new Error('转出金额无效，无法转出');
  }
  
  return apiClient.post(`game/withdrawal?lang=${encodeURIComponent(lang)}`, withdrawalParams).then((res: any) => {
    console.log('🔄 转出接口完整响应:', JSON.stringify(res, null, 2));
    
    // 根据实际日志，后端返回格式：{ status: "success", code: 200, message: "", money: 200 }
    // money 字段直接在 res 上，不在 res.data 里
    
    // 检查响应状态
    if (res.status === 'error') {
      console.error('❌ 转出失败（status=error）:', res.message);
      return {
        code: res.code || 400,
        message: res.message || '转出失败',
        status: 'error',
        data: {}
      };
    }
    
    // 检查响应码
    if (res.code !== 200) {
      console.error('❌ 转出失败（code!=200）:', res.code, res.message);
      return {
        code: res.code || 400,
        message: res.message || '转出失败',
        status: 'error',
        data: {}
      };
    }
    
    // 成功：后端已经执行了：
    // - MemberApi.money = 0
    // - member.money += amount
    // 后端返回：{ status: "success", code: 200, message: "", money: 200 }
    console.log('✅ 转出成功，后端已更新余额，转出金额:', res.money || withdrawalParams.money);
    return {
      code: res.code || 200,
      message: res.message || '转出成功',
      status: res.status || 'success',
      data: {
        money: res.money || withdrawalParams.money,
        ...(res.data || {})
      }
    };
  }).catch((error: any) => {
    console.error('❌ 转出API异常:', error);
    console.error('❌ 错误响应:', error.response?.data || error.message);
    throw error;
  });
};

// 获取单个接口余额
export interface ApiMoneyInfo {
  api_name: string;
  api_title: string;
  money: number | string;
}

export interface ApiMoneyResponse {
  code: number;
  message: string;
  data: {
    money_info: ApiMoneyInfo[];
    is_trans_on?: number;
  };
}

export const getApiMoney = (apiCode: string): Promise<ApiMoneyResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`game/api_money?lang=${encodeURIComponent(lang)}`, {
    api_code: apiCode
  }).then((res: any) => {
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data || { money_info: [] }
    };
  });
};

// 获取所有接口余额
export interface ApiMoneysResponse {
  code: number;
  message: string;
  data: {
    api_moneys: ApiMoneyInfo[];
  };
}

export const getApiMoneys = (): Promise<ApiMoneysResponse> => {
  const lang = localStorage.getItem('ly_lang') || 'zh_cn';
  return apiClient.post(`game/api_moneys?lang=${encodeURIComponent(lang)}`, {}).then((res: any) => {
    return {
      code: res.code || 200,
      message: res.message || '',
      data: res.data || { api_moneys: [] }
    };
  });
};

