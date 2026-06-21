import i18nInstance from '@/i18n';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const current = i18n.language?.startsWith('ne') ? 'ne' : 'en';

    const toggle = () => {
        const next = current === 'ne' ? 'en' : 'ne';
        i18nInstance.changeLanguage(next);
    };

    return (
        <button
            onClick={toggle}
            className="flex h-7 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 text-[10px] font-bold text-slate-300 transition-all hover:border-indigo-500/50 hover:text-indigo-300"
            title="Switch Language"
        >
            <span className={current === 'ne' ? 'text-indigo-400' : 'text-slate-500'}>ने</span>
            <span className="text-slate-600">/</span>
            <span className={current === 'en' ? 'text-indigo-400' : 'text-slate-500'}>EN</span>
        </button>
    );
}
