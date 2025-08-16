
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
  disabled: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

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
    </div>
  );
};
