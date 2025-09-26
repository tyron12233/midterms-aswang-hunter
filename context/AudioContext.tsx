import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Types
interface LoopRegion {
    /** start time (seconds) for loop inside the audio buffer */
    start: number;
    /** end time (seconds) for loop inside the audio buffer */
    end: number;
}

interface BackgroundTrackOptions {
    /** If provided, loop only a subsection (useful to skip intro) */
    loopRegion?: LoopRegion;
    /** Overall volume 0..1 */
    volume?: number;
    /** Optional fade in seconds */
    fadeIn?: number;
    /** Optional fade out seconds when stopping */
    fadeOut?: number;
    /** Start playback at this offset (seconds) inside the buffer (lets you skip an intro section) */
    startAt?: number;
}

interface AudioContextValue {
    playBackground: (src: string, opts?: BackgroundTrackOptions) => Promise<void>;
    stopBackground: (fadeOutSeconds?: number) => void;
    isBackgroundPlaying: boolean;
    setBackgroundVolume: (v: number) => void;
    triggerSfx: (src: string, options?: { volume?: number; fadeOut?: number; maxDuration?: number; startAt?: number }) => void;
    preload: (srcs: string | string[]) => Promise<void>;
    hasUserInteracted: boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export const useAudio = () => {
    const ctx = useContext(AudioCtx);
    if (!ctx) throw new Error('useAudio must be used within AudioProvider');
    return ctx;
};

/**
 * AudioProvider encapsulates background music with an optional intro and a looping middle section.
 * It uses Web Audio API for precise loop points and smooth fades.
 */
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Lazily create the audio context (must be resumed on user gesture for autoplay policies)
    const audioContextRef = useRef<AudioContext | null>(null);
    const bgSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const loopRegionRef = useRef<LoopRegion | null>(null);
    const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
    const currentTrackRef = useRef<string | null>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
    // Pending background request if autoplay blocked
    const pendingBgRef = useRef<{
        src: string;
        opts?: BackgroundTrackOptions;
    } | null>(null);

    const ensureContext = () => {
        if (!audioContextRef.current) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;
            gainRef.current = ctx.createGain();
            gainRef.current.connect(ctx.destination);
        }
        // Some browsers suspend until user interaction
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current!;
    };

    const stopBackground = useCallback((fadeOutSeconds = 0.5) => {
        const ctx = audioContextRef.current;
        if (!ctx || !bgSourceRef.current || !gainRef.current) return;

        const now = ctx.currentTime;
        const g = gainRef.current.gain;
        try {
            g.cancelScheduledValues(now);
            g.setValueAtTime(g.value, now);
            g.linearRampToValueAtTime(0, now + fadeOutSeconds);
            bgSourceRef.current.stop(now + fadeOutSeconds + 0.05);
        } catch (_) { /* ignore */ }
        bgSourceRef.current = null;
        loopRegionRef.current = null;
        currentTrackRef.current = null;
        setTimeout(() => setIsBackgroundPlaying(false), (fadeOutSeconds * 1000) + 60);
    }, []);

    const setBackgroundVolume = useCallback((v: number) => {
        const ctx = ensureContext();
        if (gainRef.current) {
            gainRef.current.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.015);
        }
    }, []);

    const loadBuffer = useCallback(async (src: string): Promise<AudioBuffer> => {
        const ctx = ensureContext();
        const cache = audioBufferCacheRef.current;
        if (cache.has(src)) return cache.get(src)!;
        const arrayBuffer = await fetch(src).then(r => r.arrayBuffer());
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        cache.set(src, audioBuffer);
        return audioBuffer;
    }, []);

    const preload = useCallback(async (srcs: string | string[]) => {
        const list = Array.isArray(srcs) ? srcs : [srcs];
        await Promise.all(list.map(src => loadBuffer(src).catch(e => console.warn('Preload failed', src, e))));
    }, [loadBuffer]);

    const playBackground = useCallback(async (src: string, opts?: BackgroundTrackOptions) => {
        const { loopRegion, volume = 0.6, fadeIn = 1.5, fadeOut = 0.5, startAt = 0 } = opts || {};
        const ctx = ensureContext();

        // If user hasn't interacted yet and context is still suspended and browser blocks playback, queue.
        if (!hasUserInteracted && ctx.state !== 'running') {
            pendingBgRef.current = { src, opts };
            return;
        }

        // If same track already playing with same loop just update volume
        if (currentTrackRef.current === src && bgSourceRef.current) {
            setBackgroundVolume(volume);
            return;
        }

        // Replace existing
        if (bgSourceRef.current) {
            stopBackground(fadeOut);
        }
        const audioBuffer = await loadBuffer(src);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        // Configure loop
        if (loopRegion) {
            source.loop = true;
            source.loopStart = Math.max(0, loopRegion.start);
            source.loopEnd = Math.min(audioBuffer.duration, loopRegion.end);
            loopRegionRef.current = loopRegion;
        } else {
            source.loop = true; // default full loop
            loopRegionRef.current = null;
        }

        if (!gainRef.current) {
            gainRef.current = ctx.createGain();
            gainRef.current.connect(ctx.destination);
        }

        // Start silent then fade in
        gainRef.current.gain.setValueAtTime(0, ctx.currentTime);
        setBackgroundVolume(volume);

    source.connect(gainRef.current);
    const safeOffset = Math.max(0, Math.min(startAt, audioBuffer.duration - 0.01));
    source.start(0, safeOffset);

        bgSourceRef.current = source;
        currentTrackRef.current = src;
        setIsBackgroundPlaying(true);
    }, [setBackgroundVolume, stopBackground, loadBuffer, hasUserInteracted]);

    const triggerSfx = useCallback((src: string, options?: { volume?: number; fadeOut?: number; maxDuration?: number; startAt?: number }) => {
        const { volume = 1, fadeOut = 0, maxDuration, startAt = 0 } = options || {};
        const ctx = ensureContext();
        // Similar gating: if user hasn't interacted we silently ignore (or could queue). Simpler: queue immediate after interaction.
        if (!hasUserInteracted && ctx.state !== 'running') {
            // Minimal queue: preload so it is instant later
            loadBuffer(src).catch(() => undefined);
            return;
        }
        loadBuffer(src)
            .then(audioBuf => {
                const srcNode = ctx.createBufferSource();
                const g = ctx.createGain();
                const clampedVol = Math.max(0, Math.min(1, volume));
                g.gain.value = clampedVol;
                srcNode.buffer = audioBuf;
                srcNode.connect(g).connect(ctx.destination);
                const offset = Math.max(0, Math.min(startAt, audioBuf.duration - 0.01));
                const remaining = audioBuf.duration - offset;
                const playDuration = maxDuration ? Math.min(maxDuration, remaining) : remaining;
                const now = ctx.currentTime;
                // Provide explicit offset + duration for precise scheduling
                srcNode.start(now, offset, playDuration);
                if (fadeOut > 0) {
                    const fadeStart = now + playDuration - fadeOut;
                    if (fadeStart > now) {
                        g.gain.setValueAtTime(clampedVol, fadeStart - 0.0005);
                        g.gain.linearRampToValueAtTime(0.0001, fadeStart + fadeOut);
                    }
                }
                srcNode.stop(now + playDuration + 0.05);
            })
            .catch(err => console.error('SFX load error', err));
    }, [hasUserInteracted, loadBuffer]);

    // User interaction listener for autoplay unlock
    useEffect(() => {
        const handleInteract = () => {
            if (hasUserInteracted) return;
            const ctx = ensureContext();
            ctx.resume().catch(() => undefined);
            setHasUserInteracted(true);
            // Play any pending background music
            if (pendingBgRef.current) {
                const { src, opts } = pendingBgRef.current;
                pendingBgRef.current = null;
                playBackground(src, opts).catch(() => undefined);
            }
            window.removeEventListener('pointerdown', handleInteract);
            window.removeEventListener('keydown', handleInteract);
            window.removeEventListener('touchstart', handleInteract);
        };
        window.addEventListener('pointerdown', handleInteract, { passive: true });
        window.addEventListener('keydown', handleInteract, { passive: true });
        window.addEventListener('touchstart', handleInteract, { passive: true });
        return () => {
            window.removeEventListener('pointerdown', handleInteract);
            window.removeEventListener('keydown', handleInteract);
            window.removeEventListener('touchstart', handleInteract);
        };
    }, [hasUserInteracted, playBackground]);

    // Clean up on unmount
    useEffect(() => () => stopBackground(0.2), [stopBackground]);

    const value: AudioContextValue = {
        playBackground,
        stopBackground,
        isBackgroundPlaying,
        setBackgroundVolume,
        triggerSfx,
        preload,
        hasUserInteracted,
    };

    return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
};
