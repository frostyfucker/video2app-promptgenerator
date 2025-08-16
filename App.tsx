
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoUploader } from './components/VideoUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingView } from './components/LoadingView';
import { useVideoProcessor } from './hooks/useVideoProcessor';
import { analyzeVideoFrames } from './services/geminiService';
import { ErrorIcon } from './components/icons';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const { processVideo } = useVideoProcessor();

  const handleVideoUpload = async (file: File) => {
    if (isLoading) return;

    setVideoFile(file);
    setGeneratedPrompt('');
    setError(null);
    setIsLoading(true);

    try {
      setProgressMessage('Extracting frames from video...');
      const frames = await processVideo(file, (progress) => {
         setProgressMessage(`Extracting frames... ${Math.round(progress * 100)}%`);
      });

      if (frames.length === 0) {
        throw new Error("Could not extract any frames from the video. Please try a different video file.");
      }

      setProgressMessage('Analyzing frames with AI...');
      const prompt = await analyzeVideoFrames(frames);
      setGeneratedPrompt(prompt);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred. Please check the console and try again.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  const handleReset = useCallback(() => {
    setVideoFile(null);
    setGeneratedPrompt('');
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-start" role="alert">
              <ErrorIcon className="w-5 h-5 mr-3 mt-1 text-red-400" />
              <div>
                <strong className="font-bold">An error occurred:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          )}

          {isLoading ? (
            <LoadingView message={progressMessage} />
          ) : generatedPrompt ? (
            <ResultDisplay prompt={generatedPrompt} onReset={handleReset} />
          ) : (
            <VideoUploader onVideoUpload={handleVideoUpload} disabled={isLoading} />
          )}
        </main>
      </div>
       <footer className="w-full max-w-4xl mx-auto text-center mt-12 text-brand-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} Video to App Prompt Generator. Built with React & Gemini.</p>
        </footer>
    </div>
  );
};

export default App;
