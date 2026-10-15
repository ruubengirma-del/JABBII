import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { JabbiiLogo } from './JabbiiLogo';
import { X, Mail, Lock, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify' | 'switch'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      // Find or log in user
      const allUsers = storage.getAllUsers();
      const matched = allUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() || u.id === 'user_me'
      ) || storage.getCurrentUser();

      storage.setCurrentUser(matched);
      onAuthSuccess(matched);
      onClose();
    }, 600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatusMessage('Please enter a unique username');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'new_creator',
        displayName: displayName || username,
        avatar:
          avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'New creator on JABBII ⚡️ WATCH • CREATE • CONNECT',
        isVerified: false,
        followersCount: 0,
        followingCount: 1,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };

      storage.setCurrentUser(newUser);
      setMode('verify');
    }, 700);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const googleUser: User = {
        id: 'user_google_connected',
        username: 'google_creator',
        displayName: 'Google Connected User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Authenticated via Google account on JABBII ⚡️',
        isVerified: true,
        followersCount: 120,
        followingCount: 15,
        likesCount: 450,
        createdAt: new Date().toISOString(),
      };
      storage.setCurrentUser(googleUser);
      onAuthSuccess(googleUser);
      onClose();
    }, 600);
  };

  const handleSwitchAccount = (user: User) => {
    storage.setCurrentUser(user);
    onAuthSuccess(user);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <JabbiiLogo size="md" showTagline={false} />
          <h2 className="text-xl font-bold mt-3 text-white">
            {mode === 'login' && 'Welcome back to JABBII'}
            {mode === 'signup' && 'Create your JABBII Account'}
            {mode === 'forgot' && 'Reset your Password'}
            {mode === 'verify' && 'Verify your Email'}
            {mode === 'switch' && 'Switch Active Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">WATCH • CREATE • CONNECT</p>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {statusMessage}
          </div>
        )}

        {/* Quick Test Accounts Switcher Bar */}
        {mode !== 'verify' && (
          <div className="mb-6 p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-cyan-300">Quick Test Profiles:</span>
              <button
                type="button"
                onClick={() => setMode(mode === 'switch' ? 'login' : 'switch')}
                className="text-cyan-400 hover:underline"
              >
                {mode === 'switch' ? 'Back to Form' : 'View all'}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {storage.getAllUsers().slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSwitchAccount(u)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-left shrink-0 transition-colors border border-slate-700/50"
                >
                  <img src={u.avatar} alt={u.username} className="w-5 h-5 rounded-full object-cover" />
                  <span className="truncate max-w-[80px]">@{u.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. jabbii_creator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-rose-500 hover:opacity-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing In...' : 'Log In to JABBII'}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-slate-900 px-3 text-xs text-slate-500">OR</span>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="pt-4 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-cyan-400 hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* MODE: SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Choose Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-slate-500">@</span>
                <input
                  type="text"
                  required
                  placeholder="unique_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your Public Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-rose-500 hover:opacity-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-cyan-400 hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your registered email address and we'll send a password recovery reset link to your inbox.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusMessage('Reset instructions sent to your email address!');
                setTimeout(() => setMode('login'), 1500);
              }}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl text-sm"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-slate-400 hover:underline text-center"
            >
              Return to Login
            </button>
          </div>
        )}

        {/* MODE: EMAIL VERIFY CONFIRMATION */}
        {mode === 'verify' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white">Welcome to JABBII!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Your profile has been created successfully. A verification code has been dispatched. You can now explore feeds and upload videos!
            </p>
            <button
              onClick={() => {
                onAuthSuccess(storage.getCurrentUser());
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-rose-500 font-bold text-sm text-white rounded-xl flex items-center justify-center gap-2"
            >
              Start Watching & Creating <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODE: SWITCH ACCOUNT */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-3">
              Select one of the community accounts to test how JABBII behaves across multiple creators:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {storage.getAllUsers().map((u) => {
                const isCurrent = u.id === storage.getCurrentUser().id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSwitchAccount(u)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors border ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <span>{u.displayName}</span>
                          {u.isVerified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-[10px] text-white flex items-center justify-center">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">@{u.username}</div>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-[11px] font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-900/40">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Switch</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setMode('login')}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
