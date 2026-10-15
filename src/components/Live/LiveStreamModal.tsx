import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../../services/storage';
import {
  X,
  Radio,
  Heart,
  Send,
  Users,
  Camera,
  RotateCcw,
  Flag,
  Sparkles,
  Gift,
  Share2,
} from 'lucide-react';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LiveChatMessage {
  id: string;
  sender: string;
  text: string;
  isGift?: boolean;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [streamTitle, setStreamTitle] = useState('Chillin & Vibing with JABBII Fam ⚡️');
  const [viewersCount, setViewersCount] = useState(1420);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([
    { id: '1', sender: 'elena_dance', text: 'Hey everyone!! 🔥' },
    { id: '2', sender: 'marcus_tech', text: 'Sound and video quality looking super crisp!' },
    { id: '3', sender: 'chef_marco', text: 'Greeting from Italy! 🍕' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [heartsCount, setHeartsCount] = useState(2450);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; x: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startLiveCamera();
      setIsBroadcasting(true);
    } else {
      endLive();
    }
  }, [isOpen]);

  // Simulate viewer fluctuation and occasional incoming chats
  useEffect(() => {
    if (!isOpen || !isBroadcasting) return;

    const interval = setInterval(() => {
      setViewersCount((v) => v + Math.floor(Math.random() * 7) - 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isBroadcasting]);

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Fallback
    }
  };

  const endLive = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsBroadcasting(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const user = storage.getCurrentUser();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: user.username,
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  const handleSendHeart = () => {
    setHeartsCount((h) => h + 1);
    const newHeart = { id: Date.now(), x: Math.random() * 60 + 20 };
    setFlyingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFlyingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1500);
  };

  const handleSendGift = () => {
    const user = storage.getCurrentUser();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `gift_${Date.now()}`,
        sender: user.username,
        text: 'sent a Rocket 🚀 gift!',
        isGift: true,
      },
    ]);
    handleSendHeart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl">
        {/* Live Camera Stream Video */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Fallback poster if camera denied */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-slate-900 to-cyan-950 flex flex-col items-center justify-center text-center p-6 text-white">
            <Radio className="w-12 h-12 text-rose-500 animate-pulse mb-3" />
            <h3 className="font-bold text-base">JABBII LIVE Broadcast</h3>
            <p className="text-xs text-slate-400 mt-1">{streamTitle}</p>
          </div>

          {/* Top Live Status Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] font-black uppercase text-rose-400">LIVE</span>
              <span className="text-white/40">·</span>
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <Users className="w-3 h-3" />
                <span>{viewersCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  endLive();
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg"
              >
                End LIVE
              </button>
            </div>
          </div>

          {/* Floating animated hearts */}
          <div className="absolute right-4 bottom-24 w-24 h-64 pointer-events-none overflow-hidden">
            {flyingHearts.map((h) => (
              <div
                key={h.id}
                className="absolute bottom-0 text-rose-500 animate-bounce"
                style={{
                  left: `${h.x}%`,
                  transition: 'all 1.5s ease-out',
                  transform: 'translateY(-180px) scale(1.4)',
                  opacity: 0,
                }}
              >
                ❤️
              </div>
            ))}
          </div>

          {/* Rolling Live Chat Box */}
          <div className="absolute bottom-16 left-4 right-20 z-20 max-h-48 overflow-y-auto no-scrollbar space-y-1.5 pointer-events-auto">
            {chatMessages.slice(-8).map((msg) => (
              <div
                key={msg.id}
                className={`text-xs px-2.5 py-1 rounded-xl backdrop-blur-md max-w-fit leading-tight ${
                  msg.isGift
                    ? 'bg-gradient-to-r from-amber-500/80 to-rose-500/80 text-white font-bold'
                    : 'bg-black/50 text-white/90 border border-white/5'
                }`}
              >
                <span className="font-bold text-cyan-300 mr-1.5">@{msg.sender}</span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Right Floating Reactions Column */}
          <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-3">
            {/* Heart Reaction */}
            <button
              onClick={handleSendHeart}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-rose-500 flex items-center justify-center hover:scale-110 active:scale-125 transition-transform"
            >
              <Heart className="w-6 h-6 fill-rose-500" />
            </button>
            <span className="text-[10px] text-white font-mono drop-shadow">
              {(heartsCount / 1000).toFixed(1)}k
            </span>

            {/* Gift Reaction */}
            <button
              onClick={handleSendGift}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center hover:scale-110 active:scale-125 transition-transform shadow-lg"
              title="Send Gift"
            >
              <Gift className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Chat Input Bar */}
        <form
          onSubmit={handleSendChat}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Comment in LIVE..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
