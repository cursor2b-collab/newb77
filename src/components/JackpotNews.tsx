import { useState, useEffect } from 'react';
import { getHomeNotices } from '@/lib/api/system';

export function JackpotNews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [news, setNews] = useState<[]>([]);


  const onToURL = (url: string) => {
    window.location.href = url;
  };

  // 获取公告数据
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await getHomeNotices();
        if (res.code === 200 && res.data && res.data.length > 0) {
          setNews(res.data);
        } else {
          // 如果没有数据，使用默认数据
          setNews([
            {
              title: '爆了爆了麻将胡了又爆大奖了，电子就玩凯发！', content: '中国公告内容', url: null
            },
            {
              title: 'K8凯发域名更新通知（2025/09/26）', content: '中国公告内容', url: null
            }
          ]);
        }
      } catch (err) {
        // 使用默认数据
        setNews([
            {
              title: '爆了爆了麻将胡了又爆大奖了，电子就玩凯发！', content: '中国公告内容', url: null
            },
            {
              title: 'K8凯发域名更新通知（2025/09/26）', content: '中国公告内容', url: null
            }
          ]);
      }
    };
    loadNotices();
  }, []);

  // 创建扩展数组，在末尾添加第一条消息的副本
  const extendedNews = news.length > 0 ? [...news, news[0]] : [];

  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [news.length]);

  useEffect(() => {
    if (news.length === 0) return;
    
    // 当滚动到复制的第一条消息时（索引为news.length），瞬间跳回真正的第一条（索引0）
    if (currentIndex === news.length) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500); // 等待过渡动画完成
    }
  }, [currentIndex, news.length]);

  return (
    <div className="px-4 py-2">
      <div className="bg-gray-900/30 backdrop-blur-md rounded-lg border border-white/10 flex items-center px-3 py-2 gap-3 shadow-lg -mt-6">
        {/* 左侧图标 */}
        <div className="flex-shrink-0">
          <img
            src="https://www.xpj00000.vip/indexImg/icon-1.61ed171d.png"
            alt="爆浆"
            className="h-6 w-auto"
          />
        </div>

        {/* 中间滚动消息 */}
        <div className="flex-1 overflow-hidden h-6">
          <div
            className={isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}
            style={{
              transform: `translateY(-${currentIndex * 24}px)`,
            }}
          >
            {extendedNews.map((item, index) => (
              <div
                key={index}
                onClick={() => onToURL(item.url)}
                style={{ cursor: 'pointer' }}
                className="h-6 flex items-center text-sm text-amber-100 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧更多按钮 */}
        <button className="flex-shrink-0">
          <img
            src="https://www.xpj00000.vip/indexImg/icon-more.2429abba.png"
            alt="更多"
            className="w-4 h-4"
          />
        </button>
      </div>
    </div>
  );
}