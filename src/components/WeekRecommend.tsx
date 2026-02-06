import { React, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { openGame } from '@/utils/gameUtils';
import { newGameApiService } from '@/lib/api/newGameApi';
import { getGameApiLanguage } from '@/utils/languageMapper';

interface GameData {
  position: number;
  size: 'small' | 'big';
  marginTop?: boolean;
  image: string;
  platformName: string;
  gameType: number;
  gameCode: string;
  name: string;
  vendorCode: string;
}

export function WeekRecommend() {
  const swiper = useRef(null); // 创建ref来存储Swiper实例
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  // 本周推荐游戏配置（游戏代码映射）
  const weekGamesConfig = [
    { name: '鲨鱼赏金', gameCode: 'shark-hunter', vendorCode: 'slot-pgsoft', position: 0, size: 'small' as const, image: '/images/week/vs20sugarrush1.png', platformName: 'PG', gameType: 3 },
    { name: '麻将胡了', gameCode: 'mahjong-ways', vendorCode: 'slot-pgsoft', position: 1, size: 'big' as const, image: '/images/week/163-zh-F.png', platformName: 'PG', gameType: 3 },
    { name: '麻将胡了2', gameCode: 'mahjong-ways2', vendorCode: 'slot-pgsoft', position: 2, size: 'small' as const, marginTop: true, image: '/images/week/184-zh-F.png', platformName: 'PG', gameType: 3 },
    { name: '寻宝黄金城', gameCode: 'treasures-aztec', vendorCode: 'slot-pgsoft', position: 3, size: 'small' as const, marginTop: true, image: '/images/week/185-zh-F.png', platformName: 'PG', gameType: 3 },
    { name: '赏金女王', gameCode: 'queen-bounty', vendorCode: 'slot-pgsoft', position: 4, size: 'small' as const, marginTop: true, image: '/images/week/app_icon_small.png', platformName: 'PG', gameType: 3 },
    { name: '麒麟送宝', gameCode: 'ways-of-qilin', vendorCode: 'slot-pgsoft', position: 5, size: 'small' as const, marginTop: true, image: '/images/week/3x-503be228.png', platformName: 'PG', gameType: 3 }
  ];

  // 从新游戏接口获取游戏数据
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const gameApiLanguage = getGameApiLanguage();
        // console.log('🌐 本周推荐游戏使用语言代码:', gameApiLanguage);

        // 获取供应商列表
        const vendorsResponse = await newGameApiService.getVendorsList();
        let vendors: any[] = [];
        
        if (Array.isArray(vendorsResponse)) {
          vendors = vendorsResponse;
        } else if (vendorsResponse && vendorsResponse.message && Array.isArray(vendorsResponse.message)) {
          vendors = vendorsResponse.message;
        } else if (vendorsResponse && vendorsResponse.success && vendorsResponse.message) {
          vendors = Array.isArray(vendorsResponse.message) ? vendorsResponse.message : [];
        }

        // 获取所有需要的供应商的游戏列表
        const vendorCodes = [...new Set(weekGamesConfig.map(g => g.vendorCode))];
        const gamesMap = new Map<string, any[]>();

        // 并行获取每个供应商的游戏列表
        const gamesPromises = vendorCodes.map(async (vendorCode) => {
          try {
            // 检查供应商是否存在
            const vendor = vendors.find((v: any) => v.vendorCode === vendorCode);
            if (!vendor) {
              console.warn(`⚠️ 供应商 ${vendorCode} 不存在，跳过`);
              return;
            }

            const gamesResponse = await newGameApiService.getGamesList(vendorCode, gameApiLanguage);
            let games: any[] = [];
            
            if (Array.isArray(gamesResponse)) {
              games = gamesResponse;
            } else if (gamesResponse && gamesResponse.message && Array.isArray(gamesResponse.message)) {
              games = gamesResponse.message;
            } else if (gamesResponse && gamesResponse.success && gamesResponse.message) {
              games = Array.isArray(gamesResponse.message) ? gamesResponse.message : [];
            }

            gamesMap.set(vendorCode, games);
            // console.log(`✅ 供应商 ${vendorCode} 获取到 ${games.length} 个游戏`);
          } catch (error) {
            console.error(`获取供应商 ${vendorCode} 的游戏失败:`, error);
            gamesMap.set(vendorCode, []);
          }
        });

        await Promise.all(gamesPromises);

        // 根据配置匹配游戏
        const matchedGames: GameData[] = weekGamesConfig.map((config) => {
          const vendorGames = gamesMap.get(config.vendorCode) || [];
          
          // 尝试通过gameCode匹配游戏
          let matchedGame = vendorGames.find((g: any) => 
            g.gameCode === config.gameCode || 
            g.gameCode?.toLowerCase() === config.gameCode?.toLowerCase()
          );

          // 如果没找到，尝试通过游戏名称匹配
          if (!matchedGame) {
            matchedGame = vendorGames.find((g: any) => 
              g.gameName?.toLowerCase().includes(config.name.toLowerCase()) ||
              config.name.toLowerCase().includes(g.gameName?.toLowerCase() || '')
            );
          }

          // 如果找到了匹配的游戏，使用API返回的数据
          if (matchedGame) {
            return {
              ...config,
              image: matchedGame.thumbnail || config.image,
              gameCode: matchedGame.gameCode || config.gameCode,
              vendorCode: matchedGame.vendorCode || config.vendorCode
            };
          }

          // 如果没找到，使用配置的默认值
          console.warn(`⚠️ 未找到游戏: ${config.name} (${config.gameCode})，使用默认配置`);
          return config as GameData;
        });

        setGames(matchedGames);
        // console.log('✅ 成功获取本周推荐游戏列表，共', matchedGames.length, '个游戏');
      } catch (error) {
        console.error('❌ 获取本周推荐游戏列表失败:', error);
        // 如果API失败，使用配置的默认值
        setGames(weekGamesConfig as GameData[]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);
  const games2 = [
    {
      position: 0,
      size: 'small',
      image: '/images/030c8cdead42dfc7e997d9c6d76b4dbe.png_.webp',
      platformName: 'PL', // Pragmatic Live
      gameType: 1,
      gameCode: 'sba71kkmr2ssba71',
      name: '骰宝'
    },
    {
      position: 1,
      size: 'big',
      image: '/images/newimg/79073e2.avif',
      platformName: 'PL', // Pragmatic Live
      gameType: 1,
      gameCode: 'drag0ntig3rsta48',
      name: '龙虎',
      useNewApi: true,
      vendorCode: 'casino-playace',
      newGameCode: 'D060'
    }
  ]

  return (
    <>
      <style>{`

        .week-box {
          padding: 15px 16px;
          padding-bottom: 0;
        }
        .week-box .week-title-box{
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .week-icon{
          width: 20px;
          height: 20px;
          margin-right: 4px;
        }
        .week-title-box .title-left {
          font-size: 16px;
          color: #fff;
          display: flex;
          align-items: center;
        }
        .week-title-box .title-right {
          font-size: 12px;
          color: #fff;
          display: flex;
          align-items: center;
        }
        .title-right .extraBtn {
          padding: 5px 7px;
          border-radius: 4px;
          background-color: rgba(199, 218, 255, .0509803922);
          color: #ffc53e;
          font-family: PingFang SC;
          font-size: 12px;
          font-weight: 600;
        }
        .recommend-list2 {
          width: 100%;
          padding: 0;
          margin-bottom: 0.2rem;
        }

        .recommend-list2 .banner-box2 {
          width: 100%;
          height: auto;
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        
        .banner-box2 .banner-box2-item{
          width: 45%;
          height: 90px;
          border-radius: 8px;
        }

        .banner-box2-item img {
          border-radius: 8px;
          width: 100%;
          height: 100%;
        }

        .recommend-list2 .public-module2 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .recommend-list2 .item2 {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .recommend-list2 .item2:active {
          transform: scale(0.98);
        }

        .recommend-list2 .home-intro-game-card2 {
          width: 100%;
          position: relative;
          border-radius: 20px;
        }

        .recommend-list2 .home-intro-game-card2 img {
          width: 100%;
          display: block;
          object-fit: contain;
          border-radius: 20px;
        }
        
        .recommend-list2 .game-collect-button {
          display: flex;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-orient: horizontal;
          -webkit-box-direction: normal;
          -ms-flex-direction: row;
          flex-direction: row;
          width: .24rem;
          height: .24rem;
          backdrop-filter: blur(10px);
          background: hsla(0, 0%, 100%, .0509803922);
          border-radius: 0 0 0 8px;
          position: absolute;
          top: 0;
          right: 0;
          z-index: 1;
        }
        .provider-box{
          display: flex;
          align-items: center;
        }
        .recommend-list2 .provider {
          display: flex;
          margin-left: 4px;
          margin-right: 10px;
          -webkit-box-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          align-items: center;
          flex-direction: row;
          width: -webkit-fit-content;
          width: -moz-fit-content;
          width: fit-content;
          height: 12px;
          padding: 0 4px;
          font-size: 10px;
          font-weight: 500;
          color: #fff;
          border-radius: 3px;
          background: hsla(0, 0%, 100%, 0.2);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          
        }
        .recommend-list2 .game-marks-top{
          -webkit-box-pack: start;
          -ms-flex-pack: start;
          justify-content: flex-start;
          -webkit-box-align: start;
          -ms-flex-align: start;
          align-items: flex-start;
          width: 100%;
          left: 5%;
          top: 6%;
          display: flex;
          flex-direction: row;
          position: absolute;
          z-index: 2;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
        }
        .week-box .pageModule{
          display: flex;
          -webkit-box-orient: horizontal;
          -webkit-box-direction: normal;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          height: 24px;
        }

        .week-box .pageItem {
          display: flex;
          -webkit-box-orient: horizontal;
          -webkit-box-direction: normal;
          flex-direction: row;
          -webkit-box-pack: center;
          justify-content: center;
          -webkit-box-align: center;
          align-items: center;
          width: 32px;
          height: 24px;
          margin-left: 4px;
          border-radius: 4px;
          background: rgba(199, 218, 255, .0509803922);
        }
        .pageModule .pageItem .pageArrow {
          width: 8px;
          height: 8px;
        }
        .game-title3 {
          
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          line-height: 30px;
          height: 30px;

        }

      `}</style>
      <div className="week-box">
        <div className="week-title-box">
          <div className="title-left">
            <div>
              <img 
                className="week-icon" 
                src="/images/week/icon_week.png" 
                loading="lazy"
                />
            </div>
            <div>本周推荐</div>
          </div>
          <div className="title-right">
            <div className="extraBtn"> 电游大厅 </div>
            <div className="pageModule">
              <div className="pageItem swiper-button-prev2 disabled">
                <img className="pageArrow" src="/images/week/zuo.png"/>
              </div>
              <div className="pageItem swiper-button-next2" >
                <img className="pageArrow" src="/images/week/you.png"/>
              </div>
            </div>
          </div>
        </div>

        <Swiper
            
            navigation={{ prevEl: '.swiper-button-prev2', nextEl: '.swiper-button-next2' }}
            modules={[Navigation]}
            
            spaceBetween={50}
            slidesPerView={1}
            ref={swiper}
          >
          <SwiperSlide>
            <div className="recommend-list2">
              <ul className="public-module2">
                {loading ? (
                  // 加载状态
                  Array.from({ length: 6 }).map((_, index) => (
                    <li 
                      key={index} 
                      className="item2 position"
                      style={{ 
                        background: '#2a2f3a', 
                        borderRadius: '8px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        minHeight: '100px'
                      }}
                    >
                      <div style={{ color: '#666', fontSize: '12px' }}>加载中...</div>
                    </li>
                  ))
                ) : (
                  games.map((game) => (
                    <li 
                      key={game.position} 
                      className="item2 position"
                      onClick={async () => {
                        // 使用新游戏接口启动游戏
                        // 将vendorCode转换为platformName格式（如 slot-pgsoft -> PG）
                        const platformMap: Record<string, string> = {
                          'slot-pgsoft': 'PG',
                          'slot-pragmatic': 'PP',
                          'slot-cq9': 'CQ9',
                          'slot-hacksaw': 'HACKSAW',
                          'slot-titan': 'TITAN',
                          'slot-uppercut': 'UPPERCUT',
                          'slot-peter': 'PETER',
                          'slot-jdb': 'JDB',
                          'casino-evolution': 'AG',
                          'sport': 'AI',
                          'joker': 'KY'
                        };
                        const platformName = platformMap[game.vendorCode] || game.platformName.toUpperCase().replace('SLOT-', '').replace('CASINO-', '');
                        
                        console.log('🎮 启动本周推荐游戏:', {
                          name: game.name,
                          vendorCode: game.vendorCode,
                          gameCode: game.gameCode,
                          platformName,
                          gameType: game.gameType
                        });
                        
                        openGame(platformName, game.gameType, game.gameCode);
                      }}
                    >
                      <div className="home-intro-game-card2">
                        <img 
                          src={game.image} 
                          alt={game.name || `Game ${game.position}`}
                          loading="lazy"
                          onError={(e) => {
                            // 图片加载失败时使用默认图片
                            const target = e.target as HTMLImageElement;
                            const defaultImages = [
                              '/images/week/vs20sugarrush1.png',
                              '/images/week/163-zh-F.png',
                              '/images/week/184-zh-F.png'
                            ];
                            if (defaultImages[game.position]) {
                              target.src = defaultImages[game.position];
                            }
                          }}
                        />
                      </div>
                      <div className="provider-box">
                        <div className="provider"> {game.platformName} </div>
                        <div className="game-title3">{game.name}</div>
                      </div>
                      <div className="game-collect-button"><i className="game-collect-button-item"></i></div>
                      
                      <p className="game-marks-top"></p>
                    </li>
                  ))
                )}
              </ul>
              <div className="banner-box2">
                {games2.map((game) => (
                  <div 
                    key={game.position} 
                    className="banner-box2-item" 
                    onClick={async () => {
                      // 所有游戏都使用 openGame 函数，在当前页面内打开（使用 iframe）
                      openGame(game.platformName, game.gameType, game.gameCode);
                    }}
                  >
                    <img 
                      src={game.image} 
                      alt={`Game ${game.position}`}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
          {/* <SwiperSlide>
            <div className="recommend-list2">
              <ul className="public-module2">
                {games.map((game) => (
                  <li 
                    key={game.position} 
                    className={`item2 position_${game.position}`}
                    onClick={async () => {
                      // 所有游戏都使用 openGame 函数，在当前页面内打开（使用 iframe）
                      openGame(game.platformName, game.gameType, game.gameCode);
                    }}
                  >
                    <div className={`home-intro-game-card2 ${game.size}`}>
                      <img 
                        src={game.image} 
                        alt={game.name || `Game ${game.position}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="game-title3">{game.name}</div>
                    <div className="game-collect-button"><i className="game-collect-button-item"></i></div>
                    <div className="provider"> PA </div>
                    <p className="game-marks-top"></p>
                  </li>
                ))}
              </ul>
            </div>
          </SwiperSlide> */}
        </Swiper>
      </div>
    </>
  );
}