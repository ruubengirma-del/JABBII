import React, { useEffect, useState } from 'react';
import { JabbiiLogo } from './JabbiiLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 8;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white px-6 py-12 select-none">
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider px-3 py-1.5 rounded-full border border-slate-800"
        >
          Skip
        </button>
      </div>

      {/* Main Brand Hero */}
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="relative mb-6">
          <JabbiiLogo size="splash" variant="full" showTagline={false} />
          {/* Subtle ambient light behind logo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-sky-500/15 to-rose-500/10 blur-2xl rounded-full -z-10 pointer-events-none" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase">
          JABBII
        </h1>

        <p className="mt-3 text-xs sm:text-sm font-semibold tracking-[0.25em] text-slate-400 uppercase">
          WATCH • CREATE • CONNECT
        </p>

        <p className="mt-6 text-xs text-slate-500 font-normal max-w-xs leading-relaxed">
          The next-generation short video social platform. Discover trending sounds, connect with creators, and share your vision.
        </p>
      </div>

      {/* Subtle Loading Bar */}
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-rose-500 transition-all duration-150 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-500 font-mono">
          <span>Loading feed</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
