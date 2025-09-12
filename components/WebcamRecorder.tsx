
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ErrorIcon, RefreshIcon } from './icons';

interface WebcamRecorderProps {
  onRecordingComplete: (file: File) => void;
  onCancel: () => void;
}

type RecordingStatus = 'idle' | 'permission' | 'recording' | 'preview' | 'error';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const WebcamRecorder: React.FC<WebcamRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [status, setStatus] = useState<RecordingStatus>('permission');
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  const stopTimer = useCallback(() => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
  }, []);

  const cleanup = useCallback(() => {
    cleanupStream();
    stopTimer();
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  }, [cleanupStream, stopTimer, videoUrl]);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
        setStream(userMediaStream);
        setStatus('idle');
      } catch (err) {
        console.error("Error getting user media:", err);
        setError("Could not access camera and microphone. Please grant permissions and try again.");
        setStatus('error');
      }
    };

    if (status === 'permission') {
        getPermissions();
    }
    
    return () => {
      cleanup();
    };
  }, [status, cleanup]);

  useEffect(() => {
    if (status === 'idle' && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [status, stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
            }
        };
        recorder.onstop = () => {
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);
            setStatus('preview');
        };
        recorder.start();
        setStatus('recording');
        setRecordingTime(0);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    } catch (e) {
        console.error("MediaRecorder error:", e);
        setError("Could not start recording. Your browser might not support the required video format.");
        setStatus('error');
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [status, stopTimer]);

  const handleUseVideo = () => {
    if (videoUrl) {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        onRecordingComplete(videoFile);
    }
  };

  const handleRetake = () => {
      if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
          setVideoUrl(null);
      }
      setRecordingTime(0);
      setStatus('idle');
  };

  const renderContent = () => {
    switch (status) {
        case 'permission':
            return <div className="text-center min-h-[200px] flex items-center justify-center"><p className="text-brand-text-secondary">Requesting camera permissions...</p></div>;
        case 'error':
            return (
                <div className="text-center text-red-300 min-h-[200px] flex flex-col items-center justify-center">
                    <ErrorIcon className="w-10 h-10 mx-auto mb-4 text-red-400" />
                    <p>{error}</p>
                </div>
            );
        case 'idle':
        case 'recording':
            return (
                <div className="relative w-full aspect-video">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full rounded-lg bg-black object-cover" />
                    {status === 'recording' && (
                        <div className="absolute top-4 left-4 flex items-center bg-red-600/90 text-white px-3 py-1 rounded-md text-sm font-bold animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                            REC {formatTime(recordingTime)}
                        </div>
                    )}
                </div>
            );
        case 'preview':
            return <video src={videoUrl} controls autoPlay className="w-full aspect-video rounded-lg bg-black" />;
    }
  };

  const renderControls = () => {
      switch (status) {
        case 'idle':
            return (
                <button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-red-500">Start Recording</button>
            );
        case 'recording':
            return (
                <button onClick={stopRecording} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center">
                    <span className="w-3 h-3 bg-white rounded-sm mr-2"></span>
                    Stop Recording
                </button>
            );
        case 'preview':
            return (
                <div className="flex space-x-4">
                    <button onClick={handleRetake} className="flex items-center bg-brand-surface hover:bg-gray-700/80 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-brand-border">
                        <RefreshIcon className="w-5 h-5 mr-2" />
                        Record Again
                    </button>
                    <button onClick={handleUseVideo} className="bg-brand-accent hover:opacity-90 text-brand-bg font-bold py-2 px-4 rounded-lg transition-colors">Use Video</button>
                </div>
            );
        case 'error':
             return (
                 <button onClick={onCancel} className="bg-brand-surface hover:bg-gray-700/80 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-brand-border">Back to Upload</button>
             );
        default:
            return null;
      }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center bg-brand-surface border border-brand-border rounded-xl shadow-lg p-4 sm:p-6 space-y-4 animate-fade-in">
        {renderContent()}
        <div className="flex items-center justify-between w-full min-h-[48px]">
             <button 
                onClick={onCancel} 
                disabled={status === 'recording'} 
                className="text-brand-text-secondary hover:text-brand-text disabled:opacity-50 transition-colors px-4 py-2"
                style={{ visibility: (status === 'idle' || status === 'preview') ? 'visible' : 'hidden' }}
             >
                Cancel
             </button>
            <div className="flex-grow flex items-center justify-center">
                {renderControls()}
            </div>
             <div className="w-[88px]"></div> {/* Spacer to balance cancel button */}
        </div>
    </div>
  );
};
