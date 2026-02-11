import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiMaximize,
} from 'react-icons/fi';

export default function Toolbar({ isPlaying, onPlayPause, currentTime, duration }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-surface border-t border-border flex items-center justify-between px-4">
      {/* Left - Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          title="Skip Backward"
        >
          <FiSkipBack />
        </button>
        
        <button
          onClick={onPlayPause}
          className="p-3 bg-primary hover:bg-blue-600 rounded-lg transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        
        <button
          className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          title="Skip Forward"
        >
          <FiSkipForward />
        </button>

        <div className="ml-4 text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Right - Additional Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiVolume2 className="text-text-muted" />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            className="w-24"
          />
        </div>

        <button
          className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          title="Fullscreen"
        >
          <FiMaximize />
        </button>
      </div>
    </div>
  );
}
