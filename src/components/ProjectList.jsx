import { useState, useEffect } from 'react';
import { FiPlus, FiFolder, FiClock, FiVideo } from 'react-icons/fi';
import { createProject, getUserProjects } from '../lib/db';
import useEditorStore from '../lib/editorStore';

export default function ProjectList({ user, onSelectProject }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [error, setError] = useState('');

    const { setProject, resetEditor } = useEditorStore();

    useEffect(() => {
        loadProjects();
    }, [user.uid]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const userProjects = await getUserProjects(user.uid);
            setProjects(userProjects);
        } catch (err) {
            console.error(err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            setCreating(true);
            const newProject = await createProject(user.uid, newProjectName);
            // Reset editor state for new project
            resetEditor();
            setProject(newProject);
            onSelectProject(newProject);
        } catch (err) {
            console.error(err);
            setError('Failed to create project');
        } finally {
            setCreating(false);
            setNewProjectName('');
        }
    };

    const handleSelectProject = (project) => {
        // Load project state into store
        resetEditor(); // Clear previous state first
        setProject(project);
        if (project.state) {
            useEditorStore.getState().loadProjectState(project.state);
        }
        onSelectProject(project);
    };

    return (
        <div className="min-h-screen bg-[#111317] p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <FiVideo className="text-xl text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">My Projects</h1>
                    </div>

                    {/* User info / Sign out would go here in a real app header, but we have it in App.jsx */}
                </div>

                {/* Create Project Section */}
                <div className="mb-12">
                    <form onSubmit={handleCreateProject} className="flex gap-4 items-end bg-[#1a1d23] p-6 rounded-2xl border border-[#2a2d35]">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-[#808690] uppercase tracking-wider mb-2">New Project Name</label>
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="My Awesome Video"
                                className="w-full bg-[#22252b] border border-[#2a2d35] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating || !newProjectName.trim()}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPlus className="text-lg" />
                            Create Project
                        </button>
                    </form>
                </div>

                {/* Project Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {projects.length === 0 ? (
                            <div className="text-center py-20 bg-[#1a1d23] rounded-2xl border border-[#2a2d35] border-dashed">
                                <FiFolder className="text-4xl text-[#2a2d35] mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-[#808690]">No projects yet</h3>
                                <p className="text-[#555860] mt-1">Create your first project above to get started!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleSelectProject(project)}
                                        className="group bg-[#1a1d23] rounded-xl border border-[#2a2d35] p-5 text-left hover:border-blue-500/50 hover:bg-[#22252b] transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                <FiVideo className="text-blue-400" />
                                            </div>
                                            <span className="text-[10px] bg-[#2a2d35] px-2 py-1 rounded text-[#808690] group-hover:bg-[#1a1d23]">
                                                {project.state?.tracks?.length || 0} tracks
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-lg text-[#c0c4cc] group-hover:text-white mb-2 truncate">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-[#555860]">
                                            <FiClock />
                                            <span>
                                                {project.updatedAt?.toDate
                                                    ? project.updatedAt.toDate().toLocaleDateString()
                                                    : 'Just now'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
