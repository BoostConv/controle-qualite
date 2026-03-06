'use client';

import { useState, useMemo } from 'react';
import { AnalysisResult, IssueCategory, IssueSeverity, Viewport } from '@/types';
import ScoreRing from './ScoreRing';
import IssueCard from './IssueCard';

interface ReportViewProps {
  result: AnalysisResult;
}

const allCategories: { value: IssueCategory; label: string }[] = [
  { value: 'typography', label: 'Typographie' },
  { value: 'spacing', label: 'Espacement' },
  { value: 'colors', label: 'Couleurs' },
  { value: 'images', label: 'Images' },
  { value: 'layout', label: 'Layout' },
  { value: 'content', label: 'Contenu' },
  { value: 'components', label: 'Composants' },
];

const allSeverities: { value: IssueSeverity; label: string }[] = [
  { value: 'critique', label: 'Critique' },
  { value: 'important', label: 'Important' },
  { value: 'mineur', label: 'Mineur' },
];

const allViewports: { value: Viewport | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'both', label: 'Les deux' },
];

export default function ReportView({ result }: ReportViewProps) {
  const [filterCategory, setFilterCategory] = useState<IssueCategory | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'all'>('all');
  const [filterViewport, setFilterViewport] = useState<Viewport | 'all'>('all');

  const filteredIssues = useMemo(() => {
    return result.issues.filter((issue) => {
      if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
      if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
      if (filterViewport !== 'all' && issue.viewport !== filterViewport && issue.viewport !== 'both') return false;
      return true;
    });
  }, [result.issues, filterCategory, filterSeverity, filterViewport]);

  const severityCounts = useMemo(() => {
    const counts = { critique: 0, important: 0, mineur: 0 };
    result.issues.forEach((i) => counts[i.severity]++);
    return counts;
  }, [result.issues]);

  const copyAllForDev = () => {
    const text = filteredIssues
      .map(
        (issue, i) =>
          `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n   Viewport: ${issue.viewport}\n   Catégorie: ${issue.category}\n   Localisation: ${issue.location}\n   Description: ${issue.description}\n   Suggestion: ${issue.suggestion}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Scores + Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          {result.score_desktop !== null && (
            <ScoreRing score={result.score_desktop} label="Desktop" color="#2563EB" />
          )}
          {result.score_mobile !== null && (
            <ScoreRing score={result.score_mobile} label="Mobile" color="#7C3AED" />
          )}
        </div>

        {/* Severity summary */}
        <div className="mt-5 flex justify-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="font-medium text-gray-600">{severityCounts.critique} critique{severityCounts.critique > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-gray-600">{severityCounts.important} important{severityCounts.important > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="font-medium text-gray-600">{severityCounts.mineur} mineur{severityCounts.mineur > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Summary text */}
        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <p className="text-sm leading-relaxed text-gray-700">{result.summary}</p>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Viewport filter */}
        <select
          value={filterViewport}
          onChange={(e) => setFilterViewport(e.target.value as Viewport | 'all')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-violet focus:outline-none"
        >
          {allViewports.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as IssueCategory | 'all')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-violet focus:outline-none"
        >
          <option value="all">Toutes catégories</option>
          {allCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Severity filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as IssueSeverity | 'all')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-violet focus:outline-none"
        >
          <option value="all">Toutes sévérités</option>
          {allSeverities.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={copyAllForDev}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copier pour le dev
          </button>
          <button
            onClick={copyJSON}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Copier JSON
          </button>
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">Aucune issue ne correspond aux filtres sélectionnés.</p>
          </div>
        ) : (
          filteredIssues.map((issue, i) => (
            <IssueCard key={i} issue={issue} />
          ))
        )}
      </div>
    </div>
  );
}
