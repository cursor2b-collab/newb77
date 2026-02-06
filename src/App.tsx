import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { setGameNavigation } from './utils/gameUtils';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { getSystemConfig } from './lib/api/system';
import { Header } from './components/Header';
import { LoaderHome } from './components/LoaderHome';
import { BannerCarousel } from './components/BannerCarousel';
import { JackpotNews } from './components/JackpotNews';
import { NavigationTabs } from './components/NavigationTabs';
import { ProfitLeaderboard } from './components/ProfitLeaderboard';
import { Footer } from './components/Footer';
import { DepositPage } from './components/DepositPage';
import BottomNavigation from './components/BottomNavigation';
import { CenteredBottomNav } from './components/CenteredBottomNav';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserCenterPage from './pages/UserCenterPage';
import PromotionsListPage from './pages/PromotionsListPage';
import PromotionDetailPage from './pages/PromotionDetailPage';
import ServicePage from './pages/ServicePage';
import TestPage from './pages/TestPage';
import WithdrawPage from './pages/WithdrawPage';
import AboutPage from './pages/AboutPage';
import TutorialPage from './pages/TutorialPage';
import AppDownloadPage from './pages/AppDownloadPage';
import MoneyLogPage from './pages/MoneyLogPage';
import GameRecordPage from './pages/GameRecordPage';
import BankCardPage from './pages/BankCardPage';
import CreditPage from './pages/CreditPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import TeamPage from './pages/TeamPage';
import MessagePage from './pages/MessagePage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import BalancePage from './pages/BalancePage';
import FavoritesPage from './pages/FavoritesPage';
import RebatePage from './pages/RebatePage';
import GamePage from './pages/GamePage';
import DepositOrderDetailPage from './pages/DepositOrderDetailPage';
import VipDetailPage from './pages/VipDetailPage';
import { GameLobbyPage } from './pages/GameLobbyPage';
import { LiveCasinoPage } from './pages/LiveCasinoPage';
import PCLayout from './components/pc/PCLayout';
import PCIndexPage from './pages/pc/PCIndexPage';
import MobileLayout from './components/MobileLayout';

// 首页组件
function HomePage() {
  return (
    <MobileLayout>
      <LoaderHome />
      <Header />
      <BannerCarousel />
      <JackpotNews />
      <NavigationTabs />
      <ProfitLeaderboard />
      <Footer />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 存款页面布局
function DepositPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout>
      <DepositPage onBack={() => window.history.back()} />
      <Footer />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 个人中心页面布局
function ProfilePageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout>
      <UserCenterPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 优惠活动列表布局
function PromotionsPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <PromotionsListPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 优惠活动详情布局
function PromotionDetailPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <PromotionDetailPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 客服页面布局
function ServicePageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <ServicePage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 登录页面布局 - 使用自定义居中容器以适配 vw 单位
function LoginPageLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#151A23',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        minHeight: '100vh'
      }}>
        <LoginPage />
      </div>
    </div>
  );
}

// 注册页面布局 - 使用自定义居中容器
function RegisterPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#151A23',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        minHeight: '100vh'
      }}>
        <RegisterPage />
      </div>
    </div>
  );
}

// 借款页面布局
function CreditPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <CreditPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 提现页面布局
function WithdrawPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <WithdrawPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 关于我们页面布局
function AboutPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <AboutPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 关于我们页面布局
function TutorialPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <TutorialPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 关于我们页面布局
function AppDownloadPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <AppDownloadPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 资产记录页面布局
function MoneyLogPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <MoneyLogPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 游戏记录页面布局
function GameRecordPageLayout() {
  sessionStorage.setItem('hasVisited', 'false');
  return (
    <MobileLayout backgroundColor="#151A23">
      <GameRecordPage />
      <CenteredBottomNav>
        <BottomNavigation />
      </CenteredBottomNav>
    </MobileLayout>
  );
}

// 内部组件：设置游戏导航函数
function AppRoutes() {
  const navigate = useNavigate();
  
  // 设置全局导航函数，供 openGame 使用
  React.useEffect(() => {
    // console.log('✅ AppRoutes: 设置全局导航函数');
    setGameNavigation((path: string) => {
      // console.log('✅ AppRoutes: 导航到:', path);
      sessionStorage.setItem('hasVisited', 'false');
      navigate(path);
    });
  }, [navigate]);

  // 获取系统配置并设置网站标题
  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const res = await getSystemConfig('system');
        if (res.code === 200 && res.data) {
          const siteName = res.data.site_name || res.data.site_title || 'B77';
          document.title = siteName;
          // console.log('✅ 网站标题已设置为:', siteName);
        }
      } catch (error) {
        console.error('❌ 获取网站名称失败:', error);
      }
    };
    fetchSiteName();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPageLayout />} />
      <Route path="/register" element={<RegisterPageLayout />} />
      <Route path="/deposit" element={<DepositPageLayout />} />
      <Route path="/deposit/order-detail" element={<MobileLayout backgroundColor="#151A23"><DepositOrderDetailPage /><CenteredBottomNav><BottomNavigation /></CenteredBottomNav></MobileLayout>} />
      <Route path="/profile" element={<ProfilePageLayout />} />
      <Route path="/promotions" element={<PromotionsPageLayout />} />
      <Route path="/promotions/:id" element={<PromotionDetailPageLayout />} />
      <Route path="/service" element={<ServicePageLayout />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/withdraw" element={<WithdrawPageLayout />} />
      <Route path="/about" element={<AboutPageLayout />} />
      <Route path="/tutorial" element={<TutorialPageLayout />} />
      <Route path="/appDownload" element={<AppDownloadPageLayout />} />
      <Route path="/assets" element={<MoneyLogPageLayout />} />
      <Route path="/game-record" element={<GameRecordPageLayout />} />
      <Route path="/bankcard" element={<BankCardPage />} />
      <Route path="/borrow" element={<CreditPageLayout />} />
      <Route path="/Credit/Index" element={<CreditPageLayout />} />
      <Route path="/Credit/Record" element={<CreditPageLayout />} />
      <Route path="/Credit/Borrow" element={<CreditPageLayout />} />
      <Route path="/Credit/Repay" element={<CreditPageLayout />} />
      <Route path="/profile-detail" element={<ProfileDetailPage />} />
      <Route path="/promotion" element={<TeamPage />} />
      <Route path="/message" element={<MessagePage />} />
      <Route path="/account" element={<AccountSecurityPage />} />
      <Route path="/balance" element={<BalancePage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/rebate" element={<MobileLayout backgroundColor="#0C1017"><RebatePage /><CenteredBottomNav><BottomNavigation /></CenteredBottomNav></MobileLayout>} />
      <Route path="/gamelobby" element={<MobileLayout backgroundColor="#0f1419"><GameLobbyPage /><CenteredBottomNav><BottomNavigation /></CenteredBottomNav></MobileLayout>} />
      <Route path="/livecasino" element={<MobileLayout backgroundColor="#0f1419"><LiveCasinoPage /><CenteredBottomNav><BottomNavigation /></CenteredBottomNav></MobileLayout>} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/vip" element={<MobileLayout backgroundColor="#0C1017"><VipDetailPage /></MobileLayout>} />
      
      {/* PC端路由 */}
      <Route path="/pc" element={<PCLayout />}>
        <Route index element={<PCIndexPage />} />
        <Route path="realPerson" element={<div>真人游戏页面（待实现）</div>} />
        <Route path="electronics" element={<div>电游页面（待实现）</div>} />
        <Route path="sports" element={<div>体育页面（待实现）</div>} />
        <Route path="eSports" element={<div>电竞页面（待实现）</div>} />
        <Route path="lottery" element={<div>彩票页面（待实现）</div>} />
        <Route path="cards" element={<div>棋牌页面（待实现）</div>} />
        <Route path="discount" element={<div>优惠活动页面（待实现）</div>} />
        <Route path="accountSetting" element={<UserCenterPage />} />
        <Route path="vip" element={<VipDetailPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </GameProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}