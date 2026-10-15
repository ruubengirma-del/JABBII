/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, VideoItem, User, SoundItem } from './types';
import { storage } from './services/storage';
import { JabbiiLogo } from './components/JabbiiLogo';
import { SplashScreen } from './components/SplashScreen';
import { FeedView } from './components/Feed/FeedView';
import { DiscoverView } from './components/Discover/DiscoverView';
import { CreateModal } from './components/Create/CreateModal';
import { InboxView } from './components/Inbox/InboxView';
import { ProfileView } from './components/Profile/ProfileView';
import { CommentsSheet } from './components/CommentsSheet';
import { ShareSheet } from './components/ShareSheet';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { CreatorAnalyticsModal } from './components/Analytics/CreatorAnalyticsModal';
import { AdminDashboardModal } from './components/Admin/AdminDashboardModal';
import { LiveStreamModal } from './components/Live/LiveStreamModal';
import { SoundDetailModal } from './components/SoundDetail/SoundDetailModal';
import { HashtagDetailModal } from './components/HashtagDetail/HashtagDetailModal';
import { BottomNavBar } from './components/Navigation/BottomNavBar';
import {
  Smartphone,
  Maximize2,
  Moon,
  Sun,
  Shield,
  Upload,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.isDarkMode());

  // Modals & Sheets
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);

  const [activeVideoForComments, setActiveVideoForComments] = useState<VideoItem | null>(null);
  const [activeVideoForShare, setActiveVideoForShare] = useState<VideoItem | null>(null);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);
  const [directChatUser, setDirectChatUser] = useState<User | null>(null);

  // Desktop view toggle: mobile framed vs full stretch
  const [desktopViewMode, setDesktopViewMode] = useState<'mobile-frame' | 'expanded'>('mobile-frame');

  // Handle dark mode DOM class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleOpenProfile = (username: string) => {
    const user = storage.getUserByUsername(username);
    if (user) {
      setViewProfileUser(user);
      setCurrentTab('profile');
    }
  };

  const handleStartMessage = (otherUser: User) => {
    setDirectChatUser(otherUser);
    setCurrentTab('inbox');
  };

  const handleUseSound = (sound: SoundItem) => {
    setIsCreateOpen(true);
  };

  const handleVideoCreated = (video: VideoItem) => {
    setCurrentTab('home');
  };

  // Unread notifications count for badge
  const unreadCount = storage.getNotifications().filter((n) => !n.isRead).length;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
      } flex flex-col items-center justify-center font-sans antialiased`}
    >
      {/* SPLASH SCREEN */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* DESKTOP TOP BAR (Only visible on medium and larger screens) */}
      <header className="hidden lg:flex w-full max-w-7xl items-center justify-between px-8 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <JabbiiLogo size="sm" showTagline={false} enableUploadModal={true} />
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            WATCH • CREATE • CONNECT
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="text-slate-400">Desktop View:</span>
            <button
              onClick={() => setDesktopViewMode('mobile-frame')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                desktopViewMode === 'mobile-frame'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Mobile View
            </button>
            <button
              onClick={() => setDesktopViewMode('expanded')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                desktopViewMode === 'expanded'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Full Feed
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:text-white text-slate-300 transition-colors"
            title="Toggle Light / Dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Shield className="w-3.5 h-3.5 text-rose-400" /> Admin
          </button>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-sm"
          >
            <UserIcon className="w-3.5 h-3.5" /> Switch Account
          </button>
        </div>
      </header>

      {/* MAIN APPLICATION CONTAINER */}
      <main
        className={`w-full flex-1 flex justify-center items-center py-0 ${
          desktopViewMode === 'mobile-frame' ? 'lg:py-4' : 'lg:py-0'
        }`}
      >
        <div
          className={`relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col ${
            desktopViewMode === 'mobile-frame'
              ? 'max-w-[440px] sm:rounded-3xl sm:border sm:border-slate-800 sm:shadow-2xl sm:h-[840px]'
              : 'max-w-4xl sm:h-[100dvh]'
          }`}
        >
          {/* TAB 1: HOME VERTICAL FEED */}
          {currentTab === 'home' && (
            <FeedView
              onOpenComments={(video) => setActiveVideoForComments(video)}
              onOpenShare={(video) => setActiveVideoForShare(video)}
              onOpenProfile={handleOpenProfile}
              onOpenSound={(soundId) => setActiveSoundId(soundId)}
              onOpenHashtag={(tag) => setActiveHashtag(tag)}
              onNavigateToDiscover={() => setCurrentTab('discover')}
            />
          )}

          {/* TAB 2: DISCOVER & SEARCH */}
          {currentTab === 'discover' && (
            <DiscoverView
              onSelectVideo={(video) => {
                setActiveVideoForComments(null);
                setCurrentTab('home');
              }}
              onOpenProfile={handleOpenProfile}
              onOpenSound={(soundId) => setActiveSoundId(soundId)}
              onOpenHashtag={(tag) => setActiveHashtag(tag)}
              onOpenLive={() => setIsLiveOpen(true)}
            />
          )}

          {/* TAB 3: INBOX & MESSAGING */}
          {currentTab === 'inbox' && (
            <InboxView
              onOpenProfile={handleOpenProfile}
              onOpenVideo={(videoId) => {
                setCurrentTab('home');
              }}
              directChatUser={directChatUser}
              onCloseDirectChat={() => setDirectChatUser(null)}
            />
          )}

          {/* TAB 4: PROFILE */}
          {currentTab === 'profile' && (
            <ProfileView
              user={viewProfileUser || undefined}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
              onSelectVideo={(video) => {
                setCurrentTab('home');
              }}
              onStartMessage={handleStartMessage}
            />
          )}

          {/* FIXED BOTTOM NAVIGATION BAR */}
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={(tab) => {
              if (tab === 'create') {
                setIsCreateOpen(true);
              } else {
                if (tab === 'profile') {
                  setViewProfileUser(null); // Return to self
                }
                setCurrentTab(tab);
              }
            }}
            unreadCount={unreadCount}
          />
        </div>
      </main>

      {/* MODALS AND BOTTOM SHEETS */}

      {/* 1. Create Video Modal (Camera / Upload / Editor) */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onVideoCreated={handleVideoCreated}
      />

      {/* 2. Comments Bottom Sheet */}
      {activeVideoForComments && (
        <CommentsSheet
          video={activeVideoForComments}
          isOpen={Boolean(activeVideoForComments)}
          onClose={() => setActiveVideoForComments(null)}
          onCommentCountChange={(newCount) => {
            activeVideoForComments.commentsCount = newCount;
          }}
          onUserClick={(username) => {
            setActiveVideoForComments(null);
            handleOpenProfile(username);
          }}
        />
      )}

      {/* 3. Share Bottom Sheet */}
      {activeVideoForShare && (
        <ShareSheet
          video={activeVideoForShare}
          isOpen={Boolean(activeVideoForShare)}
          onClose={() => setActiveVideoForShare(null)}
          onRepost={() => {}}
          onStartDuet={() => {
            setIsCreateOpen(true);
          }}
          onStartStitch={() => {
            setIsCreateOpen(true);
          }}
        />
      )}

      {/* 4. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setViewProfileUser(null);
        }}
      />

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={() => {
          setIsAuthOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      {/* 6. Creator Analytics */}
      <CreatorAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* 7. Admin Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 8. JABBII LIVE Modal */}
      <LiveStreamModal
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
      />

      {/* 9. Sound Detail Modal */}
      <SoundDetailModal
        soundId={activeSoundId}
        onClose={() => setActiveSoundId(null)}
        onSelectVideo={() => setCurrentTab('home')}
        onUseSound={handleUseSound}
      />

      {/* 10. Hashtag Detail Modal */}
      <HashtagDetailModal
        hashtag={activeHashtag}
        onClose={() => setActiveHashtag(null)}
        onSelectVideo={() => setCurrentTab('home')}
      />
    </div>
  );
}
