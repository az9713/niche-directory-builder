import type { Listing } from "@/lib/types";

const SERVICE_MAP: { key: keyof Listing; label: string }[] = [
  { key: "svc_full_groom", label: "Full Groom" },
  { key: "svc_bath_only", label: "Bath Only" },
  { key: "svc_nail_trim", label: "Nail Trim" },
  { key: "svc_deshedding", label: "Deshedding" },
  { key: "svc_teeth_brushing", label: "Teeth Brushing" },
  { key: "svc_ear_cleaning", label: "Ear Cleaning" },
  { key: "svc_flea_treatment", label: "Flea Treatment" },
  { key: "svc_puppy_groom", label: "Puppy Groom" },
  { key: "svc_senior_groom", label: "Senior Groom" },
  { key: "svc_dematting", label: "Dematting" },
  { key: "svc_breed_cuts", label: "Breed Cuts" },
];

const FEATURE_MAP: { key: keyof Listing; label: string }[] = [
  { key: "is_licensed", label: "Licensed" },
  { key: "is_insured", label: "Insured" },
  { key: "fear_free_certified", label: "Fear Free Certified" },
  { key: "cage_free", label: "Cage Free" },
  { key: "uses_natural_products", label: "Natural Products" },
  { key: "one_on_one_attention", label: "One-on-One Attention" },
  { key: "online_booking", label: "Online Booking" },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${
            i < full
              ? "text-amber-400"
              : i === full && hasHalf
                ? "text-amber-400"
                : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ListingDetail({ listing }: { listing: Listing }) {
  return (
    <div className="space-y-8">
      {/* Hero image */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl sm:h-80">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.image_description ?? listing.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
            <svg
              className="h-24 w-24 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5.5-3c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V16h14v-2c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Header info */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{listing.name}</h1>

        {listing.full_address ? (
          <p className="mt-2 text-gray-600">{listing.full_address}</p>
        ) : (
          <p className="mt-2 text-gray-600">
            {listing.city}, {listing.state} {listing.zip ?? ""}
          </p>
        )}

        {/* Rating */}
        {listing.rating !== null && (
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={listing.rating} />
            <span className="text-lg font-semibold text-gray-900">
              {listing.rating.toFixed(1)}
            </span>
            {listing.reviews_count !== null && (
              <span className="text-sm text-gray-500">
                ({listing.reviews_count} reviews)
              </span>
            )}
          </div>
        )}

        {/* Contact buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {listing.phone}
            </a>
          )}
          {listing.website && (
            <a
              href={listing.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Visit Website
            </a>
          )}
          {listing.google_maps_url && (
            <a
              href={listing.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              View on Maps
            </a>
          )}
        </div>

        {/* Price range */}
        {listing.price_range_low !== null &&
          listing.price_range_high !== null && (
            <p className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Price Range:</span> $
              {listing.price_range_low} - ${listing.price_range_high}
            </p>
          )}

        {/* Experience */}
        {listing.years_experience !== null && (
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium">Experience:</span>{" "}
            {listing.years_experience} years
          </p>
        )}
      </div>

      {/* Services */}
      <div>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">Services</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_MAP.map(({ key, label }) => {
            const offered = listing[key] as boolean;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  offered
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {offered ? (
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pet types */}
      <div>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">Pet Types</h2>
        <div className="flex flex-wrap gap-2">
          {listing.accepts_dogs && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Dogs
            </span>
          )}
          {listing.accepts_cats && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
              Cats
            </span>
          )}
        </div>
        {listing.breed_sizes && listing.breed_sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.breed_sizes.map((size) => (
              <span
                key={size}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div>
        <h2 className="mb-3 text-xl font-semibold text-gray-900">Features</h2>
        <div className="flex flex-wrap gap-2">
          {FEATURE_MAP.map(({ key, label }) => {
            const active = listing[key] as boolean;
            if (!active) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Service Area */}
      {(listing.primary_city ||
        (listing.service_cities && listing.service_cities.length > 0) ||
        listing.service_radius_miles) && (
        <div>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            Service Area
          </h2>
          {listing.primary_city && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Primary City:</span>{" "}
              {listing.primary_city}
            </p>
          )}
          {listing.service_cities && listing.service_cities.length > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Also Serves:</span>{" "}
              {listing.service_cities.join(", ")}
            </p>
          )}
          {listing.service_radius_miles && (
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Service Radius:</span>{" "}
              {listing.service_radius_miles} miles
            </p>
          )}
        </div>
      )}
    </div>
  );
}
