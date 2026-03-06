'use client';

import { useState } from 'react';
import UploadZone from './UploadZone';
import { DevInputMode } from '@/types';

interface ViewportColumnProps {
  viewport: 'desktop' | 'mobile';
  figmaImage: string | null;
  devImage: string | null;
  onFigmaChange: (img: string | null) => void;
  onDevChange: (img: string | null) => void;
}

export default function ViewportColumn({
  viewport,
  figmaImage,
  devImage,
  onFigmaChange,
  onDevChange,
}: ViewportColumnProps) {
  const [devMode, setDevMode] = useState<DevInputMode>('url');
  const [url, setUrl] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState('');

  const isDesktop = viewport === 'desktop';
  const colorClass = isDesktop ? 'text-blue-600' : 'text-purple-600';
  const bgAccent = isDesktop ? 'bg-blue-50' : 'bg-purple-50';
  const borderAccent = isDesktop ? 'border-blue-200' : 'border-purple-200';
  const icon = isDesktop ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  const handleCapture = async () => {
    if (!url.trim()) return;
    setCapturing(true);
    setCaptureError('');
    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), viewport }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Capture failed');
      onDevChange(data.image);
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Erreur de capture');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${borderAccent} ${bgAccent}/30 bg-white p-5 shadow-sm`}>
      {/* Header */}
      <div className={`mb-4 flex items-center gap-2 ${colorClass}`}>
        {icon}
        <h2 className="font-syne text-lg font-bold">
          {isDesktop ? 'Desktop' : 'Mobile'}
        </h2>
        <span className="ml-auto text-xs font-medium text-gray-400">
          {isDesktop ? '1440 × 900' : '390 × 844'}
        </span>
      </div>

      {/* Figma upload */}
      <UploadZone
        label="Maquette Figma"
        image={figmaImage}
        onImageChange={onFigmaChange}
      />

      {/* Separator */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-bold text-gray-400">VS</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Dev section */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
          Page développée
        </span>

        {/* Tabs */}
        <div className="mb-3 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setDevMode('url')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              devMode === 'url'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Capture URL
          </button>
          <button
            onClick={() => setDevMode('upload')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              devMode === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload manuel
          </button>
        </div>

        {devMode === 'url' ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-violet focus:outline-none focus:ring-1 focus:ring-brand-violet"
              />
              <button
                onClick={handleCapture}
                disabled={capturing || !url.trim()}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  isDesktop
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                    : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                }`}
              >
                {capturing ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Capture...
                  </span>
                ) : (
                  'Capturer'
                )}
              </button>
            </div>
            {captureError && (
              <p className="text-xs text-red-500">{captureError}</p>
            )}
            {devImage && (
              <div className="relative mt-2">
                <img
                  src={devImage}
                  alt="Capture"
                  className="max-h-[240px] w-full rounded-lg border border-gray-100 object-contain"
                />
                <button
                  onClick={() => onDevChange(null)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <UploadZone
            label=""
            image={devImage}
            onImageChange={onDevChange}
          />
        )}
      </div>
    </div>
  );
}
