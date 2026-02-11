import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward,
  FiVolume2, FiMaximize, FiRepeat,
  FiChevronsLeft, FiChevronsRight,
} from 'react-icons/fi';
import useEditorStore from '../../lib/editorStore';

export default function Toolbar() {
  const { isPlaying, currentTime, duration, togglePlayPause, setCurrentTime } = useEditorStore();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-10 bg-[#1a1d23] border-t border-[#2a2d35] flex items-center justify-between px-4">
      <div className="flex items-center gap-2 w-48">
        <span className="text-xs font-mono text-[#c0c4cc] tabular-nums">{formatTime(currentTime)}</span>
        <span className="text-xs text-[#555860]">/</span>
        <span className="text-xs font-mono text-[#808690] tabular-nums">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentTime(0)} className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Go to Start">
          <FiChevronsLeft className="text-sm" />
        </button>
        <button onClick={() => setCurrentTime(Math.max(0, currentTime - 1 / 30))} className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Previous Frame">
          <FiSkipBack className="text-sm" />
        </button>
        <button onClick={togglePlayPause} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors mx-1" title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <FiPause className="text-sm text-white" /> : <FiPlay className="text-sm text-white ml-0.5" />}
        </button>
        <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 1 / 30))} className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Next Frame">
          <FiSkipForward className="text-sm" />
        </button>
        <button onClick={() => setCurrentTime(duration)} className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Go to End">
          <FiChevronsRight className="text-sm" />
        </button>
      </div>

      <div className="flex items-center gap-3 w-48 justify-end">
        <button className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Loop">
          <FiRepeat className="text-sm" />
        </button>
        <div className="flex items-center gap-1.5">
          <FiVolume2 className="text-xs text-[#808690]" />
          <input type="range" min="0" max="100" defaultValue="100" className="w-16 h-1 accent-blue-500" />
        </div>
        <button className="p-1.5 hover:bg-[#22252b] rounded transition-colors text-[#808690] hover:text-white" title="Fullscreen">
          <FiMaximize className="text-sm" />
        </button>
      </div>
    </div>
  );
}
