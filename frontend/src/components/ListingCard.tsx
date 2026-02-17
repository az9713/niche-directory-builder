import Link from "next/link";
import type { Listing } from "@/lib/types";

const SERVICE_LABELS: Record<string, string> = {
  svc_full_groom: "Full Groom",
  svc_bath_only: "Bath Only",
  svc_nail_trim: "Nail Trim",
  svc_deshedding: "Deshedding",
  svc_teeth_brushing: "Teeth Brushing",
  svc_ear_cleaning: "Ear Cleaning",
  svc_flea_treatment: "Flea Treatment",
  svc_puppy_groom: "Puppy Groom",
  svc_senior_groom: "Senior Groom",
  svc_dematting: "Dematting",
  svc_breed_cuts: "Breed Cuts",
};

function getActiveServices(listing: Listing): string[] {
  const keys = Object.keys(SERVICE_LABELS) as (keyof Listing)[];
  return keys
    .filter((key) => listing[key] === true)
    .map((key) => SERVICE_LABELS[key])
    .slice(0, 4);
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const services = getActiveServices(listing);

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.image_description ?? listing.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
            <svg
              className="h-16 w-16 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-3c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V16h14v-2c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/groomer/${listing.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-emerald-600">
            {listing.name}
          </h3>
        </Link>

        <p className="mt-1 text-sm text-gray-500">
          {listing.city}, {listing.state}
        </p>

        {listing.rating !== null && (
          <div className="mt-2 flex items-center gap-1.5">
            <svg
              className="h-4 w-4 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {listing.rating.toFixed(1)}
            </span>
            {listing.reviews_count !== null && (
              <span className="text-sm text-gray-400">
                ({listing.reviews_count} reviews)
              </span>
            )}
          </div>
        )}

        {services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {services.map((svc) => (
              <span
                key={svc}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              >
                {svc}
              </span>
            ))}
          </div>
        )}

        {listing.price_range_low !== null && listing.price_range_high !== null && (
          <p className="mt-2 text-sm font-medium text-gray-600">
            ${listing.price_range_low} - ${listing.price_range_high}
          </p>
        )}

        <Link
          href={`/groomer/${listing.slug}`}
          className="mt-3 inline-block text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
