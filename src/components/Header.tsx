import type { UserProgress, LanguageProgress } from '../types';
import { LANGUAGES } from '../data/languages';
import { xpForNextLevel } from '../utils/progress';
import { BookOpen, Flame, Star, Globe } from 'lucide-react';

interface HeaderProps {
  progress: UserProgress;
  selectedLanguage: string;
  langProgress: LanguageProgress;
}

export default function Header({ selectedLanguage, langProgress }: HeaderProps) {
  const language = LANGUAGES.find((l) => l.code === selectedLanguage);
  const xpNeeded = xpForNextLevel(langProgress.level);
  const xpProgress = Math.min((langProgress.totalXP / xpNeeded) * 100, 100);

  return (
    <header className="bg-white shadow-sm border-b border-indigo-100">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-600" size={28} />
            <span className="text-2xl font-bold text-indigo-700">Lingu</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">
                {langProgress.streak}
              </span>
            </div>

            {/* Level & XP */}
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span className="text-xs font-bold text-gray-600">
                  Level {langProgress.level}
                </span>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {langProgress.totalXP} / {xpNeeded} XP
              </span>
            </div>

            {/* Current Language */}
            {language && (
              <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
                <BookOpen size={14} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">
                  {language.flag} {language.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
