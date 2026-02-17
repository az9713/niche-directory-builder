import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingDetail from "@/components/ListingDetail";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { getListingBySlug, getAllSlugs } from "@/lib/queries";
import Link from "next/link";
import type { Listing } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

function getTopServices(listing: Listing, limit: number): string[] {
  return Object.entries(SERVICE_LABELS)
    .filter(([key]) => listing[key as keyof Listing] === true)
    .map(([, label]) => label)
    .slice(0, limit);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return { title: "Groomer Not Found" };
  }

  const topServices = getTopServices(listing, 3);
  const servicesText =
    topServices.length > 0
      ? `Services include ${topServices.join(", ")}.`
      : "";

  return {
    title: `${listing.name} - Mobile Pet Grooming in ${listing.city}, ${listing.state}`,
    description: `Mobile pet grooming by ${listing.name} in ${listing.city}, ${listing.state}. ${servicesText} Read reviews and request a quote.`,
  };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

export default async function GroomerPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <>
      <JsonLd listing={listing} />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/groomers" className="hover:text-gray-700">
              Groomers
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ListingDetail listing={listing} />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <LeadForm
                  listingId={listing.id}
                  listingName={listing.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
