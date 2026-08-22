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
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// === Legal Documents ===
export interface LegalDocumentSummary {
  id: string;
  title: string;
  documentType: string;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  languageCode: string;
  createdAt: string;
  source?: { authorityName: string; officialUrl: string };
  _count?: { sections: number; versions: number };
}

export interface LegalDocumentDetail extends LegalDocumentSummary {
  contentHash: string;
  lastIndexedAt?: string;
  country: { id: string; code: string; nameUz: string; nameRu: string; nameEn: string };
  jurisdiction?: { id: string; code: string; name: string };
  source: { id: string; authorityName: string; officialUrl: string; documentType: string };
  versions: LegalVersion[];
  sections: LegalSectionSummary[];
}

export interface LegalVersion {
  id: string;
  versionNumber: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  status: string;
  sourceUrl?: string;
}

export interface LegalSectionSummary {
  id: string;
  sectionType: string;
  sectionLabel?: string;
  ordinal: number;
  status: string;
  effectiveFrom?: string;
}

export interface LegalSectionDetail extends LegalSectionSummary {
  textOriginal: string;
  textNormalized: string;
  sourceUrl: string;
  sourceStartOffset?: number;
  sourceEndOffset?: number;
  languageCode: string;
  countryCode: string;
  document: { id: string; title: string; documentType: string };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function getDocuments(params?: {
  q?: string;
  countryId?: string;
  documentType?: string;
  status?: string;
  language?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<LegalDocumentSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/laws${qs ? `?${qs}` : ''}`);
}

export async function getDocumentById(id: string): Promise<LegalDocumentDetail> {
  return apiFetch(`/laws/${id}`);
}

export async function getDocumentSections(
  documentId: string,
  params?: { sectionType?: string; page?: number; limit?: number },
): Promise<PaginatedResponse<LegalSectionSummary>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return apiFetch(`/laws/${documentId}/sections${qs ? `?${qs}` : ''}`);
}

export async function getSectionById(id: string): Promise<LegalSectionDetail> {
  return apiFetch(`/sections/${id}`);
}

// === Search ===
export interface SearchParams {
  q: string;
  countryCode?: string;
  documentType?: string;
  sectionType?: string;
  language?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  sectionType: string;
  sectionLabel?: string;
  ordinal: number;
  textNormalized: string;
  sourceUrl: string;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  document: {
    id: string;
    title: string;
    documentType: string;
    status: string;
    source?: { authorityName: string; officialUrl: string };
  };
}

export async function searchLegal(params: SearchParams): Promise<PaginatedResponse<SearchResult>> {
  return apiFetch('/search/legal', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// === Chat ===
export interface Conversation {
  id: string;
  countryCode: string;
  language: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  answer?: AiAnswer;
}

export interface AiAnswer {
  id: string;
  jurisdiction: string;
  language: string;
  shortAnswer: string;
  answer: string;
  assumptions: string[];
  missingFacts: string[];
  nextSteps: string[];
  riskLevel: string;
  needsHumanReview: boolean;
  confidence: number;
  disclaimer: string;
  citations: Citation[];
}

export interface Citation {
  id: string;
  sourceId?: string;
  sectionId?: string;
  title: string;
  article?: string;
  url?: string;
  effectiveDate?: string;
  status?: string;
  quotedText?: string;
}

export async function createConversation(countryCode: string, language = 'uz') {
  return apiFetch<Conversation>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ countryCode, language }),
  });
}

export async function listConversations() {
  return apiFetch<Conversation[]>('/chat/sessions');
}

export async function getConversation(id: string) {
  return apiFetch<Conversation>(`/chat/sessions/${id}`);
}

export async function sendMessage(conversationId: string, content: string) {
  return apiFetch<{ userMessage: ChatMessage; assistantMessage: ChatMessage; answer: AiAnswer }>(
    `/chat/sessions/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
  );
}

// === Jurisdictions ===
export interface Country {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  direction: string;
}

export async function getCountries() {
  return apiFetch<Country[]>('/jurisdictions/countries');
}

export async function getLanguages() {
  return apiFetch<Language[]>('/jurisdictions/languages');
}

// === Auth ===
export async function loginUser(email: string, password: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
}

export async function registerUser(email: string, password: string, name: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password, name }) },
  );
}

// === AI (direct, no conversation) ===
export async function askAi(question: string, language = 'ru', countryCode?: string) {
  return apiFetch<AiAnswer>('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question, language, countryCode }),
  });
}
