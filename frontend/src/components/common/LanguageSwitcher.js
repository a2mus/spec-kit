import React from 'react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import { Languages } from 'lucide-react';

function LanguageSwitcher() {
    const { language, setLanguage, direction } = useLanguageDirection();

    return (
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <button
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'ar'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-white/40 hover:text-white/70'
                    }`}
            >
                AR
            </button>
            <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'fr'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-white/40 hover:text-white/70'
                    }`}
            >
                FR
            </button>
            <div className="mx-1 text-white/10">|</div>
            <div className="px-2 text-[10px] font-mono text-white/30 uppercase tracking-tighter">
                {direction}
            </div>
            <Languages size={14} className="mx-1 text-white/20" />
        </div>
    );
}

export default LanguageSwitcher;
