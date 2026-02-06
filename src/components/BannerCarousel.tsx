import { useState, useEffect } from 'react';
import { getBanners } from '@/lib/api/system';

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<string[]>([]);

  // 获取轮播图数据
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await getBanners(2); // type: 2 = mobile1
        if (res.code === 200 && res.data && res.data.length > 0) {
          setBanners(res.data.map((item: any) => item.src || item.url || ''));
        } else {
          // 如果没有数据，使用默认数据
          setBanners([
            'https://www.xpj00000.vip/indexImg/a3c5a243c548ec8490c7a926a74c27bc.jpg_.webp',
            'https://www.xpj00000.vip/indexImg/5b69e8f06b714db2aea98ca13f2dea05.jpg_.webp',
            'https://www.xpj00000.vip/indexImg/31814cf135293179d2232093aaaabe5d.jpg_.webp',
            'https://www.xpj00000.vip/indexImg/fc52919dbf2f2c9b140ebd945f825ddf.jpg_.webp',
          ]);
        }
      } catch (err) {
        // 使用默认数据
        setBanners([
          'https://www.xpj00000.vip/indexImg/a3c5a243c548ec8490c7a926a74c27bc.jpg_.webp',
          'https://www.xpj00000.vip/indexImg/5b69e8f06b714db2aea98ca13f2dea05.jpg_.webp',
        ]);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="px-4 py-3">
      <div className="relative rounded-lg overflow-hidden">
        {/* 轮播图片 */}
        <div className="relative w-full h-40">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* 指示器圆点 */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`切换到第 ${index + 1} 张`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}