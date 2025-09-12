
import React, { useCallback, useState } from 'react';
import { UploadIcon, CameraIcon, YouTubeIcon } from './icons';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
  disabled: boolean;
  onSwitchToRecorder: () => void;
  onYouTubeUrlSubmit: (url: string) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload, disabled, onSwitchToRecorder, onYouTubeUrlSubmit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoUpload(file);
    } else {
      alert('Please drop a valid video file.');
    }
  }, [onVideoUpload, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (youtubeUrl.trim()) {
      onYouTubeUrlSubmit(youtubeUrl.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="video-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center w-full h-64 border-2 border-brand-border border-dashed rounded-xl cursor-pointer
          bg-brand-surface hover:bg-gray-700/50 transition-colors duration-300
          ${isDragging ? 'border-brand-primary bg-blue-900/20' : ''}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-3 text-brand-text-secondary" />
          <p className="mb-2 text-sm text-brand-text-secondary">
            <span className="font-semibold text-brand-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-brand-text-secondary">MP4, MOV, WEBM (Max 50MB)</p>
        </div>
        <input
          id="video-upload"
          type="file"
          className="hidden"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-brand-border"></div>
        <span className="flex-shrink mx-4 text-brand-text-secondary uppercase text-xs font-semibold">Or</span>
        <div className="flex-grow border-t border-brand-border"></div>
      </div>
       <button
        onClick={onSwitchToRecorder}
        disabled={disabled}
        className="w-full flex items-center justify-center px-4 py-3 border border-brand-border rounded-xl text-brand-text bg-brand-surface hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary"
      >
        <CameraIcon className="w-6 h-6 mr-3 text-brand-primary" />
        <span className="text-sm font-semibold">Record with Webcam</span>
      </button>
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-brand-border"></div>
        <span className="flex-shrink mx-4 text-brand-text-secondary uppercase text-xs font-semibold">Or</span>
        <div className="flex-grow border-t border-brand-border"></div>
      </div>

      <div className="w-full">
        <form onSubmit={handleUrlSubmit}>
          <label htmlFor="youtube-url" className="flex items-center mb-2 text-sm font-semibold text-brand-text">
            <YouTubeIcon className="w-6 h-6 mr-2 text-red-500" />
            Analyze a YouTube Video
          </label>
          <div className="flex space-x-2">
            <input
              id="youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={disabled}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-grow px-4 py-2 bg-brand-bg border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
              aria-label="YouTube video URL"
            />
            <button
              type="submit"
              disabled={disabled || !youtubeUrl.trim()}
              className="px-4 py-2 font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
