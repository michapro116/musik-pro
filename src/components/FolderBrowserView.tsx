import React, { useState } from 'react';
import { 
  Folder, 
  ChevronRight, 
  Music, 
  Play, 
  ListPlus, 
  ArrowLeft, 
  HardDrive, 
  FolderTree, 
  Sparkles, 
  Heart 
} from 'lucide-react';
import { Song, FolderNode } from '../types/music';

interface FolderBrowserViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayFolder: (folderSongs: Song[]) => void;
  onAddFolderToQueue: (folderSongs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
}

export const FolderBrowserView: React.FC<FolderBrowserViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayFolder,
  onAddFolderToQueue,
  onToggleFavorite
}) => {
  // Current directory path as array of segments
  const [currentPath, setCurrentPath] = useState<string[]>([
    'storage',
    'emulated',
    '0',
    'Music'
  ]);

  // Construct virtual folder structure from songs or predefined local music folders
  const getFolderData = () => {
    const pathString = '/' + currentPath.join('/');

    // If at root /storage/emulated/0/Music
    if (pathString === '/storage/emulated/0/Music') {
      return {
        subFolders: [
          { name: 'Reggaetón & Urbano', count: 2, size: '8.0 MB' },
          { name: 'Rock & Alternativo', count: 1, size: '4.9 MB' },
          { name: 'Lo-Fi Chill & Acústico', count: 1, size: '3.4 MB' },
          { name: 'Descargas & Podcasts', count: 0, size: '0 MB' }
        ],
        folderSongs: []
      };
    }

    if (pathString.includes('Reggaetón')) {
      return {
        subFolders: [],
        folderSongs: songs.filter((s) => s.genre?.toLowerCase().includes('reggaetón') || s.genre?.toLowerCase().includes('urbano'))
      };
    }

    if (pathString.includes('Rock')) {
      return {
        subFolders: [],
        folderSongs: songs.filter((s) => s.genre?.toLowerCase().includes('rock'))
      };
    }

    if (pathString.includes('Lo-Fi')) {
      return {
        subFolders: [],
        folderSongs: songs.filter((s) => s.genre?.toLowerCase().includes('lo-fi') || s.genre?.toLowerCase().includes('chill'))
      };
    }

    // Default fallback
    return {
      subFolders: [],
      folderSongs: songs
    };
  };

  const { subFolders, folderSongs } = getFolderData();

  const handleNavigateInto = (folderName: string) => {
    setCurrentPath((prev) => [...prev, folderName]);
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
  };

  const handleNavigateBack = () => {
    if (currentPath.length > 4) {
      setCurrentPath((prev) => prev.slice(0, -1));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-24 text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-emerald-400" />
            <span>Navegador de Carpetas Locales</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Explora la estructura de directorios físicos de tu almacenamiento interno o tarjeta SD
          </p>
        </div>

        {folderSongs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayFolder(folderSongs)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Reproducir Carpeta ({folderSongs.length})</span>
            </button>

            <button
              onClick={() => onAddFolderToQueue(folderSongs)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
              title="Añadir todas las pistas a la cola"
            >
              <ListPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir a Cola</span>
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb Path Bar */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {currentPath.length > 4 && (
          <button
            onClick={handleNavigateBack}
            className="p-1 hover:text-emerald-400 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors mr-1"
            title="Subir un nivel"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />

        {currentPath.map((segment, index) => {
          const isLast = index === currentPath.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
              <button
                onClick={() => handleNavigateToBreadcrumb(index)}
                className={`truncate max-w-[150px] transition-colors ${
                  isLast
                    ? 'text-emerald-400 font-bold'
                    : 'text-zinc-400 hover:text-white hover:underline'
                }`}
              >
                {segment}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Folders List */}
      {subFolders.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
            Directorios ({subFolders.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subFolders.map((sf) => (
              <div
                key={sf.name}
                onClick={() => handleNavigateInto(sf.name)}
                className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <Folder className="w-5 h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs text-white truncate group-hover:text-emerald-400 transition-colors">
                      {sf.name}
                    </h5>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {sf.count} pistas • {sf.size}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files List in Current Folder */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Archivos en esta carpeta ({folderSongs.length})
        </span>

        {folderSongs.length === 0 ? (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-8 text-center space-y-2">
            <Music className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">
              No hay archivos de audio directos en esta carpeta. Selecciona una subcarpeta arriba.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
            {folderSongs.map((song, idx) => {
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
                        onPlaySong(song);
                      }}
                      className="w-5 h-5 text-emerald-400 hidden group-hover:flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>

                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <Music className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${
                        currentSong?.id === song.id ? 'text-emerald-400' : 'text-zinc-200'
                      }`}>
                        {song.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {song.artist} • <span className="text-zinc-500 font-mono">{song.fileSize || '3.8 MB'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      MP3 320k
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
