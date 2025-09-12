
import React from 'react';
import { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, RefreshIcon, WandIcon, LinkIcon } from './icons';

interface ResultDisplayProps {
  prompt: string;
  onReset: () => void;
  sources?: any[] | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ prompt, onReset, sources }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setHasCopied(true);
  };

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg animate-fade-in">
       <div className="p-4 sm:p-6 border-b border-brand-border flex justify-between items-center">
          <div className="flex items-center">
            <WandIcon className="w-6 h-6 mr-3 text-brand-accent"/>
            <h2 className="text-xl font-bold text-brand-text">Your Generated Prompt</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary transition-all"
                >
                {hasCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                <span className="ml-2">{hasCopied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
                onClick={onReset}
                title="Start Over"
                className="inline-flex items-center p-2 border border-brand-border text-sm font-medium rounded-md shadow-sm text-brand-text-secondary bg-brand-surface hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary transition-all"
                >
                <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
       </div>

      <div className="p-4 sm:p-6">
        <pre className="whitespace-pre-wrap break-words bg-brand-bg p-4 rounded-lg font-mono text-sm text-brand-text-secondary overflow-x-auto">
            <code>
                {prompt}
            </code>
        </pre>
      </div>

      {sources && sources.length > 0 && (
        <div className="p-4 sm:p-6 border-t border-brand-border">
          <h3 className="flex items-center text-lg font-semibold text-brand-text mb-3">
            <LinkIcon className="w-5 h-5 mr-2 text-brand-text-secondary" />
            Sources
          </h3>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              source.web && (
                <li key={index} className="text-sm">
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline hover:text-blue-400 transition-colors break-all"
                    title={source.web.uri}
                  >
                    {index + 1}. {source.web.title || source.web.uri}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
