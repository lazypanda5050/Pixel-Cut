import { useRef, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';

export default function Preview({
  videoUrl,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = currentTime;
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange(videoRef.current.duration);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {videoUrl ? (
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          
          {/* Play/Pause Overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={onPlayPause}
          >
            <button className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
              {isPlaying ? (
                <FiPause className="text-white text-2xl" />
              ) : (
                <FiPlay className="text-white text-2xl ml-1" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-surface-light rounded-full flex items-center justify-center">
            <FiPlay className="text-4xl text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Video Loaded</h3>
          <p className="text-text-muted">
            Upload a video to start editing
          </p>
        </div>
      )}
    </div>
  );
}
