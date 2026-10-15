import React from 'react';
import { NavTab } from '../../types';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadCount = 0,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-slate-900/80 px-2 py-1 max-w-lg mx-auto sm:rounded-t-2xl select-none"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around h-13">
        {/* TAB 1: HOME */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors ${
            currentTab === 'home' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home Feed"
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Home</span>
        </button>

        {/* TAB 2: DISCOVER */}
        <button
          onClick={() => onTabChange('discover')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors ${
            currentTab === 'discover' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Discover"
        >
          <Compass className={`w-5 h-5 ${currentTab === 'discover' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Discover</span>
        </button>

        {/* TAB 3: CREATE (+) */}
        <button
          onClick={() => onTabChange('create')}
          className="flex items-center justify-center flex-1 min-h-[44px] group"
          aria-label="Create Video"
        >
          <div className="relative flex items-center justify-center w-11 h-7 rounded-lg group-hover:scale-105 transition-transform active:scale-95">
            {/* Cyan left offset & Rose right offset accents */}
            <div className="absolute inset-0 bg-cyan-400 rounded-lg -translate-x-1" />
            <div className="absolute inset-0 bg-rose-500 rounded-lg translate-x-1" />
            {/* Center white button */}
            <div className="relative w-9 h-7 bg-white rounded-lg flex items-center justify-center shadow-md">
              <Plus className="w-4 h-4 text-black stroke-[3]" />
            </div>
          </div>
        </button>

        {/* TAB 4: INBOX */}
        <button
          onClick={() => onTabChange('inbox')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors ${
            currentTab === 'inbox' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Inbox & Messages"
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${currentTab === 'inbox' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Inbox</span>
        </button>

        {/* TAB 5: PROFILE */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] transition-colors ${
            currentTab === 'profile' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="My Profile"
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
