import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Upload, 
  Folder, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Music2, 
  HardDrive,
  Cloud,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { Song, Playlist } from '../types/music';
import { subscribeToAuth, AuthState, getCurrentUser, getAccessToken } from '../services/firebaseAuth';

interface HomeViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleFavorite: (songId: string) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onImportLocalFiles: (files: FileList) => void;
  onOpenAudioPro: () => void;
  onOpenGoogleDrive: () => void;
  onOpenInstallModal?: () => void;
  onOpenAndroidProject?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onToggleFavorite,
  onSelectPlaylist,
  onImportLocalFiles,
  onOpenAudioPro,
  onOpenGoogleDrive,
  onOpenInstallModal,
  onOpenAndroidProject
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    user: getCurrentUser(),
    accessToken: getAccessToken(),
    isAuthenticated: !!getCurrentUser() && !!getAccessToken()
  });

  useEffect(() => {
    const unsub = subscribeToAuth((state) => {
      setAuthState(state);
    });
    return unsub;
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportLocalFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-8 pb-24 text-white">
      {/* Header & Local Audio Uploader Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Bienvenido a tu reproductor <span className="text-emerald-400 font-semibold">MiMusic Pro</span>.
          </p>
        </div>

        {/* Action Buttons: Local File Loader, Drive Cloud, and EQ */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-all shadow-md active:scale-95"
            title="Cargar archivos de tu disco duro local"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Cargar MP3 local</span>
          </button>

          {/* Primary Google Drive Cloud button */}
          <button
            onClick={onOpenGoogleDrive}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shadow-md active:scale-95 ${
              authState.isAuthenticated
                ? 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/40'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/50 shadow-cyan-500/20'
            }`}
          >
            <Cloud className="w-4 h-4 text-white shrink-0" />
            <span>{authState.isAuthenticated ? 'Nube Google Drive' : 'Conectar a Google Drive'}</span>
            {authState.isAuthenticated && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Install on Mobile button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all shadow-md active:scale-95"
              title="Instalar MiMusic Pro gratis en tu celular"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Instalar en Celular</span>
            </button>
          )}

          {/* Export APK / Android Studio */}
          {onOpenAndroidProject && (
            <button
              onClick={onOpenAndroidProject}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all shadow-md active:scale-95"
              title="Descargar proyecto Android Studio y compilar APK con GitHub Actions"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Exportar APK</span>
            </button>
          )}

          <button
            onClick={onOpenAudioPro}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Audio Pro EQ</span>
          </button>
        </div>
      </div>

      {/* Prominent Google Drive Hero Cloud Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1e28] via-[#0d151c] to-[#0c0d12] p-6 border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-400 text-black">
              <Cloud className="w-3.5 h-3.5 stroke-[2.5]" /> Google Drive Nube
            </span>
            <span className="text-xs text-cyan-300/90 font-mono">
              {authState.isAuthenticated ? 'Cuenta conectada' : 'Tu música en la nube'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authState.isAuthenticated 
              ? `Google Drive activo para ${authState.user?.displayName || authState.user?.email || 'tu cuenta'}`
              : 'Usa tu cuenta de Google Drive como la nube de la aplicación'}
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {authState.isAuthenticated
              ? 'Tus archivos musicales de Google Drive están sincronizados. Puedes reproducir pistas al instante o descargarlas a tu almacenamiento offline.'
              : 'Conecta tu cuenta de Google Drive para acceder y reproducir directamente tus canciones MP3, FLAC y WAV sin ocupar memoria en el dispositivo.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          {authState.isAuthenticated ? (
            <button
              onClick={onOpenGoogleDrive}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-xl shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Cloud className="w-4 h-4 fill-current" />
              <span>Explorar Música en Drive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            /* Official Google Sign In button */
            <button
              onClick={onOpenGoogleDrive}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs shadow-xl shadow-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Conectar y Loguear en Google Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Top Grid (Spotify Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {playlists.slice(0, 3).map((pl) => {
          const firstSong = songs.find((s) => pl.songIds.includes(s.id));
          const isThisPlPlaying = isPlaying && currentSong && pl.songIds.includes(currentSong.id);

          return (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="flex items-center bg-zinc-900/60 hover:bg-zinc-800/80 rounded-xl overflow-hidden cursor-pointer group transition-all border border-zinc-800/50 shadow-sm"
            >
              <div className="w-16 h-16 shrink-0 bg-zinc-800 relative">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400 font-bold">
                    <Folder className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 px-4 min-w-0">
                <h4 className="font-semibold text-sm truncate text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {pl.name}
                </h4>
                <p className="text-xs text-zinc-500 truncate">{pl.songIds.length} canciones</p>
              </div>
              <div className="pr-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (firstSong) {
                      if (currentSong?.id === firstSong.id) {
                        onTogglePlay();
                      } else {
                        onPlaySong(firstSong);
                      }
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                >
                  {isThisPlPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Banner: Audio Pro Engine Ready */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900/90 to-zinc-900 p-6 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black">
              <Sparkles className="w-3 h-3" /> Nuevo Motor Audio Pro
            </span>
            <span className="text-xs text-emerald-400 font-mono">10 Bandas + Bass Booster</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Sonido de alta definición adaptado a tus auriculares
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Perfiles calibrados para Reggaetón con graves profundos, música Urbana, Rock y Voces claras. Conéctalo con tus archivos de música o auriculares favoritos.
          </p>
        </div>
        <button
          onClick={onOpenAudioPro}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-transform active:scale-95"
        >
          <span>Abrir Ecualizador</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Recently Added Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Canciones recientes en tu dispositivo</h3>
          <span className="text-xs text-zinc-400">{songs.length} pistas en memoria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {songs.slice(0, 6).map((song) => {
            const isThisPlaying = isPlaying && currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                  isThisPlaying
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/60 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 relative overflow-hidden shrink-0">
                    {song.artwork ? (
                      <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                        <Music2 className="w-5 h-5" />
                      </div>
                    )}
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h5 className="font-semibold text-sm text-white truncate">{song.title}</h5>
                    <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      {song.audioFormat && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 font-mono">
                          {song.audioFormat}
                        </span>
                      )}
                      <span>{song.fileSize || 'Audio local'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      song.isFavorite ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentSong?.id === song.id) {
                        onTogglePlay();
                      } else {
                        onPlaySong(song);
                      }
                    }}
                    className="p-2.5 rounded-full bg-emerald-500 text-black hover:scale-105 active:scale-95 transition-all"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
