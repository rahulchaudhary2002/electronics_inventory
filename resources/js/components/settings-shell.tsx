import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Palette } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit as profileHref } from '@/routes/profile';
import { edit as securityHref } from '@/routes/security';
import { edit as appearanceHref } from '@/routes/appearance';
import PosShell from '@/components/pos-shell';

export default function SettingsShell({ children }: { children: ReactNode }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    const tabs = [
        { label: t('settings.profile'),    href: profileHref().url,    icon: User },
        { label: t('settings.security'),   href: securityHref().url,   icon: Lock },
        { label: t('settings.appearance'), href: appearanceHref().url, icon: Palette },
    ];

    return (
        <PosShell title={t('settings.title')} backHref="/menu" activeNav="menu">
            {/* Sticky sub-nav */}
            <div className="sticky top-0 z-10 flex shrink-0 border-b border-slate-800 bg-slate-950">
                {tabs.map(({ label, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-semibold transition-all ${
                            isCurrentOrParentUrl(href)
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
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
