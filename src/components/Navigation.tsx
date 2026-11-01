import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Sliders, 
  Smartphone, 
  Cloud, 
  ArrowDownToLine, 
  Music, 
  FolderTree, 
  Cast,
  Car,
  Database,
  AppWindow,
  Radio
} from 'lucide-react';
import { subscribeToAuth, AuthState, getCurrentUser, getAccessToken } from '../services/firebaseAuth';

export type TabType = 'home' | 'search' | 'library' | 'folders' | 'audiopro' | 'downloads' | 'android-project';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenGoogleDrive: () => void;
  onOpenCastModal: () => void;
  onOpenCarMode: () => void;
  onOpenBackupModal: () => void;
  onOpenWidgetModal: () => void;
  onOpenInstallModal?: () => void;
  activeDeviceName: string;
  playlistCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenGoogleDrive,
  onOpenCastModal,
  onOpenCarMode,
  onOpenBackupModal,
  onOpenWidgetModal,
  onOpenInstallModal,
  activeDeviceName,
  playlistCount
}) => {
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

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0a0a0d]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Music className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            MiMusic <span className="text-[10px] bg-emerald-500 text-black px-1 py-0.2 rounded font-black">PRO</span>
          </span>
        </div>

        {/* Quick Mobile Action Bar */}
        <div className="flex items-center gap-1.5">
          {/* Quick APK Export button */}
          <button
            onClick={() => onSelectTab('android-project')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              currentTab === 'android-project'
                ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-sm'
                : 'bg-zinc-800/90 text-emerald-300 border-emerald-500/30 hover:bg-zinc-700'
            }`}
            title="Exportar APK y Proyecto Android Studio"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">APK</span>
          </button>

          {/* Quick Install App button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 shadow-sm transition-all active:scale-95"
              title="Instalar MiMusic Pro gratis en tu celular"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-[11px]">Instalar</span>
            </button>
          )}

          {/* Quick Google Drive button */}
          <button
            onClick={onOpenGoogleDrive}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              authState.isAuthenticated
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
            title="Google Drive Cloud Music"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">{authState.isAuthenticated ? 'Drive' : 'Conectar'}</span>
            {authState.isAuthenticated && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Quick Cast Button */}
          <button
            onClick={onOpenCastModal}
            className="p-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-indigo-300"
            title={activeDeviceName}
          >
            <Cast className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a0a0d] border-r border-zinc-800/80 p-4 shrink-0 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Music className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              MiMusic <span className="text-xs bg-emerald-500 text-black px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">PRO</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Reproductor Personal Offline</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          <button
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'home'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Home className={`w-5 h-5 ${currentTab === 'home' ? 'text-emerald-400' : ''}`} />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => onSelectTab('search')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'search'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Search className={`w-5 h-5 ${currentTab === 'search' ? 'text-emerald-400' : ''}`} />
            <span>Buscar</span>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'library'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <Library className={`w-5 h-5 ${currentTab === 'library' ? 'text-emerald-400' : ''}`} />
            <span>Tu biblioteca</span>
          </button>

          <button
            onClick={() => onSelectTab('folders')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'folders'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <FolderTree className={`w-5 h-5 ${currentTab === 'folders' ? 'text-emerald-400' : ''}`} />
            <span>Carpetas Físicas</span>
          </button>

          <button
            onClick={() => onSelectTab('audiopro')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'audiopro'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Audio Pro (10 Bandas)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">EQ</span>
          </button>

          <button
            onClick={() => onSelectTab('downloads')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'downloads'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <ArrowDownToLine className={`w-5 h-5 ${currentTab === 'downloads' ? 'text-emerald-400' : ''}`} />
            <span>Descargas & Offline</span>
          </button>
        </nav>

        {/* Audio Output Selector Pill & Cloud / APK section */}
        <div className="mt-auto pt-4 border-t border-zinc-800/80 space-y-2">
          {/* Active Audio Output Device Button */}
          <button
            onClick={onOpenCastModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Cast className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">{activeDeviceName}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
          </button>

          {/* Car Driving Mode */}
          <button
            onClick={onOpenCarMode}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 hover:text-white hover:bg-amber-950/40 transition-colors border border-amber-500/30 bg-amber-950/20"
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>Modo Conducción Auto</span>
          </button>

          {/* Google Drive & Backup row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenGoogleDrive}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors border truncate ${
                authState.isAuthenticated
                  ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Google Drive Nube"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Google Drive</span>
              {authState.isAuthenticated && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            <button
              onClick={onOpenBackupModal}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border border-zinc-800 truncate"
              title="Copia de Seguridad & Restaurar"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Backup</span>
            </button>
          </div>

          {/* Widget Android simulator */}
          <button
            onClick={onOpenWidgetModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border border-zinc-800"
          >
            <AppWindow className="w-4 h-4 text-cyan-400" />
            <span>Widget Pantalla de Inicio</span>
          </button>

          {/* Install on Mobile App button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Instalar Gratis en Celular</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('android-project')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'android-project'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800/90 text-white hover:bg-zinc-700/80 border border-emerald-500/30'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-black" />
            <span>Exportar APK / Android Studio</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0d0d12]/98 backdrop-blur-xl border-t border-zinc-800/90 px-1 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex-1 flex flex-col items-center py-1 px-1 text-[10px] transition-colors ${
            currentTab === 'home' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="truncate">Inicio</span>
        </button>

        <button
          onClick={() => onSelectTab('search')}
          className={`flex-1 flex flex-col items-center py-1 px-1 text-[10px] transition-colors ${
            currentTab === 'search' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="truncate">Buscar</span>
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`flex-1 flex flex-col items-center py-1 px-1 text-[10px] transition-colors ${
            currentTab === 'library' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Library className="w-5 h-5 mb-0.5" />
          <span className="truncate">Biblioteca</span>
        </button>

        <button
          onClick={() => onSelectTab('folders')}
          className={`flex-1 flex flex-col items-center py-1 px-1 text-[10px] transition-colors ${
            currentTab === 'folders' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderTree className="w-5 h-5 mb-0.5" />
          <span className="truncate">Carpetas</span>
        </button>

        <button
          onClick={() => onSelectTab('audiopro')}
          className={`flex-1 flex flex-col items-center py-1 px-1 text-[10px] transition-colors ${
            currentTab === 'audiopro' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="truncate">Audio Pro</span>
        </button>
      </nav>
    </>
  );
};
