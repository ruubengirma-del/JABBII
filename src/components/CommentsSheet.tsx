import React, { useState, useEffect } from 'react';
import { CommentItem, VideoItem } from '../types';
import { storage } from '../services/storage';
import { X, Heart, Send, Pin, Trash2, Flag, ArrowUpDown, Smile } from 'lucide-react';

interface CommentsSheetProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;
  onUserClick?: (username: string) => void;
}

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '😂', '🙌', '💯', '✨', '⚡️'];

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  video,
  isOpen,
  onClose,
  onCommentCountChange,
  onUserClick,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, video.id]);

  const loadComments = () => {
    const list = storage.getComments(video.id);
    setComments([...list]);
  };

  if (!isOpen) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let textToSend = inputText.trim();
    if (replyingTo) {
      textToSend = `@${replyingTo.user.username} ${textToSend}`;
    }

    storage.addComment(video.id, textToSend);
    loadComments();
    setInputText('');
    setReplyingTo(null);
    onCommentCountChange(video.commentsCount + 1);
  };

  const handleToggleLike = (commentId: string) => {
    storage.toggleLikeComment(video.id, commentId);
    loadComments();
  };

  const handleDelete = (commentId: string) => {
    storage.deleteComment(video.id, commentId);
    loadComments();
    onCommentCountChange(Math.max(0, video.commentsCount - 1));
  };

  const handlePin = (commentId: string) => {
    if (video.creatorId !== currentUser.id) return;
    storage.pinComment(video.id, commentId);
    loadComments();
  };

  const handleReport = (commentId: string) => {
    storage.submitReport('comment', commentId, 'Inappropriate comment content');
    alert('Thank you. Comment has been flagged for moderation review.');
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (sortBy === 'top') {
      return b.likesCount - a.likesCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl h-[75vh] max-h-[640px] flex flex-col shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">
              {comments.length} Comments
            </span>
            <button
              onClick={() => setSortBy(sortBy === 'top' ? 'newest' : 'top')}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 px-2 py-0.5 rounded-full bg-slate-800"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortBy === 'top' ? 'Top' : 'Newest'}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {sortedComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
              <Smile className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            sortedComments.map((c) => {
              const isAuthor = c.userId === currentUser.id;
              const isVideoCreator = video.creatorId === currentUser.id;

              return (
                <div key={c.id} className="flex gap-3 text-sm group">
                  <img
                    src={c.user.avatar}
                    alt={c.user.username}
                    onClick={() => onUserClick?.(c.user.username)}
                    className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer hover:opacity-90"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        onClick={() => onUserClick?.(c.user.username)}
                        className="font-bold text-xs text-slate-200 cursor-pointer hover:underline"
                      >
                        {c.user.displayName}
                      </span>
                      {c.user.isVerified && (
                        <span className="w-3 h-3 rounded-full bg-cyan-500 text-[9px] text-white flex items-center justify-center">
                          ✓
                        </span>
                      )}
                      {c.userId === video.creatorId && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-400 font-semibold px-1.5 py-0.2 rounded">
                          Creator
                        </span>
                      )}
                      {c.isPinned && (
                        <span className="flex items-center gap-0.5 text-[10px] text-cyan-400 font-medium">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-0.5 break-words whitespace-pre-wrap leading-relaxed">
                      {c.content}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span>{c.createdAt}</span>
                      <button
                        onClick={() => setReplyingTo(c)}
                        className="hover:text-slate-300 font-medium"
                      >
                        Reply
                      </button>

                      {isVideoCreator && (
                        <button
                          onClick={() => handlePin(c.id)}
                          className="hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {c.isPinned ? 'Unpin' : 'Pin'}
                        </button>
                      )}

                      {isAuthor && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Delete
                        </button>
                      )}

                      {!isAuthor && (
                        <button
                          onClick={() => handleReport(c.id)}
                          className="hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Report comment"
                        >
                          <Flag className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Like Heart */}
                  <div className="flex flex-col items-center pt-1">
                    <button
                      onClick={() => handleToggleLike(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          c.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                    {c.likesCount > 0 && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {c.likesCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-1.5 flex items-center gap-2 border-t border-slate-800/80 bg-slate-900/90 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-base hover:scale-125 transition-transform shrink-0 p-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Replying banner */}
        {replyingTo && (
          <div className="px-4 py-1.5 bg-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Replying to @{replyingTo.user.username}</span>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleAddComment}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <input
            type="text"
            placeholder={
              video.commentsEnabled
                ? 'Add comment... use @ to mention'
                : 'Comments are disabled for this video'
            }
            disabled={!video.commentsEnabled}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !video.commentsEnabled}
            className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
