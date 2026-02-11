import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { FiVideo, FiLogOut } from 'react-icons/fi';
import Auth from './components/Auth';
import Editor from './components/Editor/Editor';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-muted">Loading Pixel-Cut...</p>
        </div>
      </div>
    );
  }

  // Not logged in → Auth screen
  if (!user) {
    return <Auth />;
  }

  // Logged in → Editor
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiVideo className="text-primary text-2xl" />
          <h1 className="text-xl font-bold text-white">Pixel-Cut</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-muted">
            {user.displayName || user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors text-text-muted hover:text-white"
            title="Sign Out"
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* Editor */}
      <Editor user={user} />
    </div>
  );
}

export default App;
