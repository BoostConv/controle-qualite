'use client';

import { useState } from 'react';
import ViewportColumn from '@/components/ViewportColumn';
import ReportView from '@/components/ReportView';
import { AnalysisResult } from '@/types';

export default function Home() {
  const [figmaD, setFigmaD] = useState<string | null>(null);
  const [devD, setDevD] = useState<string | null>(null);
  const [figmaM, setFigmaM] = useState<string | null>(null);
  const [devM, setDevM] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const hasDesktopPair = figmaD && devD;
  const hasMobilePair = figmaM && devM;
  const canAnalyze = hasDesktopPair || hasMobilePair;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const body: Record<string, string> = {};
      if (hasDesktopPair) {
        body.figmaD = figmaD!;
        body.shotD = devD!;
      }
      if (hasMobilePair) {
        body.figmaM = figmaM!;
        body.shotM = devM!;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analyse failed');

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFigmaD(null);
    setDevD(null);
    setFigmaM(null);
    setDevM(null);
    setResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EDE4F5] to-[#F7F1FB]">
      {/* Header */}
      <header className="border-b border-white/50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-violet">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-syne text-xl font-bold text-gray-900">
              QA Visual Agent
            </h1>
          </div>
          {result && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Nouvelle analyse
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {!result ? (
          <>
            {/* Upload section */}
            <div className="mb-6 text-center">
              <h2 className="font-syne text-2xl font-bold text-gray-900">
                Comparez vos maquettes avec le développement
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Uploadez vos maquettes Figma et capturez les pages développées pour lancer l&apos;analyse QA.
              </p>
            </div>

            {/* Two columns */}
            <div className="grid gap-6 md:grid-cols-2">
              <ViewportColumn
                viewport="desktop"
                figmaImage={figmaD}
                devImage={devD}
                onFigmaChange={setFigmaD}
                onDevChange={setDevD}
              />
              <ViewportColumn
                viewport="mobile"
                figmaImage={figmaM}
                devImage={devM}
                onFigmaChange={setFigmaM}
                onDevChange={setDevM}
              />
            </div>

            {/* Status indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${hasDesktopPair ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={hasDesktopPair ? 'text-green-700 font-medium' : 'text-gray-500'}>
                  Desktop {hasDesktopPair ? 'prêt' : 'incomplet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${hasMobilePair ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={hasMobilePair ? 'text-green-700 font-medium' : 'text-gray-500'}>
                  Mobile {hasMobilePair ? 'prêt' : 'incomplet'}
                </span>
              </div>
            </div>

            {/* Analyze button */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || analyzing}
                className="flex items-center gap-2 rounded-xl bg-brand-violet px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-violet/25 transition hover:bg-brand-violet/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {analyzing ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Lancer l&apos;analyse QA
                  </>
                )}
              </button>
              {!canAnalyze && (
                <p className="text-xs text-gray-400">
                  Complétez au moins une paire (Figma + Dev) pour lancer l&apos;analyse
                </p>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Report section */
          <ReportView result={result} />
        )}
      </div>
    </main>
  );
}
