import React from 'react';
import { Sparkles } from 'lucide-react';
import { Song } from '../types/music';

interface AudioQualityBadgeProps {
  song: Song;
  size?: 'sm' | 'md';
}

export const AudioQualityBadge: React.FC<AudioQualityBadgeProps> = ({ song, size = 'sm' }) => {
  if (song.isHiRes || song.audioFormat === 'FLAC') {
    return (
      <span 
        className={`inline-flex items-center gap-1 rounded-md font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-amber-300 border border-amber-500/40 shadow-xs ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
        }`}
        title={`${song.bitrate || 'FLAC 24-bit/96kHz'} • Audio de Estudio sin Pérdida`}
      >
        <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5 text-amber-400' : 'w-3 h-3 text-amber-400'} />
        <span>HI-RES LOSSLESS</span>
      </span>
    );
  }

  if (song.bitrate?.includes('320') || song.audioFormat === 'MP3') {
    return (
      <span 
        className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wider bg-zinc-800/90 text-emerald-400/90 border border-zinc-700 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="MP3 320 kbps CBR Calidad Alta"
      >
        <span>320K HQ</span>
      </span>
    );
  }

  if (song.audioFormat === 'AAC') {
    return (
      <span 
        className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wider bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="AAC 256 kbps Audio Dinámico"
      >
        <span>AAC</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-md font-medium uppercase tracking-wider bg-zinc-900 text-zinc-400 border border-zinc-800 ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
      }`}
    >
      <span>PCM</span>
    </span>
  );
};
