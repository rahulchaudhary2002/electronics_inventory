import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit as profileHref } from '@/routes/profile';
import { edit as securityHref } from '@/routes/security';
import PosShell from '@/components/pos-shell';

export default function SettingsShell({ children }: { children: ReactNode }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    const tabs = [
        { label: t('settings.profile'),  href: profileHref().url },
        { label: t('settings.security'), href: securityHref().url },
    ];

    return (
        <PosShell title={t('settings.title')} backHref="/menu" activeNav="menu">
            {/* Sticky sub-nav */}
            <div className="sticky top-0 z-10 flex shrink-0 border-b border-slate-800 bg-slate-950">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex-1 py-3 text-center text-[11px] font-bold transition-all border-b-2 ${
                            isCurrentOrParentUrl(tab.href)
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Page content */}
            <div className="space-y-5 p-4">
                {children}
            </div>
        </PosShell>
    );
}
