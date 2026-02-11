import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance = null;
let isLoaded = false;

export const loadFFmpeg = async (onProgress) => {
  if (isLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]:', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    ffmpegInstance = ffmpeg;
    console.log('✅ FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error);
    throw error;
  }
};

export const getFFmpeg = () => {
  if (!ffmpegInstance) {
    throw new Error('FFmpeg not loaded. Call loadFFmpeg() first.');
  }
  return ffmpegInstance;
};

export const trimVideo = async (inputFile, startTime, endTime, onProgress) => {
  const ffmpeg = await loadFFmpeg(onProgress);
  
  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  
  // Write input file to FFmpeg's virtual filesystem
  await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
  
  // Run FFmpeg command
  await ffmpeg.exec([
    '-i', inputName,
    '-ss', startTime,
    '-to', endTime,
    '-c', 'copy',
    outputName
  ]);
  
  // Read the output file
  const data = await ffmpeg.readFile(outputName);
  
  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  
  return new Blob([data.buffer], { type: 'video/mp4' });
};

export const mergeVideos = async (videoFiles, onProgress) => {
  const ffmpeg = await loadFFmpeg(onProgress);
  
  // Create concat file
  let concatContent = '';
  for (let i = 0; i < videoFiles.length; i++) {
    const filename = `input${i}.mp4`;
    await ffmpeg.writeFile(filename, await fetchFile(videoFiles[i]));
    concatContent += `file '${filename}'\n`;
  }
  
  await ffmpeg.writeFile('concat.txt', concatContent);
  
  // Merge videos
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'output.mp4'
  ]);
  
  const data = await ffmpeg.readFile('output.mp4');
  
  // Clean up
  for (let i = 0; i < videoFiles.length; i++) {
    await ffmpeg.deleteFile(`input${i}.mp4`);
  }
  await ffmpeg.deleteFile('concat.txt');
  await ffmpeg.deleteFile('output.mp4');
  
  return new Blob([data.buffer], { type: 'video/mp4' });
};

// Helper function to fetch file
const fetchFile = async (file) => {
  if (file instanceof Blob) {
    return new Uint8Array(await file.arrayBuffer());
  }
  const response = await fetch(file);
  return new Uint8Array(await response.arrayBuffer());
};

export default {
  loadFFmpeg,
  getFFmpeg,
  trimVideo,
  mergeVideos,
};
