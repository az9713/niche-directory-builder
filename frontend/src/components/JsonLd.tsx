import type { Listing } from "@/lib/types";

export default function JsonLd({ listing }: { listing: Listing }) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
  };

  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
  };
  if (listing.full_address) address.streetAddress = listing.full_address;
  if (listing.city) address.addressLocality = listing.city;
  if (listing.state) address.addressRegion = listing.state;
  if (listing.zip) address.postalCode = listing.zip;

  if (Object.keys(address).length > 1) {
    schema.address = address;
  }

  if (listing.phone) schema.telephone = listing.phone;
  if (listing.website) schema.url = listing.website;
  if (listing.image_url) schema.image = listing.image_url;

  if (listing.rating !== null && listing.reviews_count !== null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviews_count,
    };
  }

  if (listing.price_range_low !== null && listing.price_range_high !== null) {
    schema.priceRange = `$${listing.price_range_low} - $${listing.price_range_high}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function DirectoryJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PawPatrol Groomers",
    url: "https://pawpatrolgroomers.com",
    description:
      "Find and compare mobile pet groomers across the United States.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://pawpatrolgroomers.com/groomers?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
