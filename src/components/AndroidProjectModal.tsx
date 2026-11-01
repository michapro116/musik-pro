import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  FileCode, 
  Copy, 
  Check, 
  GitBranch, 
  Terminal, 
  Layers, 
  Sparkles, 
  Cpu, 
  Sliders 
} from 'lucide-react';
import { ANDROID_FILES, downloadAndroidProjectZip } from '../services/androidProjectGenerator';

export const AndroidProjectModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState(ANDROID_FILES[0]); // .github/workflows/build-apk.yml
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [activeTab, setActiveTab] = useState<'methods' | 'code' | 'features'>('methods');

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 text-white max-w-6xl mx-auto">
      {/* Hero Action Card */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-900 border border-emerald-500/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              Código Fuente Nativo Completo
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              Gradle 8.7 • Kotlin 2.0 • Media3 1.5 • Room 2.6
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Proyecto Android Studio: MiMusic Pro
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Estructura nativa completa con <code className="bg-black/50 text-emerald-300 px-1.5 py-0.5 rounded">MediaSessionService</code>, base de datos reactiva <code className="bg-black/50 text-emerald-300 px-1.5 py-0.5 rounded">Room</code>, ecualizador <code className="bg-black/50 text-emerald-300 px-1.5 py-0.5 rounded">AudioEffects</code> de 10 bandas con Virtualizador 3D y flujo CI en la nube para compilar tu APK con 1 clic.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>
            {isDownloading ? 'Empaquetando ZIP...' : 'Descargar Proyecto Completo (.ZIP)'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 pb-2 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('methods')}
          className={`py-2 px-3 rounded-xl transition-colors ${
            activeTab === 'methods'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          1. Métodos de Compilación de APK
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`py-2 px-3 rounded-xl transition-colors ${
            activeTab === 'code'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          2. Explorador de Código Kotlin
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`py-2 px-3 rounded-xl transition-colors ${
            activeTab === 'features'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          3. Auditoría de Requisitos Cumplidos
        </button>
      </div>

      {activeTab === 'methods' && (
        <div className="space-y-6">
          {/* GitHub Actions Highlight (Zero setup) */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-900 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Método 1: Compilar en la Nube con GitHub Actions (¡Sin instalar nada en tu PC!)
                </h3>
                <p className="text-xs text-zinc-400">
                  Ideal si no quieres instalar gigabytes de SDKs en tu computadora
                </p>
              </div>
            </div>

            <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside bg-black/40 p-4 rounded-xl border border-zinc-800">
              <li>Descarga el archivo ZIP del proyecto pulsando el botón verde arriba.</li>
              <li>Sube los archivos a un repositorio en tu cuenta de GitHub (puede ser público o privado).</li>
              <li>El archivo <code className="text-cyan-300 font-mono">.github/workflows/build-apk.yml</code> ya está incluido en el ZIP.</li>
              <li>Ve a la pestaña <b>Actions</b> en GitHub y pulsa <b>Run workflow</b>.</li>
              <li>En menos de 3 minutos, descarga el archivo <code className="text-emerald-400 font-mono">app-debug.apk</code> listo para instalar en tu celular Android.</li>
            </ol>
          </div>

          {/* Android Studio & CLI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Método 2: Android Studio Local</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Abre Android Studio, selecciona <b>Open</b> y abre la carpeta descomprimida. Conecta tu teléfono por USB con Depuración activada y presiona el botón verde <b>Run (▶)</b> o ve a <b>Build &gt; Build APK(s)</b>.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Método 3: Terminal Gradle</span>
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Si tienes JDK 17 instalado, ejecuta:
                <br />
                <code className="text-emerald-400 font-mono bg-black/60 px-2 py-0.5 rounded inline-block mt-1">
                  ./gradlew assembleDebug
                </code>
                <br />
                El APK se genera en <code className="text-zinc-300">app/build/outputs/apk/debug/app-debug.apk</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Explorador de Código Fuente</h3>
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPath ? 'Copiado' : 'Copiar Archivo'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {/* File List */}
            <div className="p-3 space-y-1 max-h-[500px] overflow-y-auto">
              {ANDROID_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all truncate block ${
                      isSelected
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <p className="truncate">{file.path}</p>
                    <p className="text-[10px] text-zinc-500 font-sans truncate">{file.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Code Viewer */}
            <div className="md:col-span-3 p-4 bg-[#0a0a0d] max-h-[500px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 text-xs text-zinc-400 border-b border-zinc-800 pb-2 font-mono">
                <span>{selectedFile.path}</span>
                <span className="text-zinc-500 uppercase">{selectedFile.language}</span>
              </div>
              <pre className="text-xs font-mono text-zinc-300 whitespace-pre leading-relaxed overflow-x-auto">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white">Requisitos y Funciones Verificadas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reproductor nativo AndroidX Media3 / ExoPlayer</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MediaSessionService para reproducción con pantalla apagada</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Audio Pro: Ecualizador 10 bandas + BassBoost + 3D Virtualizer</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>LoudnessEnhancer y limitador anti-distorsión armónica</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Base de datos Room y escáner MediaStore &gt;5.000 temas</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gestor de descargas offline con verificación de integridad</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Integración Google Drive con OAuth oficial y permisos mínimos</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-zinc-800/40 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Flujo de CI/CD GitHub Actions para compilar APK sin Android Studio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
