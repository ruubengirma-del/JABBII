import React, { useState } from 'react';
import { VideoItem } from '../types';
import { storage } from '../services/storage';
import {
  X,
  Link2,
  Repeat2,
  Send,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Scissors,
  Split,
  Download,
} from 'lucide-react';

interface ShareSheetProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onRepost?: () => void;
  onStartDuet?: () => void;
  onStartStitch?: () => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  video,
  isOpen,
  onClose,
  onRepost,
  onStartDuet,
  onStartStitch,
}) => {
  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(video.isReposted || false);
  const users = storage.getAllUsers().filter((u) => u.id !== storage.getCurrentUser().id);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#video_${video.id}`;
    navigator.clipboard?.writeText(url);
    storage.incrementShareCount(video.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepost = () => {
    setReposted(!reposted);
    video.isReposted = !reposted;
    storage.incrementShareCount(video.id);
    onRepost?.();
    setTimeout(onClose, 600);
  };

  const handleSendToUser = (user: (typeof users)[0]) => {
    storage.sendMessage(user.id, `Shared video from @${video.creator.username}`, video.id);
    storage.incrementShareCount(video.id);
    alert(`Video sent to @${user.username} in Direct Messages!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto" />

        <div className="flex items-center justify-between">
          <span className="font-bold text-sm tracking-wide">Share video to</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Send to JABBII Friends (One-tap direct share) */}
        <div>
          <span className="text-xs text-slate-400 font-semibold mb-2.5 block">
            Send to JABBII Friends
          </span>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSendToUser(u)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="relative">
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950">
                    <Send className="w-2.5 h-2.5" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-300 max-w-[60px] truncate">
                  {u.displayName.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Share Actions */}
        <div>
          <span className="text-xs text-slate-400 font-semibold mb-2.5 block">
            Actions & Duet
          </span>
          <div className="grid grid-cols-4 gap-3 text-center">
            {/* Repost */}
            <button
              onClick={handleRepost}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  reposted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">
                {reposted ? 'Reposted' : 'Repost'}
              </span>
            </button>

            {/* Duet */}
            <button
              onClick={() => {
                onStartDuet?.();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center">
                <Split className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Duet</span>
            </button>

            {/* Stitch */}
            <button
              onClick={() => {
                onStartStitch?.();
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-300">Stitch</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  copied ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
              </div>
              <span className="text-[11px] font-medium text-slate-300">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Direct Link Bar */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate pr-2">
            <Link2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="truncate">https://jabbii.video/#video_{video.id}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shrink-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
