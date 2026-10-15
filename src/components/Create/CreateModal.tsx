import React, { useState, useRef, useEffect } from 'react';
import { storage, saveVideoBlob } from '../../services/storage';
import { VideoItem, SoundItem } from '../../types';
import {
  X,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Type,
  Music,
  Smile,
  Sliders,
  Check,
  Play,
  Pause,
  ArrowRight,
  Save,
  Globe,
  Lock,
  Users,
} from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoCreated: (video: VideoItem) => void;
}

type Step = 'capture' | 'edit' | 'publish';

const FILTERS = [
  { id: 'normal', name: 'Normal', css: '' },
  { id: 'warm', name: 'Cinematic Warm', css: 'sepia(30%) saturate(140%) contrast(110%)' },
  { id: 'noir', name: 'Noir Classic', css: 'grayscale(100%) contrast(140%)' },
  { id: 'cyber', name: 'Cyber Neon', css: 'hue-rotate(180deg) saturate(180%)' },
  { id: 'vintage', name: 'Vintage 90s', css: 'sepia(50%) contrast(90%) brightness(110%)' },
  { id: 'vivid', name: 'Vivid Pop', css: 'saturate(200%) contrast(120%)' },
];

const STICKERS = ['🔥', '✨', '⚡️', '🚀', '💯', '❤️', '🎉', '👑', '👀', '💃', '🍕', '⭐️'];

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onVideoCreated }) => {
  const [step, setStep] = useState<Step>('capture');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Video Media State
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  // Editor Tools
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [textOverlay, setTextOverlay] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [placedStickers, setPlacedStickers] = useState<string[]>([]);
  const [speed, setSpeed] = useState<number>(1);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(100);

  // Publish Metadata
  const [caption, setCaption] = useState<string>('');
  const [selectedSound, setSelectedSound] = useState<SoundItem>(storage.getSounds()[0]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const [duetEnabled, setDuetEnabled] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Refs
  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamObjectRef = useRef<MediaStream | null>(null);

  // Clean up streams on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('capture');
    setVideoBlob(null);
    setVideoUrl(null);
    setTextOverlay('');
    setPlacedStickers([]);
    setSelectedFilter(FILTERS[0]);
    setCaption('');
    setRecordSeconds(0);
    setIsRecording(false);
  };

  // Start Camera
  const startCamera = async () => {
    try {
      if (streamObjectRef.current) {
        streamObjectRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });

      streamObjectRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      alert('Camera access could not be initialized. You can still upload video files directly!');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamObjectRef.current) {
      streamObjectRef.current.getTracks().forEach((track) => track.stop());
      streamObjectRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    setTimeout(startCamera, 100);
  };

  // Recording
  const startRecording = () => {
    if (!streamObjectRef.current) return;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(streamObjectRef.current);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      stopCamera();
      setStep('edit');
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordSeconds(0);
  };

  // Timer while recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 60) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload file from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      setVideoBlob(file);
      setVideoUrl(URL.createObjectURL(file));
      setStep('edit');
    }
  };

  // Apply speed changes to preview
  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Publish video handler
  const handlePublish = async () => {
    if (!videoBlob && !videoUrl) return;
    setIsPublishing(true);

    const currentUser = storage.getCurrentUser();
    const videoId = `vid_${Date.now()}`;

    let finalUrl = videoUrl || '';
    if (videoBlob) {
      finalUrl = await saveVideoBlob(videoId, videoBlob);
    }

    // Extract hashtags from caption
    const hashtagsFound = (caption.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.slice(1));
    if (hashtagsFound.length === 0) hashtagsFound.push('JabbiiVibes');

    const newVideo = storage.addVideo({
      creatorId: currentUser.id,
      creator: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
        isVerified: currentUser.isVerified,
      },
      videoUrl: finalUrl,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      caption: caption || 'Created with JABBII Studio ⚡️ #JabbiiVibes',
      hashtags: hashtagsFound,
      sound: {
        id: selectedSound.id,
        title: selectedSound.title,
        author: selectedSound.author,
        coverUrl: selectedSound.coverUrl,
      },
      visibility,
      commentsEnabled,
      duetEnabled,
      filterApplied: selectedFilter.id,
    });

    setIsPublishing(false);
    onVideoCreated(newVideo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[90vh] max-h-[820px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {step === 'capture' && 'JABBII Camera & Upload'}
              {step === 'edit' && 'Video Studio Editor'}
              {step === 'publish' && 'Post Video'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CAPTURE OR UPLOAD */}
        {step === 'capture' && (
          <div className="flex-1 flex flex-col justify-between p-4 relative bg-slate-950 overflow-hidden">
            {cameraActive ? (
              <div className="relative w-full flex-1 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoStreamRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Flip camera */}
                <button
                  onClick={toggleCameraFacing}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
                  title="Flip camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Timer badge */}
                {isRecording && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs flex items-center gap-1.5 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span>00:{recordSeconds.toString().padStart(2, '0')} / 01:00</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-rose-500/20 flex items-center justify-center mb-4 text-cyan-400">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Record or Upload Video</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mb-6">
                  Share your dance, vlog, tutorial, tech demo, or moment on JABBII.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>

                  <label className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 border border-slate-700">
                    <Upload className="w-4 h-4 text-rose-400" /> Upload File
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Camera Trigger */}
            {cameraActive && (
              <div className="pt-4 flex items-center justify-around shrink-0">
                <label className="flex flex-col items-center gap-1 text-slate-400 hover:text-white cursor-pointer text-xs">
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Big Record Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all ${
                    isRecording
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-white bg-rose-500 hover:scale-105'
                  }`}
                >
                  <div
                    className={`transition-all ${
                      isRecording ? 'w-6 h-6 rounded-md bg-rose-500' : 'w-14 h-14 rounded-full bg-rose-600'
                    }`}
                  />
                </button>

                <button
                  onClick={stopCamera}
                  className="flex flex-col items-center gap-1 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: VIDEO STUDIO EDITOR */}
        {step === 'edit' && videoUrl && (
          <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto no-scrollbar">
            {/* Live Video Preview Box */}
            <div className="relative w-full h-72 sm:h-80 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              <video
                ref={previewVideoRef}
                src={videoUrl}
                loop
                autoPlay
                playsInline
                style={{ filter: selectedFilter.css }}
                className="w-full h-full object-cover"
              />

              {/* Text Overlay */}
              {textOverlay && (
                <div
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-xl px-3 py-1 rounded bg-black/40 backdrop-blur-sm pointer-events-none text-center max-w-[80%]"
                  style={{ color: textColor }}
                >
                  {textOverlay}
                </div>
              )}

              {/* Placed Stickers */}
              {placedStickers.length > 0 && (
                <div className="absolute bottom-12 left-4 flex gap-2 pointer-events-none text-2xl">
                  {placedStickers.map((s, i) => (
                    <span key={i} className="animate-bounce">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Editor Tool Controls */}
            <div className="space-y-4 my-3 text-xs">
              {/* Visual Filters */}
              <div>
                <span className="font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Visual Filter Preset
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                        selectedFilter.id === f.id
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Overlay Tool */}
              <div>
                <span className="font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-cyan-400" /> Text Overlay
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type text overlay..."
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-0.5"
                    title="Change color"
                  />
                </div>
              </div>

              {/* Stickers Tool */}
              <div>
                <span className="font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-rose-400" /> Stickers & Badges
                </span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {STICKERS.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setPlacedStickers((prev) =>
                          prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                        )
                      }
                      className={`text-lg p-1.5 rounded-xl border shrink-0 transition-transform hover:scale-125 ${
                        placedStickers.includes(s)
                          ? 'border-cyan-400 bg-cyan-950/40'
                          : 'border-slate-800 bg-slate-800/60'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Speed */}
              <div>
                <span className="font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Speed Multiplier: {speed}x
                </span>
                <div className="flex gap-2">
                  {[0.5, 1, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setSpeed(sp)}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        speed === sp
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Next Step Bar */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setStep('capture')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Retake
              </button>
              <button
                onClick={() => setStep('publish')}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-rose-500 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                Next: Publish Info <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PUBLISH SETTINGS */}
        {step === 'publish' && (
          <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto no-scrollbar space-y-4">
            <div className="space-y-4">
              {/* Caption & Hashtags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Describe your video & add #hashtags
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell your viewers about this video... #JabbiiVibes #CreateEveryday"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-1.5">
                  {['#JabbiiVibes', '#StreetDance', '#TechReview', '#FoodieTok', '#SkateLife'].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => setCaption((prev) => prev + ' ' + tag)}
                        className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded-full px-2.5 py-0.5 hover:bg-cyan-900/40 shrink-0"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Sound Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" /> Soundtrack Audio Attribution
                </label>
                <select
                  value={selectedSound.id}
                  onChange={(e) => {
                    const sound = storage.getSounds().find((s) => s.id === e.target.value);
                    if (sound) setSelectedSound(sound);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {storage.getSounds().map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — {s.author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audience Visibility */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Who can watch this video
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center ${
                      visibility === 'public'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('friends')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center ${
                      visibility === 'friends'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Friends</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center ${
                      visibility === 'private'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              {/* Permissions Toggles */}
              <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span>Allow viewers to comment</span>
                  <input
                    type="checkbox"
                    checked={commentsEnabled}
                    onChange={(e) => setCommentsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Allow Duet and Stitch reuse</span>
                  <input
                    type="checkbox"
                    checked={duetEnabled}
                    onChange={(e) => setDuetEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Publish Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setStep('edit')}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Back to Edit
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-rose-500 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isPublishing ? (
                  'Publishing...'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Publish to JABBII
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
