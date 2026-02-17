"use client";

import { useCallback } from "react";
import type { Listing, ListingFilters } from "@/lib/types";
import FilterSidebar from "@/components/FilterSidebar";
import ListingCard from "@/components/ListingCard";

const PAGE_SIZE = 20;

interface BrowsePageProps {
  listings: Listing[];
  count: number;
  filters: ListingFilters;
  states: string[];
}

export default function BrowsePage({
  listings,
  count,
  filters,
  states,
}: BrowsePageProps) {
  const page = filters.page ?? 1;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const handleFilterChange = useCallback(
    (newFilters: ListingFilters) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.state) params.set("state", newFilters.state);
      if (newFilters.city) params.set("city", newFilters.city);
      if (newFilters.accepts_cats) params.set("accepts_cats", "true");
      if (newFilters.fear_free) params.set("fear_free", "true");
      if (newFilters.breed_size)
        params.set("breed_size", newFilters.breed_size);
      if (newFilters.min_rating)
        params.set("min_rating", String(newFilters.min_rating));
      if (newFilters.services && newFilters.services.length > 0)
        params.set("services", newFilters.services.join(","));
      if (newFilters.page && newFilters.page > 1)
        params.set("page", String(newFilters.page));

      const qs = params.toString();
      window.location.href = qs ? `/groomers?${qs}` : "/groomers";
    },
    []
  );

  function goToPage(p: number) {
    handleFilterChange({ ...filters, page: p });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 text-sm text-gray-500">
        {count} groomer{count !== 1 ? "s" : ""} found
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar
          filters={filters}
          states={states}
          onFilterChange={handleFilterChange}
        />

        <div className="flex-1">
          {listings.length === 0 ? (
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No groomers found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => goToPage(pageNum)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pageNum === page
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
