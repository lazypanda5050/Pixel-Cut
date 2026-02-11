# Pixel-Cut Project Structure

```
Pixel-Cut/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── Auth.jsx        # Authentication component (login/signup)
│   │   └── Editor/
│   │       ├── Editor.jsx   # Main editor container
│   │       ├── Preview.jsx  # Video preview component
│   │       ├── Timeline.jsx # Timeline component
│   │       └── Toolbar.jsx  # Playback controls
│   ├── lib/
│   │   ├── firebase.js      # Firebase initialization
│   │   └── ffmpeg.js        # FFmpeg wrapper utilities
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Example environment variables
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vercel.json             # Vercel deployment config
├── vite.config.js          # Vite bundler configuration
└── README.md               # Documentation
```

## Components Overview

### Auth.jsx
- Email/password authentication
- Google sign-in
- Sign up / Sign in toggle
- Error handling

### Editor/Editor.jsx
- Main editing interface
- File upload
- Left sidebar (tools)
- Center preview
- Right sidebar (properties)
- Bottom timeline

### Editor/Preview.jsx
- Video player
- Play/pause overlay
- Aspect ratio handling
- Time tracking

### Editor/Timeline.jsx
- Canvas-based timeline
- Time markers
- Playhead
- Click-to-seek
- Zoom controls

### Editor/Toolbar.jsx
- Playback controls
- Time display
- Volume control
- Fullscreen toggle

## Libraries Used

- **@ffmpeg/ffmpeg** - Client-side video processing
- **firebase** - Authentication, storage, database
- **react** - UI framework
- **tailwindcss** - Styling
- **react-icons** - Icon library
- **zustand** - State management (lightweight)
- **fabric** - Canvas manipulation
- **wavesurfer.js** - Audio waveforms

## Next Steps

1. ✅ Basic project structure
2. ✅ Authentication
3. ✅ File upload
4. ✅ Video preview
5. ✅ Basic timeline
6. ⏳ FFmpeg integration
7. ⏳ Real-time collaboration
8. ⏳ Firebase storage
9. ⏳ Video trimming
10. ⏳ Export functionality
