import React from 'react';
import { openGame } from '@/utils/gameUtils';

export function RecommendedGames() {
  const games = [
    {
      position: 0,
      size: 'small',
      image: '/images/6b95ffd319c76b3cdd349fac4955a1b5.png_.webp',
      platformName: 'PL', // Pragmatic Live
      gameType: 1,
      gameCode: 'geogamingh2rw545',
      name: 'VIP 自动轮盘'
    },
    {
      position: 1,
      size: 'big',
      image: 'https://www.xpj00000.vip/indexImg/026_45_1.png_.webp',
      platformName: 'AG',
      gameType: 1,
      gameCode: '0'
    },
    {
      position: 2,
      size: 'small',
      marginTop: true,
      image: '/images/f7a09c5f491e769eedb7a7c5f7ac5dce.png_.webp',
      platformName: 'PL', // Pragmatic Live
      gameType: 1,
      gameCode: 'mbc371rpmfmbc371',
      name: '百家乐'
    },
    {
      position: 3,
      size: 'small',
      marginTop: true,
      image: 'https://www.xpj00000.vip/indexImg/058.png_.webp',
      platformName: 'EVO',
      gameType: 1,
      gameCode: '0'
    },
    {
      position: 4,
      size: 'small',
      marginTop: true,
      image: '/images/newimg/062.png',
      platformName: 'AI',
      gameType: 5, // 体育
      gameCode: '0'
    },
    {
      position: 7,
      size: 'small',
      marginTop: true,
      image: 'https://www.xpj00000.vip/indexImg/074_830.png_.webp',
      platformName: 'KY',
      gameType: 6,
      gameCode: '830'
    },
    {
      position: 8,
      size: 'small',
      marginTop: true,
      image: '/images/newimg/cjnb.png',
      platformName: 'JDB',
      gameType: 3,
      gameCode: '14045' // 超级牛B 豪华版
    }
  ];

  return (
    <>
      <style>{`
        .recommend-list {
          width: 100%;
          padding: 0 0.16rem;
          margin-bottom: 0.2rem;
        }

        .recommend-list .public-module {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.15rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .recommend-list .item {
          position: relative;
          overflow: hidden;
          border-radius: 0.08rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .recommend-list .item:active {
          transform: scale(0.98);
        }

        .recommend-list .home-intro-game-card {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .recommend-list .home-intro-game-card img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          border-radius: 0.08rem;
        }

        .recommend-list .home-intro-game-card.small {
          aspect-ratio: 1.72;
        }

        .recommend-list .home-intro-game-card.big {
          aspect-ratio: 0.86;
          grid-row: span 2;
        }

        .recommend-list .item.position_0 {
          grid-column: 1;
          grid-row: 1;
        }

        .recommend-list .item.position_1 {
          grid-column: 2;
          grid-row: 1 / span 2;
        }

        .recommend-list .item.position_2 {
          grid-column: 1;
          grid-row: 2;
        }

        .recommend-list .item.position_3 {
          grid-column: 1;
          grid-row: 3;
        }

        .recommend-list .item.position_4 {
          grid-column: 2;
          grid-row: 3;
        }

        .recommend-list .item.position_7 {
          grid-column: 1;
          grid-row: 4;
        }

        .recommend-list .item.position_8 {
          grid-column: 2;
          grid-row: 4;
        }
      `}</style>

      <div className="recommend-list">
        <ul className="public-module">
          {games.map((game) => (
            <li 
              key={game.position} 
              className={`item position_${game.position}`}
              onClick={async () => {
                // 所有游戏都使用 openGame 函数，在当前页面内打开（使用 iframe）
                openGame(game.platformName, game.gameType, game.gameCode);
              }}
            >
              <div className={`home-intro-game-card ${game.size}`}>
                <img 
                  src={game.image} 
                  alt={game.name || `Game ${game.position}`}
                  loading="lazy"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}