'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import FilterSidebar from '@/components/FilterSidebar';
import ListingCard from '@/components/ListingCard';
import { getListings, getStates } from '@/lib/queries';
import type { Listing, ListingFilters } from '@/lib/types';

const PAGE_SIZE = 20;

function parseFilters(params: URLSearchParams): ListingFilters {
  return {
    search: params.get('search') ?? undefined,
    state: params.get('state') ?? undefined,
    city: params.get('city') ?? undefined,
    accepts_cats: params.get('accepts_cats') === 'true' || undefined,
    fear_free: params.get('fear_free') === 'true' || undefined,
    breed_size: params.get('breed_size') ?? undefined,
    min_rating: params.get('min_rating') ? Number(params.get('min_rating')) : undefined,
    services: params.get('services') ? params.get('services')!.split(',') : undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
  };
}

export default function BrowsePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ListingFilters>(() => parseFilters(searchParams));
  const [listings, setListings] = useState<Listing[]>([]);
  const [count, setCount] = useState(0);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch states for the filter sidebar
  useEffect(() => {
    getStates().then(setStates);
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    setLoading(true);
    getListings(filters).then(({ data, count: totalCount }) => {
      setListings(data);
      setCount(totalCount);
      setLoading(false);
    });
  }, [filters]);

  const updateURL = useCallback(
    (newFilters: ListingFilters) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.state) params.set('state', newFilters.state);
      if (newFilters.city) params.set('city', newFilters.city);
      if (newFilters.accepts_cats) params.set('accepts_cats', 'true');
      if (newFilters.fear_free) params.set('fear_free', 'true');
      if (newFilters.breed_size) params.set('breed_size', newFilters.breed_size);
      if (newFilters.min_rating) params.set('min_rating', String(newFilters.min_rating));
      if (newFilters.services && newFilters.services.length > 0)
        params.set('services', newFilters.services.join(','));
      if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));

      const qs = params.toString();
      router.push(qs ? `/groomers?${qs}` : '/groomers', { scroll: false });
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (newFilters: ListingFilters) => {
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [updateURL]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const newFilters = { ...filters, search: query || undefined, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const currentPage = filters.page ?? 1;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar defaultValue={filters.search ?? ''} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <FilterSidebar
          filters={filters}
          states={states}
          onFilterChange={handleFilterChange}
        />

        {/* Listings grid */}
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {count > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-900">
                    {(currentPage - 1) * PAGE_SIZE + 1}&ndash;
                    {Math.min(currentPage * PAGE_SIZE, count)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-900">
                    {count.toLocaleString()}
                  </span>{' '}
                  groomers
                </>
              ) : loading ? (
                'Loading...'
              ) : (
                'No groomers found matching your filters.'
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No groomers found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleFilterChange({ ...filters, page: currentPage - 1 })}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          handleFilterChange({ ...filters, page });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          page === currentPage
                            ? 'bg-emerald-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange({ ...filters, page: currentPage + 1 })}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
