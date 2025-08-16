
import { useCallback } from 'react';

// Maximum number of frames to extract to avoid large payloads and long processing times.
const MAX_FRAMES = 15;
const FRAME_CAPTURE_INTERVAL_SECONDS = 2; // Capture a frame every 2 seconds.

export const useVideoProcessor = () => {
  const processVideo = useCallback(
    (file: File, onProgress: (progress: number) => void): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          return reject(new Error('Canvas 2D context is not supported.'));
        }

        video.preload = 'metadata';
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const duration = video.duration;
          const frames: string[] = [];
          
          // Determine the interval, ensuring we don't exceed MAX_FRAMES
          let interval = FRAME_CAPTURE_INTERVAL_SECONDS;
          if (duration / interval > MAX_FRAMES) {
              interval = duration / MAX_FRAMES;
          }
          if (duration < interval) {
              interval = duration / 2 || 1; // Handle very short videos
          }
          
          let currentTime = 0;
          let framesCaptured = 0;

          const captureFrame = () => {
            if (currentTime > duration || framesCaptured >= MAX_FRAMES) {
              URL.revokeObjectURL(videoUrl);
              resolve(frames);
              return;
            }

            video.currentTime = currentTime;
          };

          video.onseeked = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Get base64 data, remove the prefix "data:image/jpeg;base64,"
            const base64Data = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            frames.push(base64Data);
            framesCaptured++;
            
            onProgress(Math.min(currentTime / duration, 1.0));
            
            currentTime += interval;
            captureFrame();
          };
          
          video.onerror = (e) => {
              URL.revokeObjectURL(videoUrl);
              console.error("Video processing error:", e);
              reject(new Error('Failed to load or process the video file. It may be corrupt or in an unsupported format.'));
          }

          // Start the process
          captureFrame();
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(videoUrl);
            console.error("Video loading error:", e);
            reject(new Error('Could not load video metadata. Please ensure it is a valid video file.'));
        };
      });
    },
    []
  );

  return { processVideo };
};
