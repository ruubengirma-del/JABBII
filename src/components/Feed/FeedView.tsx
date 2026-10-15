import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, HomeFeedTab } from '../../types';
import { storage } from '../../services/storage';
import { VideoCard } from './VideoCard';
import { ChevronUp, ChevronDown, Compass, Users } from 'lucide-react';

interface FeedViewProps {
  onOpenComments: (video: VideoItem) => void;
  onOpenShare: (video: VideoItem) => void;
  onOpenProfile: (username: string) => void;
  onOpenSound: (soundId: string) => void;
  onOpenHashtag: (tag: string) => void;
  onNavigateToDiscover?: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  onOpenComments,
  onOpenShare,
  onOpenProfile,
  onOpenSound,
  onOpenHashtag,
  onNavigateToDiscover,
}) => {
  const [activeTab, setActiveTab] = useState<HomeFeedTab>('foryou');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // start muted per browser policy
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Load videos based on active tab
  useEffect(() => {
    const feedVideos = storage.getVideos(activeTab);
    setVideos(feedVideos);
    setCurrentIndex(0);
  }, [activeTab]);

  // Keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'j'].includes(e.key)) {
        e.preventDefault();
        handleNext();
      } else if (['ArrowUp', 'k'].includes(e.key)) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Touch Swipe for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) {
      handleNext();
    } else if (diff < -SWIPE_THRESHOLD) {
      handlePrev();
    }
  };

  // Wheel scroll with debouncing
  const lastWheelTime = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 600) return;

    if (e.deltaY > 30) {
      lastWheelTime.current = now;
      handleNext();
    } else if (e.deltaY < -30) {
      lastWheelTime.current = now;
      handlePrev();
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-center items-center"
    >
      {/* Top Floating Feed Tabs: Friends | Following | For You */}
      <div className="absolute top-3 left-0 right-0 z-30 flex items-center justify-center gap-4 text-sm font-bold text-white/70 select-none">
        <button
          onClick={() => setActiveTab('friends')}
          className={`transition-colors pb-1 border-b-2 ${
            activeTab === 'friends'
              ? 'text-white border-white'
              : 'border-transparent hover:text-white/90'
          }`}
        >
          Friends
        </button>
        <span className="text-white/30 text-xs">|</span>
        <button
          onClick={() => setActiveTab('following')}
          className={`transition-colors pb-1 border-b-2 ${
            activeTab === 'following'
              ? 'text-white border-white'
              : 'border-transparent hover:text-white/90'
          }`}
        >
          Following
        </button>
        <span className="text-white/30 text-xs">|</span>
        <button
          onClick={() => setActiveTab('foryou')}
          className={`transition-colors pb-1 border-b-2 ${
            activeTab === 'foryou'
              ? 'text-white border-white'
              : 'border-transparent hover:text-white/90'
          }`}
        >
          For You
        </button>
      </div>

      {/* Video Content Display */}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 text-white max-w-xs">
          <Users className="w-12 h-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-bold">No videos yet in this tab</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            {activeTab === 'following'
              ? 'Follow creators to see their latest videos right here.'
              : 'Connect with friends to discover shared video moments.'}
          </p>
          <button
            onClick={() => {
              if (onNavigateToDiscover) onNavigateToDiscover();
              else setActiveTab('foryou');
            }}
            className="py-2.5 px-5 bg-gradient-to-r from-cyan-500 to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> Explore For You Feed
          </button>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {videos.map((vid, idx) => {
            // Only render active and adjacent video cards for maximum performance
            const isNear = Math.abs(idx - currentIndex) <= 1;
            if (!isNear) return null;

            return (
              <div
                key={vid.id}
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  display: idx === currentIndex ? 'block' : 'none',
                }}
              >
                <VideoCard
                  video={vid}
                  isActive={idx === currentIndex}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onOpenComments={onOpenComments}
                  onOpenShare={onOpenShare}
                  onOpenProfile={onOpenProfile}
                  onOpenSound={onOpenSound}
                  onOpenHashtag={onOpenHashtag}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Desktop Next/Prev Controls */}
      {videos.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 absolute right-5 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 text-white flex items-center justify-center border border-slate-700/60 shadow-lg transition-transform active:scale-95"
            title="Previous Video (Arrow Up)"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === videos.length - 1}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 text-white flex items-center justify-center border border-slate-700/60 shadow-lg transition-transform active:scale-95"
            title="Next Video (Arrow Down)"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
