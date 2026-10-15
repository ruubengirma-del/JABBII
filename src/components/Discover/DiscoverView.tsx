import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { User, VideoItem, SoundItem, HashtagItem, DiscoverTab } from '../../types';
import {
  Search,
  TrendingUp,
  Music,
  Hash,
  User as UserIcon,
  Play,
  Flame,
  Radio,
  SlidersHorizontal,
  X,
  Plus,
  Check,
} from 'lucide-react';

interface DiscoverViewProps {
  onSelectVideo: (video: VideoItem) => void;
  onOpenProfile: (username: string) => void;
  onOpenSound: (soundId: string) => void;
  onOpenHashtag: (tag: string) => void;
  onOpenLive: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onSelectVideo,
  onOpenProfile,
  onOpenSound,
  onOpenHashtag,
  onOpenLive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DiscoverTab>('top');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    '#StreetDance',
    'Elena Rostova',
    'TechReview',
    'Neon Pulse Beat',
  ]);

  const allVideos = storage.getVideos('foryou');
  const allUsers = storage.getAllUsers();
  const allSounds = storage.getSounds();
  const allHashtags = storage.getHashtags();

  // Search filtering
  const query = searchQuery.trim().toLowerCase();

  const filteredVideos = useMemo(() => {
    if (!query) return allVideos;
    return allVideos.filter(
      (v) =>
        v.caption.toLowerCase().includes(query) ||
        v.creator.username.toLowerCase().includes(query) ||
        v.creator.displayName.toLowerCase().includes(query) ||
        v.hashtags.some((t) => t.toLowerCase().includes(query))
    );
  }, [allVideos, query]);

  const filteredUsers = useMemo(() => {
    if (!query) return allUsers;
    return allUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.displayName.toLowerCase().includes(query) ||
        u.bio.toLowerCase().includes(query)
    );
  }, [allUsers, query]);

  const filteredSounds = useMemo(() => {
    if (!query) return allSounds;
    return allSounds.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.author.toLowerCase().includes(query)
    );
  }, [allSounds, query]);

  const filteredHashtags = useMemo(() => {
    if (!query) return allHashtags;
    return allHashtags.filter((h) => h.tag.toLowerCase().includes(query));
  }, [allHashtags, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 5)]);
    }
  };

  const handleFollowToggle = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    storage.toggleFollowUser(userId);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-white overflow-y-auto no-scrollbar pb-20">
      {/* Search Header Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-900">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, creators, sounds, #tags..."
            className="w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Tab navigation */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar mt-2.5 text-xs font-semibold">
          {(['top', 'users', 'videos', 'sounds', 'hashtags', 'live'] as DiscoverTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1.5 whitespace-nowrap capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'live' ? '🔴 LIVE' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recent Searches (when not searching actively) */}
        {!searchQuery && recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
              <span>Recent Searches</span>
              <button
                onClick={() => setRecentSearches([])}
                className="text-[11px] text-slate-500 hover:text-rose-400"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(s)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-xs text-slate-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Hashtags Banner Strip */}
        {(!searchQuery || activeTab === 'top' || activeTab === 'hashtags') && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Trending on JABBII</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredHashtags.slice(0, 6).map((h) => (
                <div
                  key={h.id}
                  onClick={() => onOpenHashtag(h.tag)}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-slate-850 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate group-hover:text-cyan-300">
                        #{h.tag}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(h.viewsCount / 1000000).toFixed(1)}M views
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Creators (when 'top' or 'users') */}
        {(activeTab === 'top' || activeTab === 'users') && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Featured Creators</span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onOpenProfile(user.username)}
                  className="w-36 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center shrink-0 cursor-pointer hover:border-slate-700 transition-all"
                >
                  <div className="relative mb-2">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-14 h-14 rounded-full object-cover border border-slate-700"
                    />
                    {user.isVerified && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500 text-white rounded-full text-[9px] flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-xs text-white truncate max-w-full">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full">
                    @{user.username}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                    {(user.followersCount / 1000).toFixed(0)}K followers
                  </span>

                  <button
                    onClick={(e) => handleFollowToggle(e, user.id)}
                    className={`mt-2 w-full py-1 rounded-lg text-xs font-bold transition-all ${
                      user.isFollowing
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Sounds (when 'top' or 'sounds') */}
        {(activeTab === 'top' || activeTab === 'sounds') && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
              <Music className="w-4 h-4 text-cyan-400" />
              <span>Trending Soundtracks</span>
            </div>
            <div className="space-y-2">
              {filteredSounds.map((snd) => (
                <div
                  key={snd.id}
                  onClick={() => onOpenSound(snd.id)}
                  className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={snd.coverUrl}
                      alt={snd.title}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">{snd.title}</div>
                      <div className="text-[11px] text-slate-400">{snd.author}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(snd.videoCount / 1000).toFixed(1)}K videos
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 font-bold text-xs rounded-xl shrink-0 transition-colors">
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Thumbnail Grid */}
        {(activeTab === 'top' || activeTab === 'videos') && (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-cyan-400" />
                <span>Featured Videos</span>
              </div>
              <span className="text-slate-500 text-[11px] font-normal">
                {filteredVideos.length} results
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => onSelectVideo(vid)}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group shadow-md"
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Play views count badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-mono text-white/90">
                    <Play className="w-3 h-3 fill-white" />
                    <span>{(vid.viewsCount / 1000).toFixed(0)}K</span>
                  </div>

                  {/* Creator avatar */}
                  <div className="absolute top-2 right-2">
                    <img
                      src={vid.creator.avatar}
                      alt={vid.creator.username}
                      className="w-6 h-6 rounded-full border border-white/60 object-cover"
                    />
                  </div>

                  {/* Caption snippet */}
                  <div className="absolute bottom-7 left-2 right-2 text-[10px] text-white/95 line-clamp-1 font-medium">
                    {vid.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIVE Tab */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Active Broadcasts</span>
              </div>
              <button
                onClick={onOpenLive}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" /> Go LIVE
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={onOpenLive}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 cursor-pointer group border border-slate-800"
              >
                <img
                  src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop&q=80"
                  alt="Live 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <span>LIVE</span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-mono">
                  4.2K watching
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-bold text-xs">Elena Rostova: Choreography Breakdown</div>
                  <div className="text-[10px] text-slate-300">Join real-time chat & feedback</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
