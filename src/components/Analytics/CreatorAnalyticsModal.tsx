import React from 'react';
import { storage } from '../../services/storage';
import { X, TrendingUp, Eye, Heart, MessageCircle, Share2, Users, Play, Award } from 'lucide-react';

interface CreatorAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorAnalyticsModal: React.FC<CreatorAnalyticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentUser = storage.getCurrentUser();
  const myVideos = storage.getVideosByCreator(currentUser.id);

  const totalViews = myVideos.reduce((acc, v) => acc + v.viewsCount, 0);
  const totalLikes = myVideos.reduce((acc, v) => acc + v.likesCount, 0);
  const totalComments = myVideos.reduce((acc, v) => acc + v.commentsCount, 0);
  const totalShares = myVideos.reduce((acc, v) => acc + v.sharesCount, 0);

  const engagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1)
      : '0.0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base">JABBII Creator Analytics</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" /> Video Views
            </span>
            <span className="text-xl font-bold font-mono mt-1 text-white">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 font-mono">+18.4% this week</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Total Likes
            </span>
            <span className="text-xl font-bold font-mono mt-1 text-white">
              {totalLikes.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 font-mono">+12.1% this week</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-400" /> Followers
            </span>
            <span className="text-xl font-bold font-mono mt-1 text-white">
              {currentUser.followersCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 font-mono">+420 new</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Engagement
            </span>
            <span className="text-xl font-bold font-mono mt-1 text-white">{engagementRate}%</span>
            <span className="text-[10px] text-emerald-400 mt-1 font-mono">High organic reach</span>
          </div>
        </div>

        {/* 7-Day Performance Trend Chart */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300">7-Day Video Impressions & Views</span>
            <span className="text-slate-500 font-mono">Daily aggregate</span>
          </div>
          <div className="h-32 flex items-end gap-2 pt-4 px-2">
            {[45, 62, 78, 55, 92, 110, 134].map((val, idx) => {
              const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Today'];
              const heightPct = Math.round((val / 140) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-sky-400 rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${heightPct}%` }}
                    title={`${val * 100} views`}
                  />
                  <span className="text-[10px] text-slate-500 font-mono">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Video Performance Table */}
        <div>
          <div className="text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
            Video Breakdown ({myVideos.length} published)
          </div>
          <div className="space-y-2">
            {myVideos.map((vid) => (
              <div
                key={vid.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.caption}
                    className="w-10 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-white truncate max-w-xs">{vid.caption}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Created {new Date(vid.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0 font-mono text-[11px]">
                  <div>
                    <div className="text-white font-bold">{vid.viewsCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Views</div>
                  </div>
                  <div>
                    <div className="text-rose-400 font-bold">{vid.likesCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Likes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
