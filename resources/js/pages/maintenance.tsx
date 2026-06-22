import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';
import PosShell from '@/components/pos-shell';

export default function Maintenance() {
    const { t } = useTranslation();

    return (
        <PosShell>
            <Head title={t('tabs.maintenance')} />

            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-400">
                    <Wrench className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-sm font-black text-white">{t('tabs.maintenance')}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t('common.comingSoon')}</p>
                </div>
            </div>
        </PosShell>
    );
}
