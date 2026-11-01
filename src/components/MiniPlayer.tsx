import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Cast, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Song, EqualizerPreset } from '../types/music';
import { WaveformVisualizer } from './WaveformVisualizer';
import { AudioQualityBadge } from './AudioQualityBadge';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  selectedPreset: EqualizerPreset;
  eqEnabled: boolean;
  gaplessEnabled: boolean;
  activeDeviceName: string;
  bassBoost?: number;
  onCycleBassBoost?: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: (songId: string) => void;
  onToggleMute: () => void;
  onChangeVolume: (val: number) => void;
  onOpenFullPlayer: () => void;
  onOpenAudioPro: () => void;
  onOpenCastModal: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  selectedPreset,
  eqEnabled,
  gaplessEnabled,
  activeDeviceName,
  bassBoost = 40,
  onCycleBassBoost,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onToggleFavorite,
  onToggleMute,
  onChangeVolume,
  onOpenFullPlayer,
  onOpenAudioPro,
  onOpenCastModal
}) => {
  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 bg-[#121217]/98 backdrop-blur-2xl border-t border-zinc-800/90 text-white select-none shadow-2xl">
      {/* Interactive Progress Bar Top Strip */}
      <div 
        className="relative w-full h-1 bg-zinc-800 hover:h-2 transition-all cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          onSeek(ratio * duration);
        }}
      >
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 group-hover:bg-emerald-400 transition-all relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Info & Artwork (expanded on mobile) */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 md:flex-initial md:max-w-[32%] cursor-pointer group"
          onClick={onOpenFullPlayer}
          title="Toca para ver reproductor completo"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-md">
            {currentSong.artwork ? (
              <img 
                src={currentSong.artwork} 
                alt={currentSong.title} 
                className={`w-full h-full object-cover transition-transform ${isPlaying ? 'scale-105' : ''}`}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                MP3
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-semibold truncate text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {currentSong.title}
              </h4>
              <AudioQualityBadge song={currentSong} size="sm" />
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              {currentSong.artist} • <span className="text-zinc-500 font-mono text-[10px]">{currentSong.bitrate || currentSong.audioFormat || 'MP3'}</span>
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(currentSong.id);
            }}
            className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors hidden sm:block"
            title={currentSong.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart 
              className={`w-4 h-4 ${currentSong.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''}`} 
            />
          </button>
        </div>

        {/* Center: Playback Controls & Time */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onPrev}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden xs:block sm:block"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
            {gaplessEnabled && (
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                GAPLESS
              </span>
            )}
          </div>
        </div>

        {/* Right: Audio Pro Status, Cast Output & Volume */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cast / Output Device Selector */}
          <button
            onClick={onOpenCastModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/50 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
            title={`Salida: ${activeDeviceName}`}
          >
            <Cast className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline truncate max-w-[90px]">{activeDeviceName}</span>
          </button>

          {/* Continuous Waveform Widget in MiniPlayer */}
          <div className="hidden lg:flex items-center w-28 h-8 bg-zinc-900/90 border border-zinc-800/80 rounded-xl px-1.5 shadow-inner" title="Onda continua sincronizada (Gapless)">
            <WaveformVisualizer isPlaying={isPlaying} height={22} theme="emerald" />
          </div>

          {/* Quick Bass Boost 1-Touch Button */}
          {onCycleBassBoost && (
            <button
              onClick={onCycleBassBoost}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm ${
                bassBoost >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-red-500 text-black border border-amber-300 ring-2 ring-amber-500/40 animate-pulse'
                  : bassBoost >= 45
                    ? 'bg-emerald-500 text-black border border-emerald-400 font-extrabold'
                    : 'bg-zinc-800/90 text-zinc-400 hover:text-white border border-zinc-700'
              }`}
              title="Refuerzo de Graves 1-Toque (Mega Bass)"
            >
              <Zap className={`w-3 h-3 ${bassBoost >= 45 ? 'fill-current' : ''}`} />
              <span>{bassBoost >= 80 ? 'MEGA BASS 🔥' : bassBoost >= 45 ? 'BASS ON ⚡' : 'BASS'}</span>
            </button>
          )}

          {/* Audio Pro Badge */}
          <button
            onClick={onOpenAudioPro}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              eqEnabled
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Abrir ecualizador Audio Pro"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[80px]">{selectedPreset}</span>
          </button>

          {/* Volume Slider */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <button
            onClick={onOpenFullPlayer}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
