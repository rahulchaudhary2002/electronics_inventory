import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppearanceTabs from '@/components/appearance-tabs';
import SettingsShell from '@/components/settings-shell';

export default function Appearance() {
    const { t } = useTranslation();
    return (
        <SettingsShell>
            <Head title={t('settings.appearance')} />

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                <h3 className="mb-4 border-b border-slate-800 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('settings.appearanceTitle')}
                </h3>
                <AppearanceTabs />
            </div>
        </SettingsShell>
    );
}
