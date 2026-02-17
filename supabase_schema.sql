-- =============================================================================
-- Mobile Pet Grooming Directory - Supabase Database Schema
-- =============================================================================
-- Run this entire file in the Supabase SQL Editor to set up the database.
-- It creates tables, indexes, full-text search, RLS policies, and triggers.
-- =============================================================================


-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- listings: Core directory table for mobile pet grooming businesses
-- -----------------------------------------------------------------------------
CREATE TABLE listings (
  -- Core fields
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  full_address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,
  phone TEXT,
  website TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  google_maps_url TEXT,
  classification TEXT,
  verification_confidence INTEGER,

  -- Services (booleans)
  svc_full_groom BOOLEAN DEFAULT FALSE,
  svc_bath_only BOOLEAN DEFAULT FALSE,
  svc_nail_trim BOOLEAN DEFAULT FALSE,
  svc_deshedding BOOLEAN DEFAULT FALSE,
  svc_teeth_brushing BOOLEAN DEFAULT FALSE,
  svc_ear_cleaning BOOLEAN DEFAULT FALSE,
  svc_flea_treatment BOOLEAN DEFAULT FALSE,
  svc_puppy_groom BOOLEAN DEFAULT FALSE,
  svc_senior_groom BOOLEAN DEFAULT FALSE,
  svc_dematting BOOLEAN DEFAULT FALSE,
  svc_breed_cuts BOOLEAN DEFAULT FALSE,

  -- Pet types
  accepts_dogs BOOLEAN DEFAULT TRUE,
  accepts_cats BOOLEAN DEFAULT FALSE,
  breed_sizes TEXT[],
  price_range_low DECIMAL(8,2),
  price_range_high DECIMAL(8,2),

  -- Features
  is_licensed BOOLEAN DEFAULT FALSE,
  is_insured BOOLEAN DEFAULT FALSE,
  fear_free_certified BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  uses_natural_products BOOLEAN DEFAULT FALSE,
  cage_free BOOLEAN DEFAULT FALSE,
  one_on_one_attention BOOLEAN DEFAULT FALSE,
  online_booking BOOLEAN DEFAULT FALSE,

  -- Images
  image_url TEXT,
  image_description TEXT,

  -- Service area
  primary_city TEXT,
  service_cities TEXT[],
  service_radius_miles INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- leads: Contact form submissions from visitors requesting quotes/info
-- -----------------------------------------------------------------------------
CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  pet_type TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================================
-- 2. FULL-TEXT SEARCH
-- =============================================================================

-- Generated tsvector column for full-text search across name, city, and state
ALTER TABLE listings ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, ''))
  ) STORED;


-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- State-level filtering (browse by state)
CREATE INDEX idx_listings_state ON listings (state);

-- City + state filtering (browse by city)
CREATE INDEX idx_listings_city_state ON listings (city, state);

-- Slug lookups (unique constraint covers this, but explicit for clarity)
CREATE INDEX idx_listings_slug ON listings (slug);

-- Sort by rating descending (top-rated listings)
CREATE INDEX idx_listings_rating ON listings (rating DESC);

-- GIN index for full-text search queries
CREATE INDEX idx_listings_fts ON listings USING GIN (fts);

-- Partial index: quickly find fear-free certified groomers
CREATE INDEX idx_listings_fear_free ON listings (id)
  WHERE fear_free_certified = TRUE;

-- Partial index: quickly find groomers that accept cats
CREATE INDEX idx_listings_accepts_cats ON listings (id)
  WHERE accepts_cats = TRUE;


-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ---- listings policies ----

-- Public read access: anyone (including anonymous visitors) can browse listings
CREATE POLICY "listings_public_read"
  ON listings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role can insert new listings (data pipeline / admin)
CREATE POLICY "listings_service_insert"
  ON listings
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role can update listings
CREATE POLICY "listings_service_update"
  ON listings
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only service_role can delete listings
CREATE POLICY "listings_service_delete"
  ON listings
  FOR DELETE
  TO service_role
  USING (true);

-- ---- leads policies ----

-- Anonymous visitors can submit lead forms (INSERT only)
CREATE POLICY "leads_anon_insert"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service_role can read leads (admin / CRM access)
CREATE POLICY "leads_service_read"
  ON leads
  FOR SELECT
  TO service_role
  USING (true);

-- Only service_role can update leads
CREATE POLICY "leads_service_update"
  ON leads
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only service_role can delete leads
CREATE POLICY "leads_service_delete"
  ON leads
  FOR DELETE
  TO service_role
  USING (true);


-- =============================================================================
-- 5. UPDATED_AT TRIGGER
-- =============================================================================

-- Trigger function: automatically set updated_at to current timestamp on UPDATE
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to listings table
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- =============================================================================
-- Schema setup complete.
-- =============================================================================
