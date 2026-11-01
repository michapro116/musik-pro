import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Sliders, 
  ListMusic, 
  Volume2, 
  VolumeX, 
  Moon, 
  FileText, 
  Trash2, 
  Cast, 
  Sparkles, 
  Tag,
  Car,
  Smartphone,
  Gauge,
  Zap,
  Activity,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { Song, PlayMode, EqualizerPreset, PlaybackSpeed } from '../types/music';
import { audioEngine } from '../services/audioEngine';
import { AudioQualityBadge } from './AudioQualityBadge';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useAlbumTheme } from '../utils/colorExtractor';

interface FullPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playMode: PlayMode;
  queue: Song[];
  volume: number;
  isMuted: boolean;
  selectedPreset: EqualizerPreset;
  eqEnabled: boolean;
  gaplessEnabled: boolean;
  playbackSpeed: PlaybackSpeed;
  crossfadeSec: number;
  activeDeviceName: string;
  activeTimerMinutes: number | null;
  remainingSeconds: number | null;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onTogglePlayMode: () => void;
  onToggleFavorite: (songId: string) => void;
  onToggleMute: () => void;
  onChangeVolume: (val: number) => void;
  onToggleGapless: () => void;
  onChangePlaybackSpeed: (speed: PlaybackSpeed) => void;
  onChangeCrossfade: (sec: number) => void;
  onOpenCarMode: () => void;
  onOpenWidgetSimulator: () => void;
  onClose: () => void;
  onOpenAudioPro: () => void;
  onOpenSleepTimer: () => void;
  onOpenCastModal: () => void;
  onOpenTagEditor: (song: Song) => void;
  onSelectSongFromQueue: (song: Song) => void;
  onRemoveFromQueue: (songId: string) => void;
  dynamicThemeEnabled?: boolean;
  onToggleDynamicTheme?: () => void;
  bassBoost?: number;
  onCycleBassBoost?: () => void;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  playMode,
  queue,
  volume,
  isMuted,
  selectedPreset,
  eqEnabled,
  gaplessEnabled,
  playbackSpeed,
  crossfadeSec,
  activeDeviceName,
  activeTimerMinutes,
  remainingSeconds,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onTogglePlayMode,
  onToggleFavorite,
  onToggleMute,
  onChangeVolume,
  onToggleGapless,
  onChangePlaybackSpeed,
  onChangeCrossfade,
  onOpenCarMode,
  onOpenWidgetSimulator,
  onClose,
  onOpenAudioPro,
  onOpenSleepTimer,
  onOpenCastModal,
  onOpenTagEditor,
  onSelectSongFromQueue,
  onRemoveFromQueue,
  dynamicThemeEnabled = true,
  onToggleDynamicTheme,
  bassBoost = 40,
  onCycleBassBoost
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'queue' | 'lyrics'>('cover');
  const [visualizerMode, setVisualizerMode] = useState<'wave' | 'scope' | 'spectrum'>('wave');
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Material You Palette Extractor
  const theme = useAlbumTheme(currentSong?.artwork, dynamicThemeEnabled);

  // Quick Bass Boost Level: normal (<45%), boost (45%-79%), extreme (>=80%)
  const bassLevel: 'normal' | 'boost' | 'extreme' = bassBoost >= 80 ? 'extreme' : bassBoost >= 45 ? 'boost' : 'normal';

  // Persistent references for momentum and phase continuity across gapless track changes
  const momentumEnergyRef = useRef<number>(0);
  const wavePhaseRef = useRef<number>(0);
  const smoothedWaveRef = useRef<Float32Array>(new Float32Array(128));

  // Native Canvas real-time Web Audio API AnalyserNode visualizer
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const sampleSize = 128;
    const timeData = new Uint8Array(sampleSize);
    const freqData = new Uint8Array(64);

    const render = () => {
      animationId = requestAnimationFrame(render);

      // Handle Device Pixel Ratio for sharp rendering on high-DPI and mobile screens
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssWidth = Math.max(10, Math.floor(rect.width));
      const cssHeight = Math.max(10, Math.floor(rect.height || 54));

      if (canvas.width !== Math.floor(cssWidth * dpr) || canvas.height !== Math.floor(cssHeight * dpr)) {
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const centerY = cssHeight / 2;

      // Extract real-time Web Audio API data from audioEngine AnalyserNode
      const analyser = audioEngine.getAnalyserNode();
      if (analyser) {
        audioEngine.getTimeDomainData(timeData);
        audioEngine.getVisualizerData(freqData);
      }

      // Compute instant RMS audio energy
      let sum = 0;
      for (let i = 0; i < 32; i++) {
        sum += freqData[i];
      }
      const measuredEnergy = Math.min(1.0, (sum / (32 * 255)) * 2.2);

      // Gapless transition resilience:
      // When isPlaying is active, if the audio buffer switches or momentarily buffers between tracks,
      // maintain persistent momentum decay instead of immediately collapsing to a flat line.
      let targetEnergy = 0;
      if (isPlaying) {
        if (measuredEnergy > 0.02) {
          targetEnergy = measuredEnergy;
        } else {
          // Retain organic wave momentum during gapless track transition
          targetEnergy = Math.max(0.18, momentumEnergyRef.current * 0.985);
        }
      } else {
        // Smooth fade down to zero when explicitly paused
        targetEnergy = 0;
      }

      // Lerp smoothing for zero-flicker transitions
      momentumEnergyRef.current += (targetEnergy - momentumEnergyRef.current) * 0.16;
      const currentEnergy = momentumEnergyRef.current;

      // Advance wave phase smoothly
      wavePhaseRef.current += 0.042 + currentEnergy * 0.038;
      const phase = wavePhaseRef.current;

      const smoothed = smoothedWaveRef.current;
      for (let i = 0; i < sampleSize; i++) {
        let targetVal = 0;
        if (currentEnergy > 0.005) {
          const byteNorm = (timeData[i] - 128) / 128.0;
          const freqNorm = freqData[i % 32] / 255.0;
          const breathing = Math.sin(phase + (i / sampleSize) * Math.PI * 4) * (0.08 + currentEnergy * 0.35);
          targetVal = (byteNorm * 0.75 + freqNorm * 0.25) * currentEnergy + breathing;
        }
        // Exponential lerp point update
        smoothed[i] += (targetVal - smoothed[i]) * 0.22;
      }

      // Render according to selected visualizer mode
      if (visualizerMode === 'wave') {
        const step = cssWidth / (sampleSize - 1);

        // LAYER 1: Ambient soft aura gradient fill
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let i = 0; i < sampleSize; i++) {
          const x = i * step;
          const amp = smoothed[i] * (cssHeight * 0.42);
          const y = centerY + amp;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * step;
            const prevAmp = smoothed[i - 1] * (cssHeight * 0.42);
            const prevY = centerY + prevAmp;
            ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
          }
        }
        ctx.lineTo(cssWidth, centerY);
        ctx.closePath();

        const auraGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
        auraGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
        auraGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.24)');
        auraGrad.addColorStop(1, 'rgba(99, 102, 241, 0.14)');
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // LAYER 2: Inverted mirror harmonic wave (stereo depth)
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let i = 0; i < sampleSize; i++) {
          const x = i * step;
          const mirrorAmp = -smoothed[i] * (cssHeight * 0.28);
          const y = centerY + mirrorAmp;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * step;
            const prevY = centerY - smoothed[i - 1] * (cssHeight * 0.28);
            ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
          }
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // LAYER 3: Main high-definition glowing crest line
        ctx.beginPath();
        for (let i = 0; i < sampleSize; i++) {
          const x = i * step;
          const amp = smoothed[i] * (cssHeight * 0.44);
          const y = centerY + amp;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * step;
            const prevAmp = smoothed[i - 1] * (cssHeight * 0.44);
            const prevY = centerY + prevAmp;
            ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
          }
        }
        const crestGrad = ctx.createLinearGradient(0, 0, cssWidth, 0);
        crestGrad.addColorStop(0, theme.primary);
        crestGrad.addColorStop(0.5, theme.accent);
        crestGrad.addColorStop(1, theme.primary);

        ctx.strokeStyle = crestGrad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Baseline guideline
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(cssWidth, centerY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

      } else if (visualizerMode === 'scope') {
        // High-Precision Real-time Oscilloscope Beam
        const step = cssWidth / (sampleSize - 1);

        // Grid markings
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(cssWidth, centerY);
        ctx.stroke();

        ctx.beginPath();
        for (let x = 0; x < cssWidth; x += 35) {
          ctx.moveTo(x, centerY - 3);
          ctx.lineTo(x, centerY + 3);
        }
        ctx.stroke();

        // Scope trace
        ctx.beginPath();
        for (let i = 0; i < sampleSize; i++) {
          const x = i * step;
          const byteNorm = (timeData[i] - 128) / 128.0;
          const amp = (byteNorm * 0.88 * currentEnergy + Math.sin(phase + i * 0.12) * (0.04 + currentEnergy * 0.16)) * (cssHeight * 0.45);
          const y = centerY + amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else {
        // 32-Band Dynamic Spectrum Visualizer (FFT)
        const barCount = 32;
        const barWidth = Math.max(2, (cssWidth / barCount) - 3);
        const barGrad = ctx.createLinearGradient(0, cssHeight, 0, 0);
        barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        barGrad.addColorStop(0.6, '#10b981');
        barGrad.addColorStop(1, '#06b6d4');

        for (let i = 0; i < barCount; i++) {
          const val = freqData[i] || 0;
          const barHeight = Math.max(3, (val / 255.0) * (cssHeight * 0.85) * (0.3 + currentEnergy * 0.7));
          const x = i * (barWidth + 3) + 1.5;
          const y = cssHeight - barHeight;

          ctx.fillStyle = barGrad;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, barWidth, barHeight);
          }

          // Peak cap indicator
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(x, Math.max(1, y - 2), barWidth, 1.5);
        }
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, visualizerMode, currentSong?.id]);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Synced lyrics calculation
  const syncedLyrics = currentSong.syncedLyrics;
  let currentLyricIndex = -1;
  if (syncedLyrics) {
    for (let i = syncedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= syncedLyrics[i].time) {
        currentLyricIndex = i;
        break;
      }
    }
  }

  // Auto-scroll lyrics container to active line
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsContainerRef.current && currentLyricIndex >= 0) {
      const activeEl = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex, activeTab]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col text-white select-none overflow-y-auto animate-in fade-in duration-300 transition-colors"
      style={{
        background: dynamicThemeEnabled 
          ? `linear-gradient(180deg, ${theme.surfaceColor} 0%, rgba(13, 13, 18, 0.98) 100%)` 
          : 'linear-gradient(180deg, #181822 0%, #0f0f14 50%, #0a0a0d 100%)'
      }}
    >
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="p-2 -ml-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors shrink-0"
          title="Minimizar reproductor"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 sm:p-1 rounded-full border border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'cover' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Portada
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'queue' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Cola</span>
            <span className="text-[10px] text-zinc-400">({queue.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'lyrics' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Letras</span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Material You Dynamic Theme Toggle Button */}
          {onToggleDynamicTheme && (
            <button
              onClick={onToggleDynamicTheme}
              className={`p-2 rounded-full transition-all ${
                dynamicThemeEnabled
                  ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
              title={`Tema Dinámico Material You: ${dynamicThemeEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`}
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Sleep Timer Indicator Button */}
          <button
            onClick={onOpenSleepTimer}
            className={`p-2 rounded-full transition-colors ${
              activeTimerMinutes !== null
                ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Temporizador de apagado"
          >
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Cast Device Button */}
          <button
            onClick={onOpenCastModal}
            className="p-2 rounded-full text-indigo-400 hover:bg-zinc-800 transition-colors"
            title={`Transmitir audio: ${activeDeviceName}`}
          >
            <Cast className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Car Mode (hidden on small mobile screens to prevent overflow) */}
          <button
            onClick={onOpenCarMode}
            className="p-2 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors hidden md:block"
            title="Modo Conducción / Auto"
          >
            <Car className="w-5 h-5 text-amber-400" />
          </button>

          {/* Android Widget Simulator */}
          <button
            onClick={onOpenWidgetSimulator}
            className="p-2 rounded-full text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors hidden md:block"
            title="Widget Pantalla de Inicio"
          >
            <Smartphone className="w-5 h-5 text-cyan-400" />
          </button>

          {/* Edit Tag metadata */}
          <button
            onClick={() => onOpenTagEditor(currentSong)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
            title="Editar etiquetas y metadatos ID3"
          >
            <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* EQ Preset Pill */}
          <button
            onClick={onOpenAudioPro}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors"
            title="Ajustar ecualizador"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[60px] sm:max-w-[80px]">{selectedPreset}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto w-full px-6 flex-1 flex flex-col justify-around py-4">
        {activeTab === 'queue' ? (
          /* Queue Panel with reorder & remove */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 h-[380px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-2">
              <span className="text-sm font-bold flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-emerald-400" />
                Cola de Reproducción ({queue.length})
              </span>
              <span className="text-[11px] text-zinc-500">Toca para reproducir</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {queue.map((song, i) => {
                const isCurrent = song.id === currentSong.id;
                return (
                  <div
                    key={`${song.id}-${i}`}
                    onClick={() => onSelectSongFromQueue(song)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors group ${
                      isCurrent
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                        : 'hover:bg-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-zinc-500 font-mono w-4">{i + 1}</span>
                      <div className="truncate">
                        <p className="truncate font-medium">{song.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono shrink-0">
                        {formatTime(song.duration)}
                      </span>
                      {queue.length > 1 && !isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromQueue(song.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                          title="Quitar de la cola"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'lyrics' ? (
          /* Live Karaoke Synced Lyrics View */
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 h-[380px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Letras Sincronizadas en Vivo
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Toca una frase para saltar</span>
            </div>

            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto space-y-4 text-center pr-2 scroll-smooth"
            >
              {syncedLyrics ? (
                syncedLyrics.map((line, idx) => {
                  const isActive = idx === currentLyricIndex;

                  return (
                    <p
                      key={idx}
                      onClick={() => onSeek(line.time)}
                      className={`text-sm cursor-pointer transition-all duration-300 py-1 rounded-xl ${
                        isActive
                          ? 'text-white font-extrabold text-base scale-105 bg-emerald-500/20 text-emerald-300'
                          : 'text-zinc-500 hover:text-zinc-300 font-medium'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-zinc-600" />
                  <p>No se encontraron letras LRC para esta pista local.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Large Album Artwork with Dynamic Aura */
          <div className="relative aspect-square max-h-[380px] w-full mx-auto my-2 rounded-3xl group flex items-center justify-center">
            {dynamicThemeEnabled && currentSong.artwork && (
              <div 
                className="absolute inset-0 -m-6 rounded-3xl blur-3xl opacity-40 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: theme.primary }}
              />
            )}
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/60">
              {currentSong.artwork ? (
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                    <Sliders className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-lg text-white">{currentSong.title}</h4>
                  <p className="text-sm text-zinc-400">{currentSong.artist}</p>
                </div>
              )}
              {eqEnabled && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Audio Pro DSP</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Track Details & Favorite */}
        <div className="flex items-center justify-between mt-4">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold truncate text-white">
                {currentSong.title}
              </h2>
              <AudioQualityBadge song={currentSong} size="md" />
            </div>
            <p className="text-sm sm:text-base text-zinc-400 truncate mt-0.5">
              {currentSong.artist} • <span className="text-zinc-500">{currentSong.album}</span>
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500">
              <span className="text-zinc-400">{currentSong.bitrate || '1411 kbps PCM'}</span>
              {currentSong.replayGainDb !== undefined && (
                <span className="flex items-center gap-1 text-emerald-400/90 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>ReplayGain {currentSong.replayGainDb > 0 ? `+${currentSong.replayGainDb}` : currentSong.replayGainDb} dB</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick 1-Tap BASS BOOST Button */}
            {onCycleBassBoost && (
              <button
                onClick={onCycleBassBoost}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md ${
                  bassLevel === 'extreme'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black border border-amber-300 ring-2 ring-amber-500/50 animate-pulse'
                    : bassLevel === 'boost'
                      ? 'bg-emerald-500 text-black border border-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500'
                }`}
                title="Refuerzo de Graves: Toca para alternar (Normal -> Bass +10dB -> Mega Bass +14dB Subwoofer)"
              >
                <Zap className={`w-3.5 h-3.5 ${bassLevel !== 'normal' ? 'fill-current' : ''}`} />
                <span>{bassLevel === 'extreme' ? 'MEGA BASS 🔥' : bassLevel === 'boost' ? 'BASS BOOST ⚡' : 'Graves: Normal'}</span>
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                  bassLevel !== 'normal' ? 'bg-black/30 text-black' : 'bg-zinc-700 text-zinc-300'
                }`}>
                  {bassLevel === 'extreme' ? '+14dB' : bassLevel === 'boost' ? '+10dB' : 'OFF'}
                </span>
              </button>
            )}

            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              className="p-2.5 text-zinc-400 hover:text-emerald-400 transition-transform active:scale-125"
              title={currentSong.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={`w-6 h-6 ${
                  currentSong.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Native Web Audio API Canvas Waveform Visualizer (Real-time AnalyserNode & Gapless Sync) */}
        <div 
          className="mt-4 p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl relative group hover:border-emerald-500/40 transition-all select-none shadow-lg shadow-black/40"
        >
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-2 px-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wide">
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isPlaying ? 'animate-pulse ring-2 ring-emerald-500/30' : 'opacity-40'}`} />
              <span>
                {visualizerMode === 'wave' 
                  ? 'Onda Continua WebAudio' 
                  : visualizerMode === 'scope' 
                    ? 'Osciloscopio HQ' 
                    : 'Espectro 64-Band DSP'}
              </span>
            </span>

            {/* Visualizer Mode Switcher */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
              <button
                onClick={() => setVisualizerMode('wave')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  visualizerMode === 'wave'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Onda Fluida con Brillo Neón"
              >
                Onda
              </button>
              <button
                onClick={() => setVisualizerMode('scope')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  visualizerMode === 'scope'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Osciloscopio Láser"
              >
                Scope
              </button>
              <button
                onClick={() => setVisualizerMode('spectrum')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  visualizerMode === 'spectrum'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Espectro de Frecuencias FFT"
              >
                FFT
              </button>
            </div>
          </div>

          {/* Integrated HTML5 Canvas connected to Web Audio API AnalyserNode */}
          <div 
            onClick={() => setVisualizerMode(prev => prev === 'wave' ? 'scope' : prev === 'scope' ? 'spectrum' : 'wave')}
            className="relative w-full h-14 overflow-hidden rounded-xl bg-black/60 border border-zinc-900 cursor-pointer"
            title="Toca el canvas para alternar estilo visual"
          >
            <canvas
              ref={waveformCanvasRef}
              className="w-full h-full block"
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-emerald-400" />
              <span>AnalyserNode (128 FFT)</span>
            </span>
            <span className={gaplessEnabled ? 'text-emerald-400/80 font-medium' : 'text-zinc-500'}>
              {gaplessEnabled ? '✓ Sincronización Gapless Activa' : 'Gapless Desactivado'}
            </span>
          </div>
        </div>

        {/* Interactive Timeline Scrubber */}
        <div className="space-y-1 mt-3">
          <div
            className="relative h-2 bg-zinc-800 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              onSeek(ratio * duration);
            }}
          >
            <div
              className="h-full rounded-full relative group-hover:opacity-90 transition-all"
              style={{ 
                width: `${progressPercent}%`,
                background: dynamicThemeEnabled
                  ? `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`
                  : 'linear-gradient(90deg, #10b981, #06b6d4)'
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex justify-between text-xs text-zinc-400 font-mono pt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Master Playback Controls */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onTogglePlayMode}
            className={`p-2 transition-colors ${
              playMode === 'shuffle' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Modo: ${playMode}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrev}
            className="p-3 text-zinc-200 hover:text-white transition-transform active:scale-90"
            title="Anterior"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full text-black flex items-center justify-center shadow-xl transition-all active:scale-95"
            style={{
              backgroundColor: dynamicThemeEnabled ? theme.primary : '#10b981',
              boxShadow: dynamicThemeEnabled ? `0 10px 25px -4px ${theme.primary}66` : '0 20px 25px -5px rgba(16, 185, 129, 0.3)'
            }}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-3 text-zinc-200 hover:text-white transition-transform active:scale-90"
            title="Siguiente"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          <button
            onClick={onTogglePlayMode}
            className={`p-2 transition-colors ${
              playMode === 'repeat-all' || playMode === 'repeat-one'
                ? 'text-emerald-400'
                : 'text-zinc-400 hover:text-white'
            }`}
            title={`Modo: ${playMode}`}
          >
            {playMode === 'repeat-one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Utility Row with Gapless, Speed, Crossfade, Output Device */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-6 border-t border-zinc-800/60 mt-6 text-zinc-400">
          {/* Cast Device Pill */}
          <button
            onClick={onOpenCastModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
          >
            <Cast className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[100px]">{activeDeviceName}</span>
          </button>

          {/* Playback Speed Button */}
          <button
            onClick={() => {
              const speeds: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
              const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              onChangePlaybackSpeed(speeds[nextIndex]);
            }}
            className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Velocidad de reproducción (preserva tono vocal)"
          >
            {playbackSpeed}x
          </button>

          {/* DJ Crossfade Button */}
          <button
            onClick={() => {
              const fades = [0, 3, 5, 8, 12];
              const nextIndex = (fades.indexOf(crossfadeSec) + 1) % fades.length;
              onChangeCrossfade(fades[nextIndex]);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
              crossfadeSec > 0
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
            }`}
            title="Fundido cruzado entre canciones (DJ Crossfade)"
          >
            FADE {crossfadeSec > 0 ? `${crossfadeSec}s` : 'OFF'}
          </button>

          {/* Gapless Toggle */}
          <button
            onClick={onToggleGapless}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
              gaplessEnabled
                ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40 shadow-sm'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
            }`}
            title="Activar / Desactivar reproducción continua Gapless"
          >
            GAPLESS {gaplessEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'cover' : 'queue')}
            className={`p-2 transition-colors ${
              activeTab === 'queue' ? 'text-emerald-400' : 'hover:text-white'
            }`}
            title="Ver cola de reproducción"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
