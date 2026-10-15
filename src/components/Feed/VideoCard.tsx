import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '../../types';
import { storage } from '../../services/storage';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Plus,
  Check,
  Play,
  Volume2,
  VolumeX,
  MoreVertical,
  Flag,
} from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenComments: (video: VideoItem) => void;
  onOpenShare: (video: VideoItem) => void;
  onOpenProfile: (username: string) => void;
  onOpenSound: (soundId: string) => void;
  onOpenHashtag: (tag: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenShare,
  onOpenProfile,
  onOpenSound,
  onOpenHashtag,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(video.isLiked);
  const [likesCount, setLikesCount] = useState<number>(video.likesCount);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(video.isBookmarked);
  const [bookmarksCount, setBookmarksCount] = useState<number>(video.bookmarksCount);
  const [isFollowing, setIsFollowing] = useState<boolean>(
    Boolean(storage.getUserById(video.creatorId)?.isFollowing)
  );
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [showReportMenu, setShowReportMenu] = useState<boolean>(false);
  const lastTapRef = useRef<number>(0);

  // Auto-play/pause when active card changes
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      storage.incrementViewCount(video.id);
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy fallback: mute and retry
            videoEl.muted = true;
            videoEl.play().catch(() => {});
          });
      }
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [isActive, video.id]);

  // Keep mute state synced
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Screen click handler for Play/Pause and Double-tap like
  const handleScreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered
      if (!isLiked) {
        handleToggleLike();
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY && lastTapRef.current !== 0) {
          togglePlayPause();
          lastTapRef.current = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const togglePlayPause = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    }
  };

  const handleToggleLike = () => {
    const newLiked = storage.toggleLikeVideo(video.id);
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  const handleToggleBookmark = () => {
    const newSaved = storage.toggleBookmarkVideo(video.id);
    setIsBookmarked(newSaved);
    setBookmarksCount((prev) => (newSaved ? prev + 1 : prev - 1));
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFollowing = storage.toggleFollowUser(video.creatorId);
    setIsFollowing(newFollowing);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    storage.submitReport('video', video.id, 'Reported by viewer for community guidelines check');
    setShowReportMenu(false);
    alert('Thank you! This video has been reported to the JABBII moderation team.');
  };

  // Format large numbers cleanly
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center">
      {/* Video Content */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={handleScreenClick}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Play/Pause Center Indicator */}
      {(!isPlaying || showPlayIcon) && (
        <div
          onClick={handleScreenClick}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/90">
            <Play className="w-8 h-8 fill-white/90 translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Double-tap Heart Burst */}
      {showHeartBurst && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-heart-burst">
          <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-lg" />
        </div>
      )}

      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Mute Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* More Options / Report */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReportMenu(!showReportMenu);
            }}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showReportMenu && (
            <div
              className="absolute right-0 top-11 w-44 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-1 text-xs text-white z-40"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleReport}
                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-rose-400"
              >
                <Flag className="w-3.5 h-3.5" /> Report Video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Contrast Scrim for Text Legibility */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Left Bottom Video Info */}
      <div className="absolute bottom-5 left-4 right-18 z-20 text-white flex flex-col gap-2">
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(video.creator.username);
            }}
            className="flex items-center gap-1.5 hover:underline font-bold text-sm tracking-wide"
          >
            <span>@{video.creator.username}</span>
            {video.creator.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-[10px] text-white flex items-center justify-center">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Caption */}
        <div className="text-xs text-slate-100/90 leading-relaxed max-w-sm">
          <span className={isCaptionExpanded ? '' : 'line-clamp-2'}>
            {video.caption.split(' ').map((word, idx) => {
              if (word.startsWith('#')) {
                const tag = word.replace(/[^a-zA-Z0-9_]/g, '');
                return (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenHashtag(tag);
                    }}
                    className="font-bold text-cyan-300 hover:underline cursor-pointer mr-1"
                  >
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </span>
          {video.caption.length > 70 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCaptionExpanded(!isCaptionExpanded);
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white ml-1"
            >
              {isCaptionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Sound Attribution Marquee */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenSound(video.sound.id);
          }}
          className="flex items-center gap-2 mt-1 cursor-pointer hover:opacity-90 max-w-xs group"
        >
          <Music className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-400 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap text-xs text-slate-300 group-hover:text-cyan-300 font-medium truncate">
            {video.sound.title} - {video.sound.author}
          </div>
        </div>
      </div>

      {/* Right Sidebar Interaction Buttons */}
      <div className="absolute right-3 bottom-5 z-20 flex flex-col items-center gap-4 text-white">
        {/* Creator Avatar with Follow Button */}
        <div className="relative mb-2">
          <img
            src={video.creator.avatar}
            alt={video.creator.username}
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(video.creator.username);
            }}
            className="w-11 h-11 rounded-full object-cover border-2 border-white cursor-pointer hover:scale-105 transition-transform"
          />
          {video.creatorId !== storage.getCurrentUser().id && (
            <button
              onClick={handleFollowClick}
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isFollowing ? 'bg-slate-700 text-white' : 'bg-rose-500 text-white hover:scale-110'
              }`}
              title={isFollowing ? 'Following' : 'Follow'}
            >
              {isFollowing ? <Check className="w-3 h-3" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleLike();
            }}
            className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-125"
          >
            <Heart
              className={`w-7 h-7 drop-shadow-md transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-white/95 font-mono drop-shadow">
            {formatNumber(likesCount)}
          </span>
        </div>

        {/* Comments Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments(video);
            }}
            className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-110"
          >
            <MessageCircle className="w-7 h-7 text-white drop-shadow-md" />
          </button>
          <span className="text-[11px] font-bold text-white/95 font-mono drop-shadow">
            {formatNumber(video.commentsCount)}
          </span>
        </div>

        {/* Bookmark / Favorite */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark();
            }}
            className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-125"
          >
            <Bookmark
              className={`w-7 h-7 drop-shadow-md transition-colors ${
                isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold text-white/95 font-mono drop-shadow">
            {formatNumber(bookmarksCount)}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare(video);
            }}
            className="p-2 rounded-full hover:bg-black/30 transition-transform active:scale-110"
          >
            <Share2 className="w-7 h-7 text-white drop-shadow-md" />
          </button>
          <span className="text-[11px] font-bold text-white/95 font-mono drop-shadow">
            {formatNumber(video.sharesCount)}
          </span>
        </div>

        {/* Spinning Vinyl Music Disc */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenSound(video.sound.id);
          }}
          className="relative mt-1 cursor-pointer hover:scale-105 transition-transform"
        >
          <div
            className={`w-11 h-11 rounded-full bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center p-1 shadow-lg ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <img
              src={video.sound.coverUrl || video.creator.avatar}
              alt="Sound cover"
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>

          {/* Floating musical note */}
          {isPlaying && (
            <div className="absolute -top-3 -left-2 animate-music-note pointer-events-none text-cyan-400 text-xs">
              🎵
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
