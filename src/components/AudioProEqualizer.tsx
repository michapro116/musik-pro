import React, { useEffect, useRef, useState } from 'react';
import { 
  Sliders, 
  Zap, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Headphones, 
  Layers, 
  BookmarkPlus, 
  Trash2, 
  Maximize, 
  Radio,
  Compass,
  Waves,
  Disc3,
  Activity
} from 'lucide-react';
import { EqualizerSettings, EqualizerPreset, StandardEqualizerPreset, ReverbMode, SpatialEnvironment } from '../types/music';
import { audioEngine, EQ_FREQUENCIES, PRESETS } from '../services/audioEngine';

interface AudioProEqualizerProps {
  settings: EqualizerSettings;
  isPlaying: boolean;
  onUpdateSettings: (newSettings: EqualizerSettings) => void;
}

export const AudioProEqualizer: React.FC<AudioProEqualizerProps> = ({
  settings,
  isPlaying,
  onUpdateSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [customName, setCustomName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // Live real-time audio spectrum visualizer
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);

      if (isPlaying && settings.enabled) {
        audioEngine.getVisualizerData(dataArray);
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 4);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 0.75;
      const gap = (canvas.width / bufferLength) * 0.25;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * (canvas.height - 8);

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#059669');
        grad.addColorStop(0.7, '#10b981');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.beginPath();
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;
        const radius = 3;

        if (barHeight > 4) {
          ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
          ctx.fill();
        } else {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(x, canvas.height - 3, barWidth, 3);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, settings.enabled]);

  const handleToggle = () => {
    const updated = audioEngine.toggleEnabled();
    onUpdateSettings(updated);
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    const updated = audioEngine.setPreset(preset);
    onUpdateSettings(updated);
  };

  const handleBandChange = (index: number, val: number) => {
    const updated = audioEngine.setBandGain(index, val);
    onUpdateSettings(updated);
  };

  const handleBassBoost = (val: number) => {
    const updated = audioEngine.setBassBoost(val);
    onUpdateSettings(updated);
  };

  const handleBassCutoff = (freq: number) => {
    const updated = audioEngine.setBassCutoffFreq(freq);
    onUpdateSettings(updated);
  };

  const handleVirtualizer = (val: number) => {
    const updated = audioEngine.setVirtualizer(val);
    onUpdateSettings(updated);
  };

  const handleSpatialEnv = (env: SpatialEnvironment) => {
    const updated = audioEngine.setSpatialEnvironment(env);
    onUpdateSettings(updated);
  };

  const handleLoudness = (val: number) => {
    const updated = audioEngine.setLoudness(val);
    onUpdateSettings(updated);
  };

  const handleReverb = (mode: ReverbMode) => {
    const updated = audioEngine.setReverbMode(mode);
    onUpdateSettings(updated);
  };

  const handleMidBoost = (val: number) => {
    const updated = audioEngine.setMidBoost(val);
    onUpdateSettings(updated);
  };

  const handleTrebleBoost = (val: number) => {
    const updated = audioEngine.setTrebleBoost(val);
    onUpdateSettings(updated);
  };

  const handleReset = () => {
    handleSelectPreset('Equilibrado');
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    audioEngine.saveCurrentAsCustomPreset(customName.trim());
    onUpdateSettings(audioEngine.getSettings());
    setCustomName('');
    setIsSavingPreset(false);
  };

  const handleDeleteCustomPreset = (id: string) => {
    const updated = audioEngine.deleteCustomPreset(id);
    onUpdateSettings(updated);
  };

  const formatFreq = (freq: number) => {
    if (freq >= 1000) return `${freq / 1000}k`;
    return `${freq}`;
  };

  const standardPresets: StandardEqualizerPreset[] = [
    'Equilibrado',
    'Mega Graves',
    'Reggaetón',
    'Urbano',
    'Rock',
    'Voces',
    'Personalizado'
  ];

  return (
    <div className="space-y-6 pb-24 text-white max-w-5xl mx-auto">
      {/* Header with Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/70 p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight">Audio Pro Suite DSP</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              10 Bandas + 3D Surround
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Procesamiento de sonido de alta fidelidad, ecualizador paramétrico y audio espacial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Reiniciar a valores planos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              settings.enabled
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <Zap className={`w-4 h-4 ${settings.enabled ? 'fill-black' : ''}`} />
            <span>{settings.enabled ? 'Efectos ACTIVADOS' : 'Efectos DESACTIVADOS'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Spectrum Visualizer */}
      <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Espectrograma de Frecuencia (30Hz - 16kHz)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            {isPlaying ? 'Señal en tiempo real' : 'En pausa'}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={700}
          height={90}
          className="w-full h-24 rounded-lg bg-[#09090c]"
        />
      </div>

      {/* Acoustic Presets & Custom Presets */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Perfiles Acústicos
          </h3>
          <button
            onClick={() => setIsSavingPreset(!isSavingPreset)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Guardar Perfil Personalizado</span>
          </button>
        </div>

        {/* Save Preset Input Bar */}
        {isSavingPreset && (
          <form onSubmit={handleSavePreset} className="flex gap-2 p-2 bg-zinc-800/60 rounded-xl border border-zinc-700">
            <input
              type="text"
              required
              placeholder="Nombre del perfil (ej. Mis Audífonos Sony, Modo Coche...)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsSavingPreset(false)}
              className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {standardPresets.map((preset) => {
            const isActive = settings.selectedPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
                }`}
              >
                {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{preset}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Presets saved by user */}
        {settings.customPresets.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Tus Perfiles Guardados ({settings.customPresets.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {settings.customPresets.map((cp) => {
                const isActive = settings.selectedPreset === cp.name;
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleSelectPreset(cp.name)}
                    className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
                    }`}
                  >
                    <span>{cp.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomPreset(cp.id);
                      }}
                      className="p-1 hover:text-red-400 rounded transition-colors"
                      title="Eliminar este perfil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 10 Graphic Bands */}
      <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Ecualizador Gráfico de 10 Bandas (Ganancia ±12 dB)
          </h3>
          <span className="text-xs text-zinc-500">Pasa el cursor o desliza para ajustar</span>
        </div>

        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="min-w-[460px] grid grid-cols-10 gap-2 sm:gap-4 items-end pt-4 pb-2">
            {settings.bands.map((gain, index) => {
              const freq = EQ_FREQUENCIES[index];
              return (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold ${gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-cyan-400' : 'text-zinc-500'}`}>
                    {gain > 0 ? `+${gain}` : gain}
                  </span>

                  {/* Vertical Slider */}
                  <div className="h-44 flex items-center justify-center relative py-2">
                    <div className="absolute w-1 h-full bg-zinc-800 rounded-full" />
                    <div className="absolute w-3 h-0.5 bg-zinc-600 top-1/2 -translate-y-1/2" />
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      disabled={!settings.enabled}
                      onChange={(e) => handleBandChange(index, parseInt(e.target.value, 10))}
                      className="h-full w-6 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] [direction:rtl] accent-emerald-500 disabled:opacity-40"
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-zinc-400 mt-1">
                    {formatFreq(freq)}
                  </span>
                  <span className="text-[9px] text-zinc-600">Hz</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase 6 Feature: Flagship Acoustic Processors - Dynamic Bass Boost & 3D Spatial Virtualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Flagship Panel 1: Dynamic Bass Boost Studio */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  Refuerzo Dinámico de Graves
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    DSP v6
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Modelado sub-acústico y filtro dinámico sin saturación</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/40 shadow">
                +{((settings.bassBoost / 100) * 14).toFixed(1)} dB
              </span>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{settings.bassBoost}% Potencia</p>
            </div>
          </div>

          {/* Bass Intensity Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-zinc-400 font-semibold">
              <span>Intensidad de Subgraves</span>
              <span className="text-emerald-400">{settings.bassBoost > 75 ? 'Impacto Masivo' : settings.bassBoost > 35 ? 'Profundo & Pegón' : 'Sutil / Natural'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.bassBoost}
              disabled={!settings.enabled}
              onChange={(e) => handleBassBoost(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
            />
          </div>

          {/* Dynamic Frequency Cutoff Selector (60Hz, 80Hz, 100Hz, 120Hz) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Frecuencia de Enfoque Acústico (Low-Shelf Cutoff)
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { freq: 60, label: '60 Hz', desc: 'Subwoofer' },
                { freq: 80, label: '80 Hz', desc: 'Club Punch' },
                { freq: 100, label: '100 Hz', desc: 'Pegada' },
                { freq: 120, label: '120 Hz', desc: 'Cálido' }
              ].map((item) => {
                const isSelected = (settings.bassCutoffFreq || 80) === item.freq;
                return (
                  <button
                    key={item.freq}
                    type="button"
                    onClick={() => handleBassCutoff(item.freq)}
                    disabled={!settings.enabled}
                    className={`py-2 px-1.5 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700/60 disabled:opacity-40'
                    }`}
                  >
                    <span className="text-xs block">{item.label}</span>
                    <span className={`text-[9px] block ${isSelected ? 'text-black/80 font-medium' : 'text-zinc-500'}`}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anti-clipping Limiter status indicator */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Compresor Analógico Anti-Clipping
            </span>
            <span className="text-emerald-400 font-mono font-bold">Activo (-1.5dB Peak Limit)</span>
          </div>
        </div>

        {/* Flagship Panel 2: 3D Spatial Virtualizer & Surround Studio */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  Virtualizador 3D Surround
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    360° Haas
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Ensanchamiento psicoacústico de fase estéreo</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-xl border border-cyan-500/40 shadow">
                {settings.virtualizer}%
              </span>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Apertura Estéreo</p>
            </div>
          </div>

          {/* Virtualizer Intensity Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-zinc-400 font-semibold">
              <span>Amplitud del Campo Sonoro</span>
              <span className="text-cyan-400">
                {settings.virtualizer > 70 ? 'Campo 360° Ultra Amplio' : settings.virtualizer > 30 ? 'Separación Estéreo Óptima' : 'Estéreo Estándar'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.virtualizer}
              disabled={!settings.enabled}
              onChange={(e) => handleVirtualizer(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />
          </div>

          {/* Spatial Environment Selector (Studio, Auditorium, Concert, Club) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Entorno Acústico Virtual
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'studio' as SpatialEnvironment, name: 'Estudio', desc: '1.2ms Nítido' },
                { id: 'auditorium' as SpatialEnvironment, name: 'Auditorio', desc: '2.4ms Sala' },
                { id: 'concert' as SpatialEnvironment, name: 'Concierto', desc: '3.2ms 360°' },
                { id: 'club' as SpatialEnvironment, name: 'Club DJ', desc: '1.6ms Inmersivo' }
              ].map((env) => {
                const isSelected = (settings.spatialEnvironment || 'studio') === env.id;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => handleSpatialEnv(env.id)}
                    disabled={!settings.enabled}
                    className={`py-2 px-1 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700/60 disabled:opacity-40'
                    }`}
                  >
                    <span className="text-xs block">{env.name}</span>
                    <span className={`text-[9px] block ${isSelected ? 'text-black/80 font-medium' : 'text-zinc-500'}`}>
                      {env.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive 3D Soundstage diagram preview */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-zinc-300">Ángulo de radiación acústica:</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold">
              <span>{Math.round(45 + (settings.virtualizer / 100) * 135)}° Panorámica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary DSP Processors: Loudness Enhancer, ReplayGain Normalizer, Reverb */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Potenciador de Volumen / Loudness Enhancer */}
        <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Maximize className="w-4 h-4 text-emerald-300" />
              Loudness Limiter
            </span>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              +{settings.loudnessGain}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Aumento de ganancia limpia sin recortes digitales ni distorsión armónica.
          </p>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.loudnessGain}
            disabled={!settings.enabled}
            onChange={(e) => handleLoudness(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
          />
        </div>

        {/* Normalización ReplayGain EBU R128 */}
        <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ReplayGain R128
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              settings.replayGainEnabled
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                : 'text-zinc-500 bg-zinc-800 border-zinc-700'
            }`}>
              {settings.replayGainEnabled ? 'Activo' : 'Off'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Nivelación automática constante de decibelios entre pistas.
          </p>
          <button
            onClick={() => {
              const updated = audioEngine.toggleReplayGain();
              onUpdateSettings(updated);
            }}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
              settings.replayGainEnabled
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {settings.replayGainEnabled ? 'Desactivar Normalizador' : 'Activar Normalizador'}
          </button>
        </div>

        {/* Efecto de Reverberación (Reverb Mode) */}
        <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Ambiente Reverb
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 capitalize">
              {settings.reverbMode}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Resonancia acústica de espacio físico.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['off', 'studio', 'concert'] as ReverbMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleReverb(mode)}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  settings.reverbMode === mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {mode === 'off' ? 'Off' : mode === 'studio' ? 'Estudio' : 'Concierto'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Native Android Audio Effects Architecture Note */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-200/90">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-300 mb-1">
            Garantía de Audio Pro Nativo en Android (Hardware DSP)
          </h4>
          <p className="leading-relaxed">
            En la APK de Android generada con Kotlin, los cambios en este panel invocan la API nativa <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">android.media.audiofx.Equalizer</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">BassBoost</code>, <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">Virtualizer</code> y <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">LoudnessEnhancer</code> asociadas a la sesión de <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">ExoPlayer</code>. Incluye limitador digital interno para prevenir saturación y recortes de audio (anti-clipping).
          </p>
        </div>
      </div>
    </div>
  );
};
