/**
 * 优惠活动列表页面 - 正确版本
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityList, type Activity } from '@/lib/api/activity';

interface Tab {
  name: string;
  type: string;
}

export default function PromotionsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [displayList, setDisplayList] = useState<Activity[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([{ name: '全部活动', type: 'all' }]);
  const [currentTab, setCurrentTab] = useState('all');

  const convertDate = (isoDate: any) => {
    try {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}.${minutes}.${seconds}`;
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (currentTab === 'all') {
      setDisplayList(allActivities);
    } else {
      const filtered = allActivities.filter((item) => String(item.type) === String(currentTab));
      setDisplayList(filtered);
    }
  }, [currentTab, allActivities]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await getActivityList();
      if (res.code === 200) {
        let activities: Activity[] = [];
        if (Array.isArray(res.data)) {
          activities = res.data;
        } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
          activities = (res.data as any).data || [];
        }

        setAllActivities(activities);
        setDisplayList(activities);

        const typeMap: Record<string, string> = {};
        activities.forEach((item) => {
          if (item.type !== undefined && item.type !== null) {
            const typeKey = String(item.type);
            if (!typeMap[typeKey]) {
              typeMap[typeKey] = item.type_text || `活动${typeKey}`;
            }
          }
        });

        const dynamicTabs: Tab[] = [{ name: '全部活动', type: 'all' }];
        Object.keys(typeMap).sort().forEach((type) => {
          dynamicTabs.push({ name: typeMap[type], type: type });
        });
        console.log('dynamicTabs',dynamicTabs);
        setTabs(dynamicTabs);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#151a23', paddingBottom: '80px' }}>
      {/* 顶部横幅 - 单独的图片 */}
      <div style={{ width: '100%', margin: 0, padding: 0, lineHeight: 0 }}>
        <img
          src="/images/newimg/bg.avif"
          alt="活动横幅"
          style={{ display: 'block', width: '100%', height: 'auto', margin: 0, padding: 0 }}
        />
      </div>

      {/* 页头背景图 + 标签栏 */}
      <div style={{ width: '100%', marginTop: '-330px', position: 'relative', overflow: 'visible' }}>
        <img
          src="https://cy-747263170.imgix.net/header_bg.caff9723.png"
          alt="背景"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />

        {/* 活动分类标签 - 叠加在背景图上 */}
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 0',
          zIndex: 10,
          width: '100%'
        }}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              onClick={() => setCurrentTab(tab.type)}
              style={{
                padding: '8px 20px',
                margin: '0 8px',
                fontSize: '18px',
                color: currentTab === tab.type ? '#fff' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.3s',
                zIndex: 20,
                display: index > 0 ? 'none' : '',
                whiteSpace: 'nowrap',
                fontWeight: currentTab === tab.type ? 500 : 400
              }}
            >
              {tab.name.substring(0, 2)}
              {/* 指示器 - 只在激活的标签显示 */}
              {currentTab === tab.type && (
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  height: '22px',
                  backgroundImage: 'url(https://www.xpj00000.vip/indexImg/active.43ca0d4a.png)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 活动列表 */}
      <div style={{ padding: '20px 15px', position: 'relative', zIndex: 30 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '18px' }}>
            加载中...
          </div>
        ) : displayList.length > 0 ? (
          displayList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/promotions/${item.id}`)}
              style={{
                marginBottom: '15px',
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ position: 'relative', width: '100%' }}>
                <img 
                  src={item.banner} 
                  alt={item.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#ff4757',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  新活动
                </div>
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <span style={{ color: '#999', fontSize: '14px' }}>{convertDate(item.start_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '18px' }}>
            暂无活动
          </div>
        )}
      </div>
    </div>
  );
}
