import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Sliders, 
  Music, 
  ListMusic 
} from 'lucide-react';
import { Song, Playlist, EqualizerSettings, LibraryBackup } from '../types/music';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  playlists: Playlist[];
  eqSettings: EqualizerSettings;
  onRestoreBackup: (backup: LibraryBackup) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  songs,
  playlists,
  eqSettings,
  onRestoreBackup
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Export full JSON backup
  const handleExportBackup = () => {
    try {
      const backup: LibraryBackup = {
        version: '1.2.0',
        timestamp: Date.now(),
        appName: 'MiMusic Pro',
        songs,
        playlists,
        equalizerSettings: eqSettings
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `MiMusicPro_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('¡Copia de seguridad exportada correctamente!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage('Error al exportar la copia de seguridad.');
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  // Export .M3U8 Master Playlist
  const handleExportM3U8 = () => {
    try {
      let content = '#EXTM3U\n#PLAYLIST:MiMusic Pro Master Library\n\n';
      songs.forEach((s) => {
        content += `#EXTINF:${Math.round(s.duration)},${s.artist} - ${s.title}\n`;
        content += `${s.folderPath || '/storage/emulated/0/Music'}/${s.title}.mp3\n\n`;
      });

      const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MiMusicPro_MasterPlaylist.m3u8';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('¡Lista M3U8 exportada con éxito!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage('Error al exportar lista M3U8.');
    }
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as LibraryBackup;

        if (!parsed.songs || !Array.isArray(parsed.songs)) {
          throw new Error('Formato de copia de seguridad no válido');
        }

        onRestoreBackup(parsed);
        setSuccessMessage(`¡Restauradas ${parsed.songs.length} canciones y ${parsed.playlists?.length || 0} listas con éxito!`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 2000);
      } catch (err) {
        setErrorMessage('Archivo inválido o corrupto. Asegúrate de seleccionar un archivo .json de MiMusic Pro.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Copias de Seguridad & Restauración</h2>
              <p className="text-xs text-zinc-400">Exporta o recupera tu biblioteca y ajustes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current State Stats */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 text-center">
          <div className="space-y-0.5">
            <div className="text-emerald-400 font-mono text-base font-bold flex items-center justify-center gap-1">
              <Music className="w-3.5 h-3.5" />
              <span>{songs.length}</span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Canciones</p>
          </div>

          <div className="space-y-0.5 border-x border-zinc-800">
            <div className="text-cyan-400 font-mono text-base font-bold flex items-center justify-center gap-1">
              <ListMusic className="w-3.5 h-3.5" />
              <span>{playlists.length}</span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Listas</p>
          </div>

          <div className="space-y-0.5">
            <div className="text-indigo-400 font-mono text-base font-bold flex items-center justify-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>10-EQ</span>
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Audio Pro</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Exportar Copia de Seguridad
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 rounded-xl text-xs font-semibold transition-colors text-white"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Guardar JSON Completo</span>
            </button>

            <button
              onClick={handleExportM3U8}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 rounded-xl text-xs font-semibold transition-colors text-white"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Exportar M3U8 Universal</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Restaurar Copia de Seguridad
          </h4>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-zinc-900/40 hover:bg-zinc-900/80 group"
          >
            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 mx-auto mb-1.5 transition-colors" />
            <p className="text-xs font-semibold text-zinc-200">
              Seleccionar archivo de copia (.json)
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Restaura canciones, listas, portadas y ecualizador sin conexión
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
