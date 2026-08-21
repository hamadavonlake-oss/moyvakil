export const PRACTICE_AREAS = [
  'labor',
  'family',
  'criminal',
  'commercial',
  'civil',
  'tax',
  'ip',
  'administrative',
  'constitutional',
  'judicial',
  'real-estate',
  'immigration',
] as const;

export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export const CITIES_UZ = [
  'Tashkent',
  'Samarkand',
  'Bukhara',
  'Namangan',
  'Andijan',
  'Fergana',
  'Nukus',
  'Karshi',
  'Termez',
  'Navoi',
] as const;

export const COUNTRIES = [
  { code: 'UZ', nameUz: "O'zbekiston", nameRu: 'Узбекистан', nameEn: 'Uzbekistan' },
  { code: 'KZ', nameUz: 'Qozog\'iston', nameRu: 'Казахстан', nameEn: 'Kazakhstan' },
] as const;
