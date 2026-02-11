import { useRef, useEffect, useState } from 'react';
import {
  FiUpload, FiScissors, FiType, FiImage, FiMusic,
  FiDownload, FiLayers, FiSliders,
  FiSquare, FiCircle, FiCrop, FiDroplet,
  FiZap, FiFilm
} from 'react-icons/fi';
import Preview from './Preview';
import Timeline from './Timeline';
import Toolbar from './Toolbar';
import useEditorStore from '../../lib/editorStore';

const TOOL_SECTIONS = [
  {
    label: 'Media',
    tools: [
      { id: 'upload', name: 'Import', icon: FiUpload, primary: true },
      { id: 'media-library', name: 'Media Library', icon: FiFilm },
    ],
  },
  {
    label: 'Edit',
    tools: [
      { id: 'cut', name: 'Split', icon: FiScissors },
      { id: 'crop', name: 'Crop', icon: FiCrop },
      { id: 'trim', name: 'Trim', icon: FiSliders },
    ],
  },
  {
    label: 'Elements',
    tools: [
      { id: 'text', name: 'Text', icon: FiType },
      { id: 'shape-rect', name: 'Rectangle', icon: FiSquare },
      { id: 'shape-circle', name: 'Circle', icon: FiCircle },
      { id: 'image', name: 'Image', icon: FiImage },
    ],
  },
  {
    label: 'Effects',
    tools: [
      { id: 'filters', name: 'Filters', icon: FiDroplet },
      { id: 'transitions', name: 'Transitions', icon: FiZap },
      { id: 'overlays', name: 'Overlays', icon: FiLayers },
    ],
  },
  {
    label: 'Export',
    tools: [
      { id: 'export', name: 'Export Video', icon: FiDownload },
    ],
  },
];

export default function Editor({ user }) {
  const {
    isPlaying, currentTime, duration, clips, activeTool, selectedClipId,
    togglePlayPause, setCurrentTime, setDuration, setActiveTool,
    addClip, selectClip, getSelectedClip, splitClip,
    media, addMedia,
  } = useEditorStore();

  const [activeView, setActiveView] = useState('preview');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const selectedClip = getSelectedClip();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    let mediaType = 'video';
    let trackId = 'video-1';

    if (file.type.startsWith('image/')) {
      mediaType = 'image';
      trackId = 'image-1';
      // Images get a default 5s duration
      addMedia({
        id: Date.now().toString(),
        type: mediaType,
        name: file.name,
        url,
        file,
      });

      // Also add to timeline for convenience (or remove this if we want strict bin-only)
      // keeping it for now as "Import" usually implies "Import to project"
      // but the user said "Make the project bin work", so let's just add to bin?
      // "When I press import, I want it in the bin".
      // But standard behavior in this app was "import to timeline".
      // I'll add to bin ONLY, so the user is forced to use the bin (as requested "Make the project bin work").
      // Wait, if I do that, the user might be confused if they don't see it on timeline.
      // But "Make the project bin work" implies they want to use it.
      // I'll add to bin, and if the timeline is empty, maybe add it to timeline too?
      // Let's just add to BIN.
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
      trackId = 'audio-1';
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        addMedia({
          id: Date.now().toString(),
          type: mediaType,
          name: file.name,
          url,
          duration: audio.duration,
          file,
        });
      };
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        addMedia({
          id: Date.now().toString(),
          type: mediaType,
          name: file.name,
          url,
          duration: video.duration,
          file,
        });
        // URL.revokeObjectURL(video.src); // Keep alive
      };
      video.src = url;
    }


    // Reset so the same file can be re-selected
    e.target.value = '';

    // Show the bin so the user sees the imported file
    setActiveView('media');
  };

  const getNextAvailableTime = (trackId) => {
    const trackClips = clips.filter(c => c.trackId === trackId);
    if (trackClips.length === 0) return 0;
    return Math.max(...trackClips.map(c => c.startTime + c.duration));
  };

  const handleToolClick = (toolId) => {
    if (toolId === 'upload') {
      fileInputRef.current?.click();
      return;
    }
    if (toolId === 'cut') {
      if (selectedClipId) {
        splitClip(selectedClipId, currentTime);
      }
      return;
    }
    if (toolId === 'media-library') {
      setActiveView('media');
      return;
    }

    // If clicking other tools, ensure we go back to preview (unless we want tools to work in media view?)
    // Usually tools might apply to preview. Let's switch to preview if it's a tool that needs it?
    // Actually, let's just set the tool. The user can switch views manually.
    setActiveTool(toolId);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-56 bg-[#1a1d23] border-r border-[#2a2d35] flex flex-col overflow-y-auto relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {TOOL_SECTIONS.map((section) => (
            <div key={section.label} className="border-b border-[#2a2d35]">
              <div className="px-3 py-2">
                <h3 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider">
                  {section.label}
                </h3>
              </div>
              <div className="px-2 pb-2 space-y-0.5">
                {section.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className={`w-full py-1.5 px-2.5 rounded text-left flex items-center gap-2.5 transition-all text-sm ${tool.primary
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : isActive
                          ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                          : 'text-[#c0c4cc] hover:bg-[#22252b] hover:text-white'
                        }`}
                    >
                      <Icon className="text-sm flex-shrink-0" />
                      <span className="text-xs">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col bg-[#111317] relative">
          {/* Center Tabs */}
          <div className="h-10 bg-[#1a1d23] border-b border-[#2a2d35] flex items-center px-4 gap-4">
            <button
              onClick={() => setActiveView('preview')}
              className={`text-sm font-medium h-full border-b-2 px-2 transition-colors ${activeView === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-[#808690] hover:text-[#c0c4cc]'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveView('media')}
              className={`text-sm font-medium h-full border-b-2 px-2 transition-colors ${activeView === 'media' ? 'border-blue-500 text-white' : 'border-transparent text-[#808690] hover:text-[#c0c4cc]'}`}
            >
              Media Bin
            </button>
          </div>

          {activeView === 'preview' ? (
            <Preview />
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-8 gap-3">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-[#22252b] rounded-lg border border-[#2a2d35] hover:border-blue-500/50 cursor-grab flex flex-col items-center justify-center relative group p-2 transition-all hover:bg-[#2a2d35]"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item.type === 'video' ? <FiFilm className="text-2xl text-[#555860] mb-2 group-hover:text-blue-400 transition-colors" /> :
                      item.type === 'image' ? <FiImage className="text-2xl text-[#555860] mb-2 group-hover:text-blue-400 transition-colors" /> :
                        <FiMusic className="text-2xl text-[#555860] mb-2 group-hover:text-blue-400 transition-colors" />
                    }
                    <span className="text-[10px] text-[#c0c4cc] font-medium text-center w-full truncate">{item.name}</span>
                  </div>
                ))}

                {/* Import Card */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-[#1a1d23] rounded-lg border border-[#2a2d35] border-dashed hover:border-blue-500 hover:bg-[#22252b] flex flex-col items-center justify-center group transition-all"
                >
                  <FiUpload className="text-xl text-[#555860] mb-1 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[10px] text-[#808690] group-hover:text-blue-400 transition-colors">Import</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-[#1a1d23] border-l border-[#2a2d35] flex flex-col overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2d35]">
            {['properties', 'inspector'].map((tab) => (
              <button
                key={tab}
                className="flex-1 py-2 text-xs font-medium capitalize transition-colors text-[#808690] hover:text-[#c0c4cc] first:border-b-2 first:border-blue-400 first:text-blue-400"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-3 space-y-4">
            {selectedClip ? (
              <>
                {/* Clip name */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider mb-1">Clip</h4>
                  <p className="text-xs text-[#c0c4cc] truncate">{selectedClip.name}</p>
                  <p className="text-[10px] text-[#555860] capitalize">{selectedClip.type}</p>
                </div>

                {/* Transform */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider mb-2">Transform</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Position X', value: '0' },
                      { label: 'Position Y', value: '0' },
                      { label: 'Scale', value: '100%' },
                      { label: 'Rotation', value: '0°' },
                    ].map((prop) => (
                      <div key={prop.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-[#808690]">{prop.label}</span>
                        <input
                          type="text"
                          defaultValue={prop.value}
                          className="w-16 px-1.5 py-0.5 text-[11px] text-right bg-[#22252b] border border-[#2a2d35] rounded text-[#c0c4cc] focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider mb-2">Opacity</h4>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="100" defaultValue="100" className="flex-1 h-1 accent-blue-500" />
                    <span className="text-[11px] text-[#808690] w-8 text-right">100%</span>
                  </div>
                </div>

                {/* Volume (for video/audio) */}
                {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider mb-2">Volume</h4>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" defaultValue="100" className="flex-1 h-1 accent-blue-500" />
                      <span className="text-[11px] text-[#808690] w-8 text-right">100%</span>
                    </div>
                  </div>
                )}

                {/* Timing */}
                <div>
                  <h4 className="text-[10px] font-semibold text-[#808690] uppercase tracking-wider mb-2">Timing</h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#808690]">Start</span>
                      <span className="text-[#c0c4cc]">{selectedClip.startTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808690]">Duration</span>
                      <span className="text-[#c0c4cc]">{selectedClip.duration.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#808690]">End</span>
                      <span className="text-[#c0c4cc]">{(selectedClip.startTime + selectedClip.duration).toFixed(2)}s</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiSliders className="text-2xl text-[#3a3d45] mb-3" />
                <p className="text-xs text-[#808690]">
                  Select a clip to view properties
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Bottom - Timeline */}
      <div className="h-64 border-t border-[#2a2d35]">
        <Timeline />
      </div>
    </div >
  );
}
