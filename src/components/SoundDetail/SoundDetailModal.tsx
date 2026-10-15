import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { VideoItem, SoundItem } from '../../types';
import { X, Play, Pause, Bookmark, Music, Share2, Video } from 'lucide-react';

interface SoundDetailModalProps {
  soundId: string | null;
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onUseSound: (sound: SoundItem) => void;
}

export const SoundDetailModal: React.FC<SoundDetailModalProps> = ({
  soundId,
  onClose,
  onSelectVideo,
  onUseSound,
}) => {
  if (!soundId) return null;

  const sound = storage.getSoundById(soundId) || storage.getSounds()[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(sound.isFavorite || false);

  // Find videos using this sound
  const videos = storage.getVideos('foryou').filter((v) => v.sound.id === sound.id || v.sound.title === sound.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">Sound Attribution</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Header Card */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={sound.coverUrl}
              alt={sound.title}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-slate-700"
            />
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />}
            </button>
          </div>

          <div className="flex-1 truncate">
            <h4 className="font-extrabold text-base text-white truncate">{sound.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{sound.author}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {(sound.videoCount / 1000).toFixed(1)}K videos created with this sound
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              onUseSound(sound);
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <Video className="w-4 h-4" /> Use This Sound
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Videos using this sound */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
            <span>Videos using this sound</span>
            <span className="text-slate-500">{videos.length} videos</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  onSelectVideo(vid);
                  onClose();
                }}
                className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 cursor-pointer group shadow-md"
              >
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[10px] font-mono text-white">
                  <Play className="w-3 h-3 fill-white" />
                  <span>{(vid.viewsCount / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
