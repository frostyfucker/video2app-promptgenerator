
import React from 'react';
import { FilmIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
        <div className="inline-flex items-center justify-center bg-brand-primary/10 text-brand-accent p-4 rounded-full mb-4 border border-brand-accent/20">
            <FilmIcon className="w-10 h-10" />
        </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-text tracking-tight">
        Video to App Prompt Generator
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
        Describe your app idea in a short video. We'll analyze it and generate a detailed prompt to bring your vision to life with AI.
      </p>
    </header>
  );
};
