import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../../services/storage';
import { User, MessageItem, NotificationItem } from '../../types';
import {
  Bell,
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Heart,
  UserPlus,
  CheckCheck,
  Check,
  Smile,
  Video,
  MoreVertical,
  ShieldAlert,
} from 'lucide-react';

interface InboxViewProps {
  onOpenProfile: (username: string) => void;
  onOpenVideo?: (videoId: string) => void;
  directChatUser?: User | null;
  onCloseDirectChat?: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  onOpenProfile,
  onOpenVideo,
  directChatUser: initialChatUser,
  onCloseDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<
    { participant: User; lastMessage: MessageItem; unreadCount: number }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(initialChatUser || null);
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [notifFilter, setNotifFilter] = useState<'all' | 'likes' | 'comments' | 'followers'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    loadInboxData();
  }, []);

  useEffect(() => {
    if (initialChatUser) {
      setSelectedUser(initialChatUser);
      setActiveTab('messages');
    }
  }, [initialChatUser]);

  useEffect(() => {
    if (selectedUser) {
      storage.markMessagesAsRead(selectedUser.id);
      loadConversationWith(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadInboxData = () => {
    setNotifications(storage.getNotifications());
    setConversations(storage.getConversations());
  };

  const loadConversationWith = (otherId: string) => {
    const msgs = storage.getMessagesWithUser(otherId);
    setChatMessages([...msgs]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    storage.sendMessage(selectedUser.id, inputMessage.trim());
    setInputMessage('');
    loadConversationWith(selectedUser.id);
    setConversations(storage.getConversations());
  };

  const handleMarkAllRead = () => {
    storage.markNotificationsAsRead();
    loadInboxData();
  };

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'likes') return n.type === 'like';
    if (notifFilter === 'comments') return n.type === 'comment';
    if (notifFilter === 'followers') return n.type === 'follow';
    return true;
  });

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col overflow-hidden pb-16">
      {/* If in Direct Message Chat Window */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col h-full bg-slate-950">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  onCloseDirectChat?.();
                  loadInboxData();
                }}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                onClick={() => onOpenProfile(selectedUser.username)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>{selectedUser.displayName}</span>
                    {selectedUser.isVerified && (
                      <span className="w-3 h-3 rounded-full bg-cyan-500 text-[8px] text-white flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-400">Active now</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                storage.submitReport('user', selectedUser.id, 'Report user from direct messages');
                alert(`Report filed for @${selectedUser.username}`);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400"
              title="Report user"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Start your conversation with @{selectedUser.username}!
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isMine
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/60'
                      }`}
                    >
                      {msg.text}

                      {/* Shared Video card if attached */}
                      {msg.sharedVideoId && (
                        <div
                          onClick={() => onOpenVideo?.(msg.sharedVideoId!)}
                          className="mt-2 p-2 bg-black/40 rounded-xl cursor-pointer hover:bg-black/60 flex items-center gap-2 border border-white/10"
                        >
                          <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-[11px] font-semibold truncate">
                            Watch Attached Video
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 px-1 font-mono">
                      <span>{msg.createdAt}</span>
                      {isMine && (
                        <CheckCheck className="w-3 h-3 text-cyan-400 inline-block ml-0.5" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={`Message @${selectedUser.username}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Standard Inbox: Messages / Activity Switcher */
        <div className="flex-1 flex flex-col h-full">
          {/* Top Tabs */}
          <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold tracking-wide">Inbox</h2>
              {activeTab === 'notifications' && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Messages
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" /> Activity
              </button>
            </div>
          </div>

          {/* TAB 1: DIRECT MESSAGES LIST */}
          {activeTab === 'messages' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Recent Chats</span>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active conversations yet. Visit any creator profile and tap "Message" to connect!
                </div>
              ) : (
                conversations.map(({ participant, lastMessage, unreadCount }) => (
                  <div
                    key={participant.id}
                    onClick={() => setSelectedUser(participant)}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative shrink-0">
                        <img
                          src={participant.avatar}
                          alt={participant.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <span>{participant.displayName}</span>
                          {participant.isVerified && (
                            <span className="w-3 h-3 rounded-full bg-cyan-500 text-[8px] text-white flex items-center justify-center">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {lastMessage.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {lastMessage.createdAt}
                      </span>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS / ACTIVITY */}
          {activeTab === 'notifications' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Category Pills */}
              <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-900">
                {(['all', 'likes', 'comments', 'followers'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setNotifFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                      notifFilter === f
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Notification Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No activity notifications yet.
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl border transition-colors flex items-center justify-between ${
                        n.isRead
                          ? 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                          : 'bg-slate-900 border-cyan-500/30 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={n.actor.avatar}
                          alt={n.actor.username}
                          onClick={() => onOpenProfile(n.actor.username)}
                          className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer"
                        />
                        <div className="text-xs">
                          <div>
                            <span
                              onClick={() => onOpenProfile(n.actor.username)}
                              className="font-bold hover:underline cursor-pointer"
                            >
                              @{n.actor.username}
                            </span>{' '}
                            {n.type === 'like' && 'liked your video'}
                            {n.type === 'comment' && 'commented on your video'}
                            {n.type === 'follow' && 'started following you'}
                          </div>
                          {n.commentText && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 italic">
                              "{n.commentText}"
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {n.createdAt}
                          </div>
                        </div>
                      </div>

                      {n.videoThumbnail && (
                        <img
                          src={n.videoThumbnail}
                          alt="Video thumbnail"
                          onClick={() => n.videoId && onOpenVideo?.(n.videoId)}
                          className="w-10 h-13 rounded-lg object-cover shrink-0 cursor-pointer border border-slate-800"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
