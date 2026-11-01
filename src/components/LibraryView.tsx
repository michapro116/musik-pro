import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  ListMusic, 
  Music, 
  ArrowUpDown, 
  Trash2, 
  FolderPlus, 
  CheckCircle2, 
  Tag, 
  Share2, 
  Download,
  Sparkles,
  Flame,
  Zap,
  Radio,
  Cloud
} from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { AudioQualityBadge } from './AudioQualityBadge';

interface LibraryViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (id: string) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenTagEditor: (song: Song) => void;
  onOpenGoogleDrive?: () => void;
}

type LibraryTab = 'all' | 'hires' | 'smart-mixes' | 'favorites' | 'playlists' | 'downloads' | 'gdrive';
type SortField = 'title' | 'artist' | 'album' | 'date' | 'playCount';

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onToggleFavorite,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectPlaylist,
  onOpenTagEditor,
  onOpenGoogleDrive
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [sortField, setSortField] = useState<SortField>('title');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getFilteredSongs = () => {
    let list = [...songs];
    if (activeTab === 'favorites') {
      list = list.filter((s) => s.isFavorite);
    } else if (activeTab === 'downloads') {
      list = list.filter((s) => s.isDownloaded);
    } else if (activeTab === 'hires') {
      list = list.filter((s) => s.isHiRes || s.audioFormat === 'FLAC');
    } else if (activeTab === 'gdrive') {
      list = list.filter((s) => s.id.startsWith('gdrive') || s.genre === 'Google Drive Nube');
    }

    list.sort((a, b) => {
      if (sortField === 'title') return a.title.localeCompare(b.title);
      if (sortField === 'artist') return a.artist.localeCompare(b.artist);
      if (sortField === 'album') return a.album.localeCompare(b.album);
      if (sortField === 'date') return (b.dateAdded || 0) - (a.dateAdded || 0);
      if (sortField === 'playCount') return (b.playCount || 0) - (a.playCount || 0);
      return 0;
    });

    return list;
  };

  const filteredSongs = getFilteredSongs();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    onCreatePlaylist(newPlName.trim(), newPlDesc.trim());
    setNewPlName('');
    setNewPlDesc('');
    setIsModalOpen(false);
  };

  // Export playlist as .m3u file
  const handleExportM3U = (pl: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    const plSongs = songs.filter((s) => pl.songIds.includes(s.id));
    let content = '#EXTM3U\n';
    plSongs.forEach((song) => {
      content += `#EXTINF:${Math.floor(song.duration)},${song.artist} - ${song.title}\n`;
      content += `${song.title.replace(/\s+/g, '_')}.mp3\n`;
    });

    const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pl.name.replace(/[^a-zA-Z0-9]/g, '_')}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24 text-white max-w-5xl mx-auto">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tu Biblioteca Musical</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Colección local almacenada en tu memoria y listas personalizadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenGoogleDrive && (
            <button
              onClick={onOpenGoogleDrive}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Explorar tu música en Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Drive</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Lista</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todas ({songs.length})
          </button>

          <button
            onClick={() => setActiveTab('gdrive')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'gdrive'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow'
                : 'text-cyan-400/80 hover:text-cyan-300'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            Google Drive ({songs.filter((s) => s.id.startsWith('gdrive') || s.genre === 'Google Drive Nube').length})
          </button>

          <button
            onClick={() => setActiveTab('hires')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'hires'
                ? 'bg-gradient-to-r from-amber-950/70 to-yellow-950/70 text-amber-300 border border-amber-500/50 shadow'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hi-Res Lossless ({songs.filter((s) => s.isHiRes || s.audioFormat === 'FLAC').length})
          </button>

          <button
            onClick={() => setActiveTab('smart-mixes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'smart-mixes'
                ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/50 shadow'
                : 'text-indigo-400/80 hover:text-indigo-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Mixes Inteligentes
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            Favoritos ({songs.filter((s) => s.isFavorite).length})
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'playlists'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            Listas ({playlists.length})
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'downloads'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Descargas Offline ({songs.filter((s) => s.isDownloaded).length})
          </button>
        </div>

        {/* Sort Selector */}
        {activeTab !== 'playlists' && activeTab !== 'smart-mixes' && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
            >
              <option value="title">Título (A-Z)</option>
              <option value="artist">Artista (A-Z)</option>
              <option value="album">Álbum</option>
              <option value="date">Fecha de adición</option>
              <option value="playCount">Más reproducidas</option>
            </select>
          </div>
        )}
      </div>

      {/* Content based on Tab */}
      {activeTab === 'playlists' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800 rounded-2xl p-4 cursor-pointer group transition-all space-y-3"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-800 relative shadow-md">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                    <ListMusic className="w-12 h-12 text-emerald-400/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-2">
                  <h4 className="font-semibold text-sm truncate text-white group-hover:text-emerald-400 transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                    {pl.description || `${pl.songIds.length} canciones`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleExportM3U(pl, e)}
                    className="p-1.5 text-zinc-500 hover:text-cyan-400 transition-colors"
                    title="Exportar lista en formato .M3U"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!pl.id.startsWith('pl-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Eliminar lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'smart-mixes' ? (
        /* Smart Dynamic Mixes View */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-lg text-white">Generador de Mixes Dinámicos</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Algoritmo inteligente de MiMusic Pro que agrupa tus pistas locales según formato audiófilo, energía acústica, frecuencia de reproducción y géneros con 1 toque.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mix 1: Hi-Res Audiophile */}
            <div className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 hover:border-amber-500/60 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-lg">
                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                      Joyas Audiófilas Hi-Res
                    </h4>
                    <p className="text-xs text-amber-400/80 font-mono">
                      FLAC 24-Bit / 96kHz Lossless
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {songs.filter(s => s.isHiRes || s.audioFormat === 'FLAC').length} pistas
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Pistas sin pérdida de información de estudio para disfrutar de la máxima resolución acústica y rango dinámico.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const hiResTracks = songs.filter(s => s.isHiRes || s.audioFormat === 'FLAC');
                    if (hiResTracks.length > 0) onPlaySong(hiResTracks[0]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Reproducir Mix</span>
                </button>
                <button
                  onClick={() => {
                    const hiResTracks = songs.filter(s => s.isHiRes || s.audioFormat === 'FLAC');
                    onCreatePlaylist('Joyas Audiófilas Hi-Res', 'Mix dinámico de archivos FLAC 24-bit');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Guardar como lista fija"
                >
                  Guardar Lista
                </button>
              </div>
            </div>

            {/* Mix 2: High Energy & BPM */}
            <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-2xl p-5 space-y-4 hover:border-emerald-500/60 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-black shadow-lg">
                    <Flame className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                      Alta Energía & BPM
                    </h4>
                    <p className="text-xs text-emerald-400/80 font-mono">
                      Reggaetón, Urbano & Rock
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {songs.filter(s => s.genre?.includes('Urbano') || s.genre?.includes('Rock') || s.genre?.includes('Reggaetón')).length} pistas
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Subgraves profundos y baterías rápidas para entrenar, conducir o elevar la adrenalina en cualquier momento.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const energyTracks = songs.filter(s => s.genre?.includes('Urbano') || s.genre?.includes('Rock') || s.genre?.includes('Reggaetón'));
                    if (energyTracks.length > 0) onPlaySong(energyTracks[0]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Reproducir Mix</span>
                </button>
                <button
                  onClick={() => {
                    onCreatePlaylist('Alta Energía & BPM', 'Mix de ritmos urbanos y rock potente');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Guardar como lista fija"
                >
                  Guardar Lista
                </button>
              </div>
            </div>

            {/* Mix 3: Top Most Played */}
            <div className="bg-zinc-900/80 border border-purple-500/30 rounded-2xl p-5 space-y-4 hover:border-purple-500/60 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                    <Radio className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                      Top Frecuentes (Top 25)
                    </h4>
                    <p className="text-xs text-purple-400/80 font-mono">
                      Mayor Recurrencia
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {songs.length} pistas
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Tus canciones más reproducidas ordenadas automáticamente según tu historial de escucha en el dispositivo.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const sorted = [...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
                    if (sorted.length > 0) onPlaySong(sorted[0]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Reproducir Mix</span>
                </button>
                <button
                  onClick={() => {
                    onCreatePlaylist('Top 25 Más Escuchadas', 'Tus canciones favoritas más reproducidas');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Guardar como lista fija"
                >
                  Guardar Lista
                </button>
              </div>
            </div>

            {/* Mix 4: Midnight Chill & Lo-Fi */}
            <div className="bg-zinc-900/80 border border-cyan-500/30 rounded-2xl p-5 space-y-4 hover:border-cyan-500/60 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black shadow-lg">
                    <Music className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                      Sesión Chill & Lo-Fi
                    </h4>
                    <p className="text-xs text-cyan-400/80 font-mono">
                      Acústica & Concentración
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {songs.filter(s => s.genre?.includes('Chill') || s.genre?.includes('Acústica') || s.genre?.includes('Lo-Fi')).length} pistas
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Sonidos orgánicos, calidez de vinilo y armonías relajantes para leer, trabajar o descansar por la noche.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const chillTracks = songs.filter(s => s.genre?.includes('Chill') || s.genre?.includes('Acústica') || s.genre?.includes('Lo-Fi'));
                    if (chillTracks.length > 0) onPlaySong(chillTracks[0]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Reproducir Mix</span>
                </button>
                <button
                  onClick={() => {
                    onCreatePlaylist('Sesión Chill & Lo-Fi', 'Música relajante para descanso y estudio');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  title="Guardar como lista fija"
                >
                  Guardar Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
          {filteredSongs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              {activeTab === 'gdrive' ? (
                <>
                  <Cloud className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-zinc-200">No hay canciones importadas de Google Drive aún</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Conecta tu cuenta de Google Drive para explorar tus carpetas de música y reproducir directamente desde tu nube personal.
                  </p>
                  {onOpenGoogleDrive && (
                    <button
                      onClick={onOpenGoogleDrive}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Cloud className="w-4 h-4 fill-current" />
                      <span>Conectar con Google Drive</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Music className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-zinc-300">No hay canciones en esta sección</h4>
                  <p className="text-xs text-zinc-500">Explora o marca tus temas favoritos con el corazón.</p>
                </>
              )}
            </div>
          ) : (
            filteredSongs.map((song, idx) => {
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
            })
          )}
        </div>
      )}

      {/* New Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Crear Lista de Reproducción</h3>
                <p className="text-xs text-zinc-400">Organiza tus canciones locales</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Nombre de la lista</label>
                <input
                  type="text"
                  required
                  placeholder="p. ej. Mis Favoritas Reggaetón"
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Descripción (opcional)</label>
                <input
                  type="text"
                  placeholder="p. ej. Para entrenar o viajar en auto"
                  value={newPlDesc}
                  onChange={(e) => setNewPlDesc(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
                >
                  Crear Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
