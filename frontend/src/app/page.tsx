import Link from "next/link";
import { getListingCount, getStateCount } from "@/lib/queries";
import HomeSearchBar from "@/components/HomeSearchBar";

export const revalidate = 3600;

export default async function HomePage() {
  const [listingCount, stateCount] = await Promise.all([
    getListingCount(),
    getStateCount(),
  ]);

  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find Mobile Pet Groomers{" "}
            <span className="text-emerald-600">Near You</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Compare services, read reviews, and request quotes from verified
            mobile pet grooming professionals across the US.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <HomeSearchBar />
          </div>
          <div className="mt-6">
            <Link
              href="/groomers"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Browse All Groomers
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="border-y border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600">
              {listingCount > 0 ? listingCount.toLocaleString() : "--"}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              Verified Groomers
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600">
              {stateCount > 0 ? stateCount : "--"}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              States Covered
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-emerald-600">100%</p>
            <p className="mt-1 text-sm font-medium text-gray-600">Verified</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Search</h3>
              <p className="mt-2 text-sm text-gray-600">
                Search by location, services, or groomer name to find options
                near you.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Compare</h3>
              <p className="mt-2 text-sm text-gray-600">
                Compare ratings, services, prices, and certifications side by
                side.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Connect</h3>
              <p className="mt-2 text-sm text-gray-600">
                Request a quote directly from the groomer and book your
                appointment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
