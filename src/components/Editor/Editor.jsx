import { useState, useRef } from 'react';
import { FiUpload, FiPlay, FiPause, FiScissors, FiDownload, FiLayers } from 'react-icons/fi';
import Preview from './Preview';
import Timeline from './Timeline';
import Toolbar from './Toolbar';

export default function Editor({ user }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState([]);
  
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-surface border-r border-border p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4 text-text-muted uppercase">Tools</h3>
          
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 bg-primary hover:bg-blue-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <FiUpload />
            Upload Video
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Tool Buttons */}
          <div className="space-y-2">
            <button className="w-full py-2 px-4 bg-surface-light hover:bg-border rounded-lg text-left flex items-center gap-2 transition-colors">
              <FiScissors />
              <span>Cut</span>
            </button>
            <button className="w-full py-2 px-4 bg-surface-light hover:bg-border rounded-lg text-left flex items-center gap-2 transition-colors">
              <FiLayers />
              <span>Add Text</span>
            </button>
            <button className="w-full py-2 px-4 bg-surface-light hover:bg-border rounded-lg text-left flex items-center gap-2 transition-colors">
              <FiDownload />
              <span>Export</span>
            </button>
          </div>

          {/* Info Panel */}
          {videoFile && (
            <div className="mt-6 p-4 bg-background rounded-lg">
              <h4 className="text-xs font-semibold mb-2 text-text-muted uppercase">File Info</h4>
              <div className="text-sm space-y-1">
                <p className="truncate" title={videoFile.name}>
                  <span className="text-text-muted">Name:</span> {videoFile.name}
                </p>
                <p>
                  <span className="text-text-muted">Size:</span>{' '}
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <span className="text-text-muted">Duration:</span>{' '}
                  {duration.toFixed(2)}s
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col bg-background">
          <Preview
            videoUrl={videoUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlayPause={handlePlayPause}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-surface border-l border-border p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-4 text-text-muted uppercase">Properties</h3>
          
          {videoFile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="100"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="100"
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <p className="text-text-muted text-sm">
              Upload a video to see properties
            </p>
          )}
        </div>
      </div>

      {/* Bottom - Timeline */}
      <div className="h-64 bg-surface border-t border-border">
        <Timeline
          clips={clips}
          duration={duration}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
        />
      </div>

      {/* Toolbar */}
      <Toolbar
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        currentTime={currentTime}
        duration={duration}
      />
    </div>
  );
}
