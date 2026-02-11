import { useRef, useEffect } from 'react';

export default function Timeline({ clips, duration, currentTime, onTimeChange }) {
  const timelineRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    drawTimeline();
  }, [duration, currentTime]);

  const drawTimeline = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    if (duration === 0) return;

    // Draw time markers
    const pixelsPerSecond = width / duration;
    const interval = duration > 60 ? 10 : duration > 30 ? 5 : 1;

    ctx.strokeStyle = '#475569';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';

    for (let i = 0; i <= duration; i += interval) {
      const x = i * pixelsPerSecond;
      
      ctx.beginPath();
      ctx.moveTo(x, height - 20);
      ctx.lineTo(x, height);
      ctx.stroke();

      const timeStr = formatTime(i);
      ctx.fillText(timeStr, x + 2, height - 25);
    }

    // Draw playhead
    const playheadX = currentTime * pixelsPerSecond;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
    ctx.lineWidth = 1;
  };

  const handleTimelineClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / canvas.width) * duration;
    onTimeChange(Math.max(0, Math.min(newTime, duration)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Header */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-muted uppercase">Timeline</h3>
        <div className="text-sm text-text-muted">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Timeline Canvas */}
      <div className="flex-1 relative overflow-x-auto" ref={timelineRef}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={200}
          className="cursor-pointer"
          onClick={handleTimelineClick}
        />
      </div>

      {/* Zoom Controls */}
      <div className="px-4 py-2 border-t border-border flex items-center gap-2">
        <span className="text-xs text-text-muted">Zoom:</span>
        <input
          type="range"
          min="1"
          max="10"
          defaultValue="5"
          className="flex-1"
        />
      </div>
    </div>
  );
}
