import { Suspense } from "react";
import type { Metadata } from "next";
import BrowsePageClient from "./BrowsePageClient";

export const metadata: Metadata = {
  title: "Find a Mobile Pet Groomer",
  description:
    "Browse and compare mobile pet groomers near you. Filter by services, location, ratings, and more to find the perfect groomer for your pet.",
};

export default function GroomersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Find Mobile Pet Groomers
          </h1>
          <p className="mt-2 text-gray-600">
            Search and filter to find the perfect groomer for your pet.
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        }
      >
        <BrowsePageClient />
      </Suspense>
    </div>
  );
}
