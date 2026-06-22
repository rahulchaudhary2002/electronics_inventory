import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Power } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { logout } from '@/routes';
import { useAuth } from '@/hooks/use-auth';

type Props = {
    children: ReactNode;
    title?: string;
    backHref?: string;
};

export default function PosShell({ children, title, backHref }: Props) {
    const { t } = useTranslation();
    const { isSuperadmin } = useAuth();

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Fixed header */}
            <header className="shrink-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-3.5 backdrop-blur-lg">
                <div className="flex items-center gap-3">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-all hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/30">
                            SE
                        </div>
                    )}
                    <div>
                        <h1 className="text-sm font-black leading-none text-white">
                            {title ?? t('common.appName')}
                        </h1>
                        {!backHref && (
                            <span className="mt-1 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-indigo-300">
                                {isSuperadmin ? t('auth.superadmin') : t('auth.outletAdmin')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <Link
                        href={logout()}
                        as="button"
                        method="post"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                        title={t('common.logout')}
                    >
                        <Power className="h-4 w-4" />
                    </Link>
                </div>
            </header>

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 transparent' }}>
                {children}
            </main>

        </div>
    );
}
