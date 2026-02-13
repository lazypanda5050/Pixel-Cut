import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

const PROJECTS_COLLECTION = 'projects';

/**
 * Creates a new project for a user
 * @param {string} userId - The ID of the user creating the project
 * @param {string} name - The name of the project
 * @returns {Promise<Object>} The created project object with ID
 */
export const createProject = async (userId, name) => {
    try {
        const projectData = {
            userId,
            name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Initial empty state
            state: {
                tracks: [
                    { id: 'video-1', name: 'Video', type: 'video', locked: false, visible: true },
                    { id: 'audio-1', name: 'Audio', type: 'audio', locked: false, visible: true },
                ],
                clips: [],
                duration: 0,
                zoom: 1,
                media: []
            }
        };

        const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
        return { id: docRef.id, ...projectData };
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

/**
 * Updates a project with new editor state
 * @param {string} projectId 
 * @param {Object} editorState - The complete state from editorStore
 */
export const saveProject = async (projectId, editorState) => {
    try {
        const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

        // Extract only serializable data, strip non-serializable file objects
        const serializableState = {
            tracks: editorState.tracks,
            clips: editorState.clips.map(({ file, ...rest }) => rest),
            duration: editorState.duration,
            zoom: editorState.zoom,
            media: editorState.media.map(({ file, uploading, ...rest }) => rest)
        };

        // Deep sanitize to remove undefined values which Firestore rejects
        const sanitizedState = JSON.parse(JSON.stringify(serializableState));

        await updateDoc(projectRef, {
            state: sanitizedState,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving project:", error);
        throw error;
    }
};

/**
 * Gets all projects for a specific user
 * @param {string} userId 
 */
export const getUserProjects = async (userId) => {
    try {
        console.log("Fetching projects for user:", userId);
        const q = query(
            collection(db, PROJECTS_COLLECTION),
            where("userId", "==", userId)
            // orderBy("updatedAt", "desc") // Commenting out to check if index is the issue
        );

        console.log("Executing Firestore query...");

        // Wrap in timeout to detect hangs
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore query timed out. Please check if your database exists in the Firebase Console.")), 15000)
        );

        const querySnapshot = await Promise.race([
            getDocs(q),
            timeoutPromise
        ]);

        console.log("Query completed. Docs found:", querySnapshot.size);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting user projects:", error);
        throw error;
    }
};

/**
 * Gets a single project by ID
 * @param {string} projectId 
 */
export const getProject = async (projectId) => {
    try {
        const docRef = doc(db, PROJECTS_COLLECTION, projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Project not found");
        }
    } catch (error) {
        console.error("Error getting project:", error);
        throw error;
    }
};

/**
 * Uploads a media file to Firebase Storage
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} Download URL
 */
export const uploadMediaFile = async (userId, file) => {
    const timestamp = Date.now();
    const storageRef = ref(storage, `media/${userId}/${timestamp}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};
