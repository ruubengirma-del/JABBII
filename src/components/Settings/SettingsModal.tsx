import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { JabbiiLogo } from '../JabbiiLogo';
import {
  X,
  Moon,
  Sun,
  Shield,
  Bell,
  Lock,
  Eye,
  Trash2,
  Download,
  HelpCircle,
  FileText,
  LogOut,
  Image as ImageIcon,
  History,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onOpenAdmin,
  isDarkMode,
  onToggleTheme,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [whoCanComment, setWhoCanComment] = useState<'everyone' | 'friends' | 'noone'>('everyone');
  const [whoCanMessage, setWhoCanMessage] = useState<'everyone' | 'friends' | 'noone'>('friends');
  const [historyItems, setHistoryItems] = useState(storage.getWatchHistoryVideos());
  const [showLogoModal, setShowLogoModal] = useState(false);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    storage.clearWatchHistory();
    setHistoryItems([]);
    alert('Watch history cleared.');
  };

  const handleExportData = () => {
    const data = {
      user: storage.getCurrentUser(),
      myVideos: storage.getVideosByCreator(storage.getCurrentUser().id),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jabbii-userdata-${Date.now()}.json`;
    a.click();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to permanently delete your JABBII account? All videos and followers will be removed.')) {
      onLogout();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[88vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-base tracking-wide">Settings & Privacy</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Banner with Official Logo */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JabbiiLogo size="sm" showTagline={false} />
            <div>
              <div className="font-bold text-xs text-white">JABBII Platform</div>
              <div className="text-[10px] text-slate-400">WATCH • CREATE • CONNECT</div>
            </div>
          </div>
          <button
            onClick={() => setShowLogoModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Brand Logo
          </button>
        </div>

        {/* Settings Groups */}
        <div className="space-y-4 text-xs">
          {/* Appearance & Display */}
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-2">
              Appearance
            </span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span className="font-medium text-slate-200">Theme</span>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-300 transition-colors"
              >
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>

          {/* Privacy & Safety */}
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-2">
              Privacy & Permissions
            </span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Private Account</div>
                  <div className="text-[10px] text-slate-500">Only approved followers can view your videos</div>
                </div>
                <input
                  type="checkbox"
                  checked={privateAccount}
                  onChange={(e) => setPrivateAccount(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div>
                  <div className="font-medium text-slate-200">Allow Video Downloads</div>
                  <div className="text-[10px] text-slate-500">Allow other viewers to download your published clips</div>
                </div>
                <input
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(e) => setAllowDownloads(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div>
                  <div className="font-medium text-slate-200">Who can Comment</div>
                </div>
                <select
                  value={whoCanComment}
                  onChange={(e: any) => setWhoCanComment(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends</option>
                  <option value="noone">No One</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div>
                  <div className="font-medium text-slate-200">Who can Direct Message</div>
                </div>
                <select
                  value={whoCanMessage}
                  onChange={(e: any) => setWhoCanMessage(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends Only</option>
                  <option value="noone">Nobody</option>
                </select>
              </div>
            </div>
          </div>

          {/* Watch History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Watch History ({historyItems.length})
              </span>
              {historyItems.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Clear History
                </button>
              )}
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              {historyItems.length === 0 ? (
                'Watch history is clear.'
              ) : (
                <p>
                  Watched {historyItems.length} videos recently. Your recommendations adapt to what you view.
                </p>
              )}
            </div>
          </div>

          {/* Admin & Moderation */}
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-2">
              Platform Governance
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full p-3 bg-slate-950 hover:bg-slate-850 rounded-2xl border border-slate-800 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Admin & Moderation Console</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Legal & About JABBII */}
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] block mb-2">
              About & Legal
            </span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
              <div className="flex justify-between items-center py-1">
                <span>Community Guidelines</span>
                <span className="text-slate-500 font-mono text-[11px]">v2026.1</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900">
                <span>Terms of Service & Privacy Policy</span>
                <span className="text-emerald-400 text-[11px]">Active</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-900">
                <span>Data Download</span>
                <button onClick={handleExportData} className="text-cyan-400 hover:underline font-semibold">
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2 px-4 rounded-xl hover:bg-rose-950/40 text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete or Deactivate Account
            </button>
          </div>
        </div>

        {/* Logo Modal Trigger */}
        {showLogoModal && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLogoModal(false)}
          >
            <div
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-white space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm">Official Logo Management</h4>
                <button onClick={() => setShowLogoModal(false)}>✕</button>
              </div>
              <p className="text-xs text-slate-300">
                Upload your official JABBII brand logo image or drop it into <code className="text-cyan-300">/public/jabbii-logo.png</code>
              </p>
              <JabbiiLogo size="lg" showTagline={true} enableUploadModal={true} />
              <button
                onClick={() => setShowLogoModal(false)}
                className="w-full py-2 bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
