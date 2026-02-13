import { useRef, useEffect, useState, useMemo } from 'react';
import { FiPlay, FiPause, FiUpload } from 'react-icons/fi';
import useEditorStore from '../../lib/editorStore';

export default function Preview({ onImportClick }) {
  const {
    tracks, clips, isPlaying, currentTime, duration,
    setCurrentTime, setPlaying, togglePlayPause, setDuration
  } = useEditorStore();

  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Measure container for proper scaling if needed (currently using 100% w/h)
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --- Master Clock Logic ---
  useEffect(() => {
    if (!isPlaying) return;

    let startTimestamp = performance.now();
    let initialTime = currentTime;
    let rafId;

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - startTimestamp) / 1000;
      const newTime = initialTime + elapsed;

      if (newTime >= duration) {
        setCurrentTime(duration);
        setPlaying(false);
      } else {
        setCurrentTime(newTime);
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, duration, setPlaying, setCurrentTime]);
  // Intentionally omitting currentTime from deps to avoid resetting the loop on every update
  // The closure captures the initial playback start time.

  // --- Layer Management ---
  // Get all clips active at the current time
  const activeClips = useMemo(() => {
    return clips.filter(clip =>
      currentTime >= clip.startTime && currentTime < (clip.startTime + clip.duration)
    ).sort((a, b) => {
      // Sort by track order (layers)
      const trackIndexA = tracks.findIndex(t => t.id === a.trackId);
      const trackIndexB = tracks.findIndex(t => t.id === b.trackId);
      return trackIndexA - trackIndexB;
    });
  }, [clips, currentTime, tracks]);

  // Determine if we have any visual content
  const hasVisualContent = activeClips.some(c => ['video', 'image', 'text'].includes(c.type));
  const hasAnyContent = clips.length > 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111317] relative overflow-hidden">
      {hasAnyContent ? (
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5"
        >
          {/* Render Active Layers */}
          {activeClips.map(clip => (
            <LayerRenderer
              key={clip.id}
              clip={clip}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          ))}

          {/* Overlay Controls */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/30 transition-colors cursor-pointer group"
              onClick={togglePlayPause}
            >
              <button className="w-16 h-16 bg-white/10 group-hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg scale-90 group-hover:scale-100">
                <FiPlay className="text-white text-2xl ml-1" />
              </button>
            </div>
          )}

          {/* Stats Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none px-2 py-1 bg-black/40 rounded backdrop-blur-sm border border-white/5">
            <span className="text-[10px] text-white/70 font-mono">1920 × 1080</span>
            <span className="text-[10px] text-white/50">|</span>
            <span className="text-[10px] text-white/70 font-mono">30 FPS</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center animate-fade-in">
          <div
            onClick={onImportClick}
            className="w-[640px] max-w-full aspect-video bg-[#0d0f12] rounded-xl border border-[#2a2d35] border-dashed flex flex-col items-center justify-center mb-6 p-8 cursor-pointer hover:border-blue-500/50 hover:bg-[#1a1d23] transition-all group"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#1a1d23] flex items-center justify-center mb-4 ring-1 ring-[#2a2d35] shadow-inner group-hover:scale-110 transition-transform">
              <FiUpload className="text-3xl text-[#555860] group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-base font-medium text-[#c0c4cc] mb-2 group-hover:text-white transition-colors">No Media Imported</h3>
            <p className="text-sm text-[#808690]">Click to import videos, images or audio</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Layer Renderers ---

function LayerRenderer({ clip, currentTime, isPlaying }) {
  // Account for the clip offset (if splitting)
  const localTime = (currentTime - clip.startTime) + (clip.offset || 0);

  if (clip.type === 'video') {
    return <VideoLayer clip={clip} localTime={localTime} isPlaying={isPlaying} />;
  }
  if (clip.type === 'image') {
    return <ImageLayer clip={clip} />;
  }
  if (clip.type === 'text') {
    return <TextLayer clip={clip} />;
  }
  if (clip.type === 'audio') {
    return <AudioLayer clip={clip} localTime={localTime} isPlaying={isPlaying} />;
  }
  return null;
}

function VideoLayer({ clip, localTime, isPlaying }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sync Time
    // We allow a small drift (0.1s) before forcing a seek to avoid stuttering
    const diff = Math.abs(video.currentTime - localTime);
    if (diff > 0.15) {
      video.currentTime = localTime;
    }

    // Play/Pause State
    if (isPlaying && video.paused) {
      video.play().catch(e => {
        // Handle autoplay policies or aborts gracefully
      });
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [localTime, isPlaying]);

  return (
    <video
      ref={videoRef}
      src={clip.url}
      className="absolute inset-0 w-full h-full object-contain"
      muted={false}
    // In a real editor, you'd manage volume mixing here
    />
  );
}

function AudioLayer({ clip, localTime, isPlaying }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const diff = Math.abs(audio.currentTime - localTime);
    if (diff > 0.15) {
      audio.currentTime = localTime;
    }

    if (isPlaying && audio.paused) {
      audio.play().catch(() => { });
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [localTime, isPlaying]);

  return <audio ref={audioRef} src={clip.url} className="hidden" />;
}

function ImageLayer({ clip }) {
  return (
    <img
      src={clip.url}
      alt="layer"
      className="absolute inset-0 w-full h-full object-contain select-none"
    />
  );
}

function TextLayer({ clip }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <h2 className="text-white text-6xl font-bold drop-shadow-lg text-center p-4">
        {clip.name}
      </h2>
    </div>
  );
}
