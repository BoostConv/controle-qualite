'use client';

import { useState } from 'react';
import { Issue } from '@/types';

interface IssueCardProps {
  issue: Issue;
}

const severityConfig = {
  critique: { label: 'Critique', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  important: { label: 'Important', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  mineur: { label: 'Mineur', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
};

const categoryLabels: Record<string, string> = {
  typography: 'Typographie',
  spacing: 'Espacement',
  colors: 'Couleurs',
  images: 'Images',
  layout: 'Layout',
  content: 'Contenu',
  components: 'Composants',
};

const viewportLabels: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  both: 'Desktop & Mobile',
};

export default function IssueCard({ issue }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityConfig[issue.severity];

  const copyText = () => {
    const text = `[${issue.severity.toUpperCase()}] ${issue.title}
Viewport: ${viewportLabels[issue.viewport]}
Catégorie: ${categoryLabels[issue.category]}
Localisation: ${issue.location}
Description: ${issue.description}
Suggestion: ${issue.suggestion}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`rounded-xl border ${sev.border} ${sev.bg}/30 bg-white overflow-hidden transition-all`}>
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${sev.dot}`} />
        <span className="flex-1 text-sm font-semibold text-gray-900">
          {issue.title}
        </span>
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${sev.bg} ${sev.text}`}>
            {sev.label}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {categoryLabels[issue.category]}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {viewportLabels[issue.viewport]}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <div className="grid gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-500">Localisation</span>
              <p className="mt-0.5 text-gray-900">{issue.location}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Description</span>
              <p className="mt-0.5 text-gray-700">{issue.description}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Suggestion</span>
              <p className="mt-0.5 text-gray-700">{issue.suggestion}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyText();
            }}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copier pour le dev
          </button>
        </div>
      )}
    </div>
  );
}
