import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { FiVideo, FiLogOut, FiSave, FiGrid } from 'react-icons/fi';
import Auth from './components/Auth';
import Editor from './components/Editor/Editor';
import ProjectList from './components/ProjectList';
import useEditorStore from './lib/editorStore';
import { saveProject } from './lib/db';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('auth'); // auth, projects, editor
  const { currentProject } = useEditorStore();

  useEffect(() => {
    console.log("Setting up auth listener...");
    const timeoutRef = setTimeout(() => {
      // This is a safety net. If loading is still true after 5s, we show an alert.
      // We check the variable in the functional update or valid scope if possible,
      // but since we can't easily access the latest state inside the timeout without a ref,
      // let's actually just force a check via a different mechanism or just alert if UI hasn't unmounted.
      // Simplified: The user is seeing logs, so we know auth changed.
      // I will remove the misleading timeout alert for now to reduce noise/confusion
      // since we know Auth IS working (logs confirm it).
      // The issue is likely likely downstream.
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u);
      setUser(u);
      setLoading(false);
      clearTimeout(timeoutRef);
      if (u) {
        setView('projects');
      } else {
        setView('auth');
      }
    }, (error) => {
      console.error("Auth Error:", error);
      setLoading(false);
      alert("Firebase connection error: " + error.message);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutRef);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // View update handled by onAuthStateChanged
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;
    try {
      const state = useEditorStore.getState();
      await saveProject(currentProject.id, state);
      alert('Project saved automatically!'); // Minimal feedback for now
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save project');
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

  // Project List View
  if (view === 'projects') {
    return (
      <>
        <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
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
        <ProjectList
          user={user}
          onSelectProject={(project) => {
            // Editor store updated in ProjectList handleSelectProject
            setView('editor');
          }}
        />
      </>
    );
  }

  // Editor View
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('projects')}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors text-text-muted hover:text-white mr-2"
            title="Back to Projects"
          >
            <FiGrid />
          </button>
          <div className="flex flex-col">
            <h1 className="text-md font-bold text-white leading-tight">{currentProject?.name || 'Untitled Project'}</h1>
            <span className="text-[10px] text-text-muted">Edited recently</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveProject}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium text-white transition-colors"
          >
            <FiSave />
            Save
          </button>
          <div className="w-px h-4 bg-border mx-2" />
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
