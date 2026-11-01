import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  RotateCcw, 
  RotateCw, 
  X, 
  Mic, 
  Sun, 
  Moon, 
  Navigation as NavIcon, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2,
  Gauge,
  Zap
} from 'lucide-react';
import { Song } from '../types/music';
import { WaveformVisualizer } from './WaveformVisualizer';

interface CarModeViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  bassBoost?: number;
  onCycleBassBoost?: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: (id: string) => void;
  onToggleMute: () => void;
  onClose: () => void;
}

export const CarModeView: React.FC<CarModeViewProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  bassBoost = 40,
  onCycleBassBoost,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onToggleFavorite,
  onToggleMute,
  onClose
}) => {
  const [highContrast, setHighContrast] = useState<boolean>(true);
  const [clockTime, setClockTime] = useState<string>('');
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(68);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Update digital clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Slight speed fluctuation for realistic GPS HUD feel
  useEffect(() => {
    if (!isPlaying) {
      setSimulatedSpeed(0);
      return;
    }
    const interval = setInterval(() => {
      setSimulatedSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        const newSpeed = Math.round(Math.max(45, Math.min(110, prev + delta)));
        return newSpeed;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Touch gesture handler (Swipe to skip tracks)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (diff > 80) {
      // Swiped right -> Previous track
      onPrev();
    } else if (diff < -80) {
      // Swiped left -> Next track
      onNext();
    }
    setTouchStartX(null);
  };

  // Voice Command Simulation
  const handleVoiceCommand = () => {
    setVoiceActive(true);
    setVoiceFeedback('Escuchando orden de voz...');

    const commands = [
      'Subir volumen +10%',
      'Siguiente tema musical',
      'Pista añadida a favoritos',
      'Modo Conducción Seguro Activo'
    ];
    const picked = commands[Math.floor(Math.random() * commands.length)];

    setTimeout(() => {
      setVoiceFeedback(`Comando reconocido: "${picked}"`);
      if (picked.includes('Siguiente')) {
        onNext();
      }
      setTimeout(() => {
        setVoiceActive(false);
        setVoiceFeedback(null);
      }, 2000);
    }, 1500);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 select-none transition-colors duration-300 ${
        highContrast 
          ? 'bg-black text-white' 
          : 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100'
      }`}
    >
      {/* Top Driving Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        {/* Left: Speedometer & Clock */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Gauge className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="font-mono text-2xl font-black text-white">{simulatedSpeed}</span>
              <span className="text-[11px] font-mono text-zinc-500 uppercase ml-1">km/h</span>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800" />

          <div className="font-mono text-xl sm:text-2xl font-bold text-zinc-300">
            {clockTime}
          </div>
        </div>

        {/* Center: Car Mode Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <NavIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Modo Conducción Seguro
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {onCycleBassBoost && (
            <button
              onClick={onCycleBassBoost}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 border transition-all active:scale-95 shadow-md ${
                bassBoost >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-red-500 text-black border-amber-300 ring-2 ring-amber-500/50 animate-pulse'
                  : bassBoost >= 45
                    ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Refuerzo de Graves 1-Toque para el Vehículo"
            >
              <Zap className={`w-4 h-4 ${bassBoost >= 45 ? 'fill-current' : ''}`} />
              <span>{bassBoost >= 80 ? 'MEGA BASS 🔥' : bassBoost >= 45 ? 'BASS BOOST ⚡' : 'GRAVES'}</span>
            </button>
          )}

          <button
            onClick={() => setHighContrast(!highContrast)}
            className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Cambiar Contraste Antideslumbrante"
          >
            {highContrast ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-cyan-400" />}
          </button>

          <button
            onClick={handleVoiceCommand}
            className={`p-3 rounded-full transition-all ${
              voiceActive 
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-110' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Comando de voz en el auto"
          >
            <Mic className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Salir de Modo Conducción"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Voice feedback banner */}
      {voiceFeedback && (
        <div className="bg-emerald-500 text-black font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-3 animate-bounce shadow-2xl text-center">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{voiceFeedback}</span>
        </div>
      )}

      {/* Main Large Display Area */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-auto w-full max-w-5xl mx-auto">
        {/* Huge Artwork */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0 border-2 border-zinc-800 bg-zinc-900">
          {currentSong.artwork ? (
            <img 
              src={currentSong.artwork} 
              alt={currentSong.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 font-bold text-4xl">
              MP3
            </div>
          )}
          {isPlaying && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-black px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>Sonando</span>
            </div>
          )}
        </div>

        {/* Big Metadata & Waveform */}
        <div className="flex-1 min-w-0 text-center md:text-left space-y-3 w-full">
          <div className="flex items-center justify-center md:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white truncate tracking-tight">
                {currentSong.title}
              </h1>
              <p className="text-xl sm:text-2xl text-zinc-400 font-medium truncate mt-1">
                {currentSong.artist}
              </p>
              <p className="text-sm text-zinc-600 truncate mt-0.5">
                {currentSong.album}
              </p>
            </div>

            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-transform active:scale-125"
              title="Favorito"
            >
              <Heart 
                className={`w-8 h-8 ${
                  currentSong.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''
                }`} 
              />
            </button>
          </div>

          {/* Continuous Waveform Visualizer in Car Mode */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-2.5">
            <WaveformVisualizer isPlaying={isPlaying} height={42} theme="emerald" />
          </div>

          {/* Progress Timeline */}
          <div className="space-y-1">
            <div 
              className="w-full h-3 bg-zinc-900 rounded-full cursor-pointer overflow-hidden border border-zinc-800"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onSeek(ratio * duration);
              }}
            >
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-mono text-zinc-500 font-semibold px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Bottom Controls (Thumb-friendly & Distraction-free) */}
      <div className="max-w-4xl mx-auto w-full pt-4 border-t border-zinc-900 flex items-center justify-between gap-3 sm:gap-6">
        {/* Rewind 15s */}
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 15))}
          className="p-4 sm:p-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-95"
          title="Retroceder 15s"
        >
          <RotateCcw className="w-8 h-8" />
        </button>

        {/* Previous Track */}
        <button
          onClick={onPrev}
          className="p-5 sm:p-6 rounded-3xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all active:scale-95 shadow-lg"
          title="Canción Anterior"
        >
          <SkipBack className="w-10 h-10 fill-current" />
        </button>

        {/* Giant Play/Pause Central Circle */}
        <button
          onClick={onTogglePlay}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-black flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? 'Pausa' : 'Reproducir'}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12 fill-current" />
          ) : (
            <Play className="w-12 h-12 fill-current ml-1.5" />
          )}
        </button>

        {/* Next Track */}
        <button
          onClick={onNext}
          className="p-5 sm:p-6 rounded-3xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all active:scale-95 shadow-lg"
          title="Siguiente Canción"
        >
          <SkipForward className="w-10 h-10 fill-current" />
        </button>

        {/* Fast-Forward 15s */}
        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 15))}
          className="p-4 sm:p-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-95"
          title="Adelantar 15s"
        >
          <RotateCw className="w-8 h-8" />
        </button>

        {/* Mute toggle button */}
        <button
          onClick={onToggleMute}
          className="hidden sm:block p-4 sm:p-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all"
          title={isMuted ? 'Desmutear' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-7 h-7 text-red-400" /> : <Volume2 className="w-7 h-7" />}
        </button>
      </div>

      {/* Gesture Hint Footnote */}
      <div className="text-center text-[11px] font-mono text-zinc-600 pt-2">
        Desliza a los lados para cambiar canción • Toca para pausar • Doble toque para favorito
      </div>
    </div>
  );
};
