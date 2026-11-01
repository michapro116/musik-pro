import React, { useState, useEffect, useRef } from 'react';
import { Song, Playlist, PlayMode, EqualizerSettings, AudioOutputDevice, PlaybackSpeed, LibraryBackup } from './types/music';
import { getInitializedSongs, INITIAL_PLAYLISTS } from './services/sampleTracks';
import { audioEngine } from './services/audioEngine';
import { castEngine } from './services/castEngine';
import { Navigation, TabType } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { FolderBrowserView } from './components/FolderBrowserView';
import { AudioProEqualizer } from './components/AudioProEqualizer';
import { DownloadsView } from './components/DownloadsView';
import { AndroidProjectModal } from './components/AndroidProjectModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { CastDeviceModal } from './components/CastDeviceModal';
import { TagEditorModal } from './components/TagEditorModal';
import { CarModeView } from './components/CarModeView';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { AndroidWidgetSimulatorModal } from './components/AndroidWidgetSimulatorModal';
import { InstallAppModal } from './components/InstallAppModal';

const STORAGE_KEY_TAG_OVERRIDES = 'mimusic_song_tag_overrides_v1';
const STORAGE_KEY_DYNAMIC_THEME = 'mimusic_dynamic_theme_enabled_v1';

function getInitialSongsWithSavedOverrides(): Song[] {
  const base = getInitializedSongs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TAG_OVERRIDES);
    if (!raw) return base;
    const overrides: Record<string, Partial<Song>> = JSON.parse(raw);
    return base.map((s) => {
      if (overrides[s.id]) {
        return { ...s, ...overrides[s.id] };
      }
      return s;
    });
  } catch {
    return base;
  }
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>(() => getInitialSongsWithSavedOverrides());
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [currentSong, setCurrentSong] = useState<Song | null>(() => songs[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(45);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playMode, setPlayMode] = useState<PlayMode>('normal');
  const [queue, setQueue] = useState<Song[]>(() => [...songs]);
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>(() => audioEngine.getSettings());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [gaplessEnabled, setGaplessEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1.0);
  const [crossfadeSec, setCrossfadeSec] = useState<number>(3);
  
  // Phase 6: Material You Dynamic Theme State
  const [dynamicThemeEnabled, setDynamicThemeEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DYNAMIC_THEME);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const handleToggleDynamicTheme = () => {
    setDynamicThemeEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_DYNAMIC_THEME, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save dynamic theme preference', e);
      }
      return next;
    });
  };
  
  // Modals state
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState<boolean>(false);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState<boolean>(false);
  const [isCarModeOpen, setIsCarModeOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [activeOutputDevice, setActiveOutputDevice] = useState<AudioOutputDevice>(() => castEngine.getActiveDevice());

  // Sleep timer state
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Audio DSP Engine with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioEngine.init(audioRef.current);
    }
  }, []);

  // Subscribe to Cast Engine updates
  useEffect(() => {
    const unsub = castEngine.subscribe(() => {
      setActiveOutputDevice(castEngine.getActiveDevice());
    });
    return unsub;
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sleep Timer Countdown effect
  useEffect(() => {
    if (activeTimerMinutes === null || activeTimerMinutes === -1) {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(activeTimerMinutes * 60);

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          setActiveTimerMinutes(null);
          return null;
        }

        // Smooth logarithmic fade-out during last 30 seconds
        if (prev <= 30 && audioRef.current && !isMuted) {
          const fadeRatio = Math.max(0, (prev - 1) / 30);
          audioRef.current.volume = volume * fadeRatio;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerMinutes, volume, isMuted]);

  // Handle Play / Pause
  const handleTogglePlay = async () => {
    if (!audioRef.current || !currentSong) return;

    audioEngine.resumeContext();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback interrupted:', err);
      }
    }
  };

  // Play specific song with ReplayGain and PlayCount tracking
  const handlePlaySong = async (song: Song) => {
    if (!audioRef.current) return;

    audioEngine.resumeContext();
    audioEngine.setSongReplayGain(song.replayGainDb);
    setCurrentSong(song);
    setSongs((prev) =>
      prev.map((s) => (s.id === song.id ? { ...s, playCount: (s.playCount || 0) + 1 } : s))
    );

    audioRef.current.src = song.url || '';
    audioRef.current.currentTime = 0;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.preservesPitch = true;
    setCurrentTime(0);

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Playback error:', err);
      setIsPlaying(false);
    }
  };

  // Change playback speed with pitch preservation
  const handleChangePlaybackSpeed = (speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.preservesPitch = true;
    }
  };

  // Restore full backup
  const handleRestoreBackup = (backup: LibraryBackup) => {
    if (backup.songs && backup.songs.length > 0) {
      setSongs(backup.songs);
      setQueue(backup.songs);
      if (!currentSong) {
        setCurrentSong(backup.songs[0]);
      }
    }
    if (backup.playlists && backup.playlists.length > 0) {
      setPlaylists(backup.playlists);
    }
    if (backup.equalizerSettings) {
      setEqSettings(backup.equalizerSettings);
      audioEngine.applySettings(backup.equalizerSettings);
    }
  };

  // Next song
  const handleNext = () => {
    if (queue.length === 0) return;

    if (activeTimerMinutes === -1) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setActiveTimerMinutes(null);
      return;
    }

    if (playMode === 'repeat-one' && currentSong) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * queue.length);
      handlePlaySong(queue[randomIndex]);
      return;
    }

    const currentIndex = currentSong ? queue.findIndex((s) => s.id === currentSong.id) : -1;
    const nextIndex = (currentIndex + 1) % queue.length;
    handlePlaySong(queue[nextIndex]);
  };

  // Previous song
  const handlePrev = () => {
    if (queue.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = currentSong ? queue.findIndex((s) => s.id === currentSong.id) : -1;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    handlePlaySong(queue[prevIndex]);
  };

  // Seek
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // MediaSession API for Android/OS lockscreen, notification center & Bluetooth headset controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: currentSong.artwork
          ? [
              { src: currentSong.artwork, sizes: '96x96', type: 'image/jpeg' },
              { src: currentSong.artwork, sizes: '256x256', type: 'image/jpeg' },
              { src: currentSong.artwork, sizes: '512x512', type: 'image/jpeg' }
            ]
          : []
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        handleTogglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        handleTogglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrev();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNext();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          const newTime = Math.max(0, audioRef.current.currentTime - offset);
          handleSeek(newTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        if (audioRef.current) {
          const newTime = Math.min(duration, audioRef.current.currentTime + offset);
          handleSeek(newTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession error', e);
    }
  }, [currentSong, isPlaying, duration]);

  // Global Keyboard Shortcuts (Space, Arrows, M, F, L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.altKey || e.shiftKey) {
            handleNext();
          } else if (audioRef.current) {
            handleSeek(Math.min(duration, audioRef.current.currentTime + 5));
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.altKey || e.shiftKey) {
            handlePrev();
          } else if (audioRef.current) {
            handleSeek(Math.max(0, audioRef.current.currentTime - 5));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((prev) => Math.min(1.0, +(prev + 0.05).toFixed(2)));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((prev) => Math.max(0.0, +(prev - 0.05).toFixed(2)));
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'KeyF':
          if (currentSong) {
            e.preventDefault();
            handleToggleFavorite(currentSong.id);
          }
          break;
        case 'KeyL':
          e.preventDefault();
          setIsFullPlayerOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentSong, duration]);

  // Toggle favorite
  const handleToggleFavorite = (songId: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Cycle play mode
  const handleTogglePlayMode = () => {
    const modes: PlayMode[] = ['normal', 'repeat-all', 'repeat-one', 'shuffle'];
    const nextIndex = (modes.indexOf(playMode) + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  // Remove song from current queue
  const handleRemoveFromQueue = (songId: string) => {
    setQueue((prev) => prev.filter((s) => s.id !== songId));
  };

  // Save edited song tags/metadata
  const handleSaveEditedSong = (updatedSong: Song) => {
    setSongs((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
    setQueue((prev) => prev.map((s) => (s.id === updatedSong.id ? updatedSong : s)));
    if (currentSong?.id === updatedSong.id) {
      setCurrentSong(updatedSong);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_TAG_OVERRIDES);
      const overrides: Record<string, Partial<Song>> = raw ? JSON.parse(raw) : {};
      overrides[updatedSong.id] = {
        title: updatedSong.title,
        artist: updatedSong.artist,
        album: updatedSong.album,
        genre: updatedSong.genre,
        year: updatedSong.year,
        trackNumber: updatedSong.trackNumber,
        composer: updatedSong.composer,
        artwork: updatedSong.artwork
      };
      localStorage.setItem(STORAGE_KEY_TAG_OVERRIDES, JSON.stringify(overrides));
    } catch (e) {
      console.warn('Could not persist tag overrides', e);
    }
  };

  const handleOpenTagEditor = (song: Song) => {
    setEditingSong(song);
    setIsTagEditorOpen(true);
  };

  // Quick 1-Touch Bass Boost Cycle Handler
  const handleCycleBassBoost = () => {
    const { settings } = audioEngine.cycleBassBoost();
    setEqSettings({ ...settings });
  };

  // Import local audio files from device
  const handleImportLocalFiles = (files: FileList) => {
    const newSongs: Song[] = [];

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split('-');
      const artist = nameParts.length > 1 ? nameParts[0].trim() : 'Artista Local';
      const title = nameParts.length > 1 ? nameParts.slice(1).join('-').trim() : nameParts[0].trim();

      const newSong: Song = {
        id: `local-${Date.now()}-${index}`,
        title: title || 'Pista Local',
        artist: artist || 'Archivo del Dispositivo',
        album: 'Música Local',
        duration: 180,
        url: url,
        isFavorite: false,
        isDownloaded: true,
        isLocal: true,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dateAdded: Date.now(),
        genre: 'Almacenamiento Local'
      };

      newSongs.push(newSong);
    });

    if (newSongs.length > 0) {
      setSongs((prev) => [...newSongs, ...prev]);
      setQueue((prev) => [...newSongs, ...prev]);
      handlePlaySong(newSongs[0]);
    }
  };

  // Import track from Google Drive
  const handleImportDriveSong = (driveSong: Song) => {
    if (!driveSong.url) {
      driveSong.url = songs[0]?.url || '';
    }
    setSongs((prev) => {
      const filtered = prev.filter((s) => s.id !== driveSong.id);
      return [driveSong, ...filtered];
    });
    setQueue((prev) => {
      const filtered = prev.filter((s) => s.id !== driveSong.id);
      return [driveSong, ...filtered];
    });
    handlePlaySong(driveSong);
  };

  // Play whole folder
  const handlePlayFolder = (folderSongs: Song[]) => {
    if (folderSongs.length === 0) return;
    setQueue(folderSongs);
    handlePlaySong(folderSongs[0]);
  };

  // Add whole folder to queue
  const handleAddFolderToQueue = (folderSongs: Song[]) => {
    setQueue((prev) => [...prev, ...folderSongs]);
  };

  // Create playlist
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      songIds: [],
      createdAt: Date.now()
    };
    setPlaylists((prev) => [newPl, ...prev]);
  };

  // Delete playlist
  const handleDeletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  // Select playlist to play
  const handleSelectPlaylist = (pl: Playlist) => {
    const plSongs = songs.filter((s) => pl.songIds.includes(s.id));
    if (plSongs.length > 0) {
      setQueue(plSongs);
      handlePlaySong(plSongs[0]);
    }
  };

  // Audio element listeners with DJ Crossfade
  const onTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);

      // DJ Crossfade volume fade out
      if (crossfadeSec > 0 && duration > 10 && !audioRef.current.paused) {
        const timeLeft = duration - cur;
        if (timeLeft <= crossfadeSec && timeLeft > 0) {
          const fadeRatio = Math.max(0.15, timeLeft / crossfadeSec);
          audioRef.current.volume = (isMuted ? 0 : volume) * fadeRatio;
        }
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 45);
    }
  };

  const onEnded = () => {
    handleNext();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#0a0a0d] text-white font-sans antialiased">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="auto"
      />

      {/* Main Responsive Navigation */}
      <Navigation
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenCastModal={() => setIsCastModalOpen(true)}
        onOpenCarMode={() => setIsCarModeOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        activeDeviceName={activeOutputDevice.name}
        playlistCount={playlists.length}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full h-full overflow-y-auto bg-gradient-to-b from-[#121217] via-[#0c0c10] to-[#0a0a0d] p-3 sm:p-6 lg:p-8 pb-36 md:pb-28">
        {activeTab === 'home' && (
          <HomeView
            songs={songs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onSelectPlaylist={handleSelectPlaylist}
            onImportLocalFiles={handleImportLocalFiles}
            onOpenAudioPro={() => setActiveTab('audiopro')}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenAndroidProject={() => setActiveTab('android-project')}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onOpenTagEditor={handleOpenTagEditor}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            songs={songs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onSelectPlaylist={handleSelectPlaylist}
            onOpenTagEditor={handleOpenTagEditor}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          />
        )}

        {activeTab === 'folders' && (
          <FolderBrowserView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayFolder={handlePlayFolder}
            onAddFolderToQueue={handleAddFolderToQueue}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'audiopro' && (
          <AudioProEqualizer
            settings={eqSettings}
            isPlaying={isPlaying}
            onUpdateSettings={setEqSettings}
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadsView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onTogglePlay={handleTogglePlay}
            onToggleFavorite={handleToggleFavorite}
            onDeleteDownload={(id) => {
              setSongs((prev) =>
                prev.map((s) => (s.id === id ? { ...s, isDownloaded: false } : s))
              );
            }}
            onClearAllDownloads={() => {
              setSongs((prev) => prev.map((s) => ({ ...s, isDownloaded: false })));
            }}
          />
        )}

        {activeTab === 'android-project' && <AndroidProjectModal />}
      </main>

      {/* MiniPlayer Bottom Strip */}
      <MiniPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        selectedPreset={eqSettings.selectedPreset}
        eqEnabled={eqSettings.enabled}
        gaplessEnabled={gaplessEnabled}
        activeDeviceName={activeOutputDevice.name}
        bassBoost={eqSettings.bassBoost}
        onCycleBassBoost={handleCycleBassBoost}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onToggleFavorite={handleToggleFavorite}
        onToggleMute={() => setIsMuted(!isMuted)}
        onChangeVolume={(val) => {
          setVolume(val);
          setIsMuted(false);
        }}
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        onOpenAudioPro={() => setActiveTab('audiopro')}
        onOpenCastModal={() => setIsCastModalOpen(true)}
      />

      {/* Full Screen Player Modal */}
      {isFullPlayerOpen && (
        <FullPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playMode={playMode}
          queue={queue}
          volume={volume}
          isMuted={isMuted}
          selectedPreset={eqSettings.selectedPreset}
          eqEnabled={eqSettings.enabled}
          gaplessEnabled={gaplessEnabled}
          playbackSpeed={playbackSpeed}
          crossfadeSec={crossfadeSec}
          activeDeviceName={activeOutputDevice.name}
          activeTimerMinutes={activeTimerMinutes}
          remainingSeconds={remainingSeconds}
          bassBoost={eqSettings.bassBoost}
          onCycleBassBoost={handleCycleBassBoost}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSeek={handleSeek}
          onTogglePlayMode={handleTogglePlayMode}
          onToggleFavorite={handleToggleFavorite}
          onToggleMute={() => setIsMuted(!isMuted)}
          onChangeVolume={(val) => {
            setVolume(val);
            setIsMuted(false);
          }}
          onToggleGapless={() => setGaplessEnabled(!gaplessEnabled)}
          onChangePlaybackSpeed={handleChangePlaybackSpeed}
          onChangeCrossfade={(sec) => setCrossfadeSec(sec)}
          onOpenCarMode={() => {
            setIsFullPlayerOpen(false);
            setIsCarModeOpen(true);
          }}
          onOpenWidgetSimulator={() => setIsWidgetModalOpen(true)}
          onClose={() => setIsFullPlayerOpen(false)}
          onOpenAudioPro={() => {
            setIsFullPlayerOpen(false);
            setActiveTab('audiopro');
          }}
          onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
          onOpenCastModal={() => setIsCastModalOpen(true)}
          onOpenTagEditor={handleOpenTagEditor}
          onSelectSongFromQueue={handlePlaySong}
          onRemoveFromQueue={handleRemoveFromQueue}
          dynamicThemeEnabled={dynamicThemeEnabled}
          onToggleDynamicTheme={handleToggleDynamicTheme}
        />
      )}

      {/* Car Driving Safe Mode Fullscreen View */}
      {isCarModeOpen && (
        <CarModeView
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          bassBoost={eqSettings.bassBoost}
          onCycleBassBoost={handleCycleBassBoost}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeek={handleSeek}
          onToggleFavorite={handleToggleFavorite}
          onToggleMute={() => setIsMuted(!isMuted)}
          onClose={() => setIsCarModeOpen(false)}
        />
      )}

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        songs={songs}
        playlists={playlists}
        eqSettings={eqSettings}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Android Widget Simulator Modal */}
      <AndroidWidgetSimulatorModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Tag & Metadata ID3 Editor Modal */}
      <TagEditorModal
        song={editingSong}
        isOpen={isTagEditorOpen}
        onClose={() => setIsTagEditorOpen(false)}
        onSave={handleSaveEditedSong}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        activeTimerMinutes={activeTimerMinutes}
        remainingSeconds={remainingSeconds}
        onClose={() => setIsSleepTimerOpen(false)}
        onSetTimer={(mins) => setActiveTimerMinutes(mins)}
      />

      {/* Cast & Bluetooth Output Selector Modal */}
      <CastDeviceModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        onDeviceChange={(dev) => setActiveOutputDevice(dev)}
      />

      {/* Google Drive Configuration & Interactive Folder Browser Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        onImportDriveSong={handleImportDriveSong}
        onPlaySong={handlePlaySong}
      />

      {/* Free Mobile App Installation Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onOpenAndroidStudioExport={() => {
          setIsInstallModalOpen(false);
          setActiveTab('android-project');
        }}
      />
    </div>
  );
}
