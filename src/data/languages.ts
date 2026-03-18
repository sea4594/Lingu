import type { Language } from '../types';

export const LANGUAGES: Language[] = [
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    speechCode: 'ja-JP',
  },
];

export const getLanguageByCode = (code: string): Language | undefined =>
  LANGUAGES.find((l) => l.code === code);
