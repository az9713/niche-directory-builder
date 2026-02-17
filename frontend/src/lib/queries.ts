import { supabase } from './supabase';
import { SEED_LISTINGS } from './seed-data';
import type { Listing, ListingFilters, Lead } from './types';

const PAGE_SIZE = 20;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const IS_MOCK = !supabaseUrl || supabaseUrl.includes('placeholder');

export async function getListings(
  filters: ListingFilters = {}
): Promise<{ data: Listing[]; count: number }> {
  if (IS_MOCK) {
    let results = [...SEED_LISTINGS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q)
      );
    }
    if (filters.state) {
      results = results.filter((l) => l.state === filters.state);
    }
    if (filters.city) {
      results = results.filter(
        (l) => l.city.toLowerCase() === filters.city!.toLowerCase()
      );
    }
    if (filters.accepts_cats) {
      results = results.filter((l) => l.accepts_cats);
    }
    if (filters.fear_free) {
      results = results.filter((l) => l.fear_free_certified);
    }
    if (filters.breed_size) {
      results = results.filter(
        (l) => l.breed_sizes && l.breed_sizes.includes(filters.breed_size!)
      );
    }
    if (filters.min_rating) {
      results = results.filter(
        (l) => l.rating != null && l.rating >= filters.min_rating!
      );
    }
    if (filters.services && filters.services.length > 0) {
      for (const svc of filters.services) {
        results = results.filter((l) => (l as unknown as Record<string, unknown>)[svc] === true);
      }
    }

    results.sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    });

    const count = results.length;
    const page = filters.page ?? 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    results = results.slice(from, to);

    return { data: results, count };
  }

  const page = filters.page ?? 1;

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' });

  if (filters.search) {
    query = query.textSearch('fts', filters.search, { type: 'websearch' });
  }

  if (filters.state) {
    query = query.eq('state', filters.state);
  }

  if (filters.city) {
    query = query.ilike('city', filters.city);
  }

  if (filters.accepts_cats) {
    query = query.eq('accepts_cats', true);
  }

  if (filters.fear_free) {
    query = query.eq('fear_free_certified', true);
  }

  if (filters.breed_size) {
    query = query.contains('breed_sizes', [filters.breed_size]);
  }

  if (filters.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }

  if (filters.services && filters.services.length > 0) {
    for (const svc of filters.services) {
      query = query.eq(svc, true);
    }
  }

  query = query
    .order('rating', { ascending: false, nullsFirst: false })
    .order('reviews_count', { ascending: false, nullsFirst: false });

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    return { data: [], count: 0 };
  }

  return { data: (data as Listing[]) ?? [], count: count ?? 0 };
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (IS_MOCK) {
    return SEED_LISTINGS.find((l) => l.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return null;
  }

  return data as Listing;
}

export async function getAllSlugs(): Promise<string[]> {
  if (IS_MOCK) {
    return SEED_LISTINGS.map((l) => l.slug);
  }

  const { data, error } = await supabase
    .from('listings')
    .select('slug');

  if (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }

  return (data ?? []).map((d) => d.slug);
}

export async function getStates(): Promise<string[]> {
  if (IS_MOCK) {
    const unique = [...new Set(SEED_LISTINGS.map((l) => l.state))];
    return unique.sort();
  }

  const { data, error } = await supabase
    .from('listings')
    .select('state')
    .order('state');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }

  const unique = [...new Set((data ?? []).map((d) => d.state))];
  return unique;
}

export async function getCitiesByState(state: string): Promise<string[]> {
  if (IS_MOCK) {
    const unique = [
      ...new Set(
        SEED_LISTINGS.filter((l) => l.state === state).map((l) => l.city)
      ),
    ];
    return unique.sort();
  }

  const { data, error } = await supabase
    .from('listings')
    .select('city')
    .eq('state', state)
    .order('city');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  const unique = [...new Set((data ?? []).map((d) => d.city))];
  return unique;
}

export async function getListingCount(): Promise<number> {
  if (IS_MOCK) {
    return SEED_LISTINGS.length;
  }

  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching listing count:', error);
    return 0;
  }

  return count ?? 0;
}

export async function getStateCount(): Promise<number> {
  if (IS_MOCK) {
    return new Set(SEED_LISTINGS.map((l) => l.state)).size;
  }

  const { data, error } = await supabase
    .from('listings')
    .select('state');

  if (error) {
    console.error('Error fetching state count:', error);
    return 0;
  }

  const unique = new Set((data ?? []).map((d) => d.state));
  return unique.size;
}

export async function submitLead(lead: Lead): Promise<boolean> {
  if (IS_MOCK) {
    console.log('[MOCK] Lead submitted:', lead);
    return true;
  }

  const { error } = await supabase.from('leads').insert(lead);

  if (error) {
    console.error('Error submitting lead:', error);
    return false;
  }

  return true;
}
