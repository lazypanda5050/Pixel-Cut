import { create } from 'zustand';

let clipIdCounter = 1;

const useEditorStore = create((set, get) => ({
    // Playback
    isPlaying: false,
    currentTime: 0,
    duration: 0,

    // Tracks
    tracks: [
        { id: 'video-1', name: 'Video', type: 'video', locked: false, visible: true },
        { id: 'audio-1', name: 'Audio', type: 'audio', locked: false, visible: true },
        { id: 'text-1', name: 'Text', type: 'text', locked: false, visible: true },
        { id: 'image-1', name: 'Image', type: 'image', locked: false, visible: true },
    ],

    // Clips on the timeline
    clips: [],

    // Selection
    selectedClipId: null,
    activeTool: null,

    // Zoom
    zoom: 1,

    // Playback actions
    togglePlayPause: () => set((s) => ({ isPlaying: !s.isPlaying })),
    setPlaying: (playing) => set({ isPlaying: playing }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),

    // Zoom
    setZoom: (zoom) => set({ zoom }),

    // Tool selection
    setActiveTool: (tool) => set((s) => ({
        activeTool: s.activeTool === tool ? null : tool,
    })),

    // Media Bin
    media: [],
    addMedia: (file) => set((s) => ({ media: [...s.media, file] })),

    // Clip actions
    addClip: (clip) => set((s) => {
        const id = `clip-${clipIdCounter++}`;
        const newClip = { id, ...clip };
        const newClips = [...s.clips, newClip];

        // Recalculate total duration
        const maxEnd = Math.max(s.duration, ...newClips.map(c => c.startTime + c.duration));

        return {
            clips: newClips,
            duration: maxEnd,
            selectedClipId: id,
        };
    }),

    splitClip: (clipId, splitTime) => set((s) => {
        const clip = s.clips.find(c => c.id === clipId);
        if (!clip) return s;

        // Check if split time is valid within clip
        if (splitTime <= clip.startTime || splitTime >= clip.startTime + clip.duration) return s;

        const firstPartDuration = splitTime - clip.startTime;
        const secondPartDuration = clip.duration - firstPartDuration;

        // Create second part
        const newClipId = `clip-${clipIdCounter++}`;
        const secondPart = {
            ...clip,
            id: newClipId,
            startTime: splitTime,
            duration: secondPartDuration,
            // If it's a video/audio file, we might need offset logic in a real engine
            // For now, we assume the player handles "starting from offset" which it doesn't really yet
            // but let's just split the block on the timeline first.
            // Actually, for a simple implementation, we assume the clip plays from 0 relative to its start.
            // If we split, the second clip needs to start playing from `firstPartDuration`.
            // We should add an `offset` property to clips later, but for now let's just create the block.
            offset: (clip.offset || 0) + firstPartDuration
        };

        const updatedFirstPart = { ...clip, duration: firstPartDuration };

        return {
            clips: [...s.clips.filter(c => c.id !== clipId), updatedFirstPart, secondPart],
            selectedClipId: newClipId
        };
    }),

    removeClip: (clipId) => set((s) => ({
        clips: s.clips.filter(c => c.id !== clipId),
        selectedClipId: s.selectedClipId === clipId ? null : s.selectedClipId,
    })),

    selectClip: (clipId) => set({ selectedClipId: clipId }),

    moveClip: (clipId, newStartTime, newTrackId) => set((s) => {
        const clip = s.clips.find(c => c.id === clipId);
        if (!clip) return s;

        // Calculate potential new state
        const targetTrackId = newTrackId || clip.trackId;
        const targetStartTime = Math.max(0, newStartTime);
        const targetEndTime = targetStartTime + clip.duration;

        // Check for collision on the target track
        const hasCollision = s.clips.some(c => {
            if (c.id === clipId) return false; // Ignore self
            if (c.trackId !== targetTrackId) return false; // Ignore other tracks

            const cEndTime = c.startTime + c.duration;

            // Check overlap: (StartA < EndB) and (EndA > StartB)
            return (targetStartTime < cEndTime) && (targetEndTime > c.startTime);
        });

        if (hasCollision) {
            return s; // Operation blocked
        }

        return {
            clips: s.clips.map(c =>
                c.id === clipId
                    ? { ...c, startTime: targetStartTime, trackId: targetTrackId }
                    : c
            ),
        };
    }),

    resizeClip: (clipId, newDuration) => set((s) => ({
        clips: s.clips.map(c =>
            c.id === clipId ? { ...c, duration: Math.max(0.5, newDuration) } : c
        ),
    })),

    // Track actions
    toggleTrackLock: (trackId) => set((s) => ({
        tracks: s.tracks.map(t =>
            t.id === trackId ? { ...t, locked: !t.locked } : t
        ),
    })),

    toggleTrackVisibility: (trackId) => set((s) => ({
        tracks: s.tracks.map(t =>
            t.id === trackId ? { ...t, visible: !t.visible } : t
        ),
    })),

    addTrack: (type) => set((s) => {
        const count = s.tracks.filter(t => t.type === type).length + 1;
        const names = { video: 'Video', audio: 'Audio', text: 'Text', image: 'Images' };
        return {
            tracks: [...s.tracks, {
                id: `${type}-${Date.now()}`,
                name: `${names[type] || type} ${count}`,
                type,
                locked: false,
                visible: true,
            }],
        };
    }),

    // Get the selected clip object
    getSelectedClip: () => {
        const { clips, selectedClipId } = get();
        return clips.find(c => c.id === selectedClipId) || null;
    },
}));

export default useEditorStore;
