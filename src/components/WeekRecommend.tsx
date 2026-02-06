import { React, useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { openGame } from '@/utils/gameUtils';
import { useGames } from '@/contexts/GameContext';

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
  const { gamingList, loading: gamesLoading } = useGames(); // 从 GameContext 获取游戏列表
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 game_lists 表获取 PG 电子游戏
  useEffect(() => {
    if (gamesLoading) {
      setLoading(true);
      return;
    }

    try {
      // 筛选 PG 平台的电子游戏（game_type = 3）
      const pgGames = gamingList.filter(game => 
        (game.platform_name || '').toUpperCase() === 'PG' && 
        game.game_type === 3
      );

      // 取前 6 个游戏作为本周推荐
      const selectedGames = pgGames.slice(0, 6);

      // 转换为 GameData 格式
      const gameDataList: GameData[] = selectedGames.map((game, index) => {
        // 根据位置决定大小：第一个大图，其他小图
        const size: 'small' | 'big' = index === 1 ? 'big' : 'small';
        const marginTop = index >= 2;

        return {
          position: index,
          size,
          marginTop,
          image: game.cover || '',
          platformName: game.platform_name || 'PG',
          gameType: game.game_type || 3,
          gameCode: game.game_code || '',
          name: game.name || '',
          vendorCode: '' // 旧接口不需要 vendorCode
        };
      });

      setGames(gameDataList);
      console.log('✅ 从 game_lists 表获取到 PG 游戏:', gameDataList.length, '个');
    } catch (error) {
      console.error('❌ 处理 PG 游戏列表失败:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [gamingList, gamesLoading]);
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
                        // 使用旧接口启动游戏（从 game_lists 表获取的游戏）
                        console.log('🎮 启动本周推荐游戏:', {
                          name: game.name,
                          platformName: game.platformName,
                          gameCode: game.gameCode,
                          gameType: game.gameType
                        });
                        
                        openGame(game.platformName, game.gameType, game.gameCode);
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