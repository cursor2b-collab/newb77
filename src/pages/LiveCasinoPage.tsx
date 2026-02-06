import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { newGameApiService } from '@/lib/api/newGameApi';
import { getGameApiLanguage } from '@/utils/languageMapper';
import { openNewGame } from '@/utils/gameUtils';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { PageLoader } from '@/components/PageLoader';

interface Game {
  id: string;
  name: string;
  thumbnail: string;
  provider: string;
  vendorCode: string;
  gameCode: string;
  vendorType?: number;
  isNew?: boolean;
  hasJackpot?: boolean;
}

export function LiveCasinoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [displayedGamesCount, setDisplayedGamesCount] = useState(12);
  const [allGamesData, setAllGamesData] = useState<Game[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // 赌场类型的供应商代码列表
  const casinoVendorCodes = [
    'casino-evolution',
    'casino-sa',
    'casino-micro',
    'casino-playace',
    'casino-mg'
  ];

  // 供应商名称映射
  const vendorNameMap: Record<string, string> = {
    'casino-evolution': 'Evolution',
    'casino-sa': 'Sa Gaming',
    'casino-micro': 'Micro Gaming',
    'casino-playace': 'PlayAce',
    'casino-mg': 'Microgaming Grand'
  };

  // 根据选中的标签筛选供应商
  const getFilteredVendors = (tab: string, vendors: any[]): any[] => {
    // 只显示赌场类型的供应商
    const casinoVendors = vendors.filter((v: any) => 
      casinoVendorCodes.includes(v.vendorCode)
    );

    if (tab === 'all') {
      return casinoVendors;
    }

    // 根据标签筛选特定供应商
    return casinoVendors.filter((v: any) => v.vendorCode === tab);
  };

  // 获取供应商列表
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsResponse = await newGameApiService.getVendorsList();
        let vendors: any[] = [];
        
        if (Array.isArray(vendorsResponse)) {
          vendors = vendorsResponse;
        } else if (vendorsResponse && vendorsResponse.message && Array.isArray(vendorsResponse.message)) {
          vendors = vendorsResponse.message;
        } else if (vendorsResponse && vendorsResponse.success && vendorsResponse.message) {
          vendors = Array.isArray(vendorsResponse.message) ? vendorsResponse.message : [];
        }

        setAllVendors(vendors);
      } catch (error) {
        console.error('获取供应商列表失败:', error);
        setAllVendors([]);
      }
    };

    fetchVendors();
  }, []);

  // 获取游戏列表
  useEffect(() => {
    const fetchGames = async () => {
      if (allVendors.length === 0) return;
      
      setLoading(true);
      try {
        const gameApiLanguage = getGameApiLanguage();
        const filteredVendors = getFilteredVendors(activeTab, allVendors);
        const vendorsToFetch = filteredVendors;

        const gamesPromises = vendorsToFetch.map(async (vendor: any) => {
          try {
            const gamesResponse = await newGameApiService.getGamesList(vendor.vendorCode, gameApiLanguage);
            let vendorGames: any[] = [];
            
            if (Array.isArray(gamesResponse)) {
              vendorGames = gamesResponse;
            } else if (gamesResponse && gamesResponse.message && Array.isArray(gamesResponse.message)) {
              vendorGames = gamesResponse.message;
            } else if (gamesResponse && gamesResponse.success && gamesResponse.message) {
              vendorGames = Array.isArray(gamesResponse.message) ? gamesResponse.message : [];
            }

            return vendorGames.map((game: any) => ({
              id: `${vendor.vendorCode}-${game.gameCode}`,
              name: game.gameName || game.name || '',
              thumbnail: game.thumbnail || game.imageUrl || '',
              provider: game.provider || vendor.name || vendorNameMap[vendor.vendorCode] || '',
              vendorCode: vendor.vendorCode,
              gameCode: game.gameCode || 'lobby',
              vendorType: vendor.type,
              isNew: game.isNew || false,
              hasJackpot: false
            }));
          } catch (error: any) {
            console.error(`获取供应商 ${vendor.vendorCode} 的游戏失败:`, error);
            return [];
          }
        });

        const gamesResults = await Promise.all(gamesPromises);
        const allGames = gamesResults.flat();
        setAllGamesData(allGames);
        setDisplayedGamesCount(12);
        requestAnimationFrame(() => {
          setGames(allGames.slice(0, 12));
          setLoading(false);
        });
      } catch (error) {
        console.error('获取游戏列表失败:', error);
        setGames([]);
        setLoading(false);
      }
    };

    fetchGames();
  }, [activeTab, allVendors]);

  // 加载更多游戏
  const loadMoreGames = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const nextCount = displayedGamesCount + 12;
      setDisplayedGamesCount(nextCount);
    } catch (error) {
      console.error('加载更多游戏失败:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 搜索时重新计算显示的游戏
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setGames(allGamesData.slice(0, displayedGamesCount));
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = allGamesData.filter(game => {
      const gameNameMatch = game.name.toLowerCase().includes(query);
      const providerMatch = game.provider.toLowerCase().includes(query);
      const vendorCodeMatch = game.vendorCode.toLowerCase().includes(query);
      return gameNameMatch || providerMatch || vendorCodeMatch;
    });
    
    setGames(filtered.slice(0, displayedGamesCount));
  }, [searchQuery, allGamesData, displayedGamesCount]);

  // 更新显示的游戏数量
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setGames(allGamesData.slice(0, displayedGamesCount));
    }
  }, [displayedGamesCount, allGamesData, searchQuery]);

  // 获取标签列表
  const tabs = [
    { id: 'all', name: '全部' },
    { id: 'casino-evolution', name: 'Evolution' },
    { id: 'casino-sa', name: 'Sa Gaming' },
    { id: 'casino-micro', name: 'Micro Gaming' },
    { id: 'casino-playace', name: 'PlayAce' },
    { id: 'casino-mg', name: 'Microgaming Grand' }
  ];

  if (loading && games.length === 0) {
    return <PageLoader />;
  }

  return (
    <>
      <style>{`
        .live-casino-page {
          min-height: 100vh;
          background: #0f1419;
          padding-bottom: 80px;
        }

        .live-casino-header {
          background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
          padding: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .live-casino-title {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 16px;
          text-align: center;
        }

        .live-casino-search {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .live-casino-search::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .live-casino-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }

        .live-casino-tabs::-webkit-scrollbar {
          display: none;
        }

        .live-casino-tab {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.3s;
        }

        .live-casino-tab.active {
          background: linear-gradient(135deg, #FFB82C 0%, #FF9500 100%);
          border-color: #FFB82C;
          color: #fff;
          font-weight: bold;
        }

        .live-casino-games {
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .live-casino-game-card {
          background: #1a1f2e;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .live-casino-game-card:active {
          transform: scale(0.98);
        }

        .live-casino-game-image {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }

        .live-casino-game-info {
          padding: 12px;
        }

        .live-casino-game-name {
          font-size: 14px;
          color: #fff;
          font-weight: 500;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .live-casino-game-provider {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .live-casino-load-more {
          padding: 16px;
          text-align: center;
        }

        .live-casino-load-more-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #FFB82C 0%, #FF9500 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .live-casino-load-more-btn:active {
          opacity: 0.8;
        }

        .live-casino-empty {
          padding: 60px 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .live-casino-empty-text {
          font-size: 16px;
          margin-top: 16px;
        }
      `}</style>

      <div className="live-casino-page">
        <div className="live-casino-header">
          <div className="live-casino-title">真人视讯</div>
          <input
            type="text"
            className="live-casino-search"
            placeholder="搜索游戏..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="live-casino-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`live-casino-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {loading && games.length === 0 ? (
          <PageLoader />
        ) : games.length === 0 ? (
          <div className="live-casino-empty">
            <div className="live-casino-empty-text">暂无游戏</div>
          </div>
        ) : (
          <>
            <div className="live-casino-games">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="live-casino-game-card"
                  onClick={() => openNewGame(game.vendorCode, game.gameCode, 1)}
                >
                  <ImageWithFallback
                    src={game.thumbnail}
                    alt={game.name}
                    className="live-casino-game-image"
                    fallbackSrc="/images/default-game.png"
                  />
                  <div className="live-casino-game-info">
                    <div className="live-casino-game-name">{game.name}</div>
                    <div className="live-casino-game-provider">{game.provider}</div>
                  </div>
                </div>
              ))}
            </div>

            {allGamesData.length > displayedGamesCount && (
              <div className="live-casino-load-more">
                <button
                  className="live-casino-load-more-btn"
                  onClick={loadMoreGames}
                  disabled={loadingMore}
                >
                  {loadingMore ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
