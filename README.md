# Pixel-Cut 🎬✂️

A collaborative web-based video editor built with modern web technologies, hosted on Vercel with Firebase backend for real-time multi-user collaboration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-9+-FFCA28?logo=firebase)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)

## 🌟 Features

- **🎥 Browser-Based Video Editing** - No installation required, runs entirely in your browser
- **👥 Real-Time Collaboration** - Multiple users can edit simultaneously with live cursor tracking
- **🔥 Firebase Integration** - Authentication, storage, and real-time sync
- **📦 Client-Side Processing** - Video processing using WebAssembly (ffmpeg.wasm)
- **🎨 Modern UI** - Intuitive drag-and-drop interface
- **☁️ Cloud Storage** - Automatic project saving to Firebase Storage
- **🔐 User Authentication** - Secure login with Firebase Auth
- **📱 Responsive Design** - Works on desktop and tablet devices
- **⚡ Edge Network** - Global CDN via Vercel for fast loading worldwide

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Vercel (Edge Network)              │
│        • Auto CDN & Global Distribution         │
│        • Custom Headers (COOP/COEP)             │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     React SPA + ffmpeg.wasm              │  │
│  │  (Client-side video processing)          │  │
│  │  • SharedArrayBuffer enabled ✓           │  │
│  │  • Multi-threaded processing             │  │
│  └──────────────────────────────────────────┘  │
│                      │                          │
└──────────────────────┼──────────────────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │      Firebase Services        │
       ├───────────────────────────────┤
       │ • Firestore (project data)    │
       │ • Storage (video files)       │
       │ • Auth (user management)      │
       │ • Realtime DB (presence)      │
       └───────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI framework
- **Vite** - Build tool and dev server
- **ffmpeg.wasm** - Browser-based video processing
- **fabric.js** - Canvas manipulation and overlays
- **wavesurfer.js** - Audio waveform visualization
- **react-beautiful-dnd** - Drag-and-drop timeline

### Backend/Services
- **Firebase Firestore** - Real-time project data sync
- **Firebase Storage** - Video and asset storage
- **Firebase Authentication** - User login (Google, Email, Anonymous)
- **Firebase Realtime Database** - Live presence and cursor tracking

### Deployment
- **Vercel** - Edge hosting with custom headers support
- **GitHub** - Source control and CI/CD integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account ([console.firebase.google.com](https://console.firebase.google.com))
- Vercel account ([vercel.com](https://vercel.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Pixel-Cut.git
   cd Pixel-Cut
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   
   b. Enable the following services:
      - Authentication (Email/Password, Google)
      - Firestore Database
      - Storage
      - Realtime Database
   
   c. Register a web app and copy the Firebase config
   
   d. Create `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /projects/{projectId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           (request.auth.uid in resource.data.collaborators ||
            request.auth.uid == resource.data.owner);
       }
     }
   }
   ```

5. **Configure Storage Security Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /projects/{projectId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null;
       }
     }
   }
   ```

6. **Create `vercel.json` for custom headers** (already included in repo)
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cross-Origin-Embedder-Policy",
             "value": "require-corp"
           },
           {
             "key": "Cross-Origin-Opener-Policy",
             "value": "same-origin"
           }
         ]
       }
     ]
   }
   ```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Deploy to Vercel

#### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   For production:
   ```bash
   vercel --prod
   ```

#### Option 2: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Vite and configure build settings
4. Add environment variables in Vercel dashboard:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.
5. Click **Deploy**

#### Option 3: GitHub Integration (Auto-Deploy)

1. Connect your GitHub repo to Vercel
2. Every push to `main` branch auto-deploys to production
3. Pull requests get preview deployments

### Post-Deployment

1. **Update Firebase authorized domains**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain (e.g., `pixel-cut.vercel.app`)

2. **Update CORS for Firebase Storage**
   ```json
   [
     {
       "origin": ["https://pixel-cut.vercel.app"],
       "method": ["GET", "PUT", "POST"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   
   Apply with:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name.appspot.com
   ```

## 📁 Project Structure

```
Pixel-Cut/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Editor/      # Video editor UI
│   │   ├── Timeline/    # Timeline component
│   │   ├── Preview/     # Video preview
│   │   └── Toolbar/     # Editing tools
│   ├── lib/
│   │   ├── firebase.js  # Firebase initialization
│   │   ├── ffmpeg.js    # FFmpeg wrapper
│   │   └── collaboration.js # Real-time collaboration
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables (not committed)
├── .env.example         # Example env file
├── vercel.json          # Vercel configuration
├── vite.config.js       # Vite configuration
├── package.json
└── README.md
```

## 🎯 Key Features Implementation

### Real-Time Collaboration

Uses Firebase Realtime Database for presence tracking:

```javascript
// Track active users
const presence = ref(database, `projects/${projectId}/presence/${userId}`);
onValue(connectedRef, (snapshot) => {
  if (snapshot.val()) {
    onDisconnect(presence).remove();
    set(presence, {
      name: user.displayName,
      cursor: { x: 0, y: 0 },
      timestamp: serverTimestamp()
    });
  }
});
```

### Video Processing

Client-side processing with ffmpeg.wasm:

```javascript
import { createFFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ 
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

await ffmpeg.load();

// Trim video example
await ffmpeg.run(
  '-i', 'input.mp4',
  '-ss', '00:00:05',
  '-to', '00:00:15',
  '-c', 'copy',
  'output.mp4'
);
```

### Project Auto-Save

Automatic save to Firestore every 5 seconds:

```javascript
useEffect(() => {
  const saveInterval = setInterval(() => {
    if (hasChanges) {
      saveProjectToFirestore(projectData);
    }
  }, 5000);
  return () => clearInterval(saveInterval);
}, [projectData, hasChanges]);
```

## 🔧 Configuration

### Firebase Quotas & Limits

Be aware of Firebase free tier limits:
- **Firestore**: 50K reads/day, 20K writes/day
- **Storage**: 5GB total, 1GB/day downloads
- **Realtime Database**: 100 simultaneous connections

For production, consider upgrading to Blaze (pay-as-you-go) plan.

### Vercel Limits (Hobby Plan)

- **Bandwidth**: 100GB/month
- **Build time**: 6,000 minutes/month
- **Deployments**: Unlimited
- **Edge Functions**: 100 hours/month

For higher limits, upgrade to Pro ($20/month).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Basic video trimming and cutting
- [ ] Timeline drag-and-drop
- [ ] Text overlays and titles
- [ ] Audio track management
- [ ] Filters and effects
- [ ] Real-time cursor tracking
- [ ] Comment system
- [ ] Export presets (1080p, 4K, etc.)
- [ ] Keyboard shortcuts
- [ ] Undo/Redo system
- [ ] Mobile responsive design
- [ ] Video templates
- [ ] Transitions and animations
- [ ] Green screen/chroma key
- [ ] Voice recording overlay

## ⚠️ Limitations

- **File Size**: Browser memory limits (recommend <500MB videos for smooth performance)
- **Processing Speed**: Client-side processing is slower than server-side (but more private!)
- **Browser Support**: Requires modern browsers with WebAssembly and SharedArrayBuffer support
  - Chrome 92+
  - Firefox 90+
  - Safari 15.2+
  - Edge 92+
- **Simultaneous Users**: Limited by Firebase Realtime Database connections (100 on free tier)

## 🐛 Troubleshooting

### FFmpeg not loading

**Issue**: FFmpeg fails to load or throws `SharedArrayBuffer is not defined`

**Solution**: This is automatically handled by Vercel with the custom headers in `vercel.json`. If you're testing locally, you need to serve the app with these headers:

```bash
# Install a dev server that supports headers
npm install -D http-server-spa

# Serve with custom headers
npx http-server-spa dist index.html 8080 \
  --cors \
  -H "Cross-Origin-Embedder-Policy: require-corp" \
  -H "Cross-Origin-Opener-Policy: same-origin"
```

### Firebase authentication errors

- Verify your Vercel domain is added to **authorized domains** in Firebase Console
- Check `.env` variables are correctly set in Vercel dashboard
- Ensure environment variables are prefixed with `VITE_`

### Large video files causing crashes

- Compress videos before upload
- Implement chunked upload for files >100MB
- Use Firebase Storage's resumable upload API

### Slow video processing

- ffmpeg.wasm is single-threaded by default
- Consider using `ffmpeg.wasm-mt` for multi-threading (requires additional setup)
- Show progress indicators to users during processing

## 🎨 Customization

### Theming

Pixel-Cut uses CSS variables for easy theming:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
}
```

### Branding

Update logos and favicons in the `public/` directory.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - WebAssembly port of FFmpeg
- [Firebase](https://firebase.google.com/) - Backend services
- [Vercel](https://vercel.com/) - Deployment platform
- [Remotion](https://www.remotion.dev/) - Inspiration for video editing patterns

## 📞 Support

- 📧 Email: support@pixel-cut.dev
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/Pixel-Cut/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR_USERNAME/Pixel-Cut/discussions)
- 🐦 Twitter: [@PixelCutApp](https://twitter.com/PixelCutApp)

---

Made with ❤️ by the Pixel-Cut Team | Powered by Vercel ▲
