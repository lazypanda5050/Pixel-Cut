import { useState, useEffect } from 'react';
import { FiVideo, FiAlertCircle } from 'react-icons/fi';

function App() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Firebase is configured
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey || apiKey === 'demo-key') {
      console.warn('⚠️ Firebase not configured. Using demo mode.');
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-surface rounded-lg p-8 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-500 text-3xl" />
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          <p className="text-text-muted mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-primary hover:bg-blue-600 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiVideo className="text-primary text-2xl" />
          <h1 className="text-xl font-bold text-white">Pixel-Cut</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">Demo Mode</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-32 h-32 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
            <FiVideo className="text-6xl text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">Welcome to Pixel-Cut! 🎬</h2>
          <p className="text-xl text-text-muted mb-8">
            Your collaborative web-based video editor
          </p>
          
          <div className="bg-surface rounded-lg p-6 border border-border text-left">
            <h3 className="font-semibold mb-3 text-white">✅ App is running!</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>✓ React loaded</li>
              <li>✓ Tailwind CSS working</li>
              <li>✓ Eruda DevTools available (check bottom-right corner)</li>
              <li>⚠️ Firebase not configured (using demo mode)</li>
            </ul>
            
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-sm text-yellow-200">
                <strong>Next step:</strong> Configure Firebase credentials in <code className="bg-black/30 px-1 rounded">.env</code> file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border px-4 py-3 text-center text-sm text-text-muted">
        Made with ❤️ by the Pixel-Cut Team
      </footer>
    </div>
  );
}

export default App;
