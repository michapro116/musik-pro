import React, { useState, useMemo } from 'react';
import { Search, X, Play, Pause, Heart, Music, Mic2, Disc, Filter, Tag } from 'lucide-react';
import { Song } from '../types/music';
import { AudioQualityBadge } from './AudioQualityBadge';

interface SearchViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenTagEditor?: (song: Song) => void;
}

type FilterType = 'all' | 'songs' | 'artists' | 'albums';

export const SearchView: React.FC<SearchViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onToggleFavorite,
  onOpenTagEditor
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return songs;
    const lower = query.toLowerCase();

    return songs.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(lower);
      const matchArtist = s.artist.toLowerCase().includes(lower);
      const matchAlbum = s.album.toLowerCase().includes(lower);
      const matchGenre = s.genre?.toLowerCase().includes(lower);

      if (activeFilter === 'songs') return matchTitle;
      if (activeFilter === 'artists') return matchArtist;
      if (activeFilter === 'albums') return matchAlbum;
      return matchTitle || matchArtist || matchAlbum || matchGenre;
    });
  }, [songs, query, activeFilter]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-24 text-white max-w-5xl mx-auto">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué quieres escuchar hoy? Título, artista o álbum..."
          className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border border-zinc-700/80 rounded-2xl text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'all'
              ? 'bg-white text-black'
              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Todo
        </button>
        <button
          onClick={() => setActiveFilter('songs')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeFilter === 'songs'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Canciones
        </button>
        <button
          onClick={() => setActiveFilter('artists')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeFilter === 'artists'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Mic2 className="w-3.5 h-3.5" />
          Artistas
        </button>
        <button
          onClick={() => setActiveFilter('albums')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeFilter === 'albums'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          Álbumes
        </button>
      </div>

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{filteredSongs.length} resultados encontrados</span>
          {query && <span>Buscando por "{query}"</span>}
        </div>

        {filteredSongs.length === 0 ? (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-12 text-center space-y-3">
            <Music className="w-12 h-12 text-zinc-600 mx-auto" />
            <h4 className="text-base font-semibold text-zinc-300">
              No se encontraron canciones para tu búsqueda
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Comprueba que el nombre esté bien escrito o importa más archivos de música desde tu dispositivo.
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
            {filteredSongs.map((song) => {
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSong?.id === song.id) {
                          onTogglePlay();
                        } else {
                          onPlaySong(song);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-black flex items-center justify-center transition-colors shrink-0"
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
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
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${
                          currentSong?.id === song.id ? 'text-emerald-400' : 'text-zinc-200'
                        }`}>
                          {song.title}
                        </p>
                        <AudioQualityBadge song={song} size="sm" />
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {song.artist} • <span className="text-zinc-500">{song.album}</span>
                        {song.bitrate && <span className="text-zinc-500 font-mono text-[10px] ml-1.5">• {song.bitrate}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {onOpenTagEditor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTagEditor(song);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar etiquetas y metadatos ID3"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    )}

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
