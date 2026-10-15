export type NavTab = 'home' | 'discover' | 'create' | 'inbox' | 'profile';
export type HomeFeedTab = 'foryou' | 'following' | 'friends';
export type DiscoverTab = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags' | 'live';
export type ProfileTab = 'videos' | 'reposts' | 'favorites' | 'liked';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  website?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface VideoItem {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
  };
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  sound: {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isReposted?: boolean;
  isPinned?: boolean;
  createdAt: string;
  visibility: 'public' | 'friends' | 'private';
  commentsEnabled: boolean;
  duetEnabled?: boolean;
  filterApplied?: string;
}

export interface CommentItem {
  id: string;
  videoId: string;
  userId: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  likesCount: number;
  isLiked: boolean;
  isPinned?: boolean;
  createdAt: string;
  replies?: CommentItem[];
}

export interface SoundItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  audioUrl?: string;
  durationSeconds: number;
  videoCount: number;
  isFavorite?: boolean;
}

export interface HashtagItem {
  id: string;
  tag: string;
  viewsCount: number;
  videosCount: number;
  isTrending?: boolean;
}

export interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  sharedVideoId?: string;
  attachmentUrl?: string;
}

export interface ConversationItem {
  id: string;
  participant: User;
  lastMessage: MessageItem;
  unreadCount: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  videoId?: string;
  videoThumbnail?: string;
  commentText?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterHandle: string;
  targetType: 'video' | 'comment' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface LiveStreamItem {
  id: string;
  host: User;
  title: string;
  coverUrl: string;
  viewerCount: number;
  startedAt: string;
  isLive: boolean;
}

export interface CollectionItem {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: string;
}
