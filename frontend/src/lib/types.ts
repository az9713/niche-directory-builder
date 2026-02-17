export interface Listing {
  id: number;
  slug: string;
  name: string;
  full_address: string | null;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_maps_url: string | null;
  classification: string | null;
  verification_confidence: number | null;

  // Services
  svc_full_groom: boolean;
  svc_bath_only: boolean;
  svc_nail_trim: boolean;
  svc_deshedding: boolean;
  svc_teeth_brushing: boolean;
  svc_ear_cleaning: boolean;
  svc_flea_treatment: boolean;
  svc_puppy_groom: boolean;
  svc_senior_groom: boolean;
  svc_dematting: boolean;
  svc_breed_cuts: boolean;

  // Pet types
  accepts_dogs: boolean;
  accepts_cats: boolean;
  breed_sizes: string[] | null;
  price_range_low: number | null;
  price_range_high: number | null;

  // Features
  is_licensed: boolean;
  is_insured: boolean;
  fear_free_certified: boolean;
  years_experience: number | null;
  uses_natural_products: boolean;
  cage_free: boolean;
  one_on_one_attention: boolean;
  online_booking: boolean;

  // Images
  image_url: string | null;
  image_description: string | null;

  // Service area
  primary_city: string | null;
  service_cities: string[] | null;
  service_radius_miles: number | null;

  created_at: string;
  updated_at: string;
}

export interface Lead {
  id?: number;
  listing_id: number;
  name: string;
  email: string;
  phone?: string;
  pet_type?: string;
  message?: string;
}

export interface ListingFilters {
  state?: string;
  city?: string;
  search?: string;
  services?: string[];
  accepts_cats?: boolean;
  fear_free?: boolean;
  breed_size?: string;
  min_rating?: number;
  page?: number;
}
