import React from 'react';
import { Moon, X, Clock, Check, BellOff } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  activeTimerMinutes: number | null; // null if off, -1 if end-of-track
  remainingSeconds: number | null;
  onClose: () => void;
  onSetTimer: (minutes: number | null) => void; // null to disable, -1 for end-of-track
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  activeTimerMinutes,
  remainingSeconds,
  onClose,
  onSetTimer
}) => {
  if (!isOpen) return null;

  const options = [
    { label: '15 minutos', value: 15 },
    { label: '30 minutos', value: 30 },
    { label: '45 minutos', value: 45 },
    { label: '60 minutos (1 hora)', value: 60 },
    { label: 'Al terminar la canción actual', value: -1 }
  ];

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Temporizador de Sueño</h3>
              <p className="text-xs text-zinc-400">Apagado automático de música</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Timer Indicator */}
        {activeTimerMinutes !== null && (
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>
                {activeTimerMinutes === -1
                  ? 'Se detendrá al final del tema'
                  : `Se detiene en: ${remainingSeconds !== null ? formatRemaining(remainingSeconds) : ''}`}
              </span>
            </span>

            <button
              onClick={() => onSetTimer(null)}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 underline"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Options list */}
        <div className="space-y-2">
          {options.map((opt) => {
            const isSelected = activeTimerMinutes === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSetTimer(opt.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            );
          })}

          {activeTimerMinutes !== null && (
            <button
              onClick={() => {
                onSetTimer(null);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 transition-colors mt-2"
            >
              <BellOff className="w-4 h-4" />
              <span>Desactivar temporizador</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
