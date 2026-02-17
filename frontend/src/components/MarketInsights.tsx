'use client';

import { useState } from 'react';
import type { MarketInsights as MarketInsightsType } from '@/lib/types';

interface MarketInsightsProps {
  insights: MarketInsightsType;
}

export default function MarketInsights({ insights }: MarketInsightsProps) {
  const [expanded, setExpanded] = useState(false);

  if (insights.totalInArea === 0) return null;

  const catPct = Math.round((insights.catCount / insights.totalInArea) * 100);
  const fearFreePct = Math.round((insights.fearFreeCount / insights.totalInArea) * 100);
  const hasGaps = insights.gaps.length > 0;
  const hasWeakSpots = insights.weakSpots.length > 0;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Market Insights — {insights.areaLabel}
            </h3>
            <p className="text-xs text-gray-500">
              {insights.totalInArea} groomer{insights.totalInArea !== 1 ? 's' : ''}
              {' · '}Avg rating {insights.avgRating}
              {hasGaps && (
                <span className="ml-1 font-medium text-red-600">
                  · {insights.gaps.length} service gap{insights.gaps.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {/* Gaps alert */}
          {hasGaps && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Service gaps — zero providers
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    No groomer in {insights.areaLabel} offers: {insights.gaps.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weak spots alert */}
          {hasWeakSpots && (
            <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Low coverage (&lt;25%)
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    {insights.weakSpots.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">{insights.totalInArea}</p>
              <p className="text-xs text-gray-500">Groomers</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">{insights.avgRating}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center ${catPct === 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className={`text-lg font-bold ${catPct === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {catPct}%
              </p>
              <p className="text-xs text-gray-500">Accept Cats</p>
            </div>
            <div className={`rounded-lg px-3 py-2 text-center ${fearFreePct === 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className={`text-lg font-bold ${fearFreePct === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {fearFreePct}%
              </p>
              <p className="text-xs text-gray-500">Fear Free</p>
            </div>
          </div>

          {/* Service coverage bars */}
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Service Coverage
          </h4>
          <div className="space-y-2">
            {insights.services.map((svc) => (
              <div key={svc.key} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-gray-600">{svc.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      svc.pct === 0 ? 'bg-red-400' : svc.pct < 25 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(svc.pct, svc.pct === 0 ? 0 : 4)}%` }}
                  />
                </div>
                <span className={`w-16 text-right text-xs font-medium ${
                  svc.pct === 0 ? 'text-red-600' : svc.pct < 25 ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {svc.count}/{svc.total} ({svc.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
