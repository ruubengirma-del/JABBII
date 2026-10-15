import React from 'react';
import { storage } from '../../services/storage';
import { VideoItem } from '../../types';
import { X, Hash, Play, Bookmark, Share2 } from 'lucide-react';

interface HashtagDetailModalProps {
  hashtag: string | null;
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const HashtagDetailModal: React.FC<HashtagDetailModalProps> = ({
  hashtag,
  onClose,
  onSelectVideo,
}) => {
  if (!hashtag) return null;

  const cleanTag = hashtag.replace(/^#/, '');
  const allVideos = storage.getVideos('foryou');
  const matchingVideos = allVideos.filter(
    (v) =>
      v.hashtags.some((t) => t.toLowerCase() === cleanTag.toLowerCase()) ||
      v.caption.toLowerCase().includes(`#${cleanTag.toLowerCase()}`)
  );

  const hashtagInfo = storage.getHashtags().find((h) => h.tag.toLowerCase() === cleanTag.toLowerCase());
  const viewCount = hashtagInfo ? hashtagInfo.viewsCount : matchingVideos.reduce((acc, v) => acc + v.viewsCount, 0);

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
            <Hash className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">Hashtag Community</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Hash className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-black text-white">#{cleanTag}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {(viewCount / 1000000).toFixed(1)}M Total Views
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {matchingVideos.length} videos on JABBII
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div>
          <div className="text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wider">
            Popular Videos
          </div>

          {matchingVideos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No videos currently tagged with #{cleanTag}. Create a video with this hashtag!
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {matchingVideos.map((vid) => (
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
          )}
        </div>
      </div>
    </div>
  );
};
