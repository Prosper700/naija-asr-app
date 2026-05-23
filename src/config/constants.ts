// API Configuration
export const API_URL = 'https://codelumi-naija-asr-api.hf.space/api';

// Supported languages
export const LANGUAGES = {
  HAUSA: 'hausa',
  YORUBA: 'yoruba',
  IGBO: 'igbo',
  ENGLISH: 'english',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

export const LANGUAGE_LABELS: Record<Language, string> = {
  hausa: 'Hausa',
  yoruba: 'Yoruba',
  igbo: 'Igbo',
  english: 'English',
};

export const NIGERIAN_LANGUAGES: Language[] = ['hausa', 'yoruba', 'igbo'];