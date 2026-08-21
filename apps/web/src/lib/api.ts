const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60s for server components
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// === Laws ===
export interface LawSummary {
  id: string;
  slug: string;
  titleUz: string;
  titleRu: string;
  titleEn?: string;
  type: string;
  category: string;
  status: string;
  adoptionDate?: string;
  sourceUrl?: string;
  lastUpdated: string;
  country: { code: string; nameUz: string; nameRu: string };
}

export interface LawDetail extends LawSummary {
  fullTextUz: string;
  fullTextRu: string;
  fullTextEn?: string;
  summaryUz?: string;
  summaryRu?: string;
  summaryEn?: string;
  effectiveDate?: string;
  articles: LawArticle[];
  amendments: LawAmendment[];
}

export interface LawArticle {
  id: string;
  number: string;
  titleUz?: string;
  titleRu?: string;
  titleEn?: string;
  contentUz: string;
  contentRu: string;
  contentEn?: string;
}

export interface LawAmendment {
  id: string;
  description: string;
  date: string;
  sourceUrl?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function getLaws(params?: {
  q?: string;
  category?: string;
  type?: string;
  status?: string;
  countryId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<LawSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/laws${qs ? `?${qs}` : ''}`);
}

export async function getLawBySlug(slug: string): Promise<LawDetail> {
  return apiFetch(`/laws/${slug}`);
}

// === Lawyers ===
export interface LawyerSummary {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  city: string;
  region?: string;
  yearsOfPractice?: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  licenseVerified: boolean;
  practiceAreas: { area: string }[];
  languages: { language: string }[];
  country: { code: string };
}

export interface LawyerDetail extends LawyerSummary {
  phone?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  education?: string;
  bioUz?: string;
  bioRu?: string;
  bioEn?: string;
  reviews: Review[];
  services: LegalService[];
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string;
  content: string;
  status: string;
  createdAt: string;
}

export interface LegalService {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn?: string;
  descriptionUz: string;
  descriptionRu: string;
  price: string;
  currency: string;
  deliveryDays: number;
  category: string;
}

export async function getLawyers(params?: {
  q?: string;
  city?: string;
  practiceArea?: string;
  language?: string;
  verified?: boolean;
  countryId?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<LawyerSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/lawyers${qs ? `?${qs}` : ''}`);
}

export async function getLawyerBySlug(slug: string): Promise<LawyerDetail> {
  return apiFetch(`/lawyers/${slug}`);
}

// === Q&A ===
export interface QuestionSummary {
  id: string;
  title: string;
  body: string;
  category: string;
  region?: string;
  language: string;
  authorName: string;
  viewCount: number;
  answerCount: number;
  isResolved: boolean;
  createdAt: string;
  _count?: { answers: number };
}

export interface QuestionDetail extends QuestionSummary {
  answers: QaAnswer[];
}

export interface QaAnswer {
  id: string;
  body: string;
  isHelpful: boolean;
  upvotes: number;
  createdAt: string;
  lawyer?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    photoUrl?: string;
    isVerified: boolean;
  } | null;
}

export async function getQuestions(params?: {
  category?: string;
  region?: string;
  language?: string;
  countryId?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<QuestionSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/qa/questions${qs ? `?${qs}` : ''}`);
}

export async function getQuestionById(id: string): Promise<QuestionDetail> {
  return apiFetch(`/qa/questions/${id}`);
}

// === Guides ===
export interface GuideSummary {
  id: string;
  slug: string;
  titleUz: string;
  titleRu: string;
  titleEn?: string;
  category: string;
  tags: string[];
  readingTime?: number;
  createdAt: string;
  country: { code: string };
}

export interface GuideDetail extends GuideSummary {
  bodyUz: string;
  bodyRu: string;
  bodyEn?: string;
  published: boolean;
  law?: { id: string; slug: string; titleUz: string; titleRu: string } | null;
  country: { code: string; nameUz: string; nameRu: string; nameEn?: string };
}

export async function getGuides(params?: {
  category?: string;
  q?: string;
  countryId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<GuideSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/guides${qs ? `?${qs}` : ''}`);
}

export async function getGuideBySlug(slug: string): Promise<GuideDetail> {
  return apiFetch(`/guides/${slug}`);
}

// === AI ===
export async function askAi(question: string, language = 'ru', countryId?: string) {
  return apiFetch<{
    answer: string;
    citations: Array<{ type: string; id: string; title: string; slug: string }>;
    model: string;
  }>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question, language, countryId }),
  });
}

// === Auth ===
export async function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
}

export async function registerUser(email: string, password: string, name: string, role?: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, name, role }) },
  );
}
