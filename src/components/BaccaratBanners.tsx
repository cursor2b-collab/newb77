import { useGames } from '@/contexts/GameContext';
import { openGame } from '@/utils/gameUtils';
// import { openNewGame } from '@/utils/gameUtils';

export function BaccaratBanners() {
  const { realbetList } = useGames();
  
  // 静态广告图片（如果游戏列表为空，使用这些）
  // 使用imgix优化参数提高图片清晰度：w=宽度，q=质量，fit=适应模式，auto=format自动选择最佳格式
  const staticBanners = [
    {
      id: 1,
      image: "https://cy-747263170.imgix.net/sucai23%20(11).png?w=800&q=90&fit=max&auto=format",
      alt: "欧博视讯",
      platformName: 'OB',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 2,
      image: "https://cy-747263170.imgix.net/yibo.png?w=800&q=90&fit=max&auto=format",
      alt: "亿博视讯",
      platformName: 'YB',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 3,
      image: "https://cy-747263170.imgix.net/wanmei.png?w=800&q=90&fit=max&auto=format",
      alt: "完美视讯",
      platformName: 'WM',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 4,
      image: "https://cy-747263170.imgix.net/bgsx12png%20(1).png?w=800&q=90&fit=max&auto=format",
      alt: "BG视讯",
      platformName: 'BG',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 5,
      image: "https://cy-747263170.imgix.net/bgsx12png%20(2).png?w=800&q=90&fit=max&auto=format",
      alt: "XG视讯",
      platformName: 'XGLIVE',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 6,
      image: "https://cy-747263170.imgix.net/bgsx12png%20(3).png?w=800&q=90&fit=max&auto=format",
      alt: "DG视讯",
      platformName: 'DG',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 7,
      image: "https://cy-747263170.imgix.net/bgsx12png%20(5).png?w=800&q=90&fit=max&auto=format",
      alt: "SEXY视讯",
      platformName: 'SEXY',
      gameType: 1,
      gameCode: '0'
    },
    {
      id: 8,
      image: "https://cy-747263170.imgix.net/bcf239484a9d675c5db3ac7b46bb870b.png_.webp?w=800&q=90&fit=max&auto=format",
      alt: "BBIN视讯",
      platformName: 'BBIN',
      gameType: 1,
      gameCode: '0'
    }
  ];

  // 新游戏接口映射（根据游戏名称或平台名称）- 已注释
  // const newGameApiMap: Record<string, { vendorCode: string; gameCode: string }> = {
  //   'BBIN旗舰厅': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'BBIN视讯': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'DG视讯': { vendorCode: 'casino-sa', gameCode: 'lobby' },
  //   '完美视讯': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'EVO视讯': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'BG视讯': { vendorCode: 'casino-ezugi', gameCode: 'lobby' },
  //   // 平台名称映射
  //   'BBIN': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'DG': { vendorCode: 'casino-sa', gameCode: 'lobby' },
  //   'WM': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'EVO': { vendorCode: 'casino-playace', gameCode: 'lobby' },
  //   'BG': { vendorCode: 'casino-ezugi', gameCode: 'lobby' },
  // };

  // 使用真实游戏数据，如果游戏列表有数据，则使用前6个游戏（去除第6和第7个）
  const banners = realbetList.length > 0 
    ? realbetList.slice(0, 6).map((game, index) => ({
        id: index + 1,
        image: game.cover || staticBanners[index]?.image || '',
        alt: game.name || `百家乐游戏${index + 1}`,
        platformName: game.platform_name,
        gameType: game.game_type || game.gameType || 1,
        gameCode: game.game_code || '0'
      }))
    : staticBanners.slice(0, 6); // 静态banner也只显示前6个

  return (
    <>
      <style>{`
        .baccarat-banners-wrapper {
          background: #151A2;
          padding: 0 16px 16px 16px;
        }

        .baccarat-banners-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 0 12px;
        }
        
        @media (min-width: 768px) {
          .baccarat-banners-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .baccarat-banner-item {
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .baccarat-banner-item:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        .baccarat-banner-item img {
          width: 100%;
          height: auto;
          display: block;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: high-quality;
        }

        .baccarat-bottom-banner {
          width: 100%;
          margin-top: 12px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .baccarat-bottom-banner:active {
          transform: scale(0.98);
          opacity: 0.9;
        }

        .baccarat-bottom-banner img {
          width: 100%;
          height: auto;
          display: block;
        }

        .baccarat-banner-btn {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 32px;
          background: transparent;
          border: none;
          color: #FFB82C;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          z-index: 10;
          transition: opacity 0.2s;
        }

        .baccarat-banner-btn:active {
          opacity: 0.8;
        }

        .baccarat-banner-btn span {
          display: block;
        }

        .baccarat-top-decoration {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px !important;
          height: 50px !important;
          max-width: 50px !important;
          max-height: 50px !important;
          min-width: 50px !important;
          min-height: 50px !important;
          object-fit: cover;
          border-radius: 50%;
          z-index: 9;
          pointer-events: none;
        }
      `}</style>

      <div className="baccarat-banners-wrapper pt-[0px] pr-[0px] pb-[16px] pl-[16px]">
        <div className="baccarat-banners-container">
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="baccarat-banner-item"
              onClick={() => {
                // 新游戏API调用已全部注释掉，统一使用旧接口
                // const newGameConfig = newGameApiMap[banner.alt] || newGameApiMap[banner.platformName];
                // 
                // if (newGameConfig) {
                //   // 使用新游戏接口
                //   openNewGame(newGameConfig.vendorCode, newGameConfig.gameCode, banner.gameType);
                // } else if (banner.id === 1) {
                //   // 第一个banner使用新游戏接口（PlayAce）
                //   openNewGame('casino-playace', 'P060', 1);
                // } else {
                //   // 使用旧接口
                //   openGame(banner.platformName, banner.gameType, banner.gameCode);
                // }
                
                // 统一使用旧接口
                openGame(banner.platformName, banner.gameType, banner.gameCode);
              }}
            >
              <img 
                src={banner.image}
                alt={banner.alt}
                loading="lazy"
              />
            </div>
          ))}
        </div>
        
        {/* 底部大图 - 点击进入第一个游戏 */}
        <div 
          className="baccarat-bottom-banner"
          style={{ position: 'relative' }}
        >
          <img 
            src="/images/week/6r4xq-rrdvx.png"
            alt="百家乐推广"
            loading="lazy"
            onClick={() => {
              if (realbetList.length > 0) {
                const firstGame = realbetList[0];
                openGame(firstGame.platform_name, firstGame.game_type || firstGame.gameType || 1, firstGame.game_code || '0');
              } else {
                openGame('AG', 1, '0');
              }
            }}
          />
          {/* 按钮上方的装饰图片 */}
          <img 
            src="/images/newimg/apng_top_jr.avif"
            alt="装饰"
            className="baccarat-top-decoration"
            loading="lazy"
          />
          <button
            className="baccarat-banner-btn"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/livecasino';
            }}
          >
            <span>进入大厅</span>
          </button>
        </div>
      </div>
    </>
  );
}