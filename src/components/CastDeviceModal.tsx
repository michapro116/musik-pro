import React, { useState, useEffect } from 'react';
import { 
  Cast, 
  Bluetooth, 
  Smartphone, 
  Tv, 
  Speaker, 
  Volume2, 
  RefreshCw, 
  Check, 
  X, 
  Radio, 
  BatteryMedium, 
  ShieldCheck 
} from 'lucide-react';
import { AudioOutputDevice, DeviceType } from '../types/music';
import { castEngine } from '../services/castEngine';

interface CastDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceChange?: (device: AudioOutputDevice) => void;
}

export const CastDeviceModal: React.FC<CastDeviceModalProps> = ({
  isOpen,
  onClose,
  onDeviceChange
}) => {
  const [devices, setDevices] = useState<AudioOutputDevice[]>(() => castEngine.getDevices());
  const [activeDevice, setActiveDevice] = useState<AudioOutputDevice>(() => castEngine.getActiveDevice());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bluetooth' | 'cast'>('all');

  useEffect(() => {
    const unsubscribe = castEngine.subscribe(() => {
      setDevices(castEngine.getDevices());
      setActiveDevice(castEngine.getActiveDevice());
      setIsScanning(castEngine.getIsScanning());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleSelectDevice = async (id: string) => {
    const updated = await castEngine.connectDevice(id);
    setActiveDevice(updated);
    if (onDeviceChange) onDeviceChange(updated);
  };

  const handleVolumeChange = (vol: number) => {
    castEngine.setDeviceVolume(activeDevice.id, vol);
  };

  const handleScan = () => {
    castEngine.scanForDevices();
  };

  const getDeviceIcon = (device: AudioOutputDevice) => {
    if (device.type === 'local') return <Smartphone className="w-5 h-5 text-emerald-400" />;
    if (device.type === 'bluetooth') return <Bluetooth className="w-5 h-5 text-cyan-400" />;
    if (device.name.toLowerCase().includes('tv')) return <Tv className="w-5 h-5 text-indigo-400" />;
    return <Speaker className="w-5 h-5 text-indigo-400" />;
  };

  const filteredDevices = devices.filter((d) => {
    if (selectedFilter === 'all') return true;
    return d.type === selectedFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cast className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Salida de Audio</h3>
              <p className="text-xs text-zinc-400">Chromecast, Google Cast y Bluetooth</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Device Card */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                {getDeviceIcon(activeDevice)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Reproduciendo en
                </span>
                <h4 className="font-bold text-sm text-white truncate max-w-[180px]">
                  {activeDevice.name}
                </h4>
              </div>
            </div>

            {activeDevice.batteryLevel !== undefined && (
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeDevice.batteryLevel}%</span>
              </span>
            )}
          </div>

          {/* Volume control for active output device */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Volumen del dispositivo
              </span>
              <span className="font-mono">{activeDevice.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={activeDevice.volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Filter Pills & Scan Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedFilter === 'all' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('bluetooth')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                selectedFilter === 'bluetooth' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bluetooth className="w-3 h-3 text-cyan-400" />
              <span>Bluetooth</span>
            </button>
            <button
              onClick={() => setSelectedFilter('cast')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                selectedFilter === 'cast' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cast className="w-3 h-3 text-indigo-400" />
              <span>Cast</span>
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold transition-colors disabled:opacity-50"
            title="Buscar dispositivos cercanos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isScanning ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>

        {/* Device List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredDevices.map((device) => {
            const isCurrent = device.id === activeDevice.id;

            return (
              <div
                key={device.id}
                onClick={() => handleSelectDevice(device.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-zinc-800/40 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                    {getDeviceIcon(device)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs text-white truncate">{device.name}</h5>
                    <p className="text-[11px] text-zinc-400 truncate">{device.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Conectado</span>
                    </span>
                  ) : (
                    <button className="text-xs text-zinc-400 hover:text-white font-medium px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700">
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Native Android Audio Routing Note */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            En Android, este módulo se conecta al <code className="text-emerald-300">MediaRouter2</code> y al <code className="text-emerald-300">Google Cast SDK</code>, permitiendo enviar la transmisión sin pérdida con códec AAC/Opus a cualquier receptor de tu red WiFi o auricular Bluetooth.
          </p>
        </div>
      </div>
    </div>
  );
};
