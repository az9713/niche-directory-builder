import type { Listing } from './types';

const now = new Date().toISOString();

// ── City/state data with realistic metro areas ───────────────────────
interface CityInfo {
  city: string;
  state: string;
  zip: string;
  address: string;
  nearby: string[];
  areaCode: string;
  priceTier: 'low' | 'mid' | 'high';
}

const CITIES: CityInfo[] = [
  { city: 'Houston', state: 'TX', zip: '77027', address: '4521 Westheimer Rd', nearby: ['Katy', 'Sugar Land', 'The Woodlands', 'Pearland'], areaCode: '713', priceTier: 'mid' },
  { city: 'Austin', state: 'TX', zip: '78704', address: '1200 S Lamar Blvd', nearby: ['Round Rock', 'Cedar Park', 'Pflugerville'], areaCode: '512', priceTier: 'mid' },
  { city: 'Dallas', state: 'TX', zip: '75201', address: '3300 Knox St', nearby: ['Plano', 'Frisco', 'Richardson', 'Arlington'], areaCode: '214', priceTier: 'mid' },
  { city: 'San Antonio', state: 'TX', zip: '78205', address: '602 E Commerce St', nearby: ['New Braunfels', 'Boerne', 'Schertz'], areaCode: '210', priceTier: 'low' },
  { city: 'Fort Worth', state: 'TX', zip: '76102', address: '815 Main St', nearby: ['Weatherford', 'Burleson', 'Keller'], areaCode: '817', priceTier: 'low' },
  { city: 'Los Angeles', state: 'CA', zip: '90069', address: '8833 W Sunset Blvd', nearby: ['Santa Monica', 'Beverly Hills', 'West Hollywood', 'Pasadena'], areaCode: '310', priceTier: 'high' },
  { city: 'San Diego', state: 'CA', zip: '92104', address: '3120 University Ave', nearby: ['La Jolla', 'Chula Vista', 'Encinitas'], areaCode: '619', priceTier: 'high' },
  { city: 'San Francisco', state: 'CA', zip: '94110', address: '2400 Mission St', nearby: ['Daly City', 'South San Francisco', 'Oakland'], areaCode: '415', priceTier: 'high' },
  { city: 'San Jose', state: 'CA', zip: '95112', address: '510 S 1st St', nearby: ['Sunnyvale', 'Santa Clara', 'Campbell'], areaCode: '408', priceTier: 'high' },
  { city: 'Sacramento', state: 'CA', zip: '95814', address: '1801 L St', nearby: ['Elk Grove', 'Roseville', 'Folsom'], areaCode: '916', priceTier: 'mid' },
  { city: 'Miami', state: 'FL', zip: '33155', address: '7250 Coral Way', nearby: ['Miami Beach', 'Coral Gables', 'Hialeah', 'Doral'], areaCode: '305', priceTier: 'high' },
  { city: 'Tampa', state: 'FL', zip: '33609', address: '4015 W Kennedy Blvd', nearby: ['St. Petersburg', 'Clearwater', 'Brandon'], areaCode: '813', priceTier: 'mid' },
  { city: 'Orlando', state: 'FL', zip: '32801', address: '55 W Church St', nearby: ['Kissimmee', 'Winter Park', 'Sanford'], areaCode: '407', priceTier: 'mid' },
  { city: 'Jacksonville', state: 'FL', zip: '32202', address: '200 E Bay St', nearby: ['Orange Park', 'Atlantic Beach', 'Fleming Island'], areaCode: '904', priceTier: 'low' },
  { city: 'New York', state: 'NY', zip: '10001', address: '142 W 36th St', nearby: ['Brooklyn', 'Queens', 'Jersey City'], areaCode: '212', priceTier: 'high' },
  { city: 'Buffalo', state: 'NY', zip: '14201', address: '500 Pearl St', nearby: ['Amherst', 'Cheektowaga', 'Tonawanda'], areaCode: '716', priceTier: 'low' },
  { city: 'Chicago', state: 'IL', zip: '60614', address: '2500 N Clark St', nearby: ['Evanston', 'Oak Park', 'Naperville', 'Schaumburg'], areaCode: '312', priceTier: 'high' },
  { city: 'Springfield', state: 'IL', zip: '62701', address: '300 E Monroe St', nearby: ['Chatham', 'Rochester', 'Sherman'], areaCode: '217', priceTier: 'low' },
  { city: 'Phoenix', state: 'AZ', zip: '85004', address: '411 N Central Ave', nearby: ['Scottsdale', 'Tempe', 'Mesa', 'Chandler'], areaCode: '602', priceTier: 'mid' },
  { city: 'Tucson', state: 'AZ', zip: '85701', address: '150 N Stone Ave', nearby: ['Marana', 'Oro Valley', 'Sahuarita'], areaCode: '520', priceTier: 'low' },
  { city: 'Seattle', state: 'WA', zip: '98101', address: '600 Pine St', nearby: ['Bellevue', 'Redmond', 'Kirkland', 'Tacoma'], areaCode: '206', priceTier: 'high' },
  { city: 'Denver', state: 'CO', zip: '80202', address: '1601 Blake St', nearby: ['Aurora', 'Lakewood', 'Boulder', 'Thornton'], areaCode: '303', priceTier: 'mid' },
  { city: 'Atlanta', state: 'GA', zip: '30309', address: '1130 Peachtree St NE', nearby: ['Marietta', 'Decatur', 'Roswell', 'Sandy Springs'], areaCode: '404', priceTier: 'mid' },
  { city: 'Nashville', state: 'TN', zip: '37203', address: '400 Broadway', nearby: ['Franklin', 'Murfreesboro', 'Brentwood'], areaCode: '615', priceTier: 'mid' },
  { city: 'Charlotte', state: 'NC', zip: '28202', address: '301 S Tryon St', nearby: ['Huntersville', 'Matthews', 'Concord'], areaCode: '704', priceTier: 'mid' },
  { city: 'Raleigh', state: 'NC', zip: '27601', address: '220 Fayetteville St', nearby: ['Durham', 'Cary', 'Chapel Hill'], areaCode: '919', priceTier: 'mid' },
  { city: 'Portland', state: 'OR', zip: '97209', address: '1000 NW Lovejoy St', nearby: ['Beaverton', 'Lake Oswego', 'Tigard'], areaCode: '503', priceTier: 'mid' },
  { city: 'Las Vegas', state: 'NV', zip: '89101', address: '150 Las Vegas Blvd N', nearby: ['Henderson', 'North Las Vegas', 'Summerlin'], areaCode: '702', priceTier: 'mid' },
  { city: 'Minneapolis', state: 'MN', zip: '55401', address: '250 Marquette Ave S', nearby: ['St. Paul', 'Bloomington', 'Edina', 'Plymouth'], areaCode: '612', priceTier: 'mid' },
  { city: 'Boston', state: 'MA', zip: '02116', address: '200 Boylston St', nearby: ['Cambridge', 'Brookline', 'Somerville', 'Newton'], areaCode: '617', priceTier: 'high' },
  { city: 'Detroit', state: 'MI', zip: '48226', address: '1001 Woodward Ave', nearby: ['Dearborn', 'Royal Oak', 'Troy', 'Ann Arbor'], areaCode: '313', priceTier: 'low' },
  { city: 'Philadelphia', state: 'PA', zip: '19103', address: '1700 Market St', nearby: ['Cherry Hill', 'King of Prussia', 'Media'], areaCode: '215', priceTier: 'mid' },
  { city: 'Pittsburgh', state: 'PA', zip: '15222', address: '220 Fort Duquesne Blvd', nearby: ['Cranberry Twp', 'Bethel Park', 'Monroeville'], areaCode: '412', priceTier: 'low' },
  { city: 'Kansas City', state: 'MO', zip: '64106', address: '300 W 12th St', nearby: ['Overland Park', 'Olathe', 'Independence'], areaCode: '816', priceTier: 'low' },
  { city: 'St. Louis', state: 'MO', zip: '63101', address: '100 N Broadway', nearby: ['Clayton', 'Kirkwood', 'Chesterfield'], areaCode: '314', priceTier: 'low' },
  { city: 'Columbus', state: 'OH', zip: '43215', address: '200 Civic Center Dr', nearby: ['Dublin', 'Westerville', 'Grove City'], areaCode: '614', priceTier: 'low' },
  { city: 'Indianapolis', state: 'IN', zip: '46204', address: '10 W Market St', nearby: ['Carmel', 'Fishers', 'Greenwood'], areaCode: '317', priceTier: 'low' },
  { city: 'Salt Lake City', state: 'UT', zip: '84101', address: '50 E South Temple', nearby: ['Sandy', 'Provo', 'West Jordan'], areaCode: '801', priceTier: 'mid' },
  { city: 'New Orleans', state: 'LA', zip: '70130', address: '333 Canal St', nearby: ['Metairie', 'Kenner', 'Slidell'], areaCode: '504', priceTier: 'mid' },
  { city: 'Milwaukee', state: 'WI', zip: '53202', address: '710 N Plankinton Ave', nearby: ['Wauwatosa', 'Brookfield', 'Waukesha'], areaCode: '414', priceTier: 'low' },
];

// ── Business name components ─────────────────────────────────────────
const NAME_PREFIXES = [
  'Pawfect', 'Happy Tails', 'Fluffy', 'Pampered Paws', 'Furry Friends',
  'VIP Pet', 'Bark & Shine', 'Wag N Wash', 'Posh Paws', 'Gentle Touch',
  'The Grooming', 'Premier', 'Royal', 'Sparkle', 'Snip & Clip',
  'All Paws', 'Lucky Dog', 'Top Dog', 'Fur Baby', 'Clean Paws',
  'Golden', 'Diamond', 'Elite', 'Express', 'Cozy',
];

const NAME_SUFFIXES = [
  'Mobile Grooming', 'Mobile Spa', 'Pet Spa', 'on Wheels', 'Mobile Pet Care',
  'Grooming Co.', 'Pet Services', 'Mobile Salon', 'Door-to-Door Grooming', 'Pet Grooming',
];

// ── Deterministic pseudo-random from seed ────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRand(seed) * arr.length)];
}

function randInt(min: number, max: number, seed: number): number {
  return min + Math.floor(seededRand(seed) * (max - min + 1));
}

function randBool(probability: number, seed: number): boolean {
  return seededRand(seed) < probability;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Generate 100 listings ────────────────────────────────────────────
function generateListings(): Listing[] {
  const listings: Listing[] = [];
  const usedSlugs = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const cityInfo = CITIES[i % CITIES.length];
    const s = (n: number) => i * 100 + n; // unique seed per field

    // Build a unique business name
    const prefix = pick(NAME_PREFIXES, s(1));
    const suffix = pick(NAME_SUFFIXES, s(2));
    let name = `${prefix} ${suffix}`;

    // If name+city would collide, add city to name
    let slug = slugify(`${name}-${cityInfo.city}`);
    if (usedSlugs.has(slug)) {
      name = `${cityInfo.city} ${prefix} ${suffix}`;
      slug = slugify(`${name}-${cityInfo.city}`);
    }
    // Final dedup
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${i}`;
    }
    usedSlugs.add(slug);

    // Price based on city tier
    const priceBase = cityInfo.priceTier === 'high' ? 65 : cityInfo.priceTier === 'mid' ? 45 : 30;
    const priceLow = priceBase + randInt(0, 20, s(10));
    const priceHigh = priceLow + randInt(30, 70, s(11));

    // Rating: skew toward 4.0+ but allow some lower
    const ratingBase = randBool(0.15, s(20)) ? 3.0 : 4.0;
    const rating = Math.round((ratingBase + seededRand(s(21)) * 1.0) * 10) / 10;
    const clampedRating = Math.min(rating, 5.0);

    // Reviews: higher-rated tend to have more
    const reviewBase = clampedRating >= 4.5 ? 80 : clampedRating >= 4.0 ? 40 : 15;
    const reviewsCount = reviewBase + randInt(0, 250, s(22));

    // Years experience
    const yearsExperience = randInt(1, 20, s(30));

    // Confidence
    const confidence = Math.round((0.80 + seededRand(s(31)) * 0.18) * 100) / 100;

    // Website: 80% have one
    const hasWebsite = randBool(0.80, s(40));
    const website = hasWebsite
      ? `https://${slugify(name)}.example.com`
      : null;

    // Phone
    const phone = `(${cityInfo.areaCode}) 555-${String(randInt(1000, 9999, s(41))).padStart(4, '0')}`;

    // Services — varied probability per service
    const svc_full_groom = randBool(0.92, s(50));
    const svc_bath_only = randBool(0.88, s(51));
    const svc_nail_trim = randBool(0.90, s(52));
    const svc_deshedding = randBool(0.65, s(53));
    const svc_teeth_brushing = randBool(0.50, s(54));
    const svc_ear_cleaning = randBool(0.70, s(55));
    const svc_flea_treatment = randBool(0.45, s(56));
    const svc_puppy_groom = randBool(0.60, s(57));
    const svc_senior_groom = randBool(0.55, s(58));
    const svc_dematting = randBool(0.50, s(59));
    const svc_breed_cuts = randBool(0.60, s(60));

    // Pet types
    const accepts_dogs = true; // all accept dogs
    const accepts_cats = randBool(0.55, s(70));

    // Breed sizes
    const allSizes: string[] = ['small', 'medium', 'large', 'giant'];
    const breedSizes = allSizes.filter((_, idx) => {
      if (idx === 0) return true; // everyone takes small
      if (idx === 1) return randBool(0.95, s(71 + idx));
      if (idx === 2) return randBool(0.80, s(71 + idx));
      return randBool(0.40, s(71 + idx));
    });

    // Features
    const is_licensed = randBool(0.75, s(80));
    const is_insured = randBool(0.70, s(81));
    const fear_free_certified = randBool(0.25, s(82));
    const uses_natural_products = randBool(0.45, s(83));
    const cage_free = randBool(0.55, s(84));
    const one_on_one_attention = randBool(0.65, s(85));
    const online_booking = randBool(0.60, s(86));

    // Service radius
    const serviceRadius = randInt(10, 30, s(90));

    listings.push({
      id: i + 1,
      slug,
      name,
      full_address: `${cityInfo.address}, ${cityInfo.city}, ${cityInfo.state} ${cityInfo.zip}`,
      city: cityInfo.city,
      state: cityInfo.state,
      zip: cityInfo.zip,
      phone,
      website,
      rating: clampedRating,
      reviews_count: reviewsCount,
      google_maps_url: null,
      classification: 'mobile_pet_grooming',
      verification_confidence: confidence,
      svc_full_groom,
      svc_bath_only,
      svc_nail_trim,
      svc_deshedding,
      svc_teeth_brushing,
      svc_ear_cleaning,
      svc_flea_treatment,
      svc_puppy_groom,
      svc_senior_groom,
      svc_dematting,
      svc_breed_cuts,
      accepts_dogs,
      accepts_cats,
      breed_sizes: breedSizes,
      price_range_low: priceLow,
      price_range_high: priceHigh,
      is_licensed,
      is_insured,
      fear_free_certified,
      years_experience: yearsExperience,
      uses_natural_products,
      cage_free,
      one_on_one_attention,
      online_booking,
      image_url: null,
      image_description: null,
      primary_city: cityInfo.city,
      service_cities: [cityInfo.city, ...cityInfo.nearby.slice(0, randInt(1, cityInfo.nearby.length, s(91)))],
      service_radius_miles: serviceRadius,
      created_at: now,
      updated_at: now,
    });
  }

  // ── Deliberate service deserts for arbitrage demos ────────────────
  // GA (Atlanta) — indices where city=Atlanta: no cats, no flea, no fear-free
  // WA (Seattle) — no fear-free, no senior groom, no teeth brushing
  // CO (Denver)  — no cats, no teeth brushing, low ratings
  // IN (Indianapolis) — no fear-free, no online booking, low ratings
  // OH (Columbus) — no flea treatment, no dematting, no deshedding
  // MN (Minneapolis) — no puppy groom, no breed cuts
  for (const listing of listings) {
    if (listing.state === 'GA') {
      listing.accepts_cats = false;
      listing.svc_flea_treatment = false;
      listing.fear_free_certified = false;
      listing.svc_teeth_brushing = false;
    }
    if (listing.state === 'WA') {
      listing.fear_free_certified = false;
      listing.svc_senior_groom = false;
      listing.svc_teeth_brushing = false;
      listing.accepts_cats = false;
    }
    if (listing.state === 'CO') {
      listing.accepts_cats = false;
      listing.svc_teeth_brushing = false;
      listing.fear_free_certified = false;
      listing.rating = Math.min(listing.rating ?? 3.5, 3.8);
    }
    if (listing.state === 'IN') {
      listing.fear_free_certified = false;
      listing.online_booking = false;
      listing.rating = Math.min(listing.rating ?? 3.5, 3.6);
      listing.svc_flea_treatment = false;
    }
    if (listing.state === 'OH') {
      listing.svc_flea_treatment = false;
      listing.svc_dematting = false;
      listing.svc_deshedding = false;
    }
    if (listing.state === 'MN') {
      listing.svc_puppy_groom = false;
      listing.svc_breed_cuts = false;
      listing.fear_free_certified = false;
    }
  }

  return listings;
}

export const SEED_LISTINGS: Listing[] = generateListings();
