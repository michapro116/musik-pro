import React, { useState, useRef } from 'react';
import { 
  Tag, 
  Image as ImageIcon, 
  X, 
  Check, 
  Disc, 
  Music, 
  Calendar, 
  Upload, 
  Trash2, 
  Sparkles, 
  Hash, 
  User, 
  Layers, 
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';
import { Song } from '../types/music';

interface TagEditorModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

const ARTWORK_PRESETS = [
  { name: 'Urbano Neon', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
  { name: 'Club DJ', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80' },
  { name: 'Lo-Fi Chill', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80' },
  { name: 'Rock Potente', url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80' },
  { name: 'Subwoofer Gold', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' },
  { name: 'Acústica Madera', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Synthwave 80s', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Estudio Clásico', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80' }
];

export const TagEditorModal: React.FC<TagEditorModalProps> = ({
  song,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !song) return null;

  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [album, setAlbum] = useState(song.album);
  const [genre, setGenre] = useState(song.genre || '');
  const [year, setYear] = useState(song.year || '2026');
  const [trackNumber, setTrackNumber] = useState(song.trackNumber || '01');
  const [composer, setComposer] = useState(song.composer || '');
  const [artwork, setArtwork] = useState(song.artwork || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resize and compress local uploaded image via offscreen canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setArtwork(compressedDataUrl);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => setIsProcessingImage(false);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Song = {
      ...song,
      title: title.trim() || 'Sin Título',
      artist: artist.trim() || 'Artista Desconocido',
      album: album.trim() || 'Álbum Desconocido',
      genre: genre.trim() || undefined,
      year: year.trim() || undefined,
      trackNumber: trackNumber.trim() || undefined,
      composer: composer.trim() || undefined,
      artwork: artwork.trim() || undefined
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-5 text-white shadow-2xl relative my-8">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Editor de Etiquetas ID3 & Carátula
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  ID3v2.4
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Modifica metadatos del archivo y personaliza la portada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Artwork + Main Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Artwork Container */}
            <div className="space-y-2 shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-start">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Carátula del Álbum
              </label>
              
              <div className="w-32 h-32 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 overflow-hidden relative group shadow-lg">
                {artwork ? (
                  <img src={artwork} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-2 text-center">
                    <Disc className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Sin Carátula</span>
                  </div>
                )}

                {/* Hover overlay with upload button */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-center p-1"
                >
                  <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="text-[10px] font-bold text-white">Cambiar Foto</span>
                </div>
              </div>

              {/* Artwork action buttons */}
              <div className="flex gap-2 w-full justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-emerald-400 flex items-center gap-1 border border-zinc-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImage ? 'Cargando...' : 'Subir'}</span>
                </button>

                {artwork && (
                  <button
                    type="button"
                    onClick={() => setArtwork('')}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 border border-zinc-700 transition-colors"
                    title="Quitar carátula"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Title & Artist & Album */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Título de la Canción *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Artista / Intérprete *
                </label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Álbum *
                </label>
                <input
                  type="text"
                  required
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Extended ID3 Tags Grid: Year, Genre, Track Number, Composer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Año
              </label>
              <input
                type="text"
                placeholder="2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Pista Nº
              </label>
              <input
                type="text"
                placeholder="01"
                value={trackNumber}
                onChange={(e) => setTrackNumber(e.target.value)}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Género
              </label>
              <input
                type="text"
                placeholder="Reggaetón, Urbano, Rock..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Composer & Web URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Compositor / Productor
              </label>
              <input
                type="text"
                placeholder="Nombre del compositor"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                O pegar URL de imagen
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={artwork.startsWith('data:') ? 'Imagen personalizada cargada' : artwork}
                onChange={(e) => setArtwork(e.target.value)}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 truncate"
              />
            </div>
          </div>

          {/* Curated Studio Cover Presets Carousel */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-400 block">
              O elige una portada artística predefinida:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {ARTWORK_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setArtwork(preset.url)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all relative group ${
                    artwork === preset.url ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* File Audio Specs Info */}
          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Formato: <strong className="text-white">{song.audioFormat || 'MP3 / PCM'}</strong></span>
              <span>• Bitrate: <strong className="text-white">{song.bitrate || '1411 kbps'}</strong></span>
            </div>
            <span className="font-mono text-zinc-500">ID: {song.id}</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Metadatos ID3</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
