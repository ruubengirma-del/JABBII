import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Image as ImageIcon, Upload, Check, AlertCircle } from 'lucide-react';

interface JabbiiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'splash';
  variant?: 'full' | 'icon' | 'wordmark';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  enableUploadModal?: boolean;
}

export const JabbiiLogo: React.FC<JabbiiLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  onClick,
  enableUploadModal = false,
}) => {
  const [logoSrc, setLogoSrc] = useState<string | null>(storage.getCustomLogo());
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if custom logo or default public path exists
    const custom = storage.getCustomLogo();
    if (custom) {
      setLogoSrc(custom);
      setImgFailed(false);
    } else {
      // Test default static asset path
      setLogoSrc('/jabbii-logo.png');
    }
  }, []);

  const handleImageError = () => {
    setImgFailed(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        storage.setCustomLogo(result);
        setLogoSrc(result);
        setImgFailed(false);
        setIsModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Size definitions for the logo
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
    splash: 'h-24 sm:h-28',
  };

  const textSizes = {
    xs: 'text-sm font-bold tracking-wider',
    sm: 'text-lg font-extrabold tracking-wider',
    md: 'text-2xl font-black tracking-wider',
    lg: 'text-3xl font-black tracking-wider',
    xl: 'text-5xl font-black tracking-widest',
    splash: 'text-4xl sm:text-6xl font-black tracking-widest',
  };

  const taglineSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
    splash: 'text-xs sm:text-sm',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (enableUploadModal) {
      e.stopPropagation();
      setIsModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`inline-flex flex-col items-center justify-center transition-all ${
          enableUploadModal || onClick ? 'cursor-pointer hover:opacity-95' : ''
        } ${className}`}
        title={enableUploadModal ? 'Click to inspect or upload official JABBII logo' : 'JABBII'}
      >
        {logoSrc && !imgFailed ? (
          <div className="relative flex items-center justify-center p-1 rounded-xl">
            <img
              src={logoSrc}
              alt="JABBII Official Logo"
              onError={handleImageError}
              className={`${sizeClasses[size]} object-contain max-w-full drop-shadow-sm select-none`}
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          /* Official JABBII Logo Placeholder (matches brand specs: JABBII wordmark, custom geometric glyph, and tagline) */
          <div className="flex flex-col items-center select-none">
            <div className="flex items-center gap-2">
              {variant !== 'wordmark' && (
                <div
                  className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-rose-500 shadow-md ${
                    size === 'xs'
                      ? 'w-6 h-6'
                      : size === 'sm'
                      ? 'w-8 h-8'
                      : size === 'md'
                      ? 'w-10 h-10'
                      : size === 'lg'
                      ? 'w-14 h-14'
                      : 'w-20 h-20'
                  }`}
                >
                  <span className="font-black text-white italic tracking-tighter text-center">
                    J
                  </span>
                  {/* Subtle dynamic glow ring */}
                  <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none" />
                </div>
              )}

              {variant !== 'icon' && (
                <div className="flex flex-col">
                  <span
                    className={`${textSizes[size]} bg-gradient-to-r from-white via-slate-100 to-slate-300 dark:from-white dark:to-slate-200 text-transparent bg-clip-text font-black uppercase`}
                  >
                    JABBII
                  </span>
                </div>
              )}
            </div>

            {showTagline && (
              <span
                className={`${taglineSizes[size]} mt-1 font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-400 uppercase text-center`}
              >
                WATCH • CREATE • CONNECT
              </span>
            )}
          </div>
        )}
      </div>

      {/* Official Logo Uploader Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg">Official JABBII Brand Logo</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-4 text-sm text-slate-300">
              <p>
                Per project instructions, you can upload the exact official JABBII logo image here.
                It will automatically display across the entire platform.
              </p>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-cyan-300">File Placement Instructions:</p>
                <p>• In-App: Upload any PNG, SVG, or WEBP file below.</p>
                <p>• Filesystem: Drop your image at <code className="text-pink-300">/public/jabbii-logo.png</code></p>
                <p>• Aspect Ratio: Maintained automatically without cropping or distortion.</p>
              </div>

              {/* Current Preview */}
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">Live Preview (Light & Dark check):</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[90px]">
                    <span className="text-[10px] text-slate-500 mb-2">Dark Background</span>
                    {logoSrc && !imgFailed ? (
                      <img src={logoSrc} alt="Preview" className="h-10 object-contain" />
                    ) : (
                      <span className="font-black text-xl text-white">JABBII</span>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[90px]">
                    <span className="text-[10px] text-slate-500 mb-2">Light Background</span>
                    {logoSrc && !imgFailed ? (
                      <img src={logoSrc} alt="Preview" className="h-10 object-contain" />
                    ) : (
                      <span className="font-black text-xl text-slate-900">JABBII</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Input */}
              <label className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-6 cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                <span className="text-sm font-semibold text-white">Upload Official Logo Image</span>
                <span className="text-xs text-slate-400 mt-1">PNG, SVG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {logoSrc && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Custom logo active
                  </span>
                  <button
                    onClick={() => {
                      storage.setCustomLogo(null);
                      setLogoSrc('/jabbii-logo.png');
                      setImgFailed(false);
                    }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Reset to Default
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
