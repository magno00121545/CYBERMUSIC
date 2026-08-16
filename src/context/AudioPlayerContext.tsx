import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song, Package } from '../types/index.js';

interface AudioPlayerContextType {
  currentSong: Song | null;
  currentPackage: Package | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, pkg?: Package) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30); // 30s preview limit
  const [volume, setVolumeState] = useState<number>(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);
  const isSynthPlayingRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or get persistent AudioContext
  const getAudioContext = () => {
    try {
      if (!synthCtxRef.current || synthCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          synthCtxRef.current = new AudioCtx();
        }
      }
      if (synthCtxRef.current && synthCtxRef.current.state === 'suspended') {
        synthCtxRef.current.resume().catch(() => {});
      }
      return synthCtxRef.current;
    } catch {
      return null;
    }
  };

  // Stop synthetic beat
  const stopSynthBeat = () => {
    isSynthPlayingRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    // Disconnect active nodes
    synthNodesRef.current.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch {}
    });
    synthNodesRef.current = [];
  };

  // Play synthetic preview beat via Web Audio API with rhythmic chords & bass
  const startSynthBeat = (genre = 'funk') => {
    stopSynthBeat();
    const ctx = getAudioContext();
    if (!ctx) return;

    isSynthPlayingRef.current = true;

    const bpm = genre.includes('funk') ? 135 : genre.includes('eletronica') ? 128 : genre.includes('forro') ? 145 : 124;
    const beatInterval = 60 / bpm;
    let nextBeatTime = ctx.currentTime + 0.05;
    let stepCount = 0;

    // Chords / Bass progression
    const bassNotes = [55.0, 65.41, 73.42, 49.0]; // A1, C2, D2, G1
    const leadNotes = [220.0, 261.63, 293.66, 329.63, 392.0]; // A3, C4, D4, E4, G4

    const scheduleBeat = () => {
      if (!isSynthPlayingRef.current || !synthCtxRef.current) return;

      while (nextBeatTime < ctx.currentTime + 0.3) {
        const time = nextBeatTime;
        const isKickStep = stepCount % 4 === 0 || (genre.includes('funk') && (stepCount % 4 === 0 || stepCount % 4 === 2));

        // 1. Kick Drum
        if (isKickStep) {
          try {
            const kickOsc = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(160, time);
            kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.28);
            kickGain.gain.setValueAtTime(volume * 0.75, time);
            kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
            kickOsc.connect(kickGain);
            kickGain.connect(ctx.destination);
            kickOsc.start(time);
            kickOsc.stop(time + 0.3);
          } catch {}
        }

        // 2. Hi-Hat on off-beats
        try {
          const hatOsc = ctx.createOscillator();
          const hatGain = ctx.createGain();
          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(genre.includes('funk') ? 6000 : 9000, time + beatInterval / 2);
          hatGain.gain.setValueAtTime(volume * 0.12, time + beatInterval / 2);
          hatGain.gain.exponentialRampToValueAtTime(0.001, time + beatInterval / 2 + 0.06);
          hatOsc.connect(hatGain);
          hatGain.connect(ctx.destination);
          hatOsc.start(time + beatInterval / 2);
          hatOsc.stop(time + beatInterval / 2 + 0.06);
        } catch {}

        // 3. Cyber Bass Synth
        try {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = genre.includes('eletronica') ? 'sawtooth' : 'triangle';
          const currentBass = bassNotes[Math.floor((stepCount / 4) % bassNotes.length)];
          bassOsc.frequency.setValueAtTime(currentBass, time);
          bassGain.gain.setValueAtTime(volume * 0.35, time);
          bassGain.gain.exponentialRampToValueAtTime(0.001, time + beatInterval * 0.85);
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(time);
          bassOsc.stop(time + beatInterval * 0.85);
        } catch {}

        // 4. Melodic Lead Arpeggio
        if (stepCount % 2 === 0) {
          try {
            const leadOsc = ctx.createOscillator();
            const leadGain = ctx.createGain();
            leadOsc.type = 'sine';
            const noteIdx = (stepCount + Math.floor(stepCount / 4)) % leadNotes.length;
            leadOsc.frequency.setValueAtTime(leadNotes[noteIdx], time);
            leadGain.gain.setValueAtTime(volume * 0.15, time);
            leadGain.gain.exponentialRampToValueAtTime(0.001, time + beatInterval * 0.5);
            leadOsc.connect(leadGain);
            leadGain.connect(ctx.destination);
            leadOsc.start(time);
            leadOsc.stop(time + beatInterval * 0.5);
          } catch {}
        }

        stepCount++;
        nextBeatTime += beatInterval;
      }

      animFrameRef.current = requestAnimationFrame(scheduleBeat);
    };

    scheduleBeat();
  };

  const playSong = (song: Song, pkg?: Package) => {
    setCurrentSong(song);
    if (pkg) setCurrentPackage(pkg);
    setCurrentTime(0);
    setDuration(30);
    setIsPlaying(true);

    const isUploadedFile = song.file_path && song.file_path.startsWith('audio_');

    if (isUploadedFile) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynthBeat();
      const audio = new Audio(`/uploads/audio/${song.file_path}`);
      audio.volume = volume;
      audioRef.current = audio;

      audio.play().catch(() => {
        startSynthBeat(pkg?.slug || pkg?.category_name || 'funk');
      });

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.currentTime >= 30) {
          audio.pause();
          setIsPlaying(false);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
      };
    } else {
      // Play rich cyberpunk synthesized preview
      startSynthBeat(pkg?.slug || pkg?.category_name || 'funk');
    }
  };

  // Timer updater for progress bar
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 30) {
            pause();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopSynthBeat();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else if (currentSong) {
      setIsPlaying(true);
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(() => startSynthBeat(currentPackage?.slug || currentPackage?.category_name || 'funk'));
      } else {
        startSynthBeat(currentPackage?.slug || currentPackage?.category_name || 'funk');
      }
    }
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const stop = () => {
    pause();
    setCurrentSong(null);
    setCurrentPackage(null);
    setCurrentTime(0);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        currentPackage,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        togglePlay,
        pause,
        seek,
        setVolume,
        stop,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  return context;
};
