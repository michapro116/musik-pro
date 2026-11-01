import { Song, AudioFormat } from '../types/music';

export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

function formatBytes(bytesStr?: string): string {
  if (!bytesStr) return 'Audio Nube';
  const bytes = parseInt(bytesStr, 10);
  if (isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function detectAudioFormat(name: string, mimeType: string): AudioFormat {
  const lower = name.toLowerCase();
  if (lower.endsWith('.flac') || mimeType.includes('flac')) return 'FLAC';
  if (lower.endsWith('.wav') || mimeType.includes('wav')) return 'WAV';
  if (lower.endsWith('.ogg') || mimeType.includes('ogg')) return 'OGG';
  if (lower.endsWith('.aac') || lower.endsWith('.m4a') || mimeType.includes('aac')) return 'AAC';
  return 'MP3';
}

function parseNameMetadata(filename: string): { title: string; artist: string; album: string } {
  // Strip extension
  const clean = filename.replace(/\.[^/.]+$/, '').trim();
  
  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    if (parts.length >= 2) {
      const artist = parts[0].trim();
      const title = parts.slice(1).join(' - ').trim();
      return {
        title,
        artist,
        album: 'Google Drive Nube'
      };
    }
  }

  return {
    title: clean,
    artist: 'Google Drive',
    album: 'Mi Nube Personal'
  };
}

/**
 * Lists all audio files from user's Google Drive
 */
export async function fetchDriveAudioFiles(
  accessToken: string,
  options?: { folderId?: string; searchQuery?: string }
): Promise<DriveApiFile[]> {
  const conditions: string[] = ["trashed = false", "(mimeType contains 'audio/' or name contains '.mp3' or name contains '.flac' or name contains '.wav' or name contains '.m4a' or name contains '.aac')"];

  if (options?.folderId) {
    conditions.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchQuery?.trim()) {
    const sanitized = options.searchQuery.replace(/'/g, "\\'");
    conditions.push(`name contains '${sanitized}'`);
  }

  const q = encodeURIComponent(conditions.join(' and '));
  const url = `${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webContentLink,iconLink,thumbnailLink,parents)&pageSize=100&orderBy=name`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error al acceder a Google Drive (${res.status})`);
  }

  const data = await res.json();
  return (data.files || []) as DriveApiFile[];
}

/**
 * Lists folders from user's Google Drive
 */
export async function fetchDriveFolders(accessToken: string): Promise<DriveFolder[]> {
  const q = encodeURIComponent("mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const url = `${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name)&pageSize=50&orderBy=name`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error al obtener carpetas (${res.status})`);
  }

  const data = await res.json();
  return (data.files || []) as DriveFolder[];
}

/**
 * Downloads the binary audio content for streaming or saving locally
 */
export async function fetchDriveAudioBlob(
  fileId: string, 
  accessToken: string,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; objectUrl: string }> {
  const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`No se pudo descargar el archivo de audio (${res.status})`);
  }

  const contentLength = res.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (res.body && total > 0 && onProgress) {
    const reader = res.body.getReader();
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        onProgress(Math.min(99, Math.round((loaded / total) * 100)));
      }
    }

    const blob = new Blob(chunks as BlobPart[], { type: res.headers.get('content-type') || 'audio/mpeg' });
    if (onProgress) onProgress(100);
    return {
      blob,
      objectUrl: URL.createObjectURL(blob)
    };
  }

  const blob = await res.blob();
  if (onProgress) onProgress(100);
  return {
    blob,
    objectUrl: URL.createObjectURL(blob)
  };
}

/**
 * Converts a Google Drive file descriptor to a MiMusic Song object
 */
export function convertDriveFileToSong(file: DriveApiFile, playableUrl?: string): Song {
  const parsed = parseNameMetadata(file.name);
  const audioFormat = detectAudioFormat(file.name, file.mimeType);

  return {
    id: `gdrive-${file.id}`,
    title: parsed.title,
    artist: parsed.artist,
    album: parsed.album,
    duration: 180, // Default duration estimation until loaded in audio context
    url: playableUrl,
    fileSize: formatBytes(file.size),
    isFavorite: false,
    isDownloaded: !!playableUrl,
    isLocal: false,
    genre: 'Google Drive Nube',
    audioFormat,
    bitrate: audioFormat === 'FLAC' ? '1411 kbps (FLAC)' : '320 kbps (Nube)',
    isHiRes: audioFormat === 'FLAC' || audioFormat === 'WAV',
    dateAdded: file.modifiedTime ? new Date(file.modifiedTime).getTime() : Date.now(),
    folderPath: '/Google Drive/Música',
    artwork: file.thumbnailLink || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  };
}
