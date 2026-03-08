import { useState } from 'react';
import type { Language } from '../types';
import { ChevronDown, Search } from 'lucide-react';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
}

export default function LanguageSelector({
  languages,
  selectedLanguage,
  onSelectLanguage,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = languages.find((l) => l.code === selectedLanguage) ?? languages[0];

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        🌍 Select a language to learn
      </label>

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selected.flag}</span>
          <div className="text-left">
            <div className="font-semibold text-gray-800">{selected.name}</div>
            <div className="text-sm text-gray-500">{selected.nativeName}</div>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                autoFocus
              />
            </div>
          </div>

          {/* Language list */}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No languages found
              </div>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors duration-100 ${
                    lang.code === selectedLanguage ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-400">{lang.nativeName}</div>
                  </div>
                  {lang.code === selectedLanguage && (
                    <span className="ml-auto text-indigo-500 text-xs font-bold">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
