import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  X, 
  FolderSync, 
  DownloadCloud, 
  Folder, 
  Music, 
  Check, 
  ArrowLeft, 
  HardDrive, 
  RefreshCw, 
  Play, 
  Search, 
  LogOut, 
  AlertCircle, 
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Song } from '../types/music';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  getCurrentUser, 
  subscribeToAuth, 
  AuthState 
} from '../services/firebaseAuth';
import { 
  fetchDriveAudioFiles, 
  fetchDriveFolders, 
  fetchDriveAudioBlob, 
  convertDriveFileToSong, 
  DriveApiFile, 
  DriveFolder 
} from '../services/driveService';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDriveSong: (song: Song) => void;
  onPlaySong?: (song: Song) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onImportDriveSong,
  onPlaySong
}) => {
  const [activeTab, setActiveTab] = useState<'browser' | 'setup' | 'architecture'>('browser');
  
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: getCurrentUser(),
    accessToken: getAccessToken(),
    isAuthenticated: !!getCurrentUser() && !!getAccessToken()
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive content state
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveApiFile[]>([]);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Download & Stream progress state
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [streamingFileId, setStreamingFileId] = useState<string | null>(null);

  // Subscribe to auth state updates
  useEffect(() => {
    const unsub = subscribeToAuth((state) => {
      setAuthState(state);
    });
    return unsub;
  }, []);

  // When modal is open and authenticated, auto-load drive files
  useEffect(() => {
    if (isOpen && authState.isAuthenticated && authState.accessToken) {
      loadDriveData(authState.accessToken);
    }
  }, [isOpen, authState.isAuthenticated, authState.accessToken, selectedFolderId]);

  const loadDriveData = async (token: string) => {
    setIsLoadingFiles(true);
    setFetchError(null);
    try {
      const [files, folders] = await Promise.all([
        fetchDriveAudioFiles(token, { 
          folderId: selectedFolderId || undefined,
          searchQuery: searchQuery || undefined 
        }),
        selectedFolderId ? Promise.resolve([]) : fetchDriveFolders(token).catch(() => [])
      ]);

      setDriveFiles(files);
      if (!selectedFolderId) {
        setDriveFolders(folders);
      }
    } catch (err: any) {
      console.error('Error fetching Google Drive music:', err);
      setFetchError(err.message || 'No se pudieron cargar los archivos de Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result.accessToken) {
        await loadDriveData(result.accessToken);
      }
    } catch (err: any) {
      console.error('Failed to log in with Google:', err);
      // Friendly message for cancelled popups vs network
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Ventana de acceso cerrada antes de completar el inicio de sesión.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Operación cancelada.');
      } else {
        setAuthError(err.message || 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDriveFiles([]);
      setDriveFolders([]);
      setSelectedFolderId(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePlayDriveFile = async (file: DriveApiFile) => {
    if (!authState.accessToken) return;
    setStreamingFileId(file.id);
    try {
      const { objectUrl } = await fetchDriveAudioBlob(file.id, authState.accessToken);
      const song = convertDriveFileToSong(file, objectUrl);
      onImportDriveSong(song);
      if (onPlaySong) {
        onPlaySong(song);
      }
    } catch (err: any) {
      console.error('Error streaming Google Drive file:', err);
      alert('No se pudo reproducir el archivo de Drive: ' + (err.message || 'Error desconocido'));
    } finally {
      setStreamingFileId(null);
    }
  };

  const handleDownloadFile = async (file: DriveApiFile) => {
    if (!authState.accessToken || downloadingIds[file.id] !== undefined || downloadedIds.includes(file.id)) {
      return;
    }

    setDownloadingIds((prev) => ({ ...prev, [file.id]: 10 }));
    try {
      const { objectUrl } = await fetchDriveAudioBlob(
        file.id, 
        authState.accessToken, 
        (percent) => {
          setDownloadingIds((prev) => ({ ...prev, [file.id]: percent }));
        }
      );

      const song = convertDriveFileToSong(file, objectUrl);
      song.isDownloaded = true;
      onImportDriveSong(song);
      setDownloadedIds((prev) => [...prev, file.id]);
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Error descargando canción de Google Drive: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setDownloadingIds((prev) => {
        const { [file.id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e14] border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Cloud className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>Google Drive Cloud Music</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  Nube Personal
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Usa tu cuenta de Google Drive para explorar y reproducir tu música directamente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 px-6 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('browser')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'browser'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Explorador de Música de Drive
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Configuración Android APK
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Seguridad & Permisos (drive.readonly)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {activeTab === 'browser' && (
            <div className="space-y-4">
              
              {/* Account Connection Status Bar */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {authState.isAuthenticated && authState.user ? (
                    authState.user.photoURL ? (
                      <img 
                        src={authState.user.photoURL} 
                        alt="Perfil" 
                        className="w-10 h-10 rounded-full border border-emerald-500/50 shadow-md shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                        {(authState.user.displayName || authState.user.email || 'GD').substring(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0">
                      <Cloud className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {authState.isAuthenticated && authState.user
                          ? (authState.user.displayName || authState.user.email)
                          : 'Google Drive no conectado'}
                      </span>
                      {authState.isAuthenticated && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {authState.isAuthenticated && authState.user
                        ? `${authState.user.email} • Acceso a archivos de audio`
                        : 'Inicia sesión con tu cuenta de Google para acceder a tus archivos'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {authState.isAuthenticated ? (
                    <>
                      <button
                        onClick={() => authState.accessToken && loadDriveData(authState.accessToken)}
                        disabled={isLoadingFiles}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                        title="Actualizar archivos de Drive"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 border border-zinc-800 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </>
                  ) : (
                    /* Official Google Sign-In Styled Button */
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isAuthenticating}
                      className="gsi-material-button relative inline-flex items-center justify-center bg-white hover:bg-zinc-100 text-[#1f1f1f] text-xs font-medium px-4 py-2.5 rounded-xl border border-zinc-300 shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      <div className="mr-2 w-4 h-4 shrink-0">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                      </div>
                      <span className="font-semibold text-zinc-900">
                        {isAuthenticating ? 'Abriendo Google...' : 'Acceder con Google'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error messages */}
              {authError && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-3 text-rose-300 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-rose-200">Aviso de autenticación:</span>
                    <p className="mt-0.5 text-zinc-300">{authError}</p>
                  </div>
                </div>
              )}

              {fetchError && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-300 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block text-amber-200">Error al leer Google Drive:</span>
                    <p className="mt-0.5 text-zinc-300">{fetchError}</p>
                    <button
                      onClick={() => authState.accessToken && loadDriveData(authState.accessToken)}
                      className="mt-2 text-cyan-400 underline font-semibold hover:text-cyan-300"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              )}

              {/* Unauthenticated State */}
              {!authState.isAuthenticated ? (
                <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/5">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-bold text-base text-white">Conecta tu cuenta de Google Drive</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Inicia sesión con tu cuenta de Google para reproducir archivos MP3, FLAC y WAV almacenados en tu Google Drive. Sin necesidad de cargarlos manualmente ni ocupar espacio en el dispositivo.
                    </p>
                  </div>

                  {/* Big Call to Action Google Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isAuthenticating}
                      className="inline-flex items-center justify-center bg-white hover:bg-zinc-100 text-zinc-900 font-semibold px-6 py-3 rounded-2xl shadow-xl shadow-white/10 hover:shadow-cyan-500/20 transition-all active:scale-95 text-sm gap-3 cursor-pointer"
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      <span>{isAuthenticating ? 'Conectando con Google...' : 'Iniciar Sesión con Google'}</span>
                    </button>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Solo lectura de audio
                    </span>
                    <span>•</span>
                    <span>Tokens protegidos en memoria</span>
                  </div>
                </div>
              ) : (
                /* Authenticated State: Real Drive Content Browser */
                <div className="space-y-4">
                  {/* Search and Navigation Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && authState.accessToken) {
                            loadDriveData(authState.accessToken);
                          }
                        }}
                        placeholder="Buscar canción en Google Drive..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    <button
                      onClick={() => authState.accessToken && loadDriveData(authState.accessToken)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Buscar en Drive</span>
                    </button>
                  </div>

                  {/* Folder Back Link if inside a folder */}
                  {selectedFolderId && (
                    <div className="flex items-center justify-between bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => setSelectedFolderId(null)}
                        className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver a todas las canciones de Drive</span>
                      </button>
                      <span className="text-xs text-zinc-400 font-mono">Carpeta seleccionada</span>
                    </div>
                  )}

                  {/* Folders List if at root */}
                  {!selectedFolderId && driveFolders.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                        Carpetas en tu Google Drive ({driveFolders.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {driveFolders.map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-cyan-500/40 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Folder className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                              <span className="font-semibold text-xs text-white truncate">{folder.name}</span>
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono group-hover:text-cyan-400 transition-colors">&gt;</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Track List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Archivos de Audio en Google Drive ({driveFiles.length})
                      </span>
                      {isLoadingFiles && (
                        <span className="text-xs text-cyan-400 flex items-center gap-1.5 animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Cargando canciones de Drive...</span>
                        </span>
                      )}
                    </div>

                    {isLoadingFiles && driveFiles.length === 0 ? (
                      <div className="p-12 text-center space-y-3 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                        <p className="text-xs text-zinc-400">Escaneando archivos de audio en tu Google Drive...</p>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-3">
                        <Music className="w-10 h-10 text-zinc-600 mx-auto" />
                        <h5 className="font-semibold text-sm text-zinc-300">No se encontraron archivos de música</h5>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          Sube archivos con formato <span className="text-emerald-400 font-mono">.mp3</span>, <span className="text-emerald-400 font-mono">.flac</span> o <span className="text-emerald-400 font-mono">.wav</span> a tu Google Drive y pulsa "Actualizar".
                        </p>
                        <button
                          onClick={() => authState.accessToken && loadDriveData(authState.accessToken)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Volver a escanear Drive</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800 divide-y divide-zinc-800/60 overflow-hidden">
                        {driveFiles.map((file) => {
                          const isDownloading = downloadingIds[file.id] !== undefined;
                          const progress = downloadingIds[file.id] || 0;
                          const isDownloaded = downloadedIds.includes(file.id);
                          const isStreaming = streamingFileId === file.id;

                          return (
                            <div 
                              key={file.id} 
                              className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                                  {isStreaming ? (
                                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                                  ) : (
                                    <Music className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-white truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                    <span className="text-cyan-400 font-medium">Google Drive</span>
                                    <span>•</span>
                                    <span className="text-zinc-500 font-mono">{file.mimeType.split('/')[1] || 'audio'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Direct Play Button */}
                                <button
                                  onClick={() => handlePlayDriveFile(file)}
                                  disabled={isStreaming}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                  title="Reproducir directamente desde Drive"
                                >
                                  {isStreaming ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  )}
                                  <span>{isStreaming ? 'Cargando...' : 'Reproducir'}</span>
                                </button>

                                {/* Offline Download Button */}
                                {isDownloaded ? (
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1.5 rounded-xl border border-emerald-500/30">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>En Biblioteca</span>
                                  </span>
                                ) : isDownloading ? (
                                  <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800">
                                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-cyan-400 transition-all duration-200"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-mono text-cyan-400">{progress}%</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                                    title="Descargar para reproducción offline"
                                  >
                                    <DownloadCloud className="w-4 h-4 text-cyan-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                Para que la aplicación compilada en Android Studio se conecte de forma nativa a tu Google Drive sin servidores intermedios:
              </p>

              <ol className="space-y-3 list-decimal list-inside text-zinc-300 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
                <li className="leading-relaxed">
                  Ingresa a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Google Cloud Console</a> en tu proyecto configurado.
                </li>
                <li className="leading-relaxed">
                  Verifica que la <b>Google Drive API</b> esté habilitada en Biblioteca de APIs.
                </li>
                <li className="leading-relaxed">
                  En <b>Pantalla de consentimiento OAuth</b>, ya cuentas con el scope:
                  <code className="text-emerald-300 font-mono bg-black/60 px-1.5 py-0.5 rounded block my-1">
                    https://www.googleapis.com/auth/drive.readonly
                  </code>
                </li>
                <li className="leading-relaxed">
                  Crea una credencial de tipo <b>ID de cliente de OAuth 2.0</b> seleccionando <b>Android</b> con paquete <code className="text-emerald-300 font-mono bg-black/60 px-1.5 py-0.5 rounded">com.mimusic.pro</code>.
                </li>
                <li className="leading-relaxed">
                  Pega tu huella digital SHA-1 en la consola de Google. La app utilizará Google Play Services y Credential Manager para inicio de sesión en 1 toque.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-300">Principio de Mínimo Privilegio (drive.readonly)</h4>
                  <p className="leading-relaxed">
                    La aplicación solicita únicamente permiso de solo lectura de archivos musicales. No tiene acceso para modificar, borrar ni compartir documentos en tu Google Drive.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <h4 className="font-bold text-white">Tokens temporales en memoria</h4>
                <p className="leading-relaxed text-zinc-400">
                  Siguiendo las pautas de seguridad de Google Workspace, el token OAuth se almacena estrictamente en memoria RAM y nunca en localStorage o cookies no seguras. Al cerrar sesión o recargar, el token se destruye limpiamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>MiMusic Pro • Nube Google Drive</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
