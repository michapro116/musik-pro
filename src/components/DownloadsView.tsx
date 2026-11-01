import React from 'react';
import { 
  ArrowDownToLine, 
  Trash2, 
  HardDrive, 
  CheckCircle2, 
  Play, 
  Pause, 
  Heart, 
  Music, 
  ShieldCheck 
} from 'lucide-react';
import { Song } from '../types/music';

interface DownloadsViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onDeleteDownload: (songId: string) => void;
  onClearAllDownloads: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onToggleFavorite,
  onDeleteDownload,
  onClearAllDownloads
}) => {
  const downloadedSongs = songs.filter((s) => s.isDownloaded);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-24 text-white max-w-5xl mx-auto">
      {/* Header & Storage Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestor de Descargas Offline</h2>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{downloadedSongs.length} pistas verificadas para escuchar sin internet</span>
            </p>
          </div>
        </div>

        {downloadedSongs.length > 0 && (
          <button
            onClick={onClearAllDownloads}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Liberar espacio de descargas</span>
          </button>
        )}
      </div>

      {/* Storage Breakdown Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400">Pistas Descargadas</span>
          <p className="text-xl font-bold text-white mt-1">{downloadedSongs.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400">Espacio Ocupado</span>
          <p className="text-xl font-bold text-cyan-400 mt-1">~15.4 MB</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400">Estado de Conexión</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Listo Offline</span>
          </p>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Archivos en Almacenamiento Local Seguro
        </h3>

        {downloadedSongs.length === 0 ? (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-12 text-center space-y-3">
            <ArrowDownToLine className="w-12 h-12 text-zinc-600 mx-auto" />
            <h4 className="text-base font-semibold text-zinc-300">
              No tienes canciones descargadas en este momento
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Puedes descargar temas desde tu biblioteca o sincronizar tus archivos locales.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
            {downloadedSongs.map((song, idx) => {
              const isThisPlaying = isPlaying && currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`flex items-center justify-between p-3.5 hover:bg-zinc-800/50 cursor-pointer transition-colors group ${
                    currentSong?.id === song.id ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-zinc-500 w-5 text-center group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSong?.id === song.id) {
                          onTogglePlay();
                        } else {
                          onPlaySong(song);
                        }
                      }}
                      className="w-5 h-5 text-emerald-400 hidden group-hover:flex items-center justify-center"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                      {song.artwork ? (
                        <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-300">
                          MP3
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        currentSong?.id === song.id ? 'text-emerald-400' : 'text-zinc-200'
                      }`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {song.artist} • <span className="text-zinc-500">{song.album}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Descargado</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDownload(song.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Eliminar de almacenamiento offline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="text-xs font-mono text-zinc-400 w-10 text-right">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
