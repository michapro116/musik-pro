import React, { useState } from 'react';
import { 
  AppWindow, 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Sliders, 
  Sparkles, 
  Smartphone, 
  Layers 
} from 'lucide-react';
import { Song } from '../types/music';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AndroidWidgetSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string) => void;
}

export const AndroidWidgetSimulatorModal: React.FC<AndroidWidgetSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleFavorite
}) => {
  const [selectedWidget, setSelectedWidget] = useState<'4x1' | '4x2'>('4x2');

  if (!isOpen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Widgets de Android MiMusic Pro</h2>
              <p className="text-xs text-zinc-400">Simulador interactivo para tu pantalla de inicio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Size Selector Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setSelectedWidget('4x2')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              selectedWidget === '4x2' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Widget Expandido 4x2 (Material You)</span>
          </button>

          <button
            onClick={() => setSelectedWidget('4x1')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              selectedWidget === '4x1' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>Widget Compacto 4x1</span>
          </button>
        </div>

        {/* Phone Launcher Simulation Preview Box */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c2237] via-[#0d101a] to-[#0a0a0f] border border-indigo-500/20 overflow-hidden shadow-2xl">
          {/* Subtle phone wallpaper texture */}
          <div className="absolute top-2 left-4 text-[10px] font-mono text-indigo-300/40">
            Android 15 Launcher • Touch Preview
          </div>

          {selectedWidget === '4x2' ? (
            /* 4x2 Expanded Widget */
            <div className="bg-[#1e1e24]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-4">
                {/* Artwork */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-md bg-zinc-800">
                  {currentSong.artwork ? (
                    <img 
                      src={currentSong.artwork} 
                      alt={currentSong.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 font-bold text-zinc-400">
                      MP3
                    </div>
                  )}
                  {isPlaying && (
                    <div className="absolute bottom-1 right-1 bg-emerald-500 text-black p-1 rounded-full shadow">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                      MiMusic Pro
                    </span>
                    <button
                      onClick={() => onToggleFavorite(currentSong.id)}
                      className="text-zinc-400 hover:text-emerald-400 p-1"
                    >
                      <Heart 
                        className={`w-4 h-4 ${currentSong.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''}`} 
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-white truncate mt-0.5">
                    {currentSong.title}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {currentSong.artist}
                  </p>

                  {/* Micro waveform inside widget */}
                  <div className="mt-2 h-5 w-full overflow-hidden opacity-85">
                    <WaveformVisualizer isPlaying={isPlaying} height={20} theme="emerald" />
                  </div>
                </div>
              </div>

              {/* Progress bar in widget */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Widget Playback Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onPrev}
                  className="p-2.5 rounded-full hover:bg-white/10 text-zinc-200 transition-colors"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-12 h-12 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  className="p-2.5 rounded-full hover:bg-white/10 text-zinc-200 transition-colors"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          ) : (
            /* 4x1 Compact Pill Widget */
            <div className="bg-[#1e1e24]/90 backdrop-blur-xl border border-white/10 rounded-full p-2.5 px-4 shadow-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-800 shadow">
                  {currentSong.artwork ? (
                    <img src={currentSong.artwork} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">MP3</div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                    {currentSong.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
                    {currentSong.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onPrev}
                  className="p-1.5 text-zinc-300 hover:text-white"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={onNext}
                  className="p-1.5 text-zinc-300 hover:text-white"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Integration Explanation with Kotlin Native Code */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 text-xs space-y-1.5 text-zinc-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Código Nativo Incluido en el Proyecto Android:</span>
          </div>
          <p className="text-zinc-400">
            El archivo exportado incluye <code className="text-emerald-300 font-mono">MiMusicAppWidgetProvider.kt</code> con soporte para las clases <code className="text-zinc-200 font-mono">GlanceAppWidget</code> y <code className="text-zinc-200 font-mono">RemoteViews</code>, sincronizándose en tiempo real con <code className="text-zinc-200 font-mono">MediaSessionService</code> al cambiar de canción.
          </p>
        </div>

        {/* Close */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
