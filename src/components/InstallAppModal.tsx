import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Zap,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAndroidStudioExport: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onOpenAndroidStudioExport
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The actual live URL for mobile browser testing
  const appUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Instalar MiMusic Pro Gratis</span>
                <span className="text-[10px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                  100% Gratis
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Sin pagos, sin suscripciones y sin tiendas de apps</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          
          {/* Method 1: Instant PWA Mobile Install (Recommended) */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-zinc-900/60 to-zinc-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h4 className="font-bold text-sm text-white">Opción Rápida: Instalar como App en tu Celular</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Recomendada
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              No necesitas descargar ningún archivo pesado. Abre el enlace en el navegador de tu celular (Chrome o Safari) y se instalará como una app nativa con su propio ícono en tu pantalla de inicio:
            </p>

            {/* Direct Install Button if supported by browser */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Instalar Ahora en este Dispositivo</span>
              </button>
            )}

            {/* Android Chrome Instructions */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="font-bold text-emerald-300 block">En Android (Google Chrome):</span>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                <li>Abre el enlace de abajo en Google Chrome en tu celular.</li>
                <li>Toca el menú de los <b>tres puntos (⋮)</b> arriba a la derecha.</li>
                <li>Selecciona <b>«Instalar aplicación»</b> o <b>«Agregar a la pantalla principal»</b>.</li>
                <li>¡Listo! Se abrirá a pantalla completa sin barra de navegador.</li>
              </ol>
            </div>

            {/* iPhone / iOS Safari Instructions */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="font-bold text-cyan-300 block">En iPhone / iPad (Safari):</span>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                <li>Abre el enlace en Safari.</li>
                <li>Toca el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba).</li>
                <li>Desliza hacia abajo y presiona <b>«Agregar al inicio»</b>.</li>
              </ol>
            </div>

            {/* Link Copy Box */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Enlace para abrir en tu celular:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 truncate focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Method 2: Android Studio APK Export */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-black text-xs flex items-center justify-center border border-zinc-700">
                2
              </span>
              <h4 className="font-bold text-sm text-white">Opción Avanzada: Compilar APK Nativo (.apk)</h4>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Si deseas generar un archivo de instalación APK tradicional con código Kotlin nativo, puedes descargar el proyecto completo listo para abrir en Android Studio o compilar automáticamente con GitHub Actions:
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenAndroidStudioExport();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-xs transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Ver Proyecto Android Studio y Generador de APK</span>
            </button>
          </div>

          {/* Guarantee pill */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sin costos, sin registro con tarjeta de crédito, 100% libre.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
