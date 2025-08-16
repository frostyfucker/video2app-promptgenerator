
import React from 'react';
import { SpinnerIcon } from './icons';

interface LoadingViewProps {
  message: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-brand-surface rounded-lg border border-brand-border">
      <SpinnerIcon className="w-12 h-12 text-brand-primary animate-spin" />
      <p className="mt-4 text-lg text-brand-text-secondary tracking-wide">{message}</p>
      <div className="w-full bg-brand-border rounded-full h-2.5 mt-6">
         <div className="bg-brand-primary h-2.5 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
