import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { ReportItem } from '../../types';
import {
  ShieldAlert,
  X,
  Users,
  Video,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Ban,
  Activity,
  FileText,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'videos' | 'logs'>('reports');
  const [reports, setReports] = useState<ReportItem[]>(storage.getReports());
  const users = storage.getAllUsers();
  const videos = storage.getVideos('foryou');

  if (!isOpen) return null;

  const handleResolve = (reportId: string, action: 'ban_user' | 'remove_video' | 'dismiss') => {
    storage.resolveReport(reportId, action);
    setReports([...storage.getReports()]);
  };

  const handleToggleUserBan = (userId: string) => {
    const user = storage.getUserById(userId);
    if (user) {
      user.isBanned = !user.isBanned;
      setReports([...storage.getReports()]);
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    storage.deleteVideo(videoId);
    setReports([...storage.getReports()]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base">JABBII Trust & Safety Admin Console</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'reports' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reports ({reports.filter((r) => r.status === 'pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'users' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === 'videos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Video Moderation ({videos.length})
          </button>
        </div>

        {/* TAB 1: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active moderation reports in the review queue.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      {rep.targetType} Report
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        rep.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-white font-medium">Reason: {rep.reason}</p>
                  <p className="text-slate-400 text-[11px]">
                    Reported by @{rep.reporterHandle} · Target ID: {rep.targetId}
                  </p>

                  {rep.status === 'pending' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => handleResolve(rep.id, 'dismiss')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium text-[11px]"
                      >
                        Dismiss
                      </button>
                      {rep.targetType === 'video' && (
                        <button
                          onClick={() => handleResolve(rep.id, 'remove_video')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Video
                        </button>
                      )}
                      {rep.targetType === 'user' && (
                        <button
                          onClick={() => handleResolve(rep.id, 'ban_user')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" /> Suspend User
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.username} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1">
                      <span>{u.displayName}</span>
                      {u.isVerified && <span className="text-cyan-400 text-[10px]">✓</span>}
                      {u.isBanned && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 rounded">
                          Banned
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[11px]">@{u.username}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleUserBan(u.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      u.isBanned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-rose-600/30 text-rose-400'
                    }`}
                  >
                    {u.isBanned ? 'Unban' : 'Suspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: VIDEOS MODERATION */}
        {activeTab === 'videos' && (
          <div className="space-y-2">
            {videos.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <img
                    src={v.thumbnailUrl}
                    alt={v.caption}
                    className="w-10 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-white truncate">@{v.creator.username}</p>
                    <p className="text-slate-400 truncate max-w-xs">{v.caption}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteVideo(v.id)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
