import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import PosShell from '@/components/pos-shell';

type MenuCard = {
    href: string;
    icon: string;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
};

export default function Menu() {
    const { t } = useTranslation();

    const cards: MenuCard[] = [
        {
            href: '/outlets',
            icon: '🏪',
            label: t('menu.outletManagement'),
            description: t('menu.outletManagementDesc'),
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
        },
        {
            href: '/categories',
            icon: '🏷️',
            label: t('menu.categoryManagement'),
            description: t('menu.categoryManagementDesc'),
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
            borderColor: 'border-violet-500/20 hover:border-violet-500/50',
        },
        {
            href: '/settings/profile',
            icon: '⚙️',
            label: t('settings.title'),
            description: t('menu.settingsDesc'),
            color: 'text-slate-300',
            bgColor: 'bg-slate-500/10',
            borderColor: 'border-slate-700 hover:border-slate-500',
        },
    ];

    return (
        <PosShell activeNav="menu">
            <Head title={t('tabs.menu')} />

            <div className="p-4 space-y-4">
                {/* Page heading */}
                <div className="pt-1 pb-2">
                    <h2 className="text-base font-black text-white">{t('tabs.menu')}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t('menu.subtitle')}</p>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-2 gap-3">
                    {cards.map((card) => (
                        <Link
                            key={card.href}
                            href={card.href}
                            className={`flex flex-col rounded-3xl border bg-slate-900 p-4 shadow-xl transition-all active:scale-[0.97] ${card.borderColor}`}
                        >
                            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-2xl ${card.bgColor}`}>
                                {card.icon}
                            </div>
                            <p className={`text-xs font-black leading-tight ${card.color}`}>{card.label}</p>
                            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">{card.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Version footer */}
                <div className="pt-4 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700">
                        {t('common.appName')} • {t('common.enterprisePos')}
                    </p>
                </div>
            </div>
        </PosShell>
    );
}
