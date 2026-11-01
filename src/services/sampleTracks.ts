import { Song, Playlist } from '../types/music';

// Helper to generate a clean synthetic WAV audio track in memory (so the app plays real audio offline with zero network dependency!)
function createSyntheticAudioBlob(style: 'reggaeton' | 'lofi' | 'rock' | 'acoustic'): string {
  const sampleRate = 22050;
  const duration = 45; // 45 seconds loopable demo track
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + numSamples * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count (1 for mono demo)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, numSamples * 2, true);

  const bpm = style === 'reggaeton' ? 94 : style === 'rock' ? 120 : style === 'lofi' ? 82 : 100;
  const beatDuration = 60 / bpm;
  const samplesPerBeat = sampleRate * beatDuration;

  const chords = [
    [220, 261.63, 329.63, 440], // Am
    [174.61, 220, 261.63, 349.23], // F
    [261.63, 329.63, 392, 523.25], // C
    [196, 246.94, 293.66, 392]  // G
  ];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatIndex = Math.floor(i / samplesPerBeat);
    const chordIndex = Math.floor(beatIndex / 4) % chords.length;
    const currentChord = chords[chordIndex];
    const beatPhase = (i % samplesPerBeat) / samplesPerBeat;

    let sample = 0;

    for (let c = 0; c < currentChord.length; c++) {
      const freq = currentChord[c];
      const tone = Math.sin(2 * Math.PI * freq * t);
      sample += tone * 0.12;
    }

    const bassFreq = currentChord[0] / 2;
    const bassEnvelope = Math.exp(-beatPhase * 4);
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.3 * bassEnvelope;
    sample += bass;

    if (style === 'reggaeton') {
      const isKick = beatPhase < 0.15;
      if (isKick) {
        const kickPitch = 120 * Math.exp(-beatPhase * 30);
        sample += Math.sin(2 * Math.PI * kickPitch * t) * 0.45 * Math.exp(-beatPhase * 15);
      }
      const snarePhase1 = (beatPhase + 0.25) % 0.5;
      if (snarePhase1 < 0.1) {
        const noise = (Math.random() * 2 - 1) * 0.2 * Math.exp(-snarePhase1 * 25);
        sample += noise;
      }
    } else {
      const isKick = beatPhase < 0.12;
      if (isKick) {
        const kickPitch = 95 * Math.exp(-beatPhase * 25);
        sample += Math.sin(2 * Math.PI * kickPitch * t) * 0.4 * Math.exp(-beatPhase * 12);
      }
      if (beatIndex % 2 === 1 && beatPhase < 0.15) {
        const noise = (Math.random() * 2 - 1) * 0.22 * Math.exp(-beatPhase * 20);
        sample += noise;
      }
    }

    const sixteenthPhase = (beatPhase * 4) % 1;
    if (sixteenthPhase < 0.05) {
      const hat = (Math.random() * 2 - 1) * 0.08 * Math.exp(-sixteenthPhase * 40);
      sample += hat;
    }

    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const INITIAL_SONGS: Song[] = [
  {
    id: 'demo-1',
    title: 'Noche Urbana (Audio Pro Test)',
    artist: 'MiMusic Studio',
    album: 'Latin Bass Master',
    duration: 45,
    genre: 'Reggaetón / Urbano',
    year: '2026',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
    isDownloaded: true,
    isLocal: true,
    fileSize: '14.8 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 24,
    url: '',
    audioFormat: 'FLAC',
    bitrate: 'FLAC 24-bit/96kHz Lossless',
    isHiRes: true,
    replayGainDb: -2.4,
    playCount: 148,
    syncedLyrics: [
      { time: 0, text: '♪ (Intro con ritmo constante y bajo profundo) ♪' },
      { time: 4, text: 'Luces en la pista encendiéndose al compás' },
      { time: 10, text: 'MiMusic Pro sonando con el bajo bien atrás' },
      { time: 16, text: 'Sube los decibeles, siente la vibración' },
      { time: 22, text: 'Ecualizador calibrado para puro reggaetón' },
      { time: 28, text: '♪ (Drop de graves con sonido envolvente 3D) ♪' },
      { time: 34, text: 'Música sin anuncios, libertad total' },
      { time: 40, text: 'Reproducción offline en tu terminal personal' }
    ]
  },
  {
    id: 'demo-2',
    title: 'Bass Punch Subwoofer 40Hz',
    artist: 'Digital Audio Lab',
    album: 'Frequencies & Acoustics',
    duration: 45,
    genre: 'Urbano / Trap',
    year: '2026',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
    isDownloaded: true,
    isLocal: true,
    fileSize: '16.2 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 12,
    url: '',
    audioFormat: 'FLAC',
    bitrate: 'FLAC 24-bit/96kHz Lossless',
    isHiRes: true,
    replayGainDb: -1.8,
    playCount: 92,
    syncedLyrics: [
      { time: 0, text: '♪ (Calibración de frecuencias bajas 40Hz - 80Hz) ♪' },
      { time: 6, text: 'Prueba de subgraves para tu sistema de audio' },
      { time: 14, text: 'Respuesta acústica limpia sin distorsión armónica' },
      { time: 22, text: 'Sintiendo el golpe del bombo en el diafragma' },
      { time: 30, text: '♪ (Barrido de frecuencias y resonancia controlada) ♪' },
      { time: 38, text: 'Audio Pro DSP activo y funcionando al 100%' }
    ]
  },
  {
    id: 'demo-3',
    title: 'Horizonte Lo-Fi & Chill',
    artist: 'Aura Sound',
    album: 'Midnight Coffee',
    duration: 45,
    genre: 'Lo-Fi / Chill',
    year: '2025',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    isFavorite: false,
    isDownloaded: false,
    isLocal: true,
    fileSize: '3.4 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 48,
    url: '',
    audioFormat: 'MP3',
    bitrate: '320 kbps CBR (HQ)',
    isHiRes: false,
    replayGainDb: -3.2,
    playCount: 45,
    syncedLyrics: [
      { time: 0, text: '♪ (Sonido suave de vinilo y acordes cálidos) ♪' },
      { time: 8, text: 'Una taza de café frente a la ventana' },
      { time: 16, text: 'Dejando que la calma fluya con la melodía' },
      { time: 26, text: 'Momento de enfoque y serenidad' },
      { time: 36, text: '♪ (Desvanecimiento tranquilo y armonioso) ♪' }
    ]
  },
  {
    id: 'demo-4',
    title: 'Electric Groove Rock',
    artist: 'The Overdrive Band',
    album: 'Analog Memories',
    duration: 45,
    genre: 'Rock',
    year: '2024',
    artwork: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    isFavorite: false,
    isDownloaded: false,
    isLocal: true,
    fileSize: '4.9 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 72,
    url: '',
    audioFormat: 'AAC',
    bitrate: 'AAC 256 kbps (VBR)',
    isHiRes: false,
    replayGainDb: -2.0,
    playCount: 28,
    syncedLyrics: [
      { time: 0, text: '♪ (Riff de guitarra eléctrica con distorsión analógica) ♪' },
      { time: 7, text: 'Subiendo la energía con baterías dinámicas' },
      { time: 15, text: 'El sonido del rock clásico en tus auriculares' },
      { time: 24, text: 'Solo de guitarra con agudos definidos y aire' },
      { time: 35, text: '♪ (Cierre con redoble potente y aplausos) ♪' }
    ]
  },
  {
    id: 'demo-5',
    title: 'Acoustic Sunrise Meditation',
    artist: 'Serenity Strings',
    album: 'Pure Resonance',
    duration: 45,
    genre: 'Acústica / Instrumental',
    year: '2026',
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
    isDownloaded: true,
    isLocal: true,
    fileSize: '15.4 MB',
    dateAdded: Date.now() - 1000 * 60 * 60 * 6,
    url: '',
    audioFormat: 'FLAC',
    bitrate: 'FLAC 24-bit/96kHz Lossless',
    isHiRes: true,
    replayGainDb: -1.2,
    playCount: 74,
    syncedLyrics: [
      { time: 0, text: '♪ (Arpegio acústico con resonancia natural) ♪' },
      { time: 8, text: 'Cuerdas de nylon vibrando con calidez analógica' },
      { time: 18, text: 'Claridad en las frecuencias medias y agudos sedosos' },
      { time: 28, text: 'Espacio acústico tridimensional sin compresión' },
      { time: 38, text: '♪ (Sustain armónico perfecto) ♪' }
    ]
  }
];

export function getInitializedSongs(): Song[] {
  const songs = [...INITIAL_SONGS];
  try {
    const regBlob = createSyntheticAudioBlob('reggaeton');
    const lofiBlob = createSyntheticAudioBlob('lofi');
    const rockBlob = createSyntheticAudioBlob('rock');
    const acousticBlob = createSyntheticAudioBlob('acoustic');

    songs[0].url = regBlob;
    songs[1].url = regBlob;
    songs[2].url = lofiBlob;
    songs[3].url = rockBlob;
    if (songs[4]) songs[4].url = acousticBlob;
  } catch (e) {
    console.error('Failed to generate audio blobs:', e);
  }
  return songs;
}

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Canciones que te gustan',
    description: 'Tus temas favoritos marcados con corazón',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    songIds: ['demo-1', 'demo-2'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  },
  {
    id: 'pl-bass',
    name: 'Audio Pro Bass Booster',
    description: 'Canciones optimizadas para probar el ecualizador y potenciador',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    songIds: ['demo-1', 'demo-2', 'demo-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
  },
  {
    id: 'pl-chill',
    name: 'Sesión Tranquila',
    description: 'Música relajante para concentrarse o descansar',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    songIds: ['demo-3'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  }
];
