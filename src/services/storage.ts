import { User, VideoItem, CommentItem, MessageItem, NotificationItem, ReportItem, SoundItem, HashtagItem, CollectionItem } from '../types';
import { CURRENT_USER, DEMO_USERS, INITIAL_VIDEOS, INITIAL_SOUNDS, INITIAL_HASHTAGS, INITIAL_NOTIFICATIONS } from './seedData';

// IndexedDB Helper for Large Blobs (Video recordings & uploads)
const DB_NAME = 'jabbii_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

function openBlobDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(id: string, blob: Blob): Promise<string> {
  try {
    const db = await openBlobDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => {
        const objectUrl = URL.createObjectURL(blob);
        resolve(objectUrl);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return URL.createObjectURL(blob);
  }
}

export async function getVideoBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await openBlobDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result instanceof Blob) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Memory + LocalStorage Cache
class StorageService {
  private users: User[] = [];
  private currentUser: User = CURRENT_USER;
  private videos: VideoItem[] = [];
  private comments: Record<string, CommentItem[]> = {};
  private messages: MessageItem[] = [];
  private notifications: NotificationItem[] = [];
  private sounds: SoundItem[] = [];
  private hashtags: HashtagItem[] = [];
  private reports: ReportItem[] = [];
  private watchHistory: string[] = []; // video IDs
  private collections: CollectionItem[] = [];
  private customLogo: string | null = null;
  private darkMode: boolean = true;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem('jabbii_users');
      this.users = storedUsers ? JSON.parse(storedUsers) : DEMO_USERS;

      const storedUser = localStorage.getItem('jabbii_current_user');
      this.currentUser = storedUser ? JSON.parse(storedUser) : CURRENT_USER;

      const storedVideos = localStorage.getItem('jabbii_videos');
      this.videos = storedVideos ? JSON.parse(storedVideos) : INITIAL_VIDEOS;

      const storedComments = localStorage.getItem('jabbii_comments');
      if (storedComments) {
        this.comments = JSON.parse(storedComments);
      } else {
        // Seed initial comments
        this.comments['vid_1'] = [
          {
            id: 'c_1',
            videoId: 'vid_1',
            userId: 'user_2',
            user: {
              username: 'marcus_tech',
              displayName: 'Marcus Chen',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              isVerified: true,
            },
            content: 'That 360 spin transition is insane 🔥',
            likesCount: 342,
            isLiked: false,
            createdAt: '2 hours ago',
          },
          {
            id: 'c_2',
            videoId: 'vid_1',
            userId: 'user_4',
            user: {
              username: 'travel_luna',
              displayName: 'Luna Sky',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
              isVerified: true,
            },
            content: 'The lighting is perfect! Drop the camera settings please!',
            likesCount: 128,
            isLiked: true,
            createdAt: '1 hour ago',
          },
        ];
        this.comments['vid_5'] = [
          {
            id: 'c_3',
            videoId: 'vid_5',
            userId: 'user_1',
            user: {
              username: 'elena_dance',
              displayName: 'Elena Rostova',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
              isVerified: true,
            },
            content: 'Welcome to JABBII Alex! Loving this platform already 🙌',
            likesCount: 89,
            isLiked: true,
            isPinned: true,
            createdAt: '30 mins ago',
          },
        ];
      }

      const storedNotifs = localStorage.getItem('jabbii_notifs');
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;

      const storedSounds = localStorage.getItem('jabbii_sounds');
      this.sounds = storedSounds ? JSON.parse(storedSounds) : INITIAL_SOUNDS;

      const storedTags = localStorage.getItem('jabbii_tags');
      this.hashtags = storedTags ? JSON.parse(storedTags) : INITIAL_HASHTAGS;

      const storedHistory = localStorage.getItem('jabbii_watch_history');
      this.watchHistory = storedHistory ? JSON.parse(storedHistory) : ['vid_1', 'vid_2'];

      const storedLogo = localStorage.getItem('jabbii_custom_logo');
      this.customLogo = storedLogo || null;

      const storedTheme = localStorage.getItem('jabbii_dark_mode');
      this.darkMode = storedTheme !== null ? JSON.parse(storedTheme) : true;

      // Seed initial messages
      const storedMsgs = localStorage.getItem('jabbii_messages');
      if (storedMsgs) {
        this.messages = JSON.parse(storedMsgs);
      } else {
        this.messages = [
          {
            id: 'm_1',
            senderId: 'user_1',
            receiverId: this.currentUser.id,
            text: 'Hey Alex! Loved your new video upload on Jabbii! Let me know if you want to collaborate on a sound mix soon 🎧',
            createdAt: 'Yesterday, 4:15 PM',
            isRead: true,
          },
          {
            id: 'm_2',
            senderId: this.currentUser.id,
            receiverId: 'user_1',
            text: 'Elena! Thanks so much. Absolutely down for a collab, let me know when you are free!',
            createdAt: 'Yesterday, 5:20 PM',
            isRead: true,
          },
          {
            id: 'm_3',
            senderId: 'user_2',
            receiverId: this.currentUser.id,
            text: 'Did you see the new camera stabilizer I reviewed? Works super smooth on mobile.',
            createdAt: '2 hours ago',
            isRead: false,
          },
        ];
      }
    } catch (err) {
      console.warn('Storage init failed, using defaults', err);
      this.users = DEMO_USERS;
      this.currentUser = CURRENT_USER;
      this.videos = INITIAL_VIDEOS;
      this.sounds = INITIAL_SOUNDS;
      this.hashtags = INITIAL_HASHTAGS;
    }
  }

  private save() {
    try {
      localStorage.setItem('jabbii_users', JSON.stringify(this.users));
      localStorage.setItem('jabbii_current_user', JSON.stringify(this.currentUser));
      localStorage.setItem('jabbii_videos', JSON.stringify(this.videos));
      localStorage.setItem('jabbii_comments', JSON.stringify(this.comments));
      localStorage.setItem('jabbii_notifs', JSON.stringify(this.notifications));
      localStorage.setItem('jabbii_messages', JSON.stringify(this.messages));
      localStorage.setItem('jabbii_watch_history', JSON.stringify(this.watchHistory));
      localStorage.setItem('jabbii_dark_mode', JSON.stringify(this.darkMode));
      if (this.customLogo) {
        localStorage.setItem('jabbii_custom_logo', this.customLogo);
      } else {
        localStorage.removeItem('jabbii_custom_logo');
      }
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- BRAND / LOGO ---
  getCustomLogo(): string | null {
    return this.customLogo;
  }

  setCustomLogo(logoDataUrlOrPath: string | null) {
    this.customLogo = logoDataUrlOrPath;
    this.save();
  }

  // --- THEME ---
  isDarkMode(): boolean {
    return this.darkMode;
  }

  setDarkMode(isDark: boolean) {
    this.darkMode = isDark;
    this.save();
  }

  // --- USER AUTH & PROFILE ---
  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    this.save();
  }

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    const clean = username.replace(/^@/, '').toLowerCase();
    return this.users.find((u) => u.username.toLowerCase() === clean);
  }

  updateProfile(updates: Partial<User>) {
    this.currentUser = { ...this.currentUser, ...updates };
    const idx = this.users.findIndex((u) => u.id === this.currentUser.id);
    if (idx >= 0) {
      this.users[idx] = this.currentUser;
    }
    this.save();
  }

  toggleFollowUser(userId: string): boolean {
    const target = this.users.find((u) => u.id === userId);
    if (!target) return false;

    const isFollowingNow = !target.isFollowing;
    target.isFollowing = isFollowingNow;
    target.followersCount += isFollowingNow ? 1 : -1;

    this.currentUser.followingCount += isFollowingNow ? 1 : -1;

    if (isFollowingNow) {
      this.addNotification({
        type: 'follow',
        actor: {
          id: this.currentUser.id,
          username: this.currentUser.username,
          displayName: this.currentUser.displayName,
          avatar: this.currentUser.avatar,
        },
      });
    }

    this.save();
    return isFollowingNow;
  }

  // --- VIDEOS & FEED ---
  getVideos(tab: 'foryou' | 'following' | 'friends' = 'foryou'): VideoItem[] {
    if (tab === 'following') {
      const followingUserIds = this.users.filter((u) => u.isFollowing).map((u) => u.id);
      return this.videos.filter((v) => followingUserIds.includes(v.creatorId) || v.creatorId === this.currentUser.id);
    }
    if (tab === 'friends') {
      const friendIds = this.users.filter((u) => u.isFollowing).map((u) => u.id);
      return this.videos.filter((v) => friendIds.includes(v.creatorId));
    }
    return this.videos;
  }

  getVideoById(id: string): VideoItem | undefined {
    return this.videos.find((v) => v.id === id);
  }

  getVideosByCreator(creatorId: string): VideoItem[] {
    return this.videos.filter((v) => v.creatorId === creatorId);
  }

  getLikedVideos(): VideoItem[] {
    return this.videos.filter((v) => v.isLiked);
  }

  getBookmarkedVideos(): VideoItem[] {
    return this.videos.filter((v) => v.isBookmarked);
  }

  addVideo(newVideo: Omit<VideoItem, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'bookmarksCount' | 'sharesCount' | 'viewsCount' | 'isLiked' | 'isBookmarked'>): VideoItem {
    const video: VideoItem = {
      ...newVideo,
      id: `vid_${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
    };
    this.videos.unshift(video);
    this.save();
    return video;
  }

  deleteVideo(videoId: string) {
    this.videos = this.videos.filter((v) => v.id !== videoId);
    this.save();
  }

  toggleLikeVideo(videoId: string): boolean {
    const video = this.videos.find((v) => v.id === videoId);
    if (!video) return false;

    video.isLiked = !video.isLiked;
    video.likesCount += video.isLiked ? 1 : -1;

    if (video.creatorId === this.currentUser.id) {
      this.currentUser.likesCount += video.isLiked ? 1 : -1;
    }

    if (video.isLiked && video.creatorId !== this.currentUser.id) {
      this.addNotification({
        type: 'like',
        actor: {
          id: this.currentUser.id,
          username: this.currentUser.username,
          displayName: this.currentUser.displayName,
          avatar: this.currentUser.avatar,
        },
        videoId: video.id,
        videoThumbnail: video.thumbnailUrl,
      });
    }

    this.save();
    return video.isLiked;
  }

  toggleBookmarkVideo(videoId: string): boolean {
    const video = this.videos.find((v) => v.id === videoId);
    if (!video) return false;

    video.isBookmarked = !video.isBookmarked;
    video.bookmarksCount += video.isBookmarked ? 1 : -1;
    this.save();
    return video.isBookmarked;
  }

  incrementShareCount(videoId: string) {
    const video = this.videos.find((v) => v.id === videoId);
    if (video) {
      video.sharesCount += 1;
      this.save();
    }
  }

  incrementViewCount(videoId: string) {
    const video = this.videos.find((v) => v.id === videoId);
    if (video) {
      video.viewsCount += 1;
      this.addWatchHistory(videoId);
      this.save();
    }
  }

  // --- COMMENTS ---
  getComments(videoId: string): CommentItem[] {
    return this.comments[videoId] || [];
  }

  addComment(videoId: string, content: string): CommentItem {
    const video = this.videos.find((v) => v.id === videoId);
    if (!this.comments[videoId]) {
      this.comments[videoId] = [];
    }

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      videoId,
      userId: this.currentUser.id,
      user: {
        username: this.currentUser.username,
        displayName: this.currentUser.displayName,
        avatar: this.currentUser.avatar,
        isVerified: this.currentUser.isVerified,
      },
      content,
      likesCount: 0,
      isLiked: false,
      createdAt: 'Just now',
    };

    this.comments[videoId].unshift(newComment);
    if (video) {
      video.commentsCount += 1;
      if (video.creatorId !== this.currentUser.id) {
        this.addNotification({
          type: 'comment',
          actor: {
            id: this.currentUser.id,
            username: this.currentUser.username,
            displayName: this.currentUser.displayName,
            avatar: this.currentUser.avatar,
          },
          videoId: video.id,
          videoThumbnail: video.thumbnailUrl,
          commentText: content,
        });
      }
    }
    this.save();
    return newComment;
  }

  toggleLikeComment(videoId: string, commentId: string): boolean {
    const list = this.comments[videoId];
    if (!list) return false;
    const comment = list.find((c) => c.id === commentId);
    if (!comment) return false;

    comment.isLiked = !comment.isLiked;
    comment.likesCount += comment.isLiked ? 1 : -1;
    this.save();
    return comment.isLiked;
  }

  pinComment(videoId: string, commentId: string) {
    const list = this.comments[videoId];
    if (!list) return;
    list.forEach((c) => {
      c.isPinned = c.id === commentId ? !c.isPinned : false;
    });
    this.save();
  }

  deleteComment(videoId: string, commentId: string) {
    if (!this.comments[videoId]) return;
    this.comments[videoId] = this.comments[videoId].filter((c) => c.id !== commentId);
    const video = this.videos.find((v) => v.id === videoId);
    if (video && video.commentsCount > 0) {
      video.commentsCount -= 1;
    }
    this.save();
  }

  // --- MESSAGES ---
  getConversations(): { participant: User; lastMessage: MessageItem; unreadCount: number }[] {
    const convMap = new Map<string, { lastMessage: MessageItem; unreadCount: number }>();

    for (const msg of this.messages) {
      const otherId = msg.senderId === this.currentUser.id ? msg.receiverId : msg.senderId;
      const existing = convMap.get(otherId);
      const isUnread = !msg.isRead && msg.receiverId === this.currentUser.id;

      if (!existing) {
        convMap.set(otherId, {
          lastMessage: msg,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        if (isUnread) existing.unreadCount += 1;
      }
    }

    const result: { participant: User; lastMessage: MessageItem; unreadCount: number }[] = [];
    convMap.forEach((val, otherId) => {
      const user = this.getUserById(otherId);
      if (user) {
        result.push({
          participant: user,
          lastMessage: val.lastMessage,
          unreadCount: val.unreadCount,
        });
      }
    });

    return result;
  }

  getMessagesWithUser(otherUserId: string): MessageItem[] {
    return this.messages.filter(
      (m) =>
        (m.senderId === this.currentUser.id && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === this.currentUser.id)
    );
  }

  sendMessage(receiverId: string, text: string, sharedVideoId?: string): MessageItem {
    const msg: MessageItem = {
      id: `m_${Date.now()}`,
      senderId: this.currentUser.id,
      receiverId,
      text,
      createdAt: 'Just now',
      isRead: false,
      sharedVideoId,
    };
    this.messages.push(msg);
    this.save();
    return msg;
  }

  markMessagesAsRead(otherUserId: string) {
    this.messages.forEach((m) => {
      if (m.senderId === otherUserId && m.receiverId === this.currentUser.id) {
        m.isRead = true;
      }
    });
    this.save();
  }

  // --- NOTIFICATIONS ---
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) {
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: 'Just now',
      isRead: false,
    };
    this.notifications.unshift(item);
    this.save();
  }

  markNotificationsAsRead() {
    this.notifications.forEach((n) => (n.isRead = true));
    this.save();
  }

  // --- WATCH HISTORY ---
  addWatchHistory(videoId: string) {
    this.watchHistory = this.watchHistory.filter((id) => id !== videoId);
    this.watchHistory.unshift(videoId);
    if (this.watchHistory.length > 50) this.watchHistory.pop();
    this.save();
  }

  getWatchHistoryVideos(): VideoItem[] {
    return this.watchHistory
      .map((id) => this.videos.find((v) => v.id === id))
      .filter((v): v is VideoItem => Boolean(v));
  }

  clearWatchHistory() {
    this.watchHistory = [];
    this.save();
  }

  // --- SOUNDS & HASHTAGS ---
  getSounds(): SoundItem[] {
    return this.sounds;
  }

  getSoundById(id: string): SoundItem | undefined {
    return this.sounds.find((s) => s.id === id);
  }

  getHashtags(): HashtagItem[] {
    return this.hashtags;
  }

  // --- REPORTS & MODERATION ---
  submitReport(targetType: 'video' | 'comment' | 'user', targetId: string, reason: string, details?: string): ReportItem {
    const report: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: this.currentUser.id,
      reporterHandle: this.currentUser.username,
      targetType,
      targetId,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.reports.unshift(report);
    this.save();
    return report;
  }

  getReports(): ReportItem[] {
    return this.reports;
  }

  resolveReport(reportId: string, action: 'ban_user' | 'remove_video' | 'dismiss') {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return;

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';

    if (action === 'remove_video' && report.targetType === 'video') {
      this.deleteVideo(report.targetId);
    } else if (action === 'ban_user' && report.targetType === 'user') {
      const user = this.getUserById(report.targetId);
      if (user) {
        user.isBanned = true;
      }
    }
    this.save();
  }
}

export const storage = new StorageService();
