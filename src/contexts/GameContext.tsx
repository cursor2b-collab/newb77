/**
 * 游戏数据Context
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getGameList, type Game } from '@/lib/api/game';

interface GameContextType {
  realbetList: Game[];
  gamingList: Game[];
  jokerList: Game[];
  sportList: Game[];
  lotteryList: Game[];
  conciseList: Game[];
  loading: boolean;
  refreshGames: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [realbetList, setRealbetList] = useState<Game[]>([]);
  const [gamingList, setGamingList] = useState<Game[]>([]);
  const [jokerList, setJokerList] = useState<Game[]>([]);
  const [sportList, setSportList] = useState<Game[]>([]);
  const [lotteryList, setLotteryList] = useState<Game[]>([]);
  const [conciseList, setConciseList] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGames = async () => {
    setLoading(true);
    try {
      console.log('🔄 开始获取游戏列表...');
      const res = await getGameList();
      console.log('📥 GameContext 收到响应:', res);
      
      if (res.code === 200 && res.data) {
        const games = res.data;
        console.log('✅ 获取到游戏数据:', games.length, '个游戏');
        
        // 重置列表
        setRealbetList([]);
        setGamingList([]);
        setJokerList([]);
        setSportList([]);
        setLotteryList([]);
        setConciseList([]);
        
        // 根据category_id分类
        games.forEach((game: Game) => {
          // 处理PA视讯改为BG视讯
          if (game.category_id === 'realbet') {
            if (game.name === 'PA视讯' || game.platform_name === 'PA') {
              game.name = 'BG视讯';
              game.platform_name = 'BG';
            }
            setRealbetList(prev => [...prev, game]);
          } else if (game.category_id === 'joker') {
            setJokerList(prev => [...prev, game]);
          } else if (game.category_id === 'gaming') {
            setGamingList(prev => [...prev, game]);
          } else if (game.category_id === 'sport') {
            // 名称映射
            if (game.name === 'AG体育' || game.platform_name === 'AGTY') {
              game.name = 'PA体育';
            }
            if (game.name === '泛亚电竞2') {
              game.name = '泛亚电竞';
            }
            setSportList(prev => [...prev, game]);
          } else if (game.category_id === 'lottery') {
            setLotteryList(prev => [...prev, game]);
          } else if (game.category_id === 'concise') {
            setConciseList(prev => [...prev, game]);
          }
        });
        
        // 统计各分类的游戏数量
        const stats = {
          realbet: games.filter((g: Game) => g.category_id === 'realbet').length,
          gaming: games.filter((g: Game) => g.category_id === 'gaming').length,
          joker: games.filter((g: Game) => g.category_id === 'joker').length,
          sport: games.filter((g: Game) => g.category_id === 'sport').length,
          lottery: games.filter((g: Game) => g.category_id === 'lottery').length,
          concise: games.filter((g: Game) => g.category_id === 'concise').length
        };
        console.log('📊 游戏分类统计:', stats);
      } else {
        console.warn('⚠️ 接口返回数据格式异常:', res);
      }
    } catch (err: any) {
      console.error('❌ 获取游戏列表失败:', err);
      console.error('❌ 错误详情:', err.message, err.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, []);

  return (
    <GameContext.Provider value={{
      realbetList,
      gamingList,
      jokerList,
      sportList,
      lotteryList,
      conciseList,
      loading,
      refreshGames
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}



