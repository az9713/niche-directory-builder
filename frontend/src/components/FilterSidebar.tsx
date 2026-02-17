'use client';

import { useState } from 'react';
import type { ListingFilters } from '@/lib/types';

const SERVICE_OPTIONS = [
  { key: 'svc_full_groom', label: 'Full Groom' },
  { key: 'svc_bath_only', label: 'Bath Only' },
  { key: 'svc_nail_trim', label: 'Nail Trim' },
  { key: 'svc_deshedding', label: 'Deshedding' },
  { key: 'svc_teeth_brushing', label: 'Teeth Brushing' },
  { key: 'svc_ear_cleaning', label: 'Ear Cleaning' },
  { key: 'svc_flea_treatment', label: 'Flea Treatment' },
  { key: 'svc_puppy_groom', label: 'Puppy Groom' },
  { key: 'svc_senior_groom', label: 'Senior Groom' },
];

interface FilterSidebarProps {
  filters: ListingFilters;
  states: string[];
  onFilterChange: (filters: ListingFilters) => void;
}

export default function FilterSidebar({ filters, states, onFilterChange }: FilterSidebarProps) {
  const [open, setOpen] = useState(false);

  function update(patch: Partial<ListingFilters>) {
    onFilterChange({ ...filters, ...patch, page: 1 });
  }

  function toggleService(svcKey: string) {
    const current = filters.services ?? [];
    const next = current.includes(svcKey)
      ? current.filter((s) => s !== svcKey)
      : [...current, svcKey];
    update({ services: next });
  }

  function clearFilters() {
    onFilterChange({ page: 1 });
  }

  const content = (
    <div className="space-y-6">
      {/* State */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">State</h3>
        <select
          value={filters.state ?? ''}
          onChange={(e) => update({ state: e.target.value || undefined, city: undefined })}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">City</h3>
        <input
          type="text"
          value={filters.city ?? ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
          placeholder="Enter city..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Services */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Services</h3>
        <div className="space-y-2">
          {SERVICE_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(filters.services ?? []).includes(opt.key)}
                onChange={() => toggleService(opt.key)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Pet Type */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Pet Type</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.accepts_cats ?? false}
            onChange={(e) => update({ accepts_cats: e.target.checked || undefined })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Accepts Cats
        </label>
      </div>

      {/* Features */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Features</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.fear_free ?? false}
            onChange={(e) => update({ fear_free: e.target.checked || undefined })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Fear Free Certified
        </label>
      </div>

      {/* Min Rating */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Minimum Rating</h3>
        <select
          value={filters.min_rating ?? ''}
          onChange={(e) => update({ min_rating: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      {/* Clear */}
      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mb-4 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
        >
          <span>Filters</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {content}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:block">
        {content}
      </aside>
    </>
  );
}
