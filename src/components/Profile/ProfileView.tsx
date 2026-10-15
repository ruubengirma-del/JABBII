import React, { useState } from 'react';
import { User, VideoItem, ProfileTab } from '../../types';
import { storage } from '../../services/storage';
import {
  Settings,
  Edit3,
  Share2,
  Lock,
  Grid,
  Heart,
  Bookmark,
  Repeat2,
  Play,
  Pin,
  Check,
  Plus,
  MessageCircle,
  ExternalLink,
  Shield,
  BarChart2,
} from 'lucide-react';

interface ProfileViewProps {
  user?: User; // if undefined, loads current user
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onStartMessage?: (otherUser: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user: profileUserProp,
  onOpenSettings,
  onOpenAnalytics,
  onSelectVideo,
  onStartMessage,
}) => {
  const currentUser = storage.getCurrentUser();
  const targetUser = profileUserProp || currentUser;
  const isSelf = targetUser.id === currentUser.id;

  const [activeTab, setActiveTab] = useState<ProfileTab>('videos');
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(targetUser.isFollowing));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState(targetUser.displayName);
  const [editBio, setEditBio] = useState(targetUser.bio);
  const [editWebsite, setEditWebsite] = useState(targetUser.website || '');
  const [editAvatar, setEditAvatar] = useState(targetUser.avatar);

  // Videos
  const creatorVideos = storage.getVideosByCreator(targetUser.id);
  const likedVideos = storage.getLikedVideos();
  const bookmarkedVideos = storage.getBookmarkedVideos();

  const handleFollowToggle = () => {
    const next = storage.toggleFollowUser(targetUser.id);
    setIsFollowing(next);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateProfile({
      displayName: editDisplayName,
      bio: editBio,
      website: editWebsite,
      avatar: editAvatar,
    });
    setIsEditModalOpen(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto no-scrollbar pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md px-4 py-3 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-wide">@{targetUser.username}</span>
          {targetUser.isVerified && (
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-[10px] text-white flex items-center justify-center">
              ✓
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSelf && (
            <>
              <button
                onClick={onOpenAnalytics}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-full hover:bg-slate-900 transition-colors"
                title="Creator Analytics"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors"
                title="Settings & Privacy"
              >
                <Settings className="w-5 h-5" />
              </button>
            </>
          )}
          {!isSelf && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Bio Section */}
      <div className="px-5 pt-4 pb-2 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-3">
          <img
            src={targetUser.avatar}
            alt={targetUser.username}
            className="w-24 h-24 rounded-full object-cover border-2 border-slate-800 shadow-xl"
          />
          {targetUser.isVerified && (
            <span className="absolute bottom-1 right-1 w-6 h-6 bg-cyan-500 text-white rounded-full text-xs flex items-center justify-center border-2 border-slate-950">
              ✓
            </span>
          )}
        </div>

        <h2 className="text-lg font-black text-white">{targetUser.displayName}</h2>
        <span className="text-xs text-slate-400 font-medium">@{targetUser.username}</span>

        {/* Follower Stats Strip */}
        <div className="flex items-center gap-6 my-4 py-2 border-y border-slate-900/80 w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-base text-white">
              {formatNumber(targetUser.followingCount)}
            </span>
            <span className="text-[11px] text-slate-400">Following</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-base text-white">
              {formatNumber(targetUser.followersCount)}
            </span>
            <span className="text-[11px] text-slate-400">Followers</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-base text-white">
              {formatNumber(targetUser.likesCount)}
            </span>
            <span className="text-[11px] text-slate-400">Likes</span>
          </div>
        </div>

        {/* Action Buttons: Edit Profile or Follow / Message */}
        <div className="flex gap-2.5 w-full max-w-xs mb-4">
          {isSelf ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleFollowToggle}
                className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isFollowing
                    ? 'bg-slate-800 border border-slate-700 text-slate-300'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Following
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Follow
                  </>
                )}
              </button>
              <button
                onClick={() => onStartMessage?.(targetUser)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Message
              </button>
            </>
          )}
        </div>

        {/* Bio Text */}
        <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-2">
          {targetUser.bio || 'No bio yet.'}
        </p>

        {targetUser.website && (
          <a
            href={targetUser.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{targetUser.website.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
      </div>

      {/* Tabs: Videos | Reposts | Favorites | Liked */}
      <div className="flex border-b border-slate-800 mt-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-cyan-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Uploaded Videos"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('reposts')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'reposts'
              ? 'border-cyan-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Reposts"
        >
          <Repeat2 className="w-4 h-4" />
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            title="Favorites & Saved"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'liked'
              ? 'border-cyan-400 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Liked Videos"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content: Video Grids */}
      <div className="p-2">
        {activeTab === 'videos' && (
          <div>
            {creatorVideos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No videos uploaded yet. Tap (+) to create the first video!
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {creatorVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 cursor-pointer group shadow-sm"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Pinned badge */}
                    {vid.isPinned && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-rose-500/90 text-[9px] font-bold text-white flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </div>
                    )}

                    {/* View count */}
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] font-mono text-white/90">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{formatNumber(vid.viewsCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reposts' && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No reposted videos yet.
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {bookmarkedVideos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                You haven't saved any videos to your favorites yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {bookmarkedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 cursor-pointer group"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] font-mono text-white">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{formatNumber(vid.viewsCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            {likedVideos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Videos liked will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {likedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 cursor-pointer group"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] font-mono text-white">
                      <Play className="w-3 h-3 fill-white" />
                      <span>{formatNumber(vid.viewsCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base">Edit JABBII Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
