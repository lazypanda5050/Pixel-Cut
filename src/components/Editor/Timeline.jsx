import { useRef, useState, useEffect, useCallback } from 'react';
import { FiVideo, FiMusic, FiType, FiImage, FiLock, FiUnlock, FiEye, FiEyeOff, FiPlus } from 'react-icons/fi';
import useEditorStore from '../../lib/editorStore';

export default function Timeline() {
  const {
    tracks, clips, duration, currentTime, zoom, selectedClipId,
    setCurrentTime, setZoom, toggleTrackLock, toggleTrackVisibility, selectClip,
    moveClip, addClip, addTrack,
  } = useEditorStore();

  const timelineRef = useRef(null);
  const tracksContainerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const totalDuration = Math.max(duration || 60, 60);
  const pixelsPerSecond = 20 * zoom;
  const timelineWidth = totalDuration * pixelsPerSecond;
  const trackHeight = 48;

  const TRACK_ICONS = { video: FiVideo, audio: FiMusic, text: FiType, image: FiImage };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const getTimeFromMouseEvent = useCallback((e) => {
    const scrollContainer = timelineRef.current;
    if (!scrollContainer) return 0;
    const rect = scrollContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollContainer.scrollLeft;
    return Math.max(0, Math.min(x / pixelsPerSecond, totalDuration));
  }, [pixelsPerSecond, totalDuration]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    // Don't start scrubbing if clicking on a clip
    if (e.target.closest('[data-clip]')) return;
    setIsScrubbing(true);
    const newTime = getTimeFromMouseEvent(e);
    setCurrentTime(newTime);
  }, [getTimeFromMouseEvent, setCurrentTime]);

  useEffect(() => {
    if (!isScrubbing) return;
    const handleMouseMove = (e) => {
      const newTime = getTimeFromMouseEvent(e);
      setCurrentTime(newTime);
    };
    const handleMouseUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, getTimeFromMouseEvent, setCurrentTime]);

  const handleScroll = (e) => setScrollLeft(e.currentTarget.scrollLeft);

  const getTimeMarkers = () => {
    const markers = [];
    let interval = 5;
    if (zoom >= 3) interval = 1;
    else if (zoom >= 1.5) interval = 2;
    else if (zoom < 0.5) interval = 10;
    for (let i = 0; i <= totalDuration; i += interval) markers.push(i);
    return markers;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return { text: 'text-blue-400', bg: 'bg-blue-500', bgLight: 'bg-blue-500/5', clip: 'bg-blue-600', clipBorder: 'border-blue-400' };
      case 'audio': return { text: 'text-green-400', bg: 'bg-green-500', bgLight: 'bg-green-500/5', clip: 'bg-green-600', clipBorder: 'border-green-400' };
      case 'text': return { text: 'text-purple-400', bg: 'bg-purple-500', bgLight: 'bg-purple-500/5', clip: 'bg-purple-600', clipBorder: 'border-purple-400' };
      case 'image': return { text: 'text-amber-400', bg: 'bg-amber-500', bgLight: 'bg-amber-500/5', clip: 'bg-amber-600', clipBorder: 'border-amber-400' };
      default: return { text: 'text-gray-400', bg: 'bg-gray-500', bgLight: 'bg-gray-500/5', clip: 'bg-gray-600', clipBorder: 'border-gray-400' };
    }
  };

  const handleClipMouseDown = (e, clip) => {
    e.stopPropagation(); // Stop scrubbing
    const startX = e.clientX;
    const initialStartTime = clip.startTime;
    const initialTrackId = clip.trackId;

    if (!tracksContainerRef.current) return;
    const tracksRect = tracksContainerRef.current.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;

      // Calculate new Start Time
      const deltaTime = deltaX / pixelsPerSecond;
      const newStartTime = Math.max(0, initialStartTime + deltaTime);

      // Calculate new Track
      const mouseY = moveEvent.clientY - tracksRect.top;
      // Account for scroll position if the container was scrollable, but checking logic:
      // The mouse Y is relative to viewport. tracksRect.top is relative to viewport.
      // So difference is relative to the container *visual* top.
      const trackIndex = Math.floor(mouseY / trackHeight);
      const targetTrack = tracks[trackIndex];

      const newTrackId = targetTrack ? targetTrack.id : initialTrackId;

      moveClip(clip.id, newStartTime, newTrackId);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const item = JSON.parse(data);
      if (!tracksContainerRef.current) return;

      const tracksRect = tracksContainerRef.current.getBoundingClientRect();
      const rect = timelineRef.current.getBoundingClientRect();

      const offsetX = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const startTime = Math.max(0, offsetX / pixelsPerSecond);

      const mouseY = e.clientY - tracksRect.top;
      const trackIndex = Math.floor(mouseY / trackHeight);
      const targetTrack = tracks[Math.max(0, Math.min(tracks.length - 1, trackIndex))];

      if (targetTrack) {
        // Use default duration if not present (e.g. 5s for images)
        const duration = item.duration || 5;

        addClip({
          trackId: targetTrack.id,
          type: item.type,
          name: item.name,
          url: item.url,
          startTime,
          duration,
          file: item.file // Passed from media object if available, though usually lost in JSON
        });
      }

    } catch (err) {
      console.error('Drop error', err);
    }
  };

  const playheadX = (currentTime || 0) * pixelsPerSecond;

  return (
    <div className="h-full flex flex-col bg-[#1a1d23] select-none">
      {/* Timeline Header */}
      <div className="h-8 flex items-center justify-between px-3 bg-[#22252b] border-b border-[#2a2d35]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#808690] uppercase tracking-wider">Timeline</span>
          {clips.length > 0 && (
            <span className="text-[10px] text-[#555860]">{clips.length} clip{clips.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-[#c0c4cc]">
            {formatTime(currentTime || 0)} / {formatTime(duration || 0)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#808690]">Zoom</span>
            <input
              type="range"
              min="0.25"
              max="5"
              step="0.25"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-20 h-1 accent-blue-500"
            />
            <span className="text-[10px] text-[#808690] w-8">{zoom}x</span>
          </div>
        </div>
      </div>

      {/* Main timeline area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track labels (left panel) */}
        <div className="w-44 flex-shrink-0 border-r border-[#2a2d35] flex flex-col">
          <div className="h-6 bg-[#22252b] border-b border-[#2a2d35]" />

          {tracks.map((track) => {
            const Icon = TRACK_ICONS[track.type] || FiVideo;
            const colors = getTypeColor(track.type);
            const trackClipCount = clips.filter(c => c.trackId === track.id).length;
            return (
              <div
                key={track.id}
                className="flex items-center gap-2 px-2 border-b border-[#2a2d35] hover:bg-[#22252b] transition-colors group"
                style={{ height: trackHeight }}
              >
                <Icon className={`text-sm ${colors.text} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[#c0c4cc] truncate block">{track.name}</span>
                  {trackClipCount > 0 && (
                    <span className="text-[9px] text-[#555860]">{trackClipCount} clip{trackClipCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleTrackVisibility(track.id)} className="p-0.5 rounded hover:bg-[#2a2d35]">
                    {track.visible ? <FiEye className="text-[10px] text-[#808690]" /> : <FiEyeOff className="text-[10px] text-[#808690]" />}
                  </button>
                  <button onClick={() => toggleTrackLock(track.id)} className="p-0.5 rounded hover:bg-[#2a2d35]">
                    {track.locked ? <FiLock className="text-[10px] text-[#808690]" /> : <FiUnlock className="text-[10px] text-[#808690]" />}
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex-1 flex items-start pt-2 px-2">
            <button
              onClick={() => addTrack('video')}
              className="flex items-center gap-1 text-[10px] text-[#808690] hover:text-[#c0c4cc] transition-colors"
            >
              <FiPlus className="text-xs" />
              Add Track
            </button>
          </div>
        </div>

        {/* Scrollable timeline area */}
        <div
          className={`flex-1 overflow-x-auto overflow-y-hidden ${isScrubbing ? 'cursor-col-resize' : ''}`}
          onScroll={handleScroll}
          ref={timelineRef}
        >
          <div className="relative" style={{ width: timelineWidth, minHeight: '100%' }}>
            {/* Time ruler */}
            <div
              className="h-6 bg-[#22252b] border-b border-[#2a2d35] relative cursor-col-resize"
              onMouseDown={handleMouseDown}
            >
              {getTimeMarkers().map((time) => {
                const x = time * pixelsPerSecond;
                return (
                  <div key={time} className="absolute top-0 h-full" style={{ left: x }}>
                    <div className="w-px h-2 bg-[#555860] absolute bottom-0" />
                    <span className="text-[9px] text-[#808690] absolute top-0.5 left-1 whitespace-nowrap font-mono">
                      {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
              {Array.from({ length: Math.floor(totalDuration) }, (_, i) => (
                <div key={`sub-${i}`} className="absolute bottom-0 w-px h-1 bg-[#3a3d45]" style={{ left: i * pixelsPerSecond }} />
              ))}
            </div>

            {/* Track lanes */}
            <div
              ref={tracksContainerRef}
              className="relative"
              onMouseDown={handleMouseDown}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {tracks.map((track) => {
                const colors = getTypeColor(track.type);
                const trackClips = clips.filter(c => c.trackId === track.id);
                return (
                  <div
                    key={track.id}
                    className={`relative border-b border-[#2a2d35] ${colors.bgLight} cursor-col-resize`}
                    style={{ height: trackHeight }}
                  >
                    {/* Grid lines */}
                    {getTimeMarkers().map((time) => (
                      <div key={time} className="absolute top-0 bottom-0 w-px bg-[#2a2d35]" style={{ left: time * pixelsPerSecond }} />
                    ))}

                    {/* Clips */}
                    {trackClips.map((clip) => {
                      const clipLeft = clip.startTime * pixelsPerSecond;
                      const clipWidth = clip.duration * pixelsPerSecond;
                      const isSelected = selectedClipId === clip.id;

                      return (
                        <div
                          key={clip.id}
                          data-clip={clip.id}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectClip(clip.id);
                          }}
                          className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all
                            ${colors.clip} ${isSelected ? `ring-2 ring-white/50 ${colors.clipBorder}` : 'ring-1 ring-white/10 hover:ring-white/30'}
                          `}
                          style={{ left: clipLeft, width: Math.max(clipWidth, 20) }}
                          title={clip.name}
                        >
                          {/* Clip content */}
                          <div className="h-full flex items-center px-2 overflow-hidden">
                            {clip.type === 'video' && <FiVideo className="text-[10px] text-white/70 flex-shrink-0 mr-1" />}
                            {clip.type === 'audio' && <FiMusic className="text-[10px] text-white/70 flex-shrink-0 mr-1" />}
                            {clip.type === 'image' && <FiImage className="text-[10px] text-white/70 flex-shrink-0 mr-1" />}
                            {clip.type === 'text' && <FiType className="text-[10px] text-white/70 flex-shrink-0 mr-1" />}
                            <span className="text-[10px] text-white/80 truncate">
                              {clip.name}
                            </span>
                          </div>

                          {/* Resize handles */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 rounded-l" />
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/30 rounded-r" />
                        </div>
                      );
                    })}

                    {/* Empty track placeholder */}
                    {trackClips.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-[#555860]">Drag {track.type} here</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: playheadX }}>
              <div className="relative">
                <div className="absolute -left-[5px] top-0 w-0 h-0" style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '6px solid #ef4444',
                }} />
              </div>
              <div className="w-px h-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
