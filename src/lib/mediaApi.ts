/**
 * Media API Service
 * Integrates with TMDB (movies/series) and Google Books API
 */

// Types
export type MediaType = 'movie' | 'series' | 'book';

export interface MediaSearchResult {
  externalId: string;
  externalSource: 'tmdb' | 'google_books';
  title: string;
  originalTitle?: string;
  description?: string;
  coverImageUrl?: string;
  releaseYear?: number;
  type: MediaType;
  // Movies/Series specific
  director?: string;
  durationMinutes?: number;
  seasonsCount?: number;
  episodesCount?: number;
  // Books specific
  author?: string;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
  // Common
  genres?: string[];
  externalRating?: number;
  language?: string;
  country?: string;
}

export interface MediaDetails extends MediaSearchResult {
  // Additional details from full API response
  cast?: string[];
  trailer?: string;
  imdbId?: string;
}

// API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1';

// Get API keys from environment
const getTmdbApiKey = () => import.meta.env.VITE_TMDB_API_KEY || '';
const getGoogleBooksApiKey = () => import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

// Helper to get TMDB image URL
const getTmdbImageUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// =====================================================
// TMDB API (Movies & Series)
// =====================================================

interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
}

interface TMDBTVResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
}

interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBGenre {
  id: number;
  name: string;
}

// Cache for genres
let movieGenresCache: Record<number, string> = {};
let tvGenresCache: Record<number, string> = {};

const fetchTMDBGenres = async (type: 'movie' | 'tv') => {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return;

  const cache = type === 'movie' ? movieGenresCache : tvGenresCache;
  if (Object.keys(cache).length > 0) return;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/${type}/list?api_key=${apiKey}&language=es-ES`
    );
    const data = await response.json();
    const genres: TMDBGenre[] = data.genres || [];

    genres.forEach(g => {
      if (type === 'movie') {
        movieGenresCache[g.id] = g.name;
      } else {
        tvGenresCache[g.id] = g.name;
      }
    });
  } catch (error) {
    console.error('Error fetching TMDB genres:', error);
  }
};

/**
 * Search for movies on TMDB
 */
export async function searchMovies(query: string, page = 1): Promise<MediaSearchResult[]> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    console.warn('TMDB API key not configured');
    return [];
  }

  await fetchTMDBGenres('movie');

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBSearchResponse<TMDBMovieResult> = await response.json();

    return data.results.map(movie => ({
      externalId: movie.id.toString(),
      externalSource: 'tmdb' as const,
      title: movie.title,
      originalTitle: movie.original_title,
      description: movie.overview,
      coverImageUrl: getTmdbImageUrl(movie.poster_path),
      releaseYear: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : undefined,
      type: 'movie' as const,
      genres: movie.genre_ids.map(id => movieGenresCache[id]).filter(Boolean),
      externalRating: movie.vote_average,
      language: movie.original_language,
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

/**
 * Search for TV series on TMDB
 */
export async function searchSeries(query: string, page = 1): Promise<MediaSearchResult[]> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    console.warn('TMDB API key not configured');
    return [];
  }

  await fetchTMDBGenres('tv');

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBSearchResponse<TMDBTVResult> = await response.json();

    return data.results.map(series => ({
      externalId: series.id.toString(),
      externalSource: 'tmdb' as const,
      title: series.name,
      originalTitle: series.original_name,
      description: series.overview,
      coverImageUrl: getTmdbImageUrl(series.poster_path),
      releaseYear: series.first_air_date ? parseInt(series.first_air_date.split('-')[0]) : undefined,
      type: 'series' as const,
      genres: series.genre_ids.map(id => tvGenresCache[id]).filter(Boolean),
      externalRating: series.vote_average,
      language: series.original_language,
    }));
  } catch (error) {
    console.error('Error searching series:', error);
    return [];
  }
}

/**
 * Get movie details from TMDB
 */
export async function getMovieDetails(tmdbId: string): Promise<MediaDetails | null> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&language=es-ES&append_to_response=credits,videos`
    );

    if (!response.ok) return null;

    const movie = await response.json();

    // Get director from credits
    const director = movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name;

    // Get trailer
    const trailer = movie.videos?.results?.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
    )?.key;

    return {
      externalId: movie.id.toString(),
      externalSource: 'tmdb',
      title: movie.title,
      originalTitle: movie.original_title,
      description: movie.overview,
      coverImageUrl: getTmdbImageUrl(movie.poster_path),
      releaseYear: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : undefined,
      type: 'movie',
      director,
      durationMinutes: movie.runtime,
      genres: movie.genres?.map((g: TMDBGenre) => g.name) || [],
      externalRating: movie.vote_average,
      language: movie.original_language,
      country: movie.production_countries?.[0]?.iso_3166_1,
      cast: movie.credits?.cast?.slice(0, 10).map((c: any) => c.name),
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer}` : undefined,
      imdbId: movie.imdb_id,
    };
  } catch (error) {
    console.error('Error getting movie details:', error);
    return null;
  }
}

/**
 * Get TV series details from TMDB
 */
export async function getSeriesDetails(tmdbId: string): Promise<MediaDetails | null> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}&language=es-ES&append_to_response=credits,videos`
    );

    if (!response.ok) return null;

    const series = await response.json();

    // Get creator
    const director = series.created_by?.[0]?.name;

    // Get trailer
    const trailer = series.videos?.results?.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
    )?.key;

    return {
      externalId: series.id.toString(),
      externalSource: 'tmdb',
      title: series.name,
      originalTitle: series.original_name,
      description: series.overview,
      coverImageUrl: getTmdbImageUrl(series.poster_path),
      releaseYear: series.first_air_date ? parseInt(series.first_air_date.split('-')[0]) : undefined,
      type: 'series',
      director,
      seasonsCount: series.number_of_seasons,
      episodesCount: series.number_of_episodes,
      durationMinutes: series.episode_run_time?.[0],
      genres: series.genres?.map((g: TMDBGenre) => g.name) || [],
      externalRating: series.vote_average,
      language: series.original_language,
      country: series.origin_country?.[0],
      cast: series.credits?.cast?.slice(0, 10).map((c: any) => c.name),
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer}` : undefined,
    };
  } catch (error) {
    console.error('Error getting series details:', error);
    return null;
  }
}

// =====================================================
// Google Books API
// =====================================================

interface GoogleBookVolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    medium?: string;
    large?: string;
  };
  language?: string;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

interface GoogleBooksSearchResponse {
  totalItems: number;
  items?: GoogleBookItem[];
}

/**
 * Search for books on Google Books API
 */
export async function searchBooks(query: string, maxResults = 20): Promise<MediaSearchResult[]> {
  const apiKey = getGoogleBooksApiKey();

  try {
    let url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=es&orderBy=relevance`;

    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksSearchResponse = await response.json();

    if (!data.items) return [];

    return data.items.map(book => {
      const info = book.volumeInfo;

      // Get ISBN
      const isbn = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                   info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

      // Get best available image
      const coverImageUrl = info.imageLinks?.medium ||
                           info.imageLinks?.large ||
                           info.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2');

      return {
        externalId: book.id,
        externalSource: 'google_books' as const,
        title: info.subtitle ? `${info.title}: ${info.subtitle}` : info.title,
        originalTitle: info.title,
        description: info.description,
        coverImageUrl: coverImageUrl?.replace('http:', 'https:'),
        releaseYear: info.publishedDate ? parseInt(info.publishedDate.split('-')[0]) : undefined,
        type: 'book' as const,
        author: info.authors?.join(', '),
        isbn,
        pageCount: info.pageCount,
        publisher: info.publisher,
        genres: info.categories,
        externalRating: info.averageRating,
        language: info.language,
      };
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

/**
 * Get book details from Google Books API
 */
export async function getBookDetails(bookId: string): Promise<MediaDetails | null> {
  const apiKey = getGoogleBooksApiKey();

  try {
    let url = `${GOOGLE_BOOKS_BASE_URL}/volumes/${bookId}`;
    if (apiKey) {
      url += `?key=${apiKey}`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const book: GoogleBookItem = await response.json();
    const info = book.volumeInfo;

    const isbn = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                 info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

    const coverImageUrl = info.imageLinks?.large ||
                         info.imageLinks?.medium ||
                         info.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=3');

    return {
      externalId: book.id,
      externalSource: 'google_books',
      title: info.subtitle ? `${info.title}: ${info.subtitle}` : info.title,
      originalTitle: info.title,
      description: info.description,
      coverImageUrl: coverImageUrl?.replace('http:', 'https:'),
      releaseYear: info.publishedDate ? parseInt(info.publishedDate.split('-')[0]) : undefined,
      type: 'book',
      author: info.authors?.join(', '),
      isbn,
      pageCount: info.pageCount,
      publisher: info.publisher,
      genres: info.categories,
      externalRating: info.averageRating,
      language: info.language,
    };
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
}

// =====================================================
// Unified Search Function
// =====================================================

/**
 * Search for media across all sources based on type
 */
export async function searchMedia(
  query: string,
  type: MediaType,
  page = 1
): Promise<MediaSearchResult[]> {
  switch (type) {
    case 'movie':
      return searchMovies(query, page);
    case 'series':
      return searchSeries(query, page);
    case 'book':
      return searchBooks(query);
    default:
      return [];
  }
}

/**
 * Get media details based on type and source
 */
export async function getMediaDetails(
  externalId: string,
  type: MediaType,
  source: 'tmdb' | 'google_books'
): Promise<MediaDetails | null> {
  if (source === 'google_books') {
    return getBookDetails(externalId);
  }

  switch (type) {
    case 'movie':
      return getMovieDetails(externalId);
    case 'series':
      return getSeriesDetails(externalId);
    default:
      return null;
  }
}

// =====================================================
// Trending & Popular
// =====================================================

/**
 * Get trending movies from TMDB
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<MediaSearchResult[]> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return [];

  await fetchTMDBGenres('movie');

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${apiKey}&language=es-ES`
    );

    if (!response.ok) return [];

    const data: TMDBSearchResponse<TMDBMovieResult> = await response.json();

    return data.results.slice(0, 20).map(movie => ({
      externalId: movie.id.toString(),
      externalSource: 'tmdb' as const,
      title: movie.title,
      originalTitle: movie.original_title,
      description: movie.overview,
      coverImageUrl: getTmdbImageUrl(movie.poster_path),
      releaseYear: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : undefined,
      type: 'movie' as const,
      genres: movie.genre_ids.map(id => movieGenresCache[id]).filter(Boolean),
      externalRating: movie.vote_average,
      language: movie.original_language,
    }));
  } catch (error) {
    console.error('Error getting trending movies:', error);
    return [];
  }
}

/**
 * Get trending TV series from TMDB
 */
export async function getTrendingSeries(timeWindow: 'day' | 'week' = 'week'): Promise<MediaSearchResult[]> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return [];

  await fetchTMDBGenres('tv');

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${apiKey}&language=es-ES`
    );

    if (!response.ok) return [];

    const data: TMDBSearchResponse<TMDBTVResult> = await response.json();

    return data.results.slice(0, 20).map(series => ({
      externalId: series.id.toString(),
      externalSource: 'tmdb' as const,
      title: series.name,
      originalTitle: series.original_name,
      description: series.overview,
      coverImageUrl: getTmdbImageUrl(series.poster_path),
      releaseYear: series.first_air_date ? parseInt(series.first_air_date.split('-')[0]) : undefined,
      type: 'series' as const,
      genres: series.genre_ids.map(id => tvGenresCache[id]).filter(Boolean),
      externalRating: series.vote_average,
      language: series.original_language,
    }));
  } catch (error) {
    console.error('Error getting trending series:', error);
    return [];
  }
}
